import { Component, Input, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { KanbanTask, ProjectMember } from '../../../../../shared/models/kanban.models';
import { KanbanService } from '../../../../../core/service/kanban-service';
import {ActivatedRoute, Router} from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { AvatarModule } from 'primeng/avatar';

interface TimelineTask extends KanbanTask {
  start: Date;
  end: Date;
  left: number;
  width: number;
  row: number;
  progress: number;
  isOverdue: boolean;
  isNearDue: boolean;
}

interface TimelineColumn {
  date: Date;
  label: string;
  isWeekend: boolean;
  isToday: boolean;
}

type ViewMode = 'day' | 'week' | 'month';

@Component({
  selector: 'app-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TooltipModule,
    ButtonModule,
    SelectButtonModule,
    SliderModule,
    AvatarModule
  ],
  templateUrl: './timeline.component.html'
})
export class TimelineComponent implements OnInit, OnDestroy {
  @Input() projectId!: number;
  @ViewChild('timelineBody') timelineBody!: ElementRef;

  private destroy$ = new Subject<void>();

  tasks: KanbanTask[] = [];
  timelineTasks: TimelineTask[] = [];
  filteredTasks: TimelineTask[] = [];
  members: ProjectMember[] = [];
  loading = true;

  // Configuración de vista
  currentView: ViewMode = 'week';
  viewModes = [
    { label: 'Día', value: 'day' },
    { label: 'Semana', value: 'week' },
    { label: 'Mes', value: 'month' }
  ];

  // Fechas
  startDate: Date = new Date();
  endDate: Date = new Date();
  visibleColumns: TimelineColumn[] = [];

  // Dimensiones
  columnWidth = 60;
  zoomLevel = 100;
  timelineWidth = 0;
  todayPosition = 0;

  // Filtros
  selectedAssignee: number | null = null;

