import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants } from '../constants/constants';

export interface LoginData {
    email: string;
    password: string;
}

interface LoginResponseData {
    token: string;
}

export interface LoginResponse {
    data: LoginResponseData;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(
        private http: HttpClient,
        private router: Router,
    ) { }

    login(data: LoginData): Observable<LoginResponse> {
        return this.http.post(`${environment.apiUrl}/auth/login`, data) as Observable<LoginResponse>;
    }

    canActivate(): boolean {
        return !!localStorage.getItem('token');
    }

    redirectIfUnauthenticated(): void {
        this.router.navigate([Constants.routes.login]);
    }
}
