import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Project, RawProjectResponse} from "src/app/shared/models/project";
import { Role } from "src/app/shared/models/role";
import { environment } from "src/environments/environment";
import {ApiListResponse, ApiResponse, ApiSingleResponse} from "../../shared/models/api-response.model";
import {map, Observable} from "rxjs";
import {ApiService} from "./api.service";
import {ProjectSummaryData} from "../../shared/models/summary-response";
import {UserUnassigned} from "../../shared/models/projects-models/userunassigned-model";
import {ProjectRequest, UpdateProjectRequest} from "../../shared/models/projects-models/project-request";
import {ProjectCreationData} from "../../shared/models/projects-models/project-create-response";
import {ProjectResponse} from "../../shared/models/projects-models/ProjectResponse";
import {
  IncidenceModel,
  TaskCreateModelRequest,
  TaskUpdateModelRequest
} from "../../shared/models/task-models/task-create-model";

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

  getProject(projectId: number): Observable<ProjectResponse> {
    return this.apiService.get<ProjectResponse>(`projects/${projectId}`);
  }

  getOneTask(projectId: number, taskId:number): Observable<IncidenceModel> {
    return this.apiService.get<IncidenceModel>(`projects/${projectId}`);
  }


  createTask(projectData: TaskCreateModelRequest, projectId: number): Observable<IncidenceModel> {
    return this.apiService.post<IncidenceModel>(`projects/${projectId}/incidences`, projectData);
  }

  UpdateTask(projectData: TaskUpdateModelRequest, projectId: number, taskId: number): Observable<IncidenceModel> {
    return this.apiService.post<IncidenceModel>(`projects/${projectId}/incidences/${taskId}`, projectData);
  }

  updateProject(projectData: UpdateProjectRequest, projectId: number): Observable<ProjectResponse> {
    return this.apiService.put<ProjectResponse>(`projects/${projectId}`, projectData);
  }

  deletProject(projectId: number): Observable<any> {
    return this.apiService.delete<any>(`projects/${projectId}`);
  }

  getUnassignedUsers(projectId: number): Observable<UserUnassigned[]> {
    return this.apiService.get<UserUnassigned[]>(`projects/${projectId}/unassigned-users`);
  }

  // Para un proyecto específico (show)
  getById(id: number) {
    return this.http.get<ApiSingleResponse<Project>>(
      `${environment.apiUrl}/projects/${id}`
    );
  }

  // Para crear (store)
  createProject(projectData: ProjectRequest): Observable<ProjectCreationData> {
    return this.apiService.post<ProjectCreationData>('projects', projectData);
  }
}
