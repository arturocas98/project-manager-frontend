import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';
import { KanbanColumn, KanbanTask, ProjectMember } from '../../../../../shared/models/kanban.models';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { KanbanService } from '../../../../../core/service/kanban-service';
import { ProjectService } from '../../../../../core/service/project.service';
import { TotalTasksPipe } from '../../../../../shared/Pipes/total-tasks.pipe';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { BadgeModule } from 'primeng/badge';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { DatePipe, NgForOf, NgIf, NgStyle, SlicePipe, TitleCasePipe } from '@angular/common';
import { Menu, MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { DragDropModule } from 'primeng/dragdrop';
import { SidebarModule } from 'primeng/sidebar';
import { CheckboxModule } from 'primeng/checkbox';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';

interface PriorityOption {
  label: string;
  value: string;
  icon: string;
}

// Interfaz para opciones de tipo
interface TypeOption {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-kanban-project',
  standalone: true,
  imports: [
    DragDropModule,
    BadgeModule,
    MenuModule,
    TotalTasksPipe,
    InputTextModule,
    ReactiveFormsModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    AvatarModule,
    NgForOf,
    NgIf,
    SlicePipe,
    TagModule,
    SidebarModule,
    CheckboxModule,
    OverlayPanelModule,
    FormsModule,
    DatePipe,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    CdkDragPreview,
    CdkDragPlaceholder,
    NgStyle,
    TitleCasePipe,
    ConfirmDialogModule,
    DialogModule,
    InputTextareaModule,
    ToastModule,
  ],
  templateUrl: './kanban-project.component.html',
})
export class KanbanProjectComponent implements OnInit, OnDestroy {
  @ViewChild('menu') sortMenu!: Menu;

  private destroy$ = new Subject<void>();
  private projectId!: number;

  // Datos principales
  originalColumns: KanbanColumn[] = [];
  columns: KanbanColumn[] = [];
  members: ProjectMember[] = [];
  loading = true;
  error: string | null = null;

  // Privilegios
  roleType: string | null = null;
  canManageTasks: boolean = false;

  // Filtros
  searchControl = new FormControl('');
  selectedPriorities: string[] = [];
  selectedTypes: string[] = [];
  selectedAssignees: number[] = [];
  filtersActive = false;
  showFiltersPanel = false;

  // Filtro Avatar Local
  selectedAvatarMember: ProjectMember | null = null;

  // Opciones para filtros
  priorityOptions: PriorityOption[] = [
    { label: 'Critical', value: 'critical', icon: 'ph ph-warning-octagon' },
    { label: 'High', value: 'high', icon: 'ph ph-arrow-up-right' },
    { label: 'Medium', value: 'medium', icon: 'ph ph-minus' },
    { label: 'Low', value: 'low', icon: 'ph ph-arrow-down-right' },
  ];

  typeOptions: TypeOption[] = [
    { label: 'Tarea', value: 'task', icon: 'ph ph-check-square' },
    { label: 'Bug', value: 'bug', icon: 'ph ph-bug' },
    { label: 'Subtarea', value: 'subtask', icon: 'ph ph-tree-structure' },
    { label: 'Historia de Usuario', value: 'history_user', icon: 'ph ph-clock-counter-clockwise' },
  ];

  // Menú de ordenamiento
  sortMenuItems: MenuItem[] = [
    {
      label: 'Más recientes',
      icon: 'ph ph-sort-descending',
      command: () => this.sortByDate('desc'),
    },
    {
      label: 'Más antiguos',
      icon: 'ph ph-sort-ascending',
      command: () => this.sortByDate('asc'),
    },
    {
      label: 'Por prioridad',
      icon: 'ph ph-warning',
      command: () => this.sortByPriority(),
    },
    {
      label: 'Por tipo',
      icon: 'ph ph-tag',
      command: () => this.sortByType(),
    },
  ];

