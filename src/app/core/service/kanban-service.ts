import { Injectable } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { ApiService } from './api.service';
import { KanbanColumn, KanbanFilters, KanbanTask, ProjectMember } from '../../shared/models/kanban.models';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private filtersSubject = new BehaviorSubject<KanbanFilters>({
    search: '',
    priority: [],
    type: [],
    assignee: [],
  });

  filters$ = this.filtersSubject.asObservable();

  // Mapeo de estados a IDs numéricos (esto debería coincidir con tu backend)
  private readonly STATE_IDS = {
    open: 1,
    progress: 2,
    review: 3,
    closed: 4,
    locked: 5,
    finished: 6,
  } as const;

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todas las tareas del proyecto
   */
  getProjectTasks(projectId: number): Observable<KanbanTask[]> {
    return this.apiService.get<KanbanTask[]>(`projects/${projectId}/incidences`).pipe(shareReplay(1));
  }

  /**
   * Obtiene los miembros del proyecto
   */
  getProjectMembers(projectId: number): Observable<ProjectMember[]> {
    return this.apiService.get<ProjectMember[]>(`projects/${projectId}/members`);
  }

  /**
   * Obtiene el tablero Kanban con tareas organizadas y filtradas
   */
  getKanbanBoard(projectId: number): Observable<KanbanColumn[]> {
    return combineLatest([this.getProjectTasks(projectId), this.filters$]).pipe(
      map(([tasks, filters]) => this.organizeTasksByStatus(this.applyFilters(tasks, filters)))
    );
  }

  /**
   * Aplica filtros a las tareas
   */
  private applyFilters(tasks: KanbanTask[], filters: KanbanFilters): KanbanTask[] {
    return tasks.filter(task => {
      // 🔍 Filtro por búsqueda
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // 🔥 Filtro por prioridad
      if (filters.priority.length > 0 && (!task.priority || !filters.priority.includes(task.priority))) {
        return false;
      }

      // 🏷 Filtro por tipo
      if (filters.type.length > 0 && (!task.type || !filters.type.includes(task.type.type))) {
        return false;
      }

      // 👤 Filtro por asignado
      if (filters.assignee.length > 0 && (!task.assigned_to || !filters.assignee.includes(task.assigned_to.id))) {
        return false;
      }

      return true;
    });
  }

  /**
   * Organiza las tareas por estado con IDs numéricos
   */
  private organizeTasksByStatus(tasks: KanbanTask[]): KanbanColumn[] {
    // Ordenar tareas por fecha de creación (más recientes primero)
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Columnas con IDs numéricos
    const columns: KanbanColumn[] = [
      {
        id: this.STATE_IDS.open, // 1
        title: 'Por hacer',
        icon: 'pi pi-folder-open',
        color: '#94a3b8',
        tasks: [],
      },
      {
        id: this.STATE_IDS.progress, // 2
        title: 'En progreso',
        icon: 'pi pi-spinner',
        color: '#f59e0b',
        tasks: [],
      },
      {
        id: this.STATE_IDS.review, // 3
        title: 'En revision',
        icon: 'pi pi-eye',
        color: '#3b82f6',
        tasks: [],
      },
      // {
      //   id: this.STATE_IDS.closed, // 4
      //   title: 'Closed',
      //   icon: 'pi pi-times-circle',
      //   color: '#6b7280',
      //   tasks: [],
      // },
      // {
      //   id: this.STATE_IDS.locked, // 5
      //   title: 'Locked',
      //   icon: 'pi pi-lock',
      //   color: '#ef4444',
      //   tasks: [],
      // },
      {
        id: this.STATE_IDS.finished, // 6
        title: 'Finalizada',
        icon: 'pi pi-check-circle',
        color: '#10b981',
        tasks: [],
      },
    ];

    // Asignar tareas a las columnas correspondientes usando el ID numérico
    sortedTasks.forEach(task => {
      // Obtener el ID del estado basado en el string del estado
      const stateId = this.getStateIdFromString(task.state.state?.toLowerCase());

      // Buscar la columna por ID numérico
      const column = columns.find(col => col.id === stateId);

      if (column) {
        column.tasks.push(task);
      } else {
        // Si el estado no coincide, poner en open por defecto (ID 1)
        const defaultColumn = columns.find(col => col.id === this.STATE_IDS.open);
        if (defaultColumn) {
          defaultColumn.tasks.push(task);
        }
      }
    });

    return columns;
  }

  /**
   * Convierte un string de estado a su ID numérico
   */
  private getStateIdFromString(state: string | undefined): number {
    switch (state) {
      case 'open':
        return this.STATE_IDS.open;
      case 'progress':
      case 'in progress':
        return this.STATE_IDS.progress;
      case 'review':
        return this.STATE_IDS.review;
      case 'closed':
        return this.STATE_IDS.closed;
      case 'locked':
        return this.STATE_IDS.locked;
      case 'finished':
        return this.STATE_IDS.finished;
      default:
        return this.STATE_IDS.open; // Default a open
    }
  }

  /**
   * Obtiene el string del estado a partir del ID (útil para debugging)
   */
  getStateStringFromId(stateId: number): string {
    switch (stateId) {
      case this.STATE_IDS.open:
        return 'open';
      case this.STATE_IDS.progress:
        return 'progress';
      case this.STATE_IDS.review:
        return 'review';
      case this.STATE_IDS.closed:
        return 'closed';
      case this.STATE_IDS.locked:
        return 'locked';
      case this.STATE_IDS.finished:
        return 'finished';
      default:
        return 'open';
    }
  }

  /**
   * Actualiza los filtros
   */
  updateFilters(filters: Partial<KanbanFilters>) {
    const currentFilters = this.filtersSubject.value;
    this.filtersSubject.next({
      ...currentFilters,
      ...filters,
    });
  }

  /**
   * Resetea los filtros
   */
  resetFilters() {
    this.filtersSubject.next({
      search: '',
      priority: [],
      type: [],
      assignee: [],
    });
  }

  /**
   * Actualiza el estado de una tarea (drag & drop)
   */
  updateTaskStatus(projectId: number, taskId: number, newStateId: number): Observable<any> {
    return this.apiService.put(`projects/${projectId}/incidences/${taskId}/update`, { incidence_state_id: newStateId });
  }

  /**
   * Método helper para obtener todas las columnas disponibles
   */
  getAvailableColumns(): KanbanColumn[] {
    return [
      {
        id: this.STATE_IDS.open,
        title: 'Open',
        icon: 'pi pi-folder-open',
        color: '#94a3b8',
        tasks: [],
      },
      {
        id: this.STATE_IDS.progress,
        title: 'In Progress',
        icon: 'pi pi-spinner',
        color: '#f59e0b',
        tasks: [],
      },
      {
        id: this.STATE_IDS.review,
        title: 'Review',
        icon: 'pi pi-eye',
        color: '#3b82f6',
        tasks: [],
      },
      {
        id: this.STATE_IDS.closed,
        title: 'Closed',
        icon: 'pi pi-times-circle',
        color: '#6b7280',
        tasks: [],
      },
      {
        id: this.STATE_IDS.locked,
        title: 'Locked',
        icon: 'pi pi-lock',
        color: '#ef4444',
        tasks: [],
      },
      {
        id: this.STATE_IDS.finished,
        title: 'Finished',
        icon: 'pi pi-check-circle',
        color: '#10b981',
        tasks: [],
      },
    ];
  }
}
