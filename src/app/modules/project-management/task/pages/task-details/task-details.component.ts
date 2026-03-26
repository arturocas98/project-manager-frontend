import { Component, OnInit, OnDestroy, LOCALE_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { DividerModule } from 'primeng/divider';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MenuItem, MessageService, TreeNode } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { Subscription } from 'rxjs';
import { ProjectService } from "../../../../../core/service/project.service";
import {
  IncidenceDetail,
  IncidenceDetailChild,
  TaskUpdateModelRequest
} from "../../../../../shared/models/task-models/task-create-model";
import { TreeModule } from "primeng/tree";
import { TruncatePipe } from "../../../../../shared/Pipes/TruncatePipe";
import { CommentResponse } from "../../../../../shared/models/task-models/CommentResponse";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { InputTextareaModule } from "primeng/inputtextarea";
import { FormsModule } from "@angular/forms";
import { ScrollPanelModule } from "primeng/scrollpanel";
import { MenuModule } from "primeng/menu";
import { DialogModule } from "primeng/dialog";
import localeEs from '@angular/common/locales/es';
import { registerLocaleData } from '@angular/common';

registerLocaleData(localeEs);
@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonModule,
    CardModule,
    TagModule,
    AvatarModule,
    DividerModule,
    ProgressSpinnerModule,
    TooltipModule,
    ToastModule,
    TreeModule,
    TruncatePipe,
    ConfirmDialogModule,
    InputTextareaModule,
    FormsModule,
    ScrollPanelModule,
    MenuModule,
    DialogModule,
  ],
  templateUrl: './task-details.component.html',
  providers: [MessageService, { provide: LOCALE_ID, useValue: 'es' }],
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
  readonly roleMap: Record<string, string> = {
    administrator: 'Administrador',
    leader: 'Lider',
    developer: 'Desarrollador',
    tester: 'Tester',
    documenter: 'Documentador',
  };
  getRoleNameInSpanish(roleName: string | null | undefined): string {
    if (!roleName) return 'Sin rol';

    const roleLower = roleName.toLowerCase();
    return this.roleMap[roleLower] || roleName; // Si no encuentra el mapeo, devuelve el original
  }
  loading = true;
  projectId!: number;
  taskId!: number;
  task: IncidenceDetail | null = null;
  error: string | null = null;

  // Para comentarios
  comments: CommentResponse[] = [];
  newComment: string = '';
  selectedFile: File | null = null;
  loadingComments: boolean = false;
  submittingComment: boolean = false;
  commentMenuItems: { [key: number]: MenuItem[] } = {};

  currentUserId: number | null = null;
  roleType: string | null = null;
  canManageTasks: boolean = false;

  // Para el árbol de PrimeNG
  treeData: TreeNode[] = [];

  // Para el breadcrumb de ancestros
  taskAncestors: { id: number; title: string }[] = [];

  // Lógica de transición de estados
  updatingState: boolean = false;
  showStateCommentDialogVisible: boolean = false;
  stateCommentDialogHeader: string = '';
  stateCommentDialogDescription: string = '';
  stateComment: string = '';
  stateCommentRequired: boolean = false;
  pendingStateId: number | null = null;

  private subscriptions: Subscription[] = [];

  // Mapeo de prioridades a colores y etiquetas
  readonly priorityMap: Record<string, { label: string; severity: string; icon: string; color: string }> = {
    low: { label: 'Baja', severity: 'info', icon: 'ph ph-arrow-down', color: 'text-blue-600' },
    medium: { label: 'Media', severity: 'warning', icon: 'ph ph-minus', color: 'text-yellow-600' },
    high: { label: 'Alta', severity: 'danger', icon: 'ph ph-arrow-up', color: 'text-orange-600' },
    critical: { label: 'Crítica', severity: 'danger', icon: 'ph ph-warning', color: 'text-red-600' },
  };

  // Mapeo de estados a colores
  readonly stateSeverityMap: Record<string, string> = {
    Open: 'info',
    'In Progress': 'warning',
    Review: 'help',
    Closed: 'success',
    Locked: 'danger',
    Finished: 'success',
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit() {
    const roleTypeStr = localStorage.getItem('role_type');
    this.roleType = roleTypeStr ? roleTypeStr.toLowerCase() : null;
    this.canManageTasks = this.roleType === 'administrator' || this.roleType === 'leader';

    const profileStr = localStorage.getItem('profile');
    if (profileStr) {
      try {
        const profile = JSON.parse(profileStr);
        this.currentUserId = profile.id || null;
      } catch (e) {
        console.error('Error parsing profile', e);
      }
    }

    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));

    const taskSub = this.route.paramMap.subscribe(params => {
      this.taskId = Number(params.get('IncidenceId'));

      if (this.taskId) {
        this.loadTaskDetails();
      } else {
        this.error = 'No se proporcionó un ID de tarea válido';
        this.loading = false;
        this.showError('Error', 'ID de tarea no válido');
      }
    });

    this.subscriptions.push(taskSub);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carga los detalles de la tarea
   */
  loadTaskDetails() {
    this.loading = true;
    this.error = null;

    const taskSub = this.projectService.getOneTask(this.projectId, this.taskId).subscribe({
      next: task => {
        this.task = task;
        this.buildTreeData();
        this.buildAncestorsPath();
        this.loading = false;
        this.loadComments(); // Cargar comentarios después de la tarea
      },
      error: error => {
        console.error('Error loading task details:', error);
        this.error = 'No se pudo cargar la información de la tarea';
        this.loading = false;
        this.showError('Error', 'Error al cargar la tarea');
      },
    });

    this.subscriptions.push(taskSub);
  }

  /**
   * Carga los comentarios de la tarea
   */
  loadComments(): void {
    if (!this.projectId || !this.taskId) return;

    this.loadingComments = true;
    const commentsSub = this.projectService.getComments(this.projectId, this.taskId).subscribe({
      next: comments => {
        this.comments = comments;

        this.buildCommentMenuItems();
        this.loadingComments = false;
        console.log(this.comments);
        console.log(comments);
      },
      error: error => {
        console.error('Error loading comments:', error);
        this.loadingComments = false;
        this.showError('Error', 'No se pudieron cargar los comentarios');
      },
    });

    this.subscriptions.push(commentsSub);
  }

  /**
   * Construye los items del menú para cada comentario
   */
  buildCommentMenuItems(): void {
    this.comments.forEach(comment => {
      this.commentMenuItems[comment.id] = [
        {
          label: 'Eliminar',
          icon: 'ph ph-trash',
          command: () => this.confirmDeleteComment(comment),
        },
      ];
    });
  }

  /**
   * Manejo de selección de archivo
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validar tamaño máximo 10MB
      const maxSizeInBytes = 10 * 1024 * 1024;
      if (file.size > maxSizeInBytes) {
        this.showError('Archivo demasiado grande', 'El archivo no debe exceder los 10MB.');
        event.target.value = ''; // Limpiar input
        this.selectedFile = null;
        return;
      }
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  /**
   * Eliminar archivo seleccionado
   */
  removeSelectedFile(): void {
    this.selectedFile = null;
    // Omitiendo la limpieza del input ref por ahora, ya que Angular se encargará del binding de UI cuando agreguemos el html
  }

  /**
   * Publica un nuevo comentario
   */
  submitComment(): void {
    if (!this.newComment.trim() && !this.selectedFile) {
      this.showError('Error', 'El comentario o el archivo no pueden estar vacíos');
      return;
    }

    this.submittingComment = true;

    const commentSub = this.projectService.createComment(this.projectId, this.taskId, this.newComment, this.selectedFile || undefined).subscribe({
      next: newComment => {
        this.comments = [newComment, ...this.comments];
        this.buildCommentMenuItems();
        this.newComment = '';
        this.selectedFile = null; // Limpiar archivo
        this.submittingComment = false;
        this.showSuccess('Comentario agregado', 'El comentario se publicó correctamente');
        this.loadComments();
      },
      error: error => {
        console.error('Error creating comment:', error);
        this.submittingComment = false;
        this.showError('Error', 'No se pudo publicar el comentario');
      },
    });

    this.subscriptions.push(commentSub);
  }

  /**
   * Edita un comentario
   */
  editComment(comment: CommentResponse): void {
    // Implementar edición cuando tengas el endpoint
    console.log('Editar comentario:', comment);
  }

  /**
   * Confirma la eliminación de un comentario
   */
  confirmDeleteComment(comment: CommentResponse): void {
    this.confirmationService.confirm({
      message: `¿Estás seguro de que deseas eliminar este comentario?`,
      header: 'Confirmar eliminación',
      icon: 'ph ph-warning',
      accept: () => {
        this.deleteComment(comment.id);
      },
    });
  }

  /**
   * Elimina un comentario
   */
  deleteComment(commentId: number): void {
    const deleteSub = this.projectService.deleteComment(this.projectId, this.taskId, commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        this.buildCommentMenuItems();
        this.showSuccess('Comentario eliminado', 'El comentario se eliminó correctamente');
      },
      error: error => {
        console.error('Error deleting comment:', error);
        this.showError('Error', 'No se pudo eliminar el comentario');
      },
    });

    this.subscriptions.push(deleteSub);
  }

  /**
   * Construye los datos para el árbol de PrimeNG
   */
  private buildTreeData() {
    if (!this.task) return;
    this.treeData = this.task.children.map(child => this.mapToTreeNode(child));
  }

  /**
   * Mapea una incidencia hija a TreeNode de PrimeNG
   */
  private mapToTreeNode(child: IncidenceDetailChild): TreeNode {
    const node: TreeNode = {
      label: child.title,
      data: child,
      expanded: true,
      children: child.children?.map(grandChild => this.mapToTreeNode(grandChild)) || [],
    };
    return node;
  }

  /**
   * Construye la ruta de ancestros para el breadcrumb
   */
  private buildAncestorsPath() {
    this.taskAncestors = [];
    if (this.task?.parent) {
      this.taskAncestors = [this.task.parent];
    }
  }

  /**
   * Obtiene el total de hijos (recursivo)
   */
  getTotalChildrenCount(task: IncidenceDetail | IncidenceDetailChild): number {
    let count = 0;
    const countChildren = (children?: IncidenceDetailChild[]): void => {
      if (!children) return;
      children.forEach(child => {
        count++;
        if (child.children?.length) {
          countChildren(child.children);
        }
      });
    };
    countChildren(task.children);
    return count;
  }

  /**
   * Obtiene la fecha a mostrar (start_date si existe, sino created_at)
   */
  getDisplayDate(item: any): string {
    return item.start_date || item.created_at;
  }

  /**
   * Navega a una tarea específica
   */
  navigateToTask(taskId: number) {
    if (taskId === this.taskId) return;
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'task-details', taskId], {
      queryParamsHandling: 'merge',
    });
  }

  createTask(columnId: number): void {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'create-task', columnId]);
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 5000,
    });
  }

  /**
   * Muestra un mensaje de éxito
   */
  private showSuccess(summary: string, detail: string) {
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000,
    });
  }

  /**
   * Obtiene la información de prioridad
   */
  getPriorityInfo(priority: string | null) {
    if (!priority) return { label: 'No definida', severity: 'secondary', icon: 'pi-question', color: '' };
    return (
      this.priorityMap[priority.toLowerCase()] || {
        label: priority,
        severity: 'secondary',
        icon: 'pi-tag',
        color: '',
      }
    );
  }

  /**
   * Obtiene el color de la prioridad
   */
  getPriorityColor(priority: string | null): string {
    if (!priority) return '';
    return this.priorityMap[priority.toLowerCase()]?.color || '';
  }

  /**
   * Obtiene el icono de la prioridad
   */
  getPriorityIcon(priority: string | null): string {
    if (!priority) return 'ph ph-tag';
    return this.priorityMap[priority.toLowerCase()]?.icon || 'ph ph-tag';
  }

  /**
   * Obtiene la severidad del estado
   */
  getStateSeverity(state: string | undefined): string {
    if (!state) return 'secondary';
    return this.stateSeverityMap[state] || 'secondary';
  }

  /**
   * Navega de regreso al kanban
   */
  goBack() {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'project-kanban']);
  }

  /**
   * Abre el modal de edición
   */
  editTask(taskId: number | undefined): void {
    if (!taskId) return;
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'task-update', taskId]);
  }

  /**
   * Obtiene las iniciales del usuario
   */
  getUserInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  /**
   * Verifica si una fecha está vencida
   */
  isOverdue(date: string | null): boolean {
    if (!date) return false;
    const dueDate = new Date(date);
    const today = new Date();
    return dueDate < today;
  }

  // --- LOGICA DE FLUJO DE TRABAJO DE ESTADOS ---

  showStateCommentDialog(header: string, desc: string, targetStateId: number, required: boolean) {
    this.stateCommentDialogHeader = header;
    this.stateCommentDialogDescription = desc;
    this.pendingStateId = targetStateId;
    this.stateCommentRequired = required;
    this.stateComment = '';
    this.showStateCommentDialogVisible = true;
  }

  confirmStateWithComment() {
    if (this.stateCommentRequired && !this.stateComment.trim()) {
      this.showError('Error', 'El comentario es obligatorio para esta acción.');
      return;
    }
    this.showStateCommentDialogVisible = false;
    if (this.pendingStateId) {
      this.updateTaskState(this.pendingStateId, this.stateComment);
    }
  }

  confirmSuspendTask() {
    this.confirmationService.confirm({
      message: '¿Está seguro de que desea suspender esta tarea? La tarea quedará inactiva temporalmente.',
      header: 'Confirmar Suspensión',
      icon: 'ph ph-warning-circle text-orange-500 text-3xl',
      acceptLabel: 'Sí, suspender',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.updateTaskState(3); // Estado de suspension
      }
    });
  }

  updateTaskState(newStateId: number, comment?: string) {
    if (!this.task || !this.projectId || !this.taskId) return;

    this.updatingState = true;

    // Mapeo inverso de id de prioridad
    const priorityMap: Record<string, number> = {
      'low': 1, 'medium': 2, 'high': 3, 'critical': 4
    };
    const priorityId = this.task.priority ? priorityMap[this.task.priority.toLowerCase()] : 2;

    const updateData: TaskUpdateModelRequest = {
      title: this.task.title,
      description: this.task.description,
      incidence_priority_id: priorityId,
      incidence_type_id: this.task.type?.id || null,
      incidence_category_id: this.task.category?.id || null,
      incidence_state_id: newStateId,
      assigned_user_id: this.task.assigned_to?.id || null,
      parent_incidence_id: this.task.parent?.id || null,
      start_date: this.task.start_date,
      due_date: this.task.due_date
    };

    const updateSub = this.projectService.UpdateTask(updateData, this.projectId, this.taskId).subscribe({
      next: (response) => {
        if (comment && comment.trim() !== '') {
          this.projectService.createComment(this.projectId, this.taskId, comment).subscribe({
            next: () => {
              this.finishStateUpdate();
            },
            error: () => {
              this.showError('Advertencia', 'El estado fue actualizado, pero no se pudo enviar el comentario');
              this.finishStateUpdate();
            }
          });
        } else {
          this.finishStateUpdate();
        }
      },
      error: (error) => {
        this.updatingState = false;
        console.error('Error updating task state:', error);
        this.showError('Error', 'No se pudo actualizar el estado de la tarea');
      }
    });

    this.subscriptions.push(updateSub);
  }

  private finishStateUpdate() {
    this.updatingState = false;
    this.showSuccess('Estado actualizado', 'El estado de la tarea se actualizó correctamente');
    this.loadTaskDetails(); // Refrescar los datos para ver el nuevo estado/comentario
  }
}