  constructor(
    private kanbanService: KanbanService,
    private router: Router,
  private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    if (!this.projectId) {
      console.error('Project ID not found');
      return;
    }

    this.loadData();
    this.setupFilters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.loading = true;

    // Cargar miembros primero
    this.kanbanService.getProjectMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
        },
        error: (error) => console.error('Error loading members:', error)
      });

    // Cargar tareas usando el mismo metodo que Kanban
    this.kanbanService.getProjectTasks(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.processTasks();
          this.calculateDateRange();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.loading = false;
        }
      });
  }

  private setupFilters(): void {
    // Escuchar cambios en los filtros del Kanban
    this.kanbanService.filters$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Recargar tareas cuando cambien los filtros
        this.kanbanService.getProjectTasks(this.projectId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (tasks) => {
              this.tasks = tasks;
              this.processTasks();
              this.calculateDateRange();
            }
          });
      });
  }

  private processTasks(): void {
    // Filtrar tareas que tienen fechas y convertir a TimelineTask
    this.timelineTasks = this.tasks
      .filter(task => task.due_date || task.start_date || task.created_at)
      .map(task => {
        // Usar start_date si existe, sino created_at
        const start = task.start_date
          ? new Date(task.start_date)
          : new Date(task.created_at);

        // Usar due_date si existe, sino 7 días después del inicio
        let end: Date;
        if (task.due_date) {
          end = new Date(task.due_date);
        } else {
          end = new Date(start);
          end.setDate(start.getDate() + 7);
        }

        // Asegurar que end no sea menor que start
        if (end < start) {
          end = new Date(start);
          end.setDate(start.getDate() + 1);
        }

        // Calcular progreso usando la misma lógica que Kanban
        const progress = this.calculateProgress(task, start, end);

        // Verificar si está vencida (misma lógica que Kanban)
        const isOverdue = this.isTaskOverdue(task, end);

        // Verificar si está próxima a vencer (misma lógica que Kanban)
        const isNearDue = this.isTaskNearDue(task, end);

        return {
          ...task,
          start,
          end,
          left: 0,
          width: 0,
          row: 0,
          progress,
          isOverdue,
          isNearDue
        };
      });

    this.layoutTasks();
    this.applyFilters();
  }

  private calculateProgress(task: KanbanTask, start: Date, end: Date): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Si está completada (usando misma lógica que Kanban)
    if (this.isTaskCompleted(task)) {
      return 100;
    }

    // Si no ha empezado
    if (today < start) {
      return 0;
    }

    // Si ya pasó la fecha fin
    if (today > end) {
      return 100;
    }

    // Calcular progreso lineal
    const total = end.getTime() - start.getTime();
    const elapsed = today.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  }

  private isTaskCompleted(task: KanbanTask): boolean {
    const state = task.state?.state?.toLowerCase();
    return state === 'terminada' ||
      state === 'finalizada' ||
      state === 'aprobada' ||
      state === 'completed' ||
      state === 'done';
  }

  private isTaskOverdue(task: KanbanTask, endDate: Date): boolean {
    if (this.isTaskCompleted(task)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    return end < today;
  }

  private isTaskNearDue(task: KanbanTask, endDate: Date): boolean {
    if (this.isTaskCompleted(task) || this.isTaskOverdue(task, endDate)) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 3 && diffDays > 0;
  }

  private layoutTasks(): void {
    // Ordenar por fecha de inicio
    this.timelineTasks.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Asignar filas para evitar solapamientos
    const rows: TimelineTask[][] = [];

    this.timelineTasks.forEach(task => {
      let placed = false;

      for (let i = 0; i < rows.length; i++) {
        const lastInRow = rows[i][rows[i].length - 1];
        if (lastInRow.end < task.start) {
          rows[i].push(task);
          task.row = i;
          placed = true;
          break;
        }
      }

      if (!placed) {
        rows.push([task]);
        task.row = rows.length - 1;
      }
    });
  }

  private updateTaskPositions(): void {
    const baseLeft = this.getDatePosition(this.startDate);

    this.filteredTasks.forEach(task => {
      task.left = this.getDatePosition(task.start) - baseLeft;
      task.width = this.getDatePosition(task.end) - this.getDatePosition(task.start);

      // Ancho mínimo para visibilidad
      if (task.width < 30) {
        task.width = 30;
      }
    });
  }

  private getDatePosition(date: Date): number {
    const diffTime = date.getTime() - this.startDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays * this.columnWidth * (this.zoomLevel / 100);
  }

  private calculateDateRange(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.currentView) {
      case 'day':
        this.startDate = new Date(today);
        this.endDate = new Date(today);
        this.endDate.setDate(this.endDate.getDate() + 1);
        break;
      case 'week':
        this.startDate = new Date(today);
        this.startDate.setDate(today.getDate() - today.getDay());
        this.endDate = new Date(this.startDate);
        this.endDate.setDate(this.endDate.getDate() + 7);
        break;
      case 'month':
        this.startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        this.endDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        break;
    }

    this.generateColumns();
  }

  private generateColumns(): void {
    this.visibleColumns = [];
    const current = new Date(this.startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    while (current < this.endDate) {
      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      const isToday = current.getTime() === today.getTime();

      let label = '';
      switch (this.currentView) {
        case 'day':
          label = current.getDate().toString();
          break;
        case 'week':
          label = current.getDate().toString();
          break;
        case 'month':
          label = current.toLocaleDateString('es', { month: 'short' });
          break;
      }

      this.visibleColumns.push({
        date: new Date(current),
        label,
        isWeekend,
        isToday
      });

      current.setDate(current.getDate() + 1);
    }

    this.timelineWidth = this.visibleColumns.length * this.columnWidth * (this.zoomLevel / 100);
    this.updateTodayPosition();
    this.updateTaskPositions();
  }

  private updateTodayPosition(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (today >= this.startDate && today <= this.endDate) {
      this.todayPosition = this.getDatePosition(today);
    } else {
      this.todayPosition = -1;
    }
  }

  private applyFilters(): void {
    this.filteredTasks = this.timelineTasks.filter(task => {
      // Filtro por asignado
      if (this.selectedAssignee && task.assigned_to?.id !== this.selectedAssignee) {
        return false;
      }

      // Mostrar solo tareas visibles en el rango de fechas actual
      return task.end >= this.startDate && task.start <= this.endDate;
    });

    this.updateTaskPositions();
  }

  // Getters públicos
  getGridTemplate(): string {
    return `repeat(${this.visibleColumns.length}, ${this.columnWidth * (this.zoomLevel / 100)}px)`;
  }

  getTimelineHeight(): number {
    const rows = this.filteredTasks.length > 0
      ? Math.max(...this.filteredTasks.map(t => t.row)) + 1
      : 1;
    return Math.max(rows * 40 + 40, 200);
  }

  // Navegación
  navigate(direction: number): void {
    switch (this.currentView) {
      case 'day':
        this.startDate.setDate(this.startDate.getDate() + direction);
        this.endDate.setDate(this.endDate.getDate() + direction);
        break;
      case 'week':
        this.startDate.setDate(this.startDate.getDate() + direction * 7);
        this.endDate.setDate(this.endDate.getDate() + direction * 7);
        break;
      case 'month':
        this.startDate.setMonth(this.startDate.getMonth() + direction);
        this.endDate.setMonth(this.endDate.getMonth() + direction);
        break;
    }

    this.generateColumns();
    this.applyFilters();
  }

  goToToday(): void {
    this.calculateDateRange();
    this.applyFilters();
  }

  onViewChange(): void {
    this.calculateDateRange();
    this.applyFilters();
  }

  updateZoom(): void {
    this.timelineWidth = this.visibleColumns.length * this.columnWidth * (this.zoomLevel / 100);
    this.updateTaskPositions();
    this.updateTodayPosition();
  }

  // Filtros
  filterByAssignee(userId: number): void {
    this.selectedAssignee = this.selectedAssignee === userId ? null : userId;
    this.applyFilters();
  }

  clearAssigneeFilter(): void {
    this.selectedAssignee = null;
    this.applyFilters();
  }

  // Utilidades
  getPeriodLabel(): string {
    switch (this.currentView) {
      case 'day':
        return this.startDate.toLocaleDateString('es', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        });
      case 'week':
        return `Semana del ${this.startDate.toLocaleDateString('es', {
          day: 'numeric',
          month: 'long'
        })}`;
      case 'month':
        return this.startDate.toLocaleDateString('es', {
          month: 'long',
          year: 'numeric'
        });
      default:
        return '';
    }
  }

  getDayOfWeek(date: Date): string {
    return date.toLocaleDateString('es', { weekday: 'short' });
  }

  getTaskColor(task: TimelineTask): string {
    // Usar la misma lógica que getTaskAccentColor del Kanban
    if (task.isOverdue) return '#F4CCCC'; // Rojo claro - Vencida
    if (task.isNearDue) return '#FCE4CC'; // Naranja claro - Próxima a vencer
    if (this.isTaskCompleted(task)) {
      if (task.due_date) {
        const dueDate = new Date(task.due_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dueDate < today) {
          return '#F2DCDB'; // Rosa claro - Terminada fuera de plazo
        }
      }
      return '#C6EFCE'; // Verde claro - Terminada a tiempo
    }
    if (task.state?.state?.toLowerCase() === 'ejecutando') return '#D9E2F3'; // Azul claro
    if (task.state?.state?.toLowerCase() === 'revisión') return '#FFF9C4'; // Amarillo claro
    return task.state?.color ? `#${task.state.color}` : '#E5E7EB';
  }

  getProgressColor(task: TimelineTask): string {
    if (task.isOverdue) return '#DC2626';
    if (task.progress === 100) return '#059669';
    return '#3B82F6';
  }

  getTypeIcon(type: string | undefined): string {
    switch (type?.toLowerCase()) {
      case 'bug': return 'pi pi-bug';
      case 'task': return 'pi pi-check-square';
      case 'subtask': return 'pi pi-sitemap';
      case 'history_user': return 'pi pi-history';
      default: return 'pi pi-tag';
    }
  }

  getAssigneeColor(name: string): string {
    const colors = [
      '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
      '#ec4899', '#6366f1', '#14b8a6', '#f97316', '#6b7280'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  getTaskTooltip(task: TimelineTask): string {
    const startDate = task.start.toLocaleDateString();
    const endDate = task.end.toLocaleDateString();
    const duration = Math.ceil((task.end.getTime() - task.start.getTime()) / (1000 * 60 * 60 * 24));

    return `
      <div class="p-2">
        <div class="font-bold mb-1">${task.title}</div>
        <div class="text-xs">#${task.id} · ${task.type?.type || 'Tarea'}</div>
        <div class="text-xs">Inicio: ${startDate}</div>
        <div class="text-xs">Fin: ${endDate}</div>
        <div class="text-xs">Duración: ${duration} días</div>
        <div class="text-xs">Progreso: ${task.progress}%</div>
        <div class="text-xs">Asignado: ${task.assigned_to?.name || 'Sin asignar'}</div>
        <div class="text-xs">Prioridad: ${task.priority || 'Normal'}</div>
        ${task.isOverdue ? '<div class="text-xs text-red-600 font-bold mt-1">⚠️ Vencida</div>' : ''}
        ${task.isNearDue ? '<div class="text-xs text-orange-600 font-bold mt-1">⚠️ Próxima a vencer</div>' : ''}
      </div>
    `;
  }

  // Navegación
  viewTask(taskId: number): void {
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'task-details',
      taskId
    ]);
  }

  createTask(): void {
    this.router.navigate([
      '/project-management/projects/kanban',
      this.projectId,
      'create-task'
    ]);
  }
}
