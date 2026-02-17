import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Project } from "src/app/shared/models/project";
import { ResponseData, ResponseMeta } from "src/app/shared/models/response";
import { Role } from "src/app/shared/models/role";
import { environment } from "src/environments/environment";

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
    return this.http.get<ResponseData<Project>>(
      `${environment.apiUrl}/projects`,
    );
  }
}
