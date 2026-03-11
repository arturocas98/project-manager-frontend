import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {debounceTime, distinctUntilChanged, Subject, takeUntil} from "rxjs";
import {KanbanColumn, KanbanTask, ProjectMember} from "../../../../../shared/models/kanban.models";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MenuItem, MessageService} from "primeng/api";
import {ActivatedRoute, Router} from "@angular/router";
import {KanbanService} from "../../../../../core/service/kanban-service";
import {TotalTasksPipe} from "../../../../../shared/Pipes/total-tasks.pipe";
import {InputTextModule} from "primeng/inputtext";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import { BadgeModule } from 'primeng/badge';
import {TooltipModule} from "primeng/tooltip";
import {AvatarModule} from "primeng/avatar";
import {DatePipe, NgForOf, NgIf, NgStyle, SlicePipe} from "@angular/common";
import {Menu, MenuModule} from 'primeng/menu';
import {TagModule} from "primeng/tag";
import { DragDropModule } from 'primeng/dragdrop';
import {SidebarModule} from "primeng/sidebar";
import {CheckboxModule} from "primeng/checkbox";
import {
  CdkDrag, CdkDragDrop,
  CdkDragPlaceholder,
  CdkDragPreview,
  CdkDropList,
  CdkDropListGroup, moveItemInArray,
  transferArrayItem
} from "@angular/cdk/drag-drop";

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
    FormsModule,
    DatePipe,
    CdkDropList,
    CdkDrag,
    CdkDropListGroup,
    CdkDragPreview,
    CdkDragPlaceholder,
    NgStyle
  ],
  templateUrl: './kanban-project.component.html',
})
export class KanbanProjectComponent  implements OnInit, OnDestroy {
  @ViewChild('menu') sortMenu!: Menu;

  private destroy$ = new Subject<void>();
  private projectId!: number;

  // Datos principales
  columns: KanbanColumn[] = [];
  members: ProjectMember[] = [];
  loading = true;

  // Filtros
  searchControl = new FormControl('');
  selectedPriorities: string[] = [];
  selectedTypes: string[] = [];
  selectedAssignees: number[] = [];
  filtersActive = false;
  showFiltersPanel = false;

  // Opciones para filtros
  priorityOptions: PriorityOption[] = [
    { label: 'Critical', value: 'critical', icon: 'pi pi-exclamation-triangle' },
    { label: 'High', value: 'high', icon: 'pi pi-arrow-up' },
    { label: 'Medium', value: 'medium', icon: 'pi pi-minus' },
    { label: 'Low', value: 'low', icon: 'pi pi-arrow-down' }
  ];

  typeOptions: TypeOption[] = [
    { label: 'Task', value: 'task', icon: 'pi pi-check-square' },
    { label: 'Bug', value: 'bug', icon: 'pi pi-exclamation-triangle' },
    { label: 'Subtask', value: 'subtask', icon: 'pi pi-sitemap' },
    { label: 'History', value: 'history_user', icon: 'pi pi-history' }
  ];

