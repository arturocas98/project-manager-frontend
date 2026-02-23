import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Project, RawProjectResponse} from "src/app/shared/models/project";
import { Role } from "src/app/shared/models/role";
import { environment } from "src/environments/environment";
import {ApiListResponse, ApiResponse, ApiSingleResponse} from "../../shared/models/api-response.model";
import {map, Observable} from "rxjs";
import {ApiService} from "./api.service";
import {ProjectSummaryData} from "../../shared/models/summary-response";

export interface RoleCollectionResponse {
  data: Role[];
}

export interface RoleResponse {
  data: Role;
}

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAll(): Observable<ApiListResponse<Project>> {
    return this.http.get<RawProjectResponse>(`${environment.apiUrl}/projects`)
      .pipe(
        map(rawResponse => {
          // Transformar la estructura anidada a un array plano de proyectos
          const projectsArray = Object.values(rawResponse.data).map(item => item.data);

          // Devolver en el formato que espera ApiListResponse
          return {
            data: projectsArray,
            links: rawResponse.links,
            meta: rawResponse.meta
          };
        })
      );
  }
  getProjectSummary(projectId: number): Observable<ProjectSummaryData> {
    return this.apiService.get<ProjectSummaryData>(`projects/${projectId}/summary`);
  }

  // Para un proyecto específico (show)
  getById(id: number) {
    return this.http.get<ApiSingleResponse<Project>>(
      `${environment.apiUrl}/projects/${id}`
    );
  }

  // Para crear (store)
  create(projectData: Partial<Project>) {
    return this.http.post<ApiSingleResponse<Project>>(
      `${environment.apiUrl}/projects`,
      projectData
    );
  }
}
