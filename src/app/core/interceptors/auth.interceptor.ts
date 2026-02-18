import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { Constants, HEADER_KEYS, I18N, LOCAL_STORAGE_KEYS, STATUS_CODE } from 'src/app/shared/constants/constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private readonly router: Router) {}

  intercept(req: HttpRequest<object>, next: HttpHandler): Observable<HttpEvent<object>> {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.token);
    const lng = localStorage.getItem(LOCAL_STORAGE_KEYS.language) ?? I18N.es;

    const publicRoutes = [
      Constants.routes.newpassword,
      Constants.routes.forgotpassword,
      Constants.routes.login,
      Constants.routes.register,
      Constants.routes.accessdenied,
      Constants.routes.error,
    ];

    if (publicRoutes.includes(req.url)) {
      return next.handle(req);
    }

    const headers = token
      ? new HttpHeaders({
          Authorization: `Bearer ${token}`,
          [HEADER_KEYS.X_LANGUAGE]: lng,
        })
      : req.headers.set(HEADER_KEYS.X_LANGUAGE, lng);


    const clonedRequest = req.clone({ headers });

    return next.handle(clonedRequest).pipe(
      tap({
        error: err => {
          if (!(err instanceof HttpErrorResponse)) return;

          const isAuthEndpoint = publicRoutes.some(route =>
            req.url.includes(route)
          );

          if (err.status === STATUS_CODE.unauthorized && !isAuthEndpoint) {
            localStorage.removeItem(LOCAL_STORAGE_KEYS.token);
            this.router.navigate([Constants.routes.login]);
          }


          if (err.status === STATUS_CODE.forbidden) {
            localStorage.setItem(LOCAL_STORAGE_KEYS.errorMessage, err.error.message);
            this.router.navigate([Constants.routes.notFound]);
          }
        },
      })
    );
  }
}
