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
import {ProjectService} from "../../../../../core/service/project.service";
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
  readonly priorityMap: Record<string, { label: string; severity: string; icon: string }> = {
    'low': { label: 'Baja', severity: 'info', icon: 'pi-arrow-down' },
    'medium': { label: 'Media', severity: 'warning', icon: 'pi-minus' },
    'high': { label: 'Alta', severity: 'danger', icon: 'pi-arrow-up' },
    'critical': { label: 'Crítica', severity: 'danger', icon: 'pi-exclamation-triangle' }
  };

  // Mapeo de estados a colores (basado en el estado string)
  readonly stateSeverityMap: Record<string, string> = {
    'Open': 'info',
    'In Progress': 'warning',
    'Review': 'help',
    'Closed': 'success',
    'Locked': 'danger',
    'Finished': 'success'
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

    const taskSub = this.route.paramMap.subscribe(params => {
      this.taskId = Number(params.get('IncidenceId'));
      console.log(this.taskId);

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
  getPriorityInfo(priority: string | null) {
    if (!priority) return { label: 'No definida', severity: 'secondary', icon: 'pi-question' };
    return this.priorityMap[priority.toLowerCase()] || { label: priority, severity: 'secondary', icon: 'pi-tag' };
  }

  /**
   * Obtiene la severidad del estado
   */
  getStateSeverity(state: string): string {
    return this.stateSeverityMap[state] || 'secondary';
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
  editTask(taskId: number): void {
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'task-update',
      taskId
    ])
  }

  /**
   * Navega a la tarea padre
   */
  goToParentTask() {
    if (this.task?.parent) {
      this.router.navigate([], {
        queryParams: { taskId: this.task.parent.id },
        queryParamsHandling: 'merge',
        relativeTo: this.route
      });
    }
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

  protected readonly Number = Number;
}
