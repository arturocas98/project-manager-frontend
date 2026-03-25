import { Injectable } from "@angular/core";
import {Project} from "src/app/shared/models/project";
import {map, Observable, BehaviorSubject, tap} from "rxjs";
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
import {Notification} from "../../shared/models/notification-models/Notification-model";
import {MessageResource, MessageRequest, MessageUpdateRequest} from "../../shared/models/projects-models/message-models";

@Injectable({
  providedIn: "root",
})
export class ProjectService {
  private projectsSubject = new BehaviorSubject<Project[]>([]);
  projects$ = this.projectsSubject.asObservable();
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSubject.asObservable();
  private projectSummaryCache = new Map<number, BehaviorSubject<ProjectSummaryData | null>>();

  constructor(private apiService: ApiService) {}

  getAll(): Observable<Project[]> {

    if (this.projectsSubject.value.length === 0) {

      this.apiService
        .get<any[]>('projects')
        .pipe(
          map(response => response.map(item => item.data)),
          tap(projects => this.projectsSubject.next(projects))
        )
        .subscribe();

    } else {

      // refresco en segundo plano
      this.apiService
        .get<any[]>('projects')
        .pipe(
          map(response => response.map(item => item.data)),
          tap(projects => this.projectsSubject.next(projects))
        )
        .subscribe();

    }

    return this.projects$;
  }

  getAllNotification(): Observable<Notification[]> {

    if (this.notificationsSubject.value.length === 0) {

      // primera carga
      this.apiService
        .get<Notification[]>(`notification`)
        .pipe(
          tap(notifications => this.notificationsSubject.next(notifications))
        )
        .subscribe();

    } else {

      // refresco en segundo plano
      this.apiService
        .get<Notification[]>(`notification`)
        .pipe(
          tap(notifications => this.notificationsSubject.next(notifications))
        )
        .subscribe();

    }

    return this.notifications$;
  }

  getNotification(idNotification:number): Observable<Notification> {
    return this.apiService.get<Notification>(`notification/${idNotification}`);
  }

  UpdateNotification(idNotification:number): Observable<Notification> {
    return this.apiService.pat<Notification>(`notification/${idNotification}/read`);
  }

  getProjectSummary(projectId: number): Observable<ProjectSummaryData | null> {

    if (!this.projectSummaryCache.has(projectId)) {

      const subject = new BehaviorSubject<ProjectSummaryData | null>(null);
      this.projectSummaryCache.set(projectId, subject);

      this.apiService
        .get<ProjectSummaryData>(`projects/${projectId}/summary`)
        .pipe(
          tap(summary => subject.next(summary))
        )
        .subscribe();

    } else {

      const subject = this.projectSummaryCache.get(projectId)!;

      // refresco en segundo plano
      this.apiService
        .get<ProjectSummaryData>(`projects/${projectId}/summary`)
        .pipe(
          tap(summary => subject.next(summary))
        )
        .subscribe();

    }

    return this.projectSummaryCache.get(projectId)!.asObservable();
  }

  getProject(projectId: number): Observable<ProjectResponse> {
    return this.apiService.get<ProjectResponse>(`projects/${projectId}`);
  }

  getMyRole(projectId: number): Observable<{ role_type: string }> {
    return this.apiService.get<{ role_type: string }>(`projects/${projectId}/my-role`);
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
      .get<{ data: CommentResponse, meta?: any }[]>(`projects/${projectId}/incidences/${taskId}/comments`)
      .pipe(
        map(responseArray => responseArray.map(item => {
            const comment = item.data;
            if (item.meta) {
                comment.meta = item.meta as any;
            }
            return comment;
        }))
      );
  }

// Crear un nuevo comentario
  createComment(projectId: number, taskId: number, description: string, file?: File): Observable<CommentResponse> {
    const formData = new FormData();
    formData.append('description', description);
    if (file) {
      formData.append('file', file);
    }

    // POST /projects/{project}/incidences/{incidence}/comments
    return this.apiService
      .postFull<CommentResponse>(`projects/${projectId}/incidences/${taskId}/comments`, formData, { omitContentType: true })
      .pipe(
        map(res => {
            const comment = res.data;
            if (res.meta) {
                comment.meta = res.meta as any;
            }
            return comment;
        })
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

  // --- PROJECT MESSAGES (CHAT) ---

  getProjectMessages(projectId: number): Observable<MessageResource[]> {
    return this.apiService.get<any>(`projects/${projectId}/messages`)
      .pipe(map(res => res.data || res));
  }

  createProjectMessage(projectId: number, payload: MessageRequest, file?: File): Observable<MessageResource> {
    if (file) {
      const formData = new FormData();
      formData.append('project_id', payload.project_id.toString());
      if (payload.text) formData.append('text', payload.text);
      if (payload.message_id) formData.append('message_id', payload.message_id.toString());
      formData.append('file', file);
      
      return this.apiService.postFull<any>(`projects/${projectId}/messages`, formData, { omitContentType: true })
        .pipe(map(res => res.data || res));
    }

    return this.apiService.post<any>(`projects/${projectId}/messages`, payload)
      .pipe(map(res => res.data || res));
  }

  updateProjectMessage(projectId: number, messageId: number, payload: MessageUpdateRequest): Observable<MessageResource> {
    return this.apiService.put<any>(`projects/${projectId}/messages/${messageId}`, payload)
      .pipe(map(res => res.data || res));
  }

  deleteProjectMessage(projectId: number, messageId: number): Observable<void> {
    return this.apiService.delete<void>(`projects/${projectId}/messages/${messageId}`);
  }

}
