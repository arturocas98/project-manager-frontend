import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Role } from 'src/app/shared/models/role';
import { environment } from 'src/environments/environment';
import {ParamJson} from "../../../../shared/models/params.model";
import {MetaData} from "../../../../shared/models/api-response.model";

export interface RoleCollectionResponse {
    data: Role[];
    meta: MetaData;
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
