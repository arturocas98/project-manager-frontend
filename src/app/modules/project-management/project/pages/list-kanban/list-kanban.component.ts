import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from "rxjs";
import { KanbanColumn, KanbanTask, ProjectMember } from "../../../../../shared/models/kanban.models";
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MenuItem, MessageService } from "primeng/api";
import { ActivatedRoute, Router } from "@angular/router";
import { KanbanService } from "../../../../../core/service/kanban-service";
import { CommonModule, DatePipe, SlicePipe } from "@angular/common";
import { TableModule } from 'primeng/table';
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { TooltipModule } from "primeng/tooltip";
import { AvatarModule } from "primeng/avatar";
import { Menu, MenuModule } from 'primeng/menu';
import { TagModule } from "primeng/tag";
import { SidebarModule } from "primeng/sidebar";
import { CheckboxModule } from "primeng/checkbox";
import { DropdownModule } from 'primeng/dropdown';
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';
import { BadgeModule } from 'primeng/badge';

interface PriorityOption {
  label: string;
  value: string;
  icon: string;
}

interface TypeOption {
  label: string;
  value: string;
  icon: string;
}

interface AssigneeOption {
  label: string;
  value: number;
}

interface ColumnOption {
  title: string;
  id: number;
}

@Component({
  selector: 'app-list-kanban',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    TooltipModule,
    AvatarModule,
    MenuModule,
    TagModule,
    SidebarModule,
    CheckboxModule,
    DropdownModule,
    MultiSelectModule,
    CalendarModule,
    BadgeModule,
    FormsModule,
    ReactiveFormsModule,
    DatePipe,
    SlicePipe
  ],
  templateUrl: './list-kanban.component.html',
})
export class ListKanbanComponent implements OnInit, OnDestroy {
  @ViewChild('menu') sortMenu!: Menu;

  private destroy$ = new Subject<void>();
  private projectId!: number;

  // Datos principales
  columns: KanbanColumn[] = [];
  members: ProjectMember[] = [];
  allTasks: KanbanTask[] = [];
  filteredTasks: KanbanTask[] = [];
  loading = true;

  // Filtros
  searchControl = new FormControl('');
  selectedPriorities: string[] = [];
  selectedTypes: string[] = [];
  selectedAssignees: number[] = [];
  selectedColumn: number | null = null;
  filtersActive = false;
  showFiltersPanel = false;

  // Vista
  viewMode: 'board' | 'list' = 'list';

  // Total de tareas
  totalTasks = 0;

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

