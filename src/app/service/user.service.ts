import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ParamJson, ResponseMeta } from '../models/response';
import { User } from '../models/user';

export interface UserCollectionResponse {
    data: User[];
    meta: ResponseMeta;
}

export interface UserResponse {
    data: User;
}

@Injectable({
    providedIn: 'root',
})
export class UserService {
    constructor(private http: HttpClient) { }

    getUsers(params: ParamJson = {}): Observable<UserCollectionResponse> {
        const url = `${environment.apiUrl}/security/users`
        return this.http.get<UserCollectionResponse>(url, { params });
    }

    getUser(id: number): Observable<UserResponse> {
        return this.http.get<UserResponse>(`${environment.apiUrl}/security/users/${id}`);
    }

    deleteUser(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${environment.apiUrl}/security/users/${id}`)
    }

    createUser(user: User): Observable<boolean> {
        return this.http.post<boolean>(`${environment.apiUrl}/security/users`, user)
    }

    updateUser(user: User, userId: number): Observable<boolean> {
        return this.http.put<boolean>(`${environment.apiUrl}/security/users/${userId}`, user)
    }
}
