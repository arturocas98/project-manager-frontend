import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {DialogModule} from "primeng/dialog";
import {ButtonModule} from "primeng/button";
import {RippleModule} from "primeng/ripple";
import {ChipsModule} from "primeng/chips";
import {FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DatePipe, NgForOf, NgIf, SlicePipe} from "@angular/common";
import {TooltipModule} from "primeng/tooltip";
import {AvatarModule} from "primeng/avatar";
import {MenuModule} from "primeng/menu";
import {PanelModule} from "primeng/panel";
import {CdkDrag, CdkDragHandle, CdkDragPlaceholder, CdkDragPreview, CdkDropList} from "@angular/cdk/drag-drop";
import {CheckboxModule} from "primeng/checkbox";
import {TagModule} from "primeng/tag";
import {SidebarModule} from "primeng/sidebar";
import {DropdownModule} from "primeng/dropdown";
import {ActivatedRoute, Router} from "@angular/router";
import {KanbanService} from "../../../../../core/service/kanban-service";
import {MessageService} from "primeng/api";
import {Subject} from "rxjs";
import {KanbanColumn, KanbanTask, ProjectMember} from "../../../../../shared/models/kanban.models";

@Component({
  selector: 'app-kanban-list',
  standalone: true,
  imports: [
    DialogModule,
    ButtonModule,
    RippleModule,
    ChipsModule,
    ReactiveFormsModule,
    NgIf,
    TooltipModule,
    AvatarModule,
    NgForOf,
    SlicePipe,
    MenuModule,
    PanelModule,
    CdkDragHandle,
    CdkDropList,
    CdkDrag,
    CdkDragPreview,
    CdkDragPlaceholder,
    CheckboxModule,
    FormsModule,
    TagModule,
    DatePipe,
    SidebarModule,
    DropdownModule
  ],
  templateUrl: './kanban-list.component.html',
})
export class KanbanListComponent  implements OnInit, OnDestroy {
  @ViewChild('menu') sortMenu: any;

  private destroy$ = new Subject<void>();
  private projectId!: number;

  // Datos principales
  columns: KanbanColumn[] = [];
  members: ProjectMember[] = [];
  loading = true;

  // Selección múltiple
  showSelection = true; // Activar/desactivar según preferencia
  selectedTasks: KanbanTask[] = [];
  showMoveDialogVisible = false;
  targetColumnId: number | null = null;

  // Filtros (IDÉNTICO al original)
  searchControl = new FormControl('');
  selectedPriorities: string[] = [];
  selectedTypes: string[] = [];
  selectedAssignees: number[] = [];
  filtersActive = false;
  showFiltersPanel = false;

  // Opciones para filtros (IDÉNTICO al original)
  priorityOptions = [ /* ... */ ];
  typeOptions = [ /* ... */ ];

  // Menú de ordenamiento (IDÉNTICO al original)
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
    this.loadBoard();
    this.loadMembers();
    this.setupSearch();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==================== MÉTODOS DE CARGA ====================

