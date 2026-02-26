import {Component, OnInit, OnDestroy} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import {ButtonModule} from 'primeng/button';
import {CardModule} from 'primeng/card';
import {TagModule} from 'primeng/tag';
import {AvatarModule} from 'primeng/avatar';
import {DividerModule} from 'primeng/divider';
import {ProgressSpinnerModule} from 'primeng/progressspinner';
import {TooltipModule} from 'primeng/tooltip';
import {MessageService} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {Subscription} from 'rxjs';
import {IncidenceModel} from "../../../../../shared/models/task-models/task-create-model";

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
  ],
  templateUrl: './task-details.component.html',
  providers: [MessageService]
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
  loading = true;
  projectId!: number;
  taskId!: number;
  task: IncidenceModel | null = null;
  error: string | null = null;

  private subscriptions: Subscription[] = [];

  // Mapeo de prioridades a colores y etiquetas
  readonly priorityMap: Record<number, { label: string; severity: string; icon: string }> = {
    1: { label: 'Baja', severity: 'info', icon: 'pi-arrow-down' },
    2: { label: 'Media', severity: 'warning', icon: 'pi-minus' },
    3: { label: 'Alta', severity: 'danger', icon: 'pi-arrow-up' },
    4: { label: 'Crítica', severity: 'danger', icon: 'pi-exclamation-triangle' }
  };

  // Mapeo de estados a colores
  readonly stateMap: Record<number, { label: string; severity: string }> = {
    1: { label: 'Abierto', severity: 'info' },
    2: { label: 'En Progreso', severity: 'warning' },
    3: { label: 'Revisión', severity: 'help' },
    4: { label: 'Cerrado', severity: 'success' },
    5: { label: 'Bloqueado', severity: 'danger' },
    6: { label: 'Finalizado', severity: 'success' }
  };

  // Mapeo de tipos
  readonly typeMap: Record<number, { label: string; icon: string }> = {
    1: { label: 'Epic', icon: 'pi-star' },
    2: { label: 'History', icon: 'pi-book' },
    3: { label: 'Task', icon: 'pi-check-square' },
    4: { label: 'Bug', icon: 'pi-bug' },
    5: { label: 'Subtask', icon: 'pi-list' }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));

    // Obtener taskId de los query params
    this.route.queryParams.subscribe(params => {
      this.taskId = Number(params['taskId']);

      if (this.taskId) {
        this.loadTaskDetails();
      } else {
        this.error = 'No se proporcionó un ID de tarea válido';
        this.loading = false;
        this.showError('Error', 'ID de tarea no válido');
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carga los detalles de la tarea
   */
  private loadTaskDetails() {
    this.loading = true;
    this.error = null;

    const taskSub = this.projectService.getOneTask(this.projectId, this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task details:', error);
        this.error = 'No se pudo cargar la información de la tarea';
        this.loading = false;

        const errorMessage = error.error?.message || 'Error al cargar la tarea';
        this.showError('Error', errorMessage);
      }
    });

    this.subscriptions.push(taskSub);
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(summary: string, detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: summary,
      detail: detail,
      life: 5000
    });
  }

  /**
   * Obtiene la información de prioridad
   */
  getPriorityInfo(priorityId: number) {
    return this.priorityMap[priorityId] || { label: 'No definida', severity: 'secondary', icon: 'pi-question' };
  }

  /**
   * Obtiene la información del estado
   */
  getStateInfo(stateId: number) {
    return this.stateMap[stateId] || { label: 'Desconocido', severity: 'secondary' };
  }

  /**
   * Obtiene la información del tipo
   */
  getTypeInfo(typeId: number) {
    return this.typeMap[typeId] || { label: 'Desconocido', icon: 'pi-question' };
  }

  /**
   * Navega de regreso al kanban
   */
  goBack() {
    this.router.navigate(['/projects', this.projectId, 'tasks']);
  }

  /**
   * Abre el modal de edición
   */
  editTask() {
    // Aquí implementarías la lógica para editar
    // Podrías abrir un modal o navegar a una página de edición
    this.router.navigate(['/projects', this.projectId, 'tasks', 'edit'], {
      queryParams: { taskId: this.taskId }
    });
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
}