  // Opciones para dropdowns de la tabla
  columnOptions: ColumnOption[] = [];
  assigneeOptions: AssigneeOption[] = [];

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
    },
    {
      label: 'Por estado',
      icon: 'pi pi-tags',
      command: () => this.sortByState()
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
          this.updateColumnOptions();
          this.flattenTasks();
          this.applyLocalFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading kanban board:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo cargar la lista de tareas'
          });
          this.loading = false;
        }
      });
  }

  /**
   * Actualiza las opciones de columnas para los filtros
   */
  private updateColumnOptions(): void {
    this.columnOptions = this.columns.map(col => ({
      title: col.title,
      id: col.id
    }));
  }

  /**
   * Aplana todas las tareas de todas las columnas en un solo array
   */
  private flattenTasks(): void {
    this.allTasks = this.columns.reduce((acc, column) => {
      return [...acc, ...column.tasks];
    }, [] as KanbanTask[]);

    this.totalTasks = this.allTasks.length;
  }

  /**
   * Aplica filtros locales (por columna seleccionada)
   */
  private applyLocalFilters(): void {
    let filtered = [...this.allTasks];

    // Filtrar por columna si hay una seleccionada
    if (this.selectedColumn !== null) {
      const column = this.columns.find(col => col.id === this.selectedColumn);
      if (column) {
        filtered = column.tasks;
      }
    }

    this.filteredTasks = filtered;
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
          this.updateAssigneeOptions();
        },
        error: (error) => {
          console.error('Error loading members:', error);
        }
      });
  }

  /**
   * Actualiza las opciones de asignados para los filtros
   */
  private updateAssigneeOptions(): void {
    this.assigneeOptions = this.members.map(member => ({
      label: member.user.name + ' (' + member.role.type + ')',
      value: member.user.id
    }));
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
        this.selectedPriorities = filters.priority;
        this.selectedTypes = filters.type;
        this.selectedAssignees = filters.assignee;
        this.searchControl.setValue(filters.search, { emitEvent: false });
        this.loadBoard();
      });
  }

  /**
   * Filtra por columna (estado)
   */
  filterByColumn(columnId: number): void {
    this.selectedColumn = columnId;
    this.applyLocalFilters();
  }

  /**
   * Limpia el filtro de columna
   */
  clearColumnFilter(): void {
    this.selectedColumn = null;
    this.applyLocalFilters();
  }

  /**
   * Cambia entre vista board y lista
   */
  changeView(view: 'board' | 'list'): void {
    if (view === 'board') {
      this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'project-kanban'
      ])
    }
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
    this.checkFiltersActive();
  }

  /**
   * Aplica filtro de tipo
   */
  applyTypeFilter(type: string): void {
    this.checkFiltersActive();
  }

  /**
   * Aplica filtro de asignado
   */
  applyAssigneeFilter(userId: number): void {
    this.checkFiltersActive();
  }

  /**
   * Limpia todos los filtros
   */
  clearFilters(): void {
    this.selectedPriorities = [];
    this.selectedTypes = [];
    this.selectedAssignees = [];
    this.selectedColumn = null;
    this.searchControl.setValue('');
    this.kanbanService.resetFilters();
    this.filtersActive = false;
    this.showFiltersPanel = false;
    this.applyLocalFilters();
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
   * Ordena por fecha
   */
  sortByDate(direction: 'asc' | 'desc'): void {
    this.filteredTasks.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return direction === 'desc' ? dateB - dateA : dateA - dateB;
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

    this.filteredTasks.sort((a, b) => {
      const priorityA = a.priority ? priorityOrder[a.priority] ?? 999 : 999;
      const priorityB = b.priority ? priorityOrder[b.priority] ?? 999 : 999;
      return priorityA - priorityB;
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

    this.filteredTasks.sort((a, b) => {
      const typeA = typeOrder[a.type?.type?.toLowerCase()] ?? 999;
      const typeB = typeOrder[b.type?.type?.toLowerCase()] ?? 999;
      return typeA - typeB;
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Ordenado',
      detail: 'Tareas ordenadas por tipo'
    });
  }

  /**
   * Ordena por estado
   */
  sortByState(): void {
    this.filteredTasks.sort((a, b) => {
      return (a.state?.state || '').localeCompare(b.state?.state || '');
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Ordenado',
      detail: 'Tareas ordenadas por estado'
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
   * Traduce la prioridad del backend a español
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

  /**
   * Obtiene color para el avatar basado en el nombre
   */
  getAssigneeColor(name: string): string {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#6b7280'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  /**
   * Obtiene color de acento para la tarea
   */
  getTaskAccentColor(task: KanbanTask): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (task.state?.state?.toLowerCase() === 'finalizada' ||
      task.state?.state?.toLowerCase() === 'aprobada') {
      return 'DAEEF3';
    }

    if (task.state?.state?.toLowerCase() === 'revisión' ||
      task.state?.state?.toLowerCase() === 'review') {
      return 'FFF9C4';
    }

    if (task.state?.state?.toLowerCase() === 'terminada' ||
      task.state?.state?.toLowerCase() === 'completed' ||
      task.state?.state?.toLowerCase() === 'done') {

      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        dueDate.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          return 'F2DCDB';
        }
      }
      return 'C6EFCE';
    }

    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dueDate < today) {
        return 'F4CCCC';
      }
      if (diffDays <= 3) {
        return 'FCE4CC';
      }
    }

    return task.state?.color || 'E5E7EB';
  }

  /**
   * Verifica si la tarea está próxima a vencer
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
    ]);
  }

  /**
   * Navega a ver tarea padre
   */
  viewParentTask(taskId: number): void {
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'task-details',
      taskId
    ]);
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
    ]);
  }

  /**
   * Crea una nueva tarea
   */
  createTask(): void {
    const defaultColumn = this.columns.find(col => col.title === 'Asignado')?.id || this.columns[0]?.id;
    if (defaultColumn) {
      this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'create-task',
        defaultColumn
      ]);
    }
  }

  /**
   * Abre el menú de ordenamiento
   */
  openSortMenu(event: Event): void {
    this.sortMenu.toggle(event);
  }
}
