import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {Project} from "src/app/shared/models/project";
import { Role } from "src/app/shared/models/role";
import { environment } from "src/environments/environment";
import {ApiSingleResponse} from "../../shared/models/api-response.model";
import {map, Observable} from "rxjs";
import {ApiService} from "./api.service";
import {ProjectSummaryData} from "../../shared/models/summary-response";
import {
  ProjectMemberRequest, ProjectMemberUpdateRequest,
  ProjectRequest,
  UpdateProjectRequest
} from "../../shared/models/projects-models/project-request";
import {ProjectCreationData} from "../../shared/models/projects-models/project-create-response";
import {ProjectResponse} from "../../shared/models/projects-models/ProjectResponse";
import {
  IncidenceDetail,
  IncidenceModel,
  TaskCreateModelRequest,
  TaskUpdateModelRequest
} from "../../shared/models/task-models/task-create-model";
import {unassignedUsersData} from "../../shared/models/auth";
import {CommentResponse} from "../../shared/models/task-models/CommentResponse";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  constructor(private http: HttpClient, private apiService: ApiService) {}

  getAll(): Observable<Project[]> {
    return this.apiService
      .get<any[]>('projects')
      .pipe(
        map(response => response.map(item => item.data))
      );
  }
  getProjectSummary(projectId: number): Observable<ProjectSummaryData> {
    return this.apiService.get<ProjectSummaryData>(`projects/${projectId}/summary`);
  }

  getProject(projectId: number): Observable<ProjectResponse> {
    return this.apiService.get<ProjectResponse>(`projects/${projectId}`);
  }

  getOneTask(projectId: number, taskId:number): Observable<IncidenceDetail> {
    return this.apiService.get<IncidenceDetail>(`projects/${projectId}/incidences/${taskId}`);
  }


  createTask(projectData: TaskCreateModelRequest, projectId: number): Observable<IncidenceModel> {
    return this.apiService.post<IncidenceModel>(`projects/${projectId}/incidences`, projectData);
  }

  UpdateTask(projectData: TaskUpdateModelRequest, projectId: number, taskId: number): Observable<IncidenceModel> {
    return this.apiService.put<IncidenceModel>(`projects/${projectId}/incidences/${taskId}/update`, projectData);
  }

  updateProject(projectData: UpdateProjectRequest, projectId: number): Observable<ProjectResponse> {
    return this.apiService.put<ProjectResponse>(`projects/${projectId}`, projectData);
  }

  deletProject(projectId: number): Observable<any> {
    return this.apiService.delete<any>(`projects/${projectId}`);
  }

  addMember(projectId: number,projectMemberData: ProjectMemberRequest): Observable<any> {
    return this.apiService.post<any>(`projects/${projectId}/members`, projectMemberData);
  }

  removeMember(projectId: number,userId: number): Observable<any> {
    return this.apiService.delete<any>(`projects/${projectId}/members/${userId}`);
  }

  removeIncidence(projectId: number,userId: number): Observable<any> {
    return this.apiService.delete<any>(`projects/${projectId}/incidences/${userId}`);
  }

  updateMember(projectId: number, memberId:number, projectMemberUpdateData: ProjectMemberUpdateRequest): Observable<any> {
    return this.apiService.patch<any>(`projects/${projectId}/members/${memberId}/role`, projectMemberUpdateData);
  }


  getUnassignedUsers(projectId:number): Observable<unassignedUsersData[]> {
    return this.apiService.get<unassignedUsersData[]>(`projects/${projectId}/unassigned-users`);
  }

  createProject(projectData: ProjectRequest): Observable<ProjectCreationData> {
    return this.apiService.post<ProjectCreationData>('projects', projectData);
  }

  /*comentarios*/
  getComments(projectId: number, taskId:number): Observable<CommentResponse[]> {
    // GET /projects/{project}/incidences/{incidence}/comments
    return this.apiService
      .get<{ data: CommentResponse }[]>(`projects/${projectId}/incidences/${taskId}/comments`)
      .pipe(
        map(responseArray => responseArray.map(item => item.data)) // extraemos solo data
      );
  }

// Crear un nuevo comentario
  createComment(projectId: number, taskId: number, description: string): Observable<CommentResponse> {
    // POST /projects/{project}/incidences/{incidence}/comments
    return this.apiService
      .post<{ data: CommentResponse }>(`projects/${projectId}/incidences/${taskId}/comments`, { description })
      .pipe(
        map(res => res.data) // extraemos solo data
      );
  }

// Actualizar un comentario existente
  updateComment(projectId: number, taskId: number, commentId: number, description: string): Observable<CommentResponse> {
    // PUT /projects/{project}/incidences/{incidence}/comments/{commentId}
    return this.apiService
      .put<{ data: CommentResponse }>(`projects/${projectId}/incidences/${taskId}/comments/${commentId}`, { description })
      .pipe(
        map(res => res.data) // extraemos solo data
      );
  }

// Eliminar un comentario
  deleteComment(projectId: number, taskId: number, commentId: number): Observable<void> {
    // DELETE /projects/{project}/incidences/{incidence}/comments/{commentId}
    return this.apiService
      .delete<void>(`projects/${projectId}/incidences/${taskId}/comments/${commentId}`);
  }

}
