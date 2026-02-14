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

export interface RegisterData {
    name: string;
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


export class RegisterResponseData {
    success!: boolean;
    message?: string;

    static fromJson(json: any, status?: number): RegisterResponseData {
        const obj = new RegisterResponseData();

        // Debug: mostrar lo que llega
        console.log('Status recibido:', status);
        console.log('JSON recibido:', json);

        // Determinar éxito basado en status 201 o presencia de usuario
        obj.success = status === 201 ||
            (json && (json.user !== undefined || json.id !== undefined));

        obj.message = json?.message || (obj.success ? 'Registro exitoso' : undefined);

        console.log('Resultado final:', {
            success: obj.success,
            message: obj.message
        });

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
            'auth/login',
            HttpMethodType.POST,
            request,
            (json) => LoginResponseData.fromJson(json)
        );
    }
    RegisterUser(request: RegisterData): Observable<RegisterResponseData> {
        console.log(request);
        return this.apiService.staticRequest<RegisterResponseData>(
            'auth/register',
            HttpMethodType.POST,
            request,
            (json, status) => RegisterResponseData.fromJson(json,status)
        );
    }


    canActivate(): boolean {
        return !!localStorage.getItem('token');
    }

}
