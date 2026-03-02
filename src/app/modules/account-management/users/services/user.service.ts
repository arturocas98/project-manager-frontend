import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {User, UserData} from 'src/app/shared/models/user';
import { environment } from 'src/environments/environment';
import { ParamJson } from '../../../../shared/models/params.model';
import { ApiSingleResponse, MetaData } from '../../../../shared/models/api-response.model';

export interface UserCollectionResponse {
  data: User[];
  meta: MetaData;
}

export interface UserResponse {
  data: User;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getUsers(params: ParamJson = {}): Observable<UserCollectionResponse> {
    const url = `${environment.apiUrl}/auth/users`;
    return this.http.get<UserCollectionResponse>(url, { params });
  }
  deleteUser(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/auth/users/${id}`);
  }

  createUser(user: UserData): Observable<boolean> {
    return this.http.post<boolean>(`${environment.apiUrl}/auth/users`, user);
  }

  updateUser(user: UserData, userId: number): Observable<boolean> {
    console.log(user);
    return this.http.put<boolean>(`${environment.apiUrl}/auth/users/${userId}`, user);
  }

  getUser(id: number): Observable<ApiSingleResponse<User>> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/auth/users/${id}`);
  }
}