  private loadBoard(): void {
    this.loading = true;
    this.kanbanService.getKanbanBoard(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (columns) => {
          // Añadir propiedad 'selected' a cada tarea
          this.columns = columns.map(col => ({
            ...col,
            tasks: col.tasks.map(task => ({ ...task, selected: false }))
          }));
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading kanban board:', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el tablero' });
          this.loading = false;
        }
      });
  }

  private loadMembers(): void {
    this.kanbanService.getProjectMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => this.members = members,
        error: (error) => console.error('Error loading members:', error)
      });
  }

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

  refresh(): void {
    this.loadBoard();
    this.loadMembers();
  }

  // ==================== MÉTODOS DE SELECCIÓN ====================

  getAllTasksCount(): number {
    return this.columns.reduce((acc, col) => acc + col.tasks.length, 0);
  }

  onTaskSelect(task: KanbanTask): void {
    if (task.selected) {
      this.selectedTasks.push(task);
    } else {
      this.selectedTasks = this.selectedTasks.filter(t => t.id !== task.id);
    }
  }

  deselectTask(task: KanbanTask): void {
    task.selected = false;
    this.selectedTasks = this.selectedTasks.filter(t => t.id !== task.id);
  }

  showMoveDialog(): void {
    if (this.selectedTasks.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Aviso', detail: 'Selecciona al menos una tarea' });
      return;
    }
    this.showMoveDialogVisible = true;
  }

  moveSelectedTasks(): void {
    if (!this.targetColumnId) return;

    const targetColumn = this.columns.find(col => col.id === this.targetColumnId);
    if (!targetColumn) return;

    // Mover todas las tareas seleccionadas
    this.selectedTasks.forEach(task => {
      // Encontrar columna origen
      const sourceColumn = this.columns.find(col =>
        col.tasks.some(t => t.id === task.id)
      );

      if (sourceColumn) {
        const taskIndex = sourceColumn.tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
          // Remover de origen
          sourceColumn.tasks.splice(taskIndex, 1);
          // Añadir a destino
          targetColumn.tasks.push(task);

          // Actualizar backend
          this.kanbanService.updateTaskStatus(this.projectId, task.id, this.targetColumnId!).subscribe({
            error: (error) => {
              console.error('Error moving task:', error);
              // Revertir en caso de error
              this.loadBoard();
            }
          });
        }
      }
    });

    // Limpiar selección
    this.selectedTasks.forEach(t => t.selected = false);
    this.selectedTasks = [];
    this.showMoveDialogVisible = false;
    this.targetColumnId = null;

    this.messageService.add({
      severity: 'success',
      summary: 'Movidas',
      detail: `Tareas movidas a ${targetColumn.title}`
    });
  }

  // ==================== DRAG & DROP ====================

  getConnectedLists(): string[] {
    return this.columns.map(col => col.id.toString());
  }

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

      // Actualizar en el backend
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
          // Revertir en caso de error
          transferArrayItem(
            event.container.data,
            event.previousContainer.data,
            event.currentIndex,
            event.previousIndex
          );
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar' });
        }
      });
    }
  }

  private getColumnTitle(columnId: number): string {
    return this.columns.find(col => col.id === columnId)?.title || '';
  }

  // ==================== FILTROS (IDÉNTICO AL ORIGINAL) ====================

  showFilters(): void {
    this.showFiltersPanel = true;
  }

  applyFilters(): void {
    this.kanbanService.updateFilters({
      priority: this.selectedPriorities,
      type: this.selectedTypes,
      assignee: this.selectedAssignees
    });
    this.showFiltersPanel = false;
  }

  clearFilters(): void {
    this.selectedPriorities = [];
    this.selectedTypes = [];
    this.selectedAssignees = [];
    this.searchControl.setValue('');
    this.kanbanService.resetFilters();
    this.filtersActive = false;
    this.showFiltersPanel = false;
  }

  private checkFiltersActive(): void {
    this.filtersActive = !!(
      this.searchControl.value ||
      this.selectedPriorities.length ||
      this.selectedTypes.length ||
      this.selectedAssignees.length
    );
  }

  getActiveFiltersCount(): number {
    let count = 0;
    if (this.searchControl.value) count++;
    count += this.selectedPriorities.length;
    count += this.selectedTypes.length;
    count += this.selectedAssignees.length;
    return count;
  }

  // ==================== ORDENAMIENTO ====================

  sortByDate(direction: 'asc' | 'desc'): void {
    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        return direction === 'desc' ? dateB - dateA : dateA - dateB;
      });
    });
  }

  sortByPriority(): void {
    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const priorityA = a.priority ? priorityOrder[a.priority] ?? 999 : 999;
        const priorityB = b.priority ? priorityOrder[b.priority] ?? 999 : 999;
        return priorityA - priorityB;
      });
    });
  }

  sortByType(): void {
    const typeOrder: Record<string, number> = { bug: 0, task: 1, subtask: 2, history_user: 3 };
    this.columns.forEach(column => {
      column.tasks.sort((a, b) => {
        const typeA = typeOrder[a.type.type.toLowerCase()] ?? 999;
        const typeB = typeOrder[b.type.type.toLowerCase()] ?? 999;
        return typeA - typeB;
      });
    });
  }

  openSortMenu(event: Event): void {
    this.sortMenu.toggle(event);
  }

  // ==================== MÉTODOS DE UTILIDAD ====================

  getTypeIcon(type: string): string {
    const map: Record<string, string> = {
      bug: 'pi pi-bug',
      task: 'pi pi-check-square',
      subtask: 'pi pi-sitemap',
      history_user: 'pi pi-history'
    };
    return map[type?.toLowerCase()] || 'pi pi-tag';
  }

  getPrioritySeverity(priority: string | null): string {
    const map: Record<string, string> = {
      critical: 'danger',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return map[priority?.toLowerCase() || ''] || 'secondary';
  }

  getAssigneeColor(name: string): string {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  isNearDueDate(dueDate: string | null): boolean {
    if (!dueDate) return false;
    const diff = new Date(dueDate).getTime() - new Date().getTime();
    return diff > 0 && diff <= 3 * 24 * 60 * 60 * 1000;
  }

  isOverdue(dueDate: string | null): boolean {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }

  // ==================== NAVEGACIÓN ====================

  viewTask(taskId: number): void {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'task-details', taskId]);
  }

  editTask(taskId: number): void {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'task-update', taskId]);
  }

  createTask(columnId: number): void {
    this.router.navigate(['/project-management/projects/kanban', this.projectId, 'create-task', columnId]);
  }
}
