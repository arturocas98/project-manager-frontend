import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {Observable, throwError} from 'rxjs';
import { Constants } from '../constants/constants';
import {ApiService, HttpMethodType} from './api.service';

export interface LoginData {
    email: string;
    password: string;
}

export class LoginResponseData {
    access_token!: string;

    static fromJson(json: any): LoginResponseData {
        const obj = new LoginResponseData();
        obj.access_token = json.data?.access_token;
        return obj;
    }
}


@Injectable({
    providedIn: 'root',
})
export class AuthService {

    constructor(
        private router: Router,
        private apiService: ApiService,
    ) { }

    loginUser(request: LoginData): Observable<LoginResponseData> {
        return this.apiService.staticRequest<LoginResponseData>(
            'auth/login',  // APIEndPoints.login
            HttpMethodType.POST,
            request,
            (json) => LoginResponseData.fromJson(json)
        );
    }


    canActivate(): boolean {
        return !!localStorage.getItem('token');
    }

    redirectIfUnauthenticated(): void {
        this.router.navigate([Constants.routes.login]);
    }
}
