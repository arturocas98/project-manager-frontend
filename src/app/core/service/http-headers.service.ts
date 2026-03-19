// http-headers.service.ts
import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';

export interface ExtraKeys {
    isFlutterWave?: boolean;
    isAirtelMoney?: boolean;
    flutterWaveSecretKey?: string;
    access_token?: string;
    'X-Country'?: string;
    'X-Currency'?: string;
    omitContentType?: boolean;
    [key: string]: any;
}

@Injectable({
    providedIn: 'root'
})
export class HttpHeadersService {
    constructor(private localStorage: LocalStorageService) {}

    buildHeaderTokens(extraKeys?: ExtraKeys, endPoint?: string): HttpHeaders {
        if (!extraKeys) {
            extraKeys = {
                isFlutterWave: false,
                isAirtelMoney: false
            };
        }

        let headerOptions: any = {
            'Cache-Control': 'no-cache',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
            'global-localization': this.getSelectedLanguage()
        };

        if (!extraKeys?.omitContentType) {
            headerOptions['Content-Type'] = 'application/json; charset=utf-8';
        }

        let headers = new HttpHeaders(headerOptions);

        const isLoggedIn = this.localStorage.getBoolAsync('isLoggedIn', false);

        if (endPoint === "auth/register") {
            headers = headers.set('Accept', 'application/json');
        }

        if (isLoggedIn) {
            if (extraKeys.isFlutterWave) {
                headers = headers.set(
                    'Authorization',
                    `Bearer ${extraKeys.flutterWaveSecretKey}`
                );
            } else if (extraKeys.isAirtelMoney) {
                headers = headers
                    .set('Authorization', `Bearer ${extraKeys.access_token}`)
                    .set('X-Country', extraKeys['X-Country'] || '')
                    .set('X-Currency', extraKeys['X-Currency'] || '');
            } else {
                const token = this.localStorage.getValueFromLocal<string>('User_Json_Web_Token');
                if (token) {
                    headers = headers.set('Authorization', `Bearer ${token}`);
                }
            }
        }

        return headers;
    }

    private getSelectedLanguage(): string {
        return this.localStorage.getValueFromLocal<string>('selectedLanguage') || 'en';
    }
}