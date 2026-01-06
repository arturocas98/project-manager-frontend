import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ParamJson, ResponseMeta } from '../models/response';
import { Role } from '../models/role';

export interface RoleCollectionResponse {
    data: Role[];
    meta: ResponseMeta;
}

export interface RoleResponse {
    data: Role;
}

@Injectable({
    providedIn: 'root',
})
export class RoleService {
    constructor(private http: HttpClient) { }

    getRoles(params: ParamJson = {}): Observable<RoleCollectionResponse> {
        const url =`${environment.apiUrl}/security/roles`;
        return this.http.get<RoleCollectionResponse>(url, { params })
    }

    getRole(id: number): Observable<RoleResponse> {
        return this.http.get<RoleResponse>(`${environment.apiUrl}/security/roles/${id}`);
    }

    deleteRole(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${environment.apiUrl}/security/roles/${id}`)
    }

    createRole(role: Role): Observable<boolean> {
        return this.http.post<boolean>(`${environment.apiUrl}/security/roles`, role)
    }

    updateRole(role: Role, roleId: number): Observable<boolean> {
        return this.http.put<boolean>(`${environment.apiUrl}/security/roles/${roleId}`, role)
    }
}
