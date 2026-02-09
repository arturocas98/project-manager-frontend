// token.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import {environment} from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class TokenService {

    constructor(
        private localStorage: LocalStorageService,
    ) {}


    getToken(): string | null {
        return this.localStorage.getValueFromLocal<string>('User_Json_Web_Token');
    }

    isLoggedIn(): boolean {
        return this.localStorage.getBoolAsync('isLoggedIn', false);
    }

    saveUserCredentials(token: string): void {
        this.localStorage.setValueToLocal('User_Json_Web_Token', token);
    }

    clearCredentials(): void {
        this.localStorage.removeValueFromLocal('User_Json_Web_Token');
        this.localStorage.removeValueFromLocal('USER_PASSWORD');
        this.localStorage.removeValueFromLocal('USER_EMAIL');
        this.localStorage.removeValueFromLocal('USER_DATA');
        this.localStorage.removeValueFromLocal('PLAYER_ID');
        this.localStorage.setValueToLocal('isLoggedIn', false);
    }

    getUserEmail(): string | null {
        return this.localStorage.getValueFromLocal<string>('USER_EMAIL');
    }

    getPlayerId(): string | null {
        return this.localStorage.getValueFromLocal<string>('PLAYER_ID');
    }

    getUserData(): any {
        return this.localStorage.getValueFromLocal<any>('USER_DATA');
    }
}