import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants, LOCAL_STORAGE_KEYS, ROLE } from 'src/app/shared/constants/constants';
import { User } from 'src/app/shared/models/user';
import { ApiSingleResponse } from '../../shared/models/api-response.model';
import { ProjectSummaryData } from '../../shared/models/summary-response';
import { Profile } from 'src/app/shared/models/auth';

export interface LoginData {
  email: string;
  password: string;
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
    private readonly router: Router
  ) {
    this.loadProfileFromStorage();
  }

  /**
   * Login - usando ApiResponse
   */
  login(data: LoginData): Observable<ApiSingleResponse<LoginResponseData>> {
    return this.http.post<ApiSingleResponse<LoginResponseData>>(`${environment.apiUrl}/auth/login`, data);
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
        this._profile.set(response.data);
        this.setRole(response.data);
        localStorage.setItem(LOCAL_STORAGE_KEYS.profile, JSON.stringify(response.data));
        console.log(response.data);
      })
    );
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
  getProfileLocal(): User | null {
    const profileStr = localStorage.getItem(LOCAL_STORAGE_KEYS.profile);

    if (!profileStr) {
      return null;
    }

    try {
      const user = JSON.parse(profileStr) as User;
      this._profile.set(user);
      return user;
    } catch (error) {
      console.error('Error parsing profile', error);
      return null;
    }
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
    console.log('role', role);
    this.role$.next(role);
  }

  get isAdmin(): boolean {
    return this.role$.value === ROLE.ADMIN;
  }

  get roleObservable$(): Observable<string | null> {
    return this.role$.asObservable();
  }
}
