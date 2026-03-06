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
import {MessageService, TreeNode} from 'primeng/api';
import {ToastModule} from 'primeng/toast';
import {Subscription} from 'rxjs';
import {ProjectService} from "../../../../../core/service/project.service";
import {
  IncidenceDetail,
  IncidenceDetailChild,
  IncidenceModel
} from "../../../../../shared/models/task-models/task-create-model";
import {TreeModule} from "primeng/tree";
import {TruncatePipe} from "../../../../../shared/Pipes/TruncatePipe";

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
  ],
  templateUrl: './task-details.component.html',
  providers: [MessageService]
})
export class TaskDetailsComponent implements OnInit, OnDestroy {
  loading = true;
  projectId!: number;
  taskId!: number;
  task: IncidenceDetail | null = null;
  error: string | null = null;

  // Para el árbol de PrimeNG
  treeData: TreeNode[] = [];

  // Para el breadcrumb de ancestros
  taskAncestors: { id: number; title: string }[] = [];

  private subscriptions: Subscription[] = [];

  // Mapeo de prioridades a colores y etiquetas
  readonly priorityMap: Record<string, { label: string; severity: string; icon: string; color: string }> = {
    'low': { label: 'Baja', severity: 'info', icon: 'pi-arrow-down', color: 'text-blue-600' },
    'medium': { label: 'Media', severity: 'warning', icon: 'pi-minus', color: 'text-yellow-600' },
    'high': { label: 'Alta', severity: 'danger', icon: 'pi-arrow-up', color: 'text-orange-600' },
    'critical': { label: 'Crítica', severity: 'danger', icon: 'pi-exclamation-triangle', color: 'text-red-600' }
  };

  // Mapeo de estados a colores
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
      next: (task) => {
        this.task = task;
        this.buildTreeData();
        this.buildAncestorsPath();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading task details:', error);
        this.error = 'No se pudo cargar la información de la tarea';
        this.loading = false;
        this.showError('Error', 'Error al cargar la tarea');
      }
    });

    this.subscriptions.push(taskSub);
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
      children: child.children?.map(grandChild => this.mapToTreeNode(grandChild)) || []
    };

    return node;
  }

  /**
   * Construye la ruta de ancestros para el breadcrumb
   */
  private buildAncestorsPath() {
    this.taskAncestors = [];

    // Aquí necesitarías una función recursiva para obtener los ancestros
    // Esto depende de cómo tu API maneje los ancestros
    if (this.task?.parent) {
      this.loadAncestors(this.task.parent.id);
    }
  }

  /**
   * Carga los ancestros de una tarea
   */
  private loadAncestors(taskId: number) {
    // Esta función debería cargar los ancestros desde el servicio
    // Por ahora solo agregamos el padre directo
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
    if (taskId === this.taskId) return; // Ya estamos en esta tarea

    this.router.navigate(
      ['/project-management/projects/kanban', this.projectId, 'task-details', taskId],
      { queryParamsHandling: 'merge' }
    );
  }

  /**
   * Crea una nueva subtarea
   */
  createSubtask() {
    this.router.navigate(
      ['/project-management/projects/kanban', this.projectId, 'task-create'],
      { queryParams: { parentId: this.taskId } }
    );
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
    if (!priority) return { label: 'No definida', severity: 'secondary', icon: 'pi-question', color: '' };
    return this.priorityMap[priority.toLowerCase()] || {
      label: priority,
      severity: 'secondary',
      icon: 'pi-tag',
      color: ''
    };
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
    if (!priority) return 'pi-tag';
    return this.priorityMap[priority.toLowerCase()]?.icon || 'pi-tag';
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
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'project-kanban',
    ]);
  }

  /**
   * Abre el modal de edición
   */
  editTask(taskId: number | undefined): void {
    if (!taskId) return;

    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'task-update',
      taskId
    ]);
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
}
