import { Injectable } from '@angular/core';
import { Observable, combineLatest, BehaviorSubject } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { KanbanColumn, KanbanFilters, KanbanTask, ProjectMember } from '../../shared/models/kanban.models';

@Injectable({
  providedIn: 'root',
})
export class KanbanService {
  private projectTasksCache = new Map<number, BehaviorSubject<KanbanTask[]>>();
  private filtersSubject = new BehaviorSubject<KanbanFilters>({
    search: '',
    priority: [],
    type: [],
    assignee: [],
  });

  filters$ = this.filtersSubject.asObservable();

  // Mapeo de estados según los datos de la base de datos
  private readonly STATE_IDS = {
    asignado: 1,
    ejecutando: 2,
    suspendido: 3,
    terminada: 4,
    terminada_fuera_plazo: 5,
    en_revision: 6,
    finalizada: 7,
  } as const;

  constructor(private apiService: ApiService) {}

  /**
   * Obtiene todas las tareas del proyecto
   */
  getProjectTasks(projectId: number): Observable<KanbanTask[]> {
    if (!this.projectTasksCache.has(projectId)) {
      const subject = new BehaviorSubject<KanbanTask[]>([]);
      this.projectTasksCache.set(projectId, subject);

      // primera carga
      this.apiService
        .get<KanbanTask[]>(`projects/${projectId}/incidences`)
        .pipe(tap(tasks => subject.next(tasks)))
        .subscribe();
    } else {
      const subject = this.projectTasksCache.get(projectId)!;

      // refresco en segundo plano
      this.apiService
        .get<KanbanTask[]>(`projects/${projectId}/incidences`)
        .pipe(tap(tasks => subject.next(tasks)))
        .subscribe();
    }

    return this.projectTasksCache.get(projectId)!.asObservable();
  }

  /**
   * Obtiene los miembros del proyecto
   */
  getProjectMembers(projectId: number): Observable<ProjectMember[]> {
    return this.apiService.get<ProjectMember[]>(`projects/${projectId}/members?page=1&per_page=1000`);
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
   * Organiza las tareas por estado usando los IDs de la base de datos
   */
  private organizeTasksByStatus(tasks: KanbanTask[]): KanbanColumn[] {
    // Ordenar tareas por fecha de creación (más recientes primero)
    const sortedTasks = [...tasks].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Columnas basadas en los estados de la base de datos
    const columns: KanbanColumn[] = [
      {
        id: this.STATE_IDS.asignado, // 1
        title: 'Asignado',
        icon: 'pi pi-user-plus',
        color: '#D6E4F0', // Usando el color de la BD
        tasks: [],
      },
      {
        id: this.STATE_IDS.ejecutando, // 2
        title: 'Ejecutando',
        icon: 'pi pi-play',
        color: '#D9E2F3', // Usando el color de la BD
        tasks: [],
      },
      {
        id: this.STATE_IDS.suspendido, // 3
        title: 'Suspendido',
        icon: 'pi pi-pause',
        color: '#FFF2CC', // Usando el color de la BD
        tasks: [],
      },
      {
        id: this.STATE_IDS.terminada, // 4
        title: 'Terminada',
        icon: 'pi pi-check',
        color: '#C6EFCE', // Usando el color de la BD
        tasks: [],
      },
      {
        id: this.STATE_IDS.terminada_fuera_plazo, // 5
        title: 'Terminada (fuera de plazo)',
        icon: 'pi pi-exclamation-triangle',
        color: '#F2DCDB', // Usando el color de la BD
        tasks: [],
      },
      {
        id: this.STATE_IDS.en_revision, // 6
        title: 'En Revisión',
        icon: 'pi pi-eye',
        color: '#FFF9C4', // Usando el color de la BD
        tasks: [],
      },
      {
        id: this.STATE_IDS.finalizada, // 7
        title: 'Finalizada',
        icon: 'pi pi-flag',
        color: '#DAEEF3', // Usando el color de la BD
        tasks: [],
      },
    ];

    // Asignar tareas a las columnas correspondientes usando el ID del estado
    sortedTasks.forEach(task => {
      // El ID del estado viene en task.state.id
      const stateId = task.state?.id;

      // Buscar la columna por ID numérico
      const column = columns.find(col => col.id === stateId);

      if (column) {
        column.tasks.push(task);
      } else {
        // Si el estado no coincide, podrías manejarlo o ignorarlo
        console.warn(`Estado no reconocido: ${stateId} para la tarea ${task.id}`);
      }
    });

    return columns;
  }

  /**
   * Convierte un string de estado a su ID numérico (útil para búsquedas)
   */
  getStateIdFromString(state: string): number {
    const stateMap: Record<string, number> = {
      asignado: this.STATE_IDS.asignado,
      ejecutando: this.STATE_IDS.ejecutando,
      suspendido: this.STATE_IDS.suspendido,
      terminada: this.STATE_IDS.terminada,
      'terminada (fuera de plazo)': this.STATE_IDS.terminada_fuera_plazo,
      'en revisión': this.STATE_IDS.en_revision,
      finalizada: this.STATE_IDS.finalizada,
    };
    return stateMap[state.toLowerCase()] || this.STATE_IDS.asignado;
  }

  /**
   * Obtiene el string del estado a partir del ID
   */
  getStateStringFromId(stateId: number): string {
    const stateMap: Record<number, string> = {
      [this.STATE_IDS.asignado]: 'Asignado',
      [this.STATE_IDS.ejecutando]: 'Ejecutando',
      [this.STATE_IDS.suspendido]: 'Suspendido',
      [this.STATE_IDS.terminada]: 'Terminada',
      [this.STATE_IDS.terminada_fuera_plazo]: 'Terminada (fuera de plazo)',
      [this.STATE_IDS.en_revision]: 'En Revisión',
      [this.STATE_IDS.finalizada]: 'Finalizada',
    };
    return stateMap[stateId] || 'Desconocido';
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
    return this.apiService.put(`projects/${projectId}/incidences/${taskId}/update`, {
      incidence_state_id: newStateId,
    });
  }

  /**
   * Método helper para obtener todas las columnas disponibles
   */
  getAvailableColumns(): KanbanColumn[] {
    return [
      {
        id: this.STATE_IDS.asignado,
        title: 'Asignado',
        icon: 'pi pi-user-plus',
        color: '#D6E4F0',
        tasks: [],
      },
      {
        id: this.STATE_IDS.ejecutando,
        title: 'Ejecutando',
        icon: 'pi pi-play',
        color: '#D9E2F3',
        tasks: [],
      },
      {
        id: this.STATE_IDS.suspendido,
        title: 'Suspendido',
        icon: 'pi pi-pause',
        color: '#FFF2CC',
        tasks: [],
      },
      {
        id: this.STATE_IDS.terminada,
        title: 'Terminada',
        icon: 'pi pi-check',
        color: '#C6EFCE',
        tasks: [],
      },
      {
        id: this.STATE_IDS.terminada_fuera_plazo,
        title: 'Terminada (fuera de plazo)',
        icon: 'pi pi-exclamation-triangle',
        color: '#F2DCDB',
        tasks: [],
      },
      {
        id: this.STATE_IDS.en_revision,
        title: 'En Revisión',
        icon: 'pi pi-eye',
        color: '#FFF9C4',
        tasks: [],
      },
      {
        id: this.STATE_IDS.finalizada,
        title: 'Finalizada',
        icon: 'pi pi-flag',
        color: '#DAEEF3',
        tasks: [],
      },
    ];
  }
}
