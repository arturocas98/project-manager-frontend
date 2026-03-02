import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants, LOCAL_STORAGE_KEYS, ROLE } from 'src/app/shared/constants/constants';
import { User } from 'src/app/shared/models/user';
import { ApiSingleResponse } from '../../shared/models/api-response.model';
import {Profile, unassignedUsersData} from 'src/app/shared/models/auth';
import { ApiService } from './api.service';

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: LoginResponseData;
}

interface LoginResponseData {
  access_token: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// auth.service.ts
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private _profile = signal<User | null>(null);
  readonly profile = this._profile.asReadonly();
  role$: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    private apiService: ApiService
  ) {
    this.loadProfileFromStorage();
  }

  /**
   * Login - usando ApiResponse
   */
  login(data: LoginData): Observable<LoginResponse> {
    return this.http.post(`${environment.apiUrl}/auth/login`, data) as Observable<LoginResponse>;
  }

  register(data: RegisterData): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, data, { observe: 'response' });
  }

  /**
   * Obtener perfil - usando ApiResponse
   */
  getProfile(): Observable<ApiSingleResponse<User>> {
    console.log('Getting user');
    return this.http.get<ApiSingleResponse<User>>(`${environment.apiUrl}/user/profile`).pipe(
      tap(response => {
        console.log(response.data);
        this._profile.set(response.data);
        this.setRole(response.data);
        localStorage.setItem(LOCAL_STORAGE_KEYS.profile, JSON.stringify(response.data));
        console.log(response.data);
      })
    );
  }

  getProfiles(): Observable<Profile[]> {
    return this.apiService.get<Profile[]>('user/profiles');
  }

  /**
   * Actualizar estado del perfil (signal + localStorage)
   */
  private updateProfileState(user: User): void {
    this._profile.set(user);
    localStorage.setItem(LOCAL_STORAGE_KEYS.profile, JSON.stringify(user));
  }

  /**
   * Obtener perfil desde localStorage
   */
  getProfileLocal(): Profile {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.profile)!) as Profile;
  }

  logout(): void {
    this.clearLocalStorage();
    this._profile.set(null);
    this.router.navigate([Constants.routes.login]);
  }

  private clearLocalStorage(): void {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.token);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.profile);
  }

  canActivate(): boolean {
    return !!localStorage.getItem(LOCAL_STORAGE_KEYS.token);
  }

  redirectIfUnauthenticated(): void {
    if (!this.canActivate()) {
      this.router.navigate([Constants.routes.login]);
    }
  }

  refreshProfile(): Observable<ApiSingleResponse<User>> {
    return this.getProfile().pipe(
      tap(response => {
        this.updateProfileState(response.data);
      })
    );
  }
  loadProfileFromStorage(): void {
    const profileStr = localStorage.getItem(LOCAL_STORAGE_KEYS.profile);

    if (!profileStr) return;

    try {
      const user = JSON.parse(profileStr) as User;
      this._profile.set(user);
      this.setRole(user); // ahora setRole
    } catch (error) {
      console.error('Error parsing profile', error);
    }
  }
  setRole(user: User): void {
    const role = user.role ?? null; // tomar el rol único
    this.role$.next(role);
  }

  get isAdmin(): boolean {
    return this.role$.value === ROLE.ADMIN;
  }

  get roleObservable$(): Observable<string | null> {
    return this.role$.asObservable();
  }
}
