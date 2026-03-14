import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {BehaviorSubject, map, Observable, tap} from 'rxjs';
import { environment } from 'src/environments/environment';
import { Constants, LOCAL_STORAGE_KEYS, ROLE } from 'src/app/shared/constants/constants';
import { User } from 'src/app/shared/models/user';
import { ApiSingleResponse } from '../../shared/models/api-response.model';
import { Profile } from 'src/app/shared/models/auth';
import { ApiService } from './api.service';
import {
  CreateTeamRequest,
  TeamFilters,
  TeamMemberRequest,
  UpdateTeamRequest
} from "../../shared/models/team-models/team-request.model";
import {Team, TeamManagement} from "../../shared/models/team-models/team.model";

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


  login(data: LoginData): Observable<LoginResponse> {
    return this.http.post(`${environment.apiUrl}/auth/login`, data) as Observable<LoginResponse>;
  }

  register(data: RegisterData): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${environment.apiUrl}/auth/register`, data, { observe: 'response' });
  }


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

  getProfiles(): Observable<Profile[]> {
    return this.apiService.get<Profile[]>('user/profiles');
  }


  private updateProfileState(user: User): void {
    this._profile.set(user);
    localStorage.setItem(LOCAL_STORAGE_KEYS.profile, JSON.stringify(user));
  }


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
      this.setRole(user);
    } catch (error) {
      console.error('Error parsing profile', error);
    }
  }
  setRole(user: User): void {
    const role = user.role ?? null;
    this.role$.next(role);
  }

  get isAdmin(): boolean {
    return this.role$.value === ROLE.ADMIN;
  }

  get roleObservable$(): Observable<string | null> {
    return this.role$.asObservable();
  }

  getTeams(filters?: TeamFilters): Observable<Team[]> {
    return this.apiService
      .get<any[]>('auth/team', filters)
      .pipe(
        map(response => response.map(item => item.data))
      );
  }


  getTeamManagement(): Observable<TeamManagement[]> {
    return this.apiService
      .get<any[]>(`${environment.apiUrl}/auth/team/management`)
      .pipe(
        map(response => response.map(item => item.data))
      );
  }


  getTeam(id: number): Observable<Team> {
    return this.apiService.get<Team>(`${environment.apiUrl}/auth/team/${id}`);
  }

  createTeam(data: CreateTeamRequest): Observable<Team> {
    return this.apiService.post<Team>(`${environment.apiUrl}/auth/team/`, data);
  }

  updateTeam(id: number, data: UpdateTeamRequest): Observable<Team> {
    return this.apiService.put<Team>(`${environment.apiUrl}/auth/team/${id}`, data);
  }

  deleteTeam(id: number): Observable<any> {
    return this.apiService.delete<any>(`${environment.apiUrl}/auth/team/${id}`);
  }

  addTeamMember(teamId: number, data: TeamMemberRequest): Observable<Team> {
    return this.apiService.post<Team>(`${environment.apiUrl}/auth/team/${teamId}/members`, data);
  }

  removeTeamMember(teamId: number, data: TeamMemberRequest): Observable<Team> {
    return this.apiService.delete<Team>(`${environment.apiUrl}/auth/team/${teamId}/members`, data);
  }

  removeTeamMemberByQuery(teamId: number, userId: number): Observable<Team> {
    return this.apiService.delete<Team>(`${environment.apiUrl}/auth/team/${teamId}/members`, { user_id: userId });
  }
}