  // Menú de ordenamiento
  sortMenuItems: MenuItem[] = [
    {
      label: 'Más recientes',
      icon: 'pi pi-sort-amount-down',
      command: () => this.sortByDate('desc')
    },
    {
      label: 'Más antiguos',
      icon: 'pi pi-sort-amount-up-alt',
      command: () => this.sortByDate('asc')
    },
    {
      label: 'Por prioridad',
      icon: 'pi pi-exclamation-triangle',
      command: () => this.sortByPriority()
    },
    {
      label: 'Por tipo',
      icon: 'pi pi-tag',
      command: () => this.sortByType()
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private kanbanService: KanbanService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
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
  private loadBoard(): void {
    this.loading = true;

    this.kanbanService.getKanbanBoard(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (columns) => {
          this.columns = columns;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading kanban board:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar el tablero Kanban'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Carga los miembros del proyecto
   */
  private loadMembers(): void {
    this.kanbanService.getProjectMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
        },
        error: (error) => {
          console.error('Error loading members:', error);
        }
      });
  }

  /**
   * Configura la búsqueda con debounce
   */
  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(search => {
      this.kanbanService.updateFilters({ search: search || '' });
      this.checkFiltersActive();
    });
  }

  /**
   * Se suscribe a los cambios de filtros
   */
  private setupFilters(): void {
    this.kanbanService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(filters => {
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
      assignee: this.selectedAssignees
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
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#6b7280'
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
    this.searchControl.setValue('');
    this.kanbanService.resetFilters();
    this.filtersActive = false;
    this.showFiltersPanel = false;
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
    return this.columns
      .filter(col => col.id !== currentColumnId)
      .map(col => col.id.toString()); // IMPORTANTE: CdkDropList espera strings para conectar
  }

  /**
   * Maneja el drop de tareas - AHORA CON ID NUMÉRICO
   */
  onTaskDrop(event: CdkDragDrop<KanbanTask[]>, columnId: number): void {
    if (event.previousContainer === event.container) {
      // Reordenar dentro de la misma columna
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      // Mover entre columnas
      const task = event.previousContainer.data[event.previousIndex];

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Actualizar en el backend - PASAMOS EL columnId COMO NUMBER
      this.kanbanService.updateTaskStatus(this.projectId, task.id, columnId).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Movido',
            detail: `Tarea movida a ${this.getColumnTitle(columnId)}`,
            life: 2000
          });
        },
        error: (error) => {
          console.error('Error updating task status:', error);

          // Revertir el movimiento en caso de error
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );

          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el estado de la tarea'
          });
        }
      });
    }
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
      detail: `Tareas ordenadas por fecha (${direction === 'desc' ? 'más recientes' : 'más antiguas'})`
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
      low: 3
    };

    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const priorityA = a.priority ? priorityOrder[a.priority] ?? 999 : 999;
        const priorityB = b.priority ? priorityOrder[b.priority] ?? 999 : 999;
        return priorityA - priorityB;
      });
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Ordenado',
      detail: 'Tareas ordenadas por prioridad'
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
      history_user: 3
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
      detail: 'Tareas ordenadas por tipo'
    });
  }

  /**
   * Obtiene el icono del tipo de tarea
   */
  getTypeIcon(type: string): string {
    switch (type?.toLowerCase()) {
      case 'bug': return 'pi pi-bug';
      case 'task': return 'pi pi-check-square';
      case 'subtask': return 'pi pi-sitemap';
      case 'history_user': return 'pi pi-history';
      default: return 'pi pi-tag';
    }
  }

  /**
   * Obtiene el nombre del tipo de tarea como string
   */
  getTaskType(task: KanbanTask): string {
    return task.type?.type || 'task';
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
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'secondary';
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
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'task-details',
      taskId
    ])
  }

  /**
   * Navega a editar la tarea
   */
  editTask(taskId: number): void {
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'task-update',
      taskId
    ])
  }

  /**
   * Crea una nueva tarea en la columna especificada - AHORA CON ID NUMÉRICO
   */
  createTask(columnId: number): void {
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'create-task',
      columnId
    ])
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
    if (task.state?.state?.toLowerCase() === 'finalizada' ||
      task.state?.state?.toLowerCase() === 'aprobada') {
      return 'DAEEF3'; // Azul claro - Finalizada (aprobada)
    }

    // Si la tarea está en revisión
    if (task.state?.state?.toLowerCase() === 'revisión' ||
      task.state?.state?.toLowerCase() === 'review') {
      return 'FFF9C4'; // Amarillo claro - En Revisión
    }

    // Si la tarea está terminada
    if (task.state?.state?.toLowerCase() === 'terminada' ||
      task.state?.state?.toLowerCase() === 'completed' ||
      task.state?.state?.toLowerCase() === 'done') {

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
      'critical': 'crítico',
      'high': 'alto',
      'medium': 'medio',
      'low': 'bajo'
    };

    return priorityMap[priority.toLowerCase()] || priority;
  }

}
