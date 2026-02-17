
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {TokenService} from "../service/token.service";
import { Observable, throwError } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(
        private router: Router,
        private tokenService: TokenService // ← Inyectar el servicio
    ) {}

    intercept(req: HttpRequest<object>, next: HttpHandler): Observable<HttpEvent<object>> {
        const token = this.tokenService.getToken(); // ← Usar servicio

        // Lista de endpoints públicos (ajusta según tu API)
        const publicEndpoints = [
            'auth/login',
            'auth/register',
            'auth/forgotpassword',
            'auth/reset-password'
        ];

        // Verificar si el endpoint es público
        const isPublicEndpoint = publicEndpoints.some(endpoint =>
            req.url.includes(endpoint)
        );

        if (isPublicEndpoint) {
            return next.handle(req);
        }

        if (token && token.length > 0) {
            const authReq = req.clone({
                headers: req.headers.set('Authorization', `Bearer ${token}`)
            });
            return next.handle(authReq);
        } else {
            // Solo redirigir si NO es una petición de API
            if (!req.url.includes('/api/')) {
                this.router.navigate(['/auth/login']);
            }
            return next.handle(req);
        }
    }
}
