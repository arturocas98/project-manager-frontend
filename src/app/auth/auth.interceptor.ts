
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Constants } from '../constants/constants';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
    ) {}

    intercept(req: HttpRequest<object>, next: HttpHandler): Observable<HttpEvent<object>> {
        const token = localStorage.getItem('token');
        if ([Constants.routes.newpassword, Constants.routes.forgotpassword, Constants.routes.login, Constants.routes.register, Constants.routes.accessdenied, Constants.routes.error].includes(req.url)) {
            return next.handle(req);
        }

        if (token != null) {
            const authReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token)
            });
            return next.handle(authReq);
        } else {
            this.router.navigate([Constants.routes.login]);
            return next.handle(req);
        }
  }
}
