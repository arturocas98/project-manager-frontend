import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { formatISO } from 'date-fns';
import { ResponseSingleData } from 'src/app/shared/models/response';
import { Constants, LOCAL_STORAGE_KEYS } from 'src/app/shared/constants/constants';
import { User } from 'src/app/shared/models/user';
import { HttpMethodType } from './api.service';

export interface LoginData {
  email: string;
  password: string;
}

interface LoginResponseData {
  access_token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  _profile = signal<User | null>(null);
  readonly profile = this._profile;

  login(data: LoginData): Observable<ResponseSingleData<LoginResponseData>> {
    return this.http.post(`${environment.apiUrl}/auth/login`, data) as Observable<
      ResponseSingleData<LoginResponseData>
    >;
  }

  logOut(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.token);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.profile);
    this.router.navigate([Constants.routes.login]);
  }

  canActivate(): boolean {
    return !!localStorage.getItem(LOCAL_STORAGE_KEYS.token);
  }

  redirectIfUnauthenticated(): void {
    this.router.navigate([Constants.routes.login]);
  }

  getProfile(): Observable<ResponseSingleData<User>> {
    return this.http.get<ResponseSingleData<User>>(`${environment.apiUrl}/user/profile`).pipe(
      map((response: ResponseSingleData<User>) => {
        const now = formatISO(new Date());
        const user: User = {
          ...response.data,
          last_login_at: now,
        };

        this.updateProfileLocal(user);

        return {
          ...response,
          data: user,
        };
      })
    );
  }

  updateProfileLocal(profile: User): void {
    localStorage.setItem(LOCAL_STORAGE_KEYS.profile, JSON.stringify(profile));
  }

  getProfileLocal(): User {
    const profile = localStorage.getItem(LOCAL_STORAGE_KEYS.profile);
    const user = JSON.parse(profile ?? '{}') as User;
    this._profile.set(user);
    return user;
  }
}
