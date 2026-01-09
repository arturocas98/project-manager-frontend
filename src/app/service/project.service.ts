import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ParamJson, ResponseData, ResponseMeta } from '../models/response';
import { Role } from '../models/role';
import { Project } from '../models/project';

export interface RoleCollectionResponse {
    data: Role[];
    meta: ResponseMeta;
}

export interface RoleResponse {
    data: Role;
}

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<ResponseData<Project>>(`${environment.apiUrl}/projects`);
  }
}