  // Dialog properties
  showStateCommentDialogVisible: boolean = false;
  stateCommentDialogHeader: string = '';
  stateCommentDialogDescription: string = '';
  stateComment: string = '';
  stateCommentRequired: boolean = false;
  pendingDropEvent: CdkDragDrop<KanbanTask[]> | null = null;
  pendingColumnId: number | null = null;
  updatingState: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kanbanService: KanbanService,
    private messageService: MessageService,
    private projectService: ProjectService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    const roleTypeStr = localStorage.getItem('role_type');
    this.roleType = roleTypeStr ? roleTypeStr.toLowerCase() : null;
    this.canManageTasks = this.roleType === 'administrator' || this.roleType === 'leader';

    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));

    if (!this.projectId) {
      console.error('Project ID not found');
      return;
    }

    this.loadBoard();
    this.loadMembers();
    this.setupSearch();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el tablero Kanban
   */
  public loadBoard(): void {
    this.loading = true;
    this.error = null;

    this.kanbanService
      .getKanbanBoard(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: columns => {
          this.originalColumns = columns.map(c => ({ ...c, tasks: [...c.tasks] }));
          this.applyLocalAvatarFilter();
          this.loading = false;
        },
        error: error => {
          console.error('Error loading kanban board:', error);
          this.error = 'No se pudo cargar la información del tablero Kanban';
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el tablero Kanban',
          });
          this.loading = false;
        },
      });
  }

  /**
   * Carga los miembros del proyecto
   */
  private loadMembers(): void {
    this.kanbanService
      .getProjectMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: members => {
          this.members = members;
        },
        error: error => {
          console.error('Error loading members:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Error al cargar los miembros del equipo',
            life: 5000,
          });
        },
      });
  }

  /**
   * Configura la búsqueda con debounce
   */
  private setupSearch(): void {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(search => {
        this.kanbanService.updateFilters({ search: search || '' });
        this.checkFiltersActive();
      });
  }

  /**
   * Se suscribe a los cambios de filtros
   */
  private setupFilters(): void {
    this.kanbanService.filters$.pipe(takeUntil(this.destroy$)).subscribe(filters => {
      // Actualizar las selecciones locales
      this.selectedPriorities = filters.priority;
      this.selectedTypes = filters.type;
      this.selectedAssignees = filters.assignee;
      this.searchControl.setValue(filters.search, { emitEvent: false });

      // Recargar el board con los nuevos filtros
      this.loadBoard();
    });
  }

  /**
   * Muestra el panel de filtros
   */
  showFilters(): void {
    this.showFiltersPanel = true;
  }

  /**
   * Aplica los filtros seleccionados
   */
  applyFilters(): void {
    this.kanbanService.updateFilters({
      priority: this.selectedPriorities,
      type: this.selectedTypes,
      assignee: this.selectedAssignees,
    });
    this.showFiltersPanel = false;
  }

  /**
   * Aplica filtro de prioridad
   */
  applyPriorityFilter(priority: string): void {
    // El checkbox ya actualiza selectedPriorities
    this.checkFiltersActive();
  }

  /**
   * Aplica filtro de tipo
   */
  applyTypeFilter(type: string): void {
    // El checkbox ya actualiza selectedTypes
    this.checkFiltersActive();
  }

  getAssigneeColor(name: string): string {
    const colors = [
      '#3b82f6',
      '#10b981',
      '#f59e0b',
      '#ef4444',
      '#8b5cf6',
      '#ec4899',
      '#6366f1',
      '#14b8a6',
      '#f97316',
      '#6b7280',
    ];

    // Generar un índice basado en el nombre
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  /**
   * Aplica filtro de asignado
   */
  applyAssigneeFilter(userId: number): void {
    // El checkbox ya actualiza selectedAssignees
    this.checkFiltersActive();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.selectedPriorities = [];
    this.selectedTypes = [];
    this.selectedAssignees = [];
    this.selectedAvatarMember = null;
    this.searchControl.setValue('');
    this.kanbanService.resetFilters();
    this.filtersActive = false;
    this.showFiltersPanel = false;
    this.applyLocalAvatarFilter();
  }

  /**
   * Alterna el filtro de avatar
   */
  toggleAvatarFilter(member: ProjectMember): void {
    if (this.selectedAvatarMember?.user.id === member.user.id) {
      this.selectedAvatarMember = null;
    } else {
      this.selectedAvatarMember = member;
    }
    this.applyLocalAvatarFilter();
  }

  /**
   * Aplica filtro local estilo Jira por Avatar (Rol)
   */
  private applyLocalAvatarFilter(): void {
    if (!this.originalColumns || this.originalColumns.length === 0) return;

    if (!this.selectedAvatarMember) {
      this.columns = this.originalColumns.map(c => ({ ...c, tasks: [...c.tasks] }));
      return;
    }

    const role = this.selectedAvatarMember.role.type.toLowerCase();
    const memberId = this.selectedAvatarMember.user.id;

    this.columns = this.originalColumns.map(c => {
      const filteredTasks = c.tasks.filter(task => {
        if (role === 'administrator' || role === 'leader' || role === 'adm' || role === 'ldr') {
          return task.created_by?.id === memberId;
        } else if (role === 'developer' || role === 'dev') {
          return task.assigned_to?.id === memberId;
        } else if (role === 'tester' || role === 'tst') {
          const st = task.state?.state?.toLowerCase() || '';
          return st.includes('terminada') || st.includes('revisión') || st.includes('review') || st.includes('completed') || st.includes('done');
        } else if (role === 'documenter' || role === 'doc') {
          const st = task.state?.state?.toLowerCase() || '';
          return st.includes('finalizada') || st.includes('aprobada');
        }
        return true;
      });
      return { ...c, tasks: filteredTasks };
    });
  }

  /**
   * Verifica si hay filtros activos
   */
  private checkFiltersActive(): void {
    this.filtersActive = !!(
      this.searchControl.value ||
      this.selectedPriorities.length ||
      this.selectedTypes.length ||
      this.selectedAssignees.length
    );
  }

  /**
   * Obtiene el número de filtros activos
   */
  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchControl.value) count++;
    count += this.selectedPriorities.length;
    count += this.selectedTypes.length;
    count += this.selectedAssignees.length;
    return count;
  }

  /**
   * Obtiene las listas conectadas para drag & drop - AHORA CON ID NUMÉRICO
   */
  getConnectedLists(currentColumnId: number): string[] {
    return this.columns.filter(col => col.id !== currentColumnId).map(col => col.id.toString()); // IMPORTANTE: CdkDropList espera strings para conectar
  }

  /**
   * Maneja el drop de tareas - AHORA CON ID NUMÉRICO
   */
  onTaskDrop(event: CdkDragDrop<KanbanTask[]>, columnId: number): void {
    if (event.previousContainer === event.container) {
      // Reordenar dentro de la misma columna
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // Mover entre columnas
      const task = event.previousContainer.data[event.previousIndex];
      const sourceColumn = this.columns.find(col => col.tasks === event.previousContainer.data);
      const sourceColumnId = sourceColumn ? sourceColumn.id : 0;

      // Restricciones por rol
      const role = this.roleType;

      let allowed = false;
      let requiresDialog = false;
      let isMandatoryComment = false;
      let dialogHeader = '';
      let dialogDesc = '';
      let requiresConfirmation = false;

      if (role === 'developer' || role === 'dev') {
        if (sourceColumnId === 1 && columnId === 2) {
          allowed = true; // Asignado -> Ejecutando
        } else if (sourceColumnId === 2 && columnId === 4) {
          allowed = true; // Ejecutando -> Terminada
          requiresDialog = true;
          isMandatoryComment = false;
          dialogHeader = 'Terminar Tarea';
          dialogDesc = 'Opcional: Añade un comentario sobre la finalización';
        }
      } else if (role === 'tester' || role === 'tst') {
        if (sourceColumnId === 4 && columnId === 6) {
          allowed = true; // Terminada -> En Revisión
        } else if (sourceColumnId === 6 && columnId === 2) {
          allowed = true; // En Revisión -> Ejecutando
          requiresDialog = true;
          isMandatoryComment = true;
          dialogHeader = 'Devolver Tarea';
          dialogDesc = 'Obligatorio: Añade un comentario explicando la devolución';
        } else if (sourceColumnId === 6 && columnId === 7) {
          allowed = true; // En Revisión -> Finalizada
        }
      } else if (role === 'administrator' || role === 'leader' || role === 'adm' || role === 'LDR') {
        allowed = true; // Pueden mover libremente
        if (columnId === 3) { // Si mueven a suspendido
          requiresConfirmation = true;
        }
      }



      // Si es permitido, movemos temporalmente el item
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      if (requiresConfirmation) {
        this.pendingDropEvent = event;
        this.pendingColumnId = columnId;
        this.confirmSuspendTask();
      } else if (requiresDialog) {
        this.pendingDropEvent = event;
        this.pendingColumnId = columnId;
        this.showStateCommentDialog(dialogHeader, dialogDesc, isMandatoryComment);
      } else {
        this.pendingDropEvent = event;
        this.pendingColumnId = columnId;

        this.confirmationService.confirm({
          message: `¿Estás seguro de mover la tarea a la columna "${this.getColumnTitle(columnId)}"?`,
          header: 'Confirmar movimiento',
          icon: 'ph ph-question text-blue-500 text-3xl',
          acceptLabel: 'Sí, mover',
          rejectLabel: 'Cancelar',
          acceptButtonStyleClass: 'p-button-primary',
          rejectButtonStyleClass: 'p-button-text p-button-secondary',
          accept: () => {
            if (this.pendingDropEvent && this.pendingColumnId !== null) {
              const task = this.pendingDropEvent.container.data[this.pendingDropEvent.currentIndex];
              this.executeTaskMove(this.pendingDropEvent, this.pendingColumnId, task);
            }
          },
          reject: () => {
            if (this.pendingDropEvent) {
              this.revertDragDrop(this.pendingDropEvent);
            }
          }
        });
      }
    }
  }

  executeTaskMove(event: CdkDragDrop<KanbanTask[]>, columnId: number, task: KanbanTask, comment?: string): void {
    this.updatingState = true;
    this.kanbanService.updateTaskStatus(this.projectId, task.id, columnId).subscribe({
      next: () => {
        if (comment && comment.trim() !== '') {
          this.projectService.createComment(this.projectId, task.id, comment).subscribe({
            next: () => {
              this.finishStateUpdate(columnId, task);
            },
            error: () => {
              this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Estado actualizado, pero no se pudo enviar el comentario' });
              this.finishStateUpdate(columnId, task);
            }
          });
        } else {
          this.finishStateUpdate(columnId, task);
        }
      },
      error: error => {
        console.error('Error updating task status:', error);
        this.revertDragDrop(event);
        this.messageService.add({
          severity: 'error',
          summary: 'Permiso Denegado',
          detail: error.error?.message || error.message || 'No se pudo actualizar el estado de la tarea',
          life: 5000
        });
        this.updatingState = false;
      },
    });
  }

  private finishStateUpdate(columnId: number, task: KanbanTask) {
    this.updatingState = false;

    if (task && task.state) {
      task.state.id = columnId;
      task.state.state = this.getColumnTitle(columnId);
    } else if (task) {
      task.state = { id: columnId, state: this.getColumnTitle(columnId) } as any;
    }

    this.messageService.add({
      severity: 'success',
      summary: 'Movido',
      detail: `Tarea movida a ${this.getColumnTitle(columnId)}`,
      life: 2000,
    });
    this.pendingDropEvent = null;
    this.pendingColumnId = null;

    // Actualiza el cache silenciosamente sin recargar la tabla entera
    this.kanbanService.getProjectTasks(this.projectId).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private revertDragDrop(event: CdkDragDrop<KanbanTask[]>) {
    transferArrayItem(
      event.container.data,
      event.previousContainer.data,
      event.currentIndex,
      event.previousIndex
    );
    this.pendingDropEvent = null;
    this.pendingColumnId = null;
  }

  showStateCommentDialog(header: string, desc: string, required: boolean) {
    this.stateCommentDialogHeader = header;
    this.stateCommentDialogDescription = desc;
    this.stateCommentRequired = required;
    this.stateComment = '';
    this.showStateCommentDialogVisible = true;
  }

  confirmStateWithComment() {
    if (this.stateCommentRequired && !this.stateComment.trim()) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'El comentario es obligatorio para esta acción.' });
      return;
    }
    this.showStateCommentDialogVisible = false;
    if (this.pendingDropEvent && this.pendingColumnId !== null) {
      const task = this.pendingDropEvent.container.data[this.pendingDropEvent.currentIndex];
      this.executeTaskMove(this.pendingDropEvent, this.pendingColumnId, task, this.stateComment);
    }
  }

  cancelStateChange() {
    this.showStateCommentDialogVisible = false;
    if (this.pendingDropEvent) {
      this.revertDragDrop(this.pendingDropEvent);
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
        if (this.pendingDropEvent && this.pendingColumnId !== null) {
          const task = this.pendingDropEvent.container.data[this.pendingDropEvent.currentIndex];
          this.executeTaskMove(this.pendingDropEvent, this.pendingColumnId, task);
        }
      },
      reject: () => {
        if (this.pendingDropEvent) {
          this.revertDragDrop(this.pendingDropEvent);
        }
      }
    });
  }

  /**
   * Obtiene el título de una columna por su ID - AHORA CON ID NUMÉRICO
   */
  private getColumnTitle(columnId: number): string {
    const column = this.columns.find(col => col.id === columnId);
    return column?.title || columnId.toString();
  }

  /**
   * Ordena por fecha
   */
  sortByDate(direction: 'asc' | 'desc'): void {
    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return direction === 'desc' ? dateB - dateA : dateA - dateB;
      });
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Ordenado',
      detail: `Tareas ordenadas por fecha (${direction === 'desc' ? 'más recientes' : 'más antiguas'})`,
    });
  }

  /**
   * Ordena por prioridad
   */
  sortByPriority(): void {
    const priorityOrder: Record<string, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
    };

    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const priorityA = a.priority ? (priorityOrder[a.priority] ?? 999) : 999;
        const priorityB = b.priority ? (priorityOrder[b.priority] ?? 999) : 999;
        return priorityA - priorityB;
      });
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Ordenado',
      detail: 'Tareas ordenadas por prioridad',
    });
  }

  /**
   * Ordena por tipo
   */
  sortByType(): void {
    const typeOrder: Record<string, number> = {
      bug: 0,
      task: 1,
      subtask: 2,
      history_user: 3,
    };

    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const typeA = typeOrder[a.type.type.toLowerCase()] ?? 999;
        const typeB = typeOrder[b.type.type.toLowerCase()] ?? 999;
        return typeA - typeB;
      });
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Ordenado',
      detail: 'Tareas ordenadas por tipo',
    });
  }

  /**
   * Obtiene el icono del tipo de tarea
   */
  getTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'bug':
        return 'ph ph-bug text-red-500';
      case 'task':
        return 'ph ph-check-square text-blue-500';
      case 'subtask':
        return 'ph ph-tree-structure text-yellow-600';
      case 'history_user':
        return 'ph ph-clock-counter-clockwise text-purple-500';
      default:
        return 'ph ph-tag text-color-secondary';
    }
  }

  /**
   * Traduce el tipo de tarea a español
   */
  getTaskTypeDisplay(type: string | undefined): string {
    if (!type) return 'Tarea';
    const typeMap: Record<string, string> = {
      task: 'Tarea',
      bug: 'Bug',
      subtask: 'Subtarea',
      history_user: 'Historia de Usuario',
    };
    return typeMap[type.toLowerCase()] || type;
  }

  /**
   * Obtiene el nombre del estado de la tarea
   */
  getTaskState(task: KanbanTask): string {
    return task.state?.state || '';
  }

  /**
   * Obtiene la severidad para el tag de prioridad
   */
  getPrioritySeverity(priority: string | null): string {
    switch (priority?.toLowerCase()) {
      case 'critical':
        return 'danger';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  }

  /**
   * Obtiene el nombre del usuario creador
   */
  getCreatedByName(task: KanbanTask): string {
    return task.created_by?.name || 'Sistema';
  }

  /**
   * Obtiene el nombre del usuario asignado
   */
  getAssignedToName(task: KanbanTask): string | null {
    return task.assigned_to?.name || null;
  }

  /**
   * Obtiene el rol del usuario asignado
   */
  getAssignedToRole(task: KanbanTask): string | null {
    return task.assigned_to?.role || null;
  }

  /**
   * Obtiene la foto de perfil del usuario asignado
   */
  getAssignedToAvatar(task: KanbanTask): string | undefined {
    // Si en el futuro agregas avatar a ProjectMember, aquí lo obtendrías
    return undefined;
  }

  /**
   * Verifica si la tarea está próxima a vencer (menos de 3 días)
   */
  isNearDueDate(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 3;
  }

  /**
   * Verifica si la tarea está vencida
   */
  isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const today = new Date();
    const due = new Date(dueDate);
    return due < today;
  }

  /**
   * Navega a ver detalles de la tarea
   */
  viewTask(taskId: number): void {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'task-details', taskId]);
  }

  /**
   * Navega a editar la tarea
   */
  editTask(taskId: number): void {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'task-update', taskId]);
  }

  /**
   * Crea una nueva tarea en la columna especificada - AHORA CON ID NUMÉRICO
   */
  createTask(columnId: number): void {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'create-task', columnId]);
  }

  /**
   * Abre el menú de ordenamiento
   */
  openSortMenu(event: Event): void {
    this.sortMenu.toggle(event);
  }

  getTaskAccentColor(task: KanbanTask): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si la tarea está finalizada (aprobada)
    if (task.state?.state?.toLowerCase() === 'finalizada' || task.state?.state?.toLowerCase() === 'aprobada') {
      return 'DAEEF3'; // Azul claro - Finalizada (aprobada)
    }

    // Si la tarea está en revisión
    if (task.state?.state?.toLowerCase() === 'revisión' || task.state?.state?.toLowerCase() === 'review') {
      return 'FFF9C4'; // Amarillo claro - En Revisión
    }

    // Si la tarea está terminada
    if (
      task.state?.state?.toLowerCase() === 'terminada' ||
      task.state?.state?.toLowerCase() === 'completed' ||
      task.state?.state?.toLowerCase() === 'done'
    ) {
      // Verificar si tiene fecha de vencimiento
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        // Si la fecha de vencimiento es menor a hoy (terminada después de vencer)
        if (dueDate < today) {
          return 'F2DCDB'; // Rosa claro - Terminada fuera de plazo
        }
      }

      return 'C6EFCE'; // Verde claro - Terminada a tiempo
    }

    // Si la tarea NO está terminada (pendiente, en progreso, etc.)
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Calcular diferencia en días
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Si está vencida (fecha pasada)
      if (dueDate < today) {
        return 'F4CCCC'; // Rojo claro - Vencida sin terminar
      }

      // Si está por vencer en 72 horas (3 días) o menos
      if (diffDays <= 3) {
        return 'FCE4CC'; // Naranja claro - A 72 horas de vencer
      }
    }

    // Si no aplica ninguna condición especial, usar el color del estado original
    return task.state?.color || 'E5E7EB'; // Gris por defecto
  }
  /**
   * Traduce la prioridad del backend a español para mostrar en pantalla
   */
  getPriorityDisplay(priority: string | null): string {
    if (!priority) return '';

    const priorityMap: Record<string, string> = {
      critical: 'crítico',
      high: 'alto',
      medium: 'medio',
      low: 'bajo',
    };

    return priorityMap[priority.toLowerCase()] || priority;
  }
  /**
 * Obtiene el color de fondo para la tarjeta de tarea
 */
  public getCardBackgroundColor(task: KanbanTask): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const state = task.state?.state?.toLowerCase() || '';

    // 1. ASIGNADO - D6E4F0
    if (state === 'asignado' || state === 'asignada' || state === 'assigned') {
      return '#D6E4F0';
    }

    // 2. EJECUTANDO - D9E2F3
    if (state === 'ejecutando' || state === 'en progreso' || state === 'in progress' || state === 'progress') {
      return '#D9E2F3';
    }

    // 3. SUSPENDIDO - FFF2CC
    if (state === 'suspendido' || state === 'suspendida' || state === 'paused' || state === 'on hold') {
      return '#FFF2CC';
    }

    // 4. TERMINADA (a tiempo) - C6EFCE
    if (state === 'terminada' || state === 'completed' || state === 'done') {
      // Verificar si tiene fecha de vencimiento
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);

        // Si la fecha de vencimiento es menor a hoy (terminada después de vencer)
        if (dueDate < today) {
          return '#F2DCDB'; // 5. TERMINADA (fuera de plazo)
        }
      }
      return '#C6EFCE'; // 4. TERMINADA (a tiempo)
    }

    // 6. EN REVISIÓN - FFF9C4
    if (state === 'revisión' || state === 'review' || state === 'en revisión') {
      return '#FFF9C4';
    }

    // 7. FINALIZADA - DAEEF3
    if (state === 'finalizada' || state === 'finalizado' || state === 'approved' || state === 'aprobada') {
      return '#DAEEF3';
    }

    // Si la tarea NO está en ninguno de los estados anteriores (pendiente, etc.)
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);

      // Calcular diferencia en días
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Si está vencida (fecha pasada)
      if (dueDate < today) {
        return '#F4CCCC'; // Rojo claro - Vencida sin terminar
      }

      // Si está por vencer en 72 horas (3 días) o menos
      if (diffDays <= 3) {
        return '#FCE4CC'; // Naranja claro - A 72 horas de vencer
      }
    }

    // Color por defecto si no hay estado específico
    return '#F9FAFB'; // Gris muy claro por defecto
  }
}
