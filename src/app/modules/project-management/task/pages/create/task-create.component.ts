import {Component, OnInit} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgClass, NgIf} from "@angular/common";
import {DropdownModule} from "primeng/dropdown";
import {ButtonModule} from "primeng/button";
import {ChipsModule} from "primeng/chips";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../../../../core/service/project.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {TaskCreateModelRequest} from "../../../../../shared/models/task-models/task-create-model";
import {KanbanService} from "../../../../../core/service/kanban-service";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-task-create',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgClass,
    DropdownModule,
    ButtonModule,
    ChipsModule,
    InputTextareaModule,
    NgIf,
    ConfirmDialogModule
  ],
  templateUrl: './task-create.component.html',
})
export class TaskCreateComponent implements OnInit {
  loading = false;
  projectId!: number;
  stateId!: number;
  stateName: string = '';

  // Lista de tareas para seleccionar padre
  parentOptions: { label: string, value: number }[] = [];
  showParentSelector = false;
  parentLabel = '';

  // Subscripciones
  private subscriptions: Subscription[] = [];

  priorities = [
    { label: 'Alta', value: 'high' },
    { label: 'Media', value: 'medium' },
    { label: 'Baja', value: 'low' }
  ];

  types = [
    { label: 'Epic', value: 'epic' },
    { label: 'History', value: 'history_user' },
    { label: 'Task', value: 'task' },
    { label: 'Subtask', value: 'subtask' },
    { label: 'bug', value: 'bug' }
  ];

  private readonly stateMap: Record<number, string> = {
    1: 'Open',
    2: 'In Progress',
    3: 'Review',
    4: 'Closed',
    5: 'Locked',
    6: 'Finished'
  };

  // Mapeo de tipos a IDs (asumiendo estos IDs según tu backend)
  private readonly typeIdMap: Record<string, number> = {
    'epic': 1,
    'history_user': 2,
    'task': 3,
    'subtask': 5,
    'bug': 5
  };

  taskForm = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    priority: ['', Validators.required],
    type: ['', Validators.required],
    parent_id: [null], // Nuevo campo para el padre
    state_id: [{value: this.stateId, disabled: true}, Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private kanbanService: KanbanService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));

    // Leer stateId del paramMap
    this.stateId = Number(this.route.snapshot.paramMap.get('stateId')) || 1;
    this.stateName = this.getStateName(this.stateId);

    // Inicializar form con stateId
    this.taskForm.patchValue({
      state_id: this.stateId
    });

    // Escuchar cambios en el tipo para actualizar el selector de padre
    this.setupTypeListener();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Configura el listener para cambios en el tipo
   */
  private setupTypeListener() {
    const typeSub = this.taskForm.get('type')?.valueChanges.subscribe(type => {
      this.updateParentSelector(type as string);
    });

    if (typeSub) {
      this.subscriptions.push(typeSub);
    }
  }

  /**
   * Actualiza el selector de padre según el tipo seleccionado
   */
  private updateParentSelector(type: string) {
    // Limpiar selección anterior
    this.taskForm.patchValue({ parent_id: null });

    switch (type) {
      case 'history_user':
        this.showParentSelector = true;
        this.parentLabel = 'Epic Padre';
        this.loadParentOptions('epic');
        this.taskForm.get('parent_id')?.setValidators([Validators.required]);
        break;

      case 'task':
        this.showParentSelector = true;
        this.parentLabel = 'History Padre';
        this.loadParentOptions('history_user');
        this.taskForm.get('parent_id')?.setValidators([Validators.required]);
        break;

      case 'subtask':
        this.showParentSelector = true;
        this.parentLabel = 'Task Padre';
        this.loadParentOptions('task');
        this.taskForm.get('parent_id')?.setValidators([Validators.required]);
        break;

      case 'bug':
        this.showParentSelector = true;
        this.parentLabel = 'Task Padre';
        this.loadParentOptions('task');
        this.taskForm.get('parent_id')?.setValidators([Validators.required]);
        break;

      default:
        this.showParentSelector = false;
        this.parentLabel = '';
        this.parentOptions = [];
        this.taskForm.get('parent_id')?.clearValidators();
        break;
    }

    this.taskForm.get('parent_id')?.updateValueAndValidity();
  }

  /**
   * Carga las opciones de padre según el tipo
   */
  private loadParentOptions(type: string) {
    this.loading = true;

    const taskSub = this.kanbanService.getProjectTasks(this.projectId).subscribe({
      next: (tasks) => {
        // Filtrar tareas por tipo
        const filteredTasks = tasks.filter(task => {
          // Asumiendo que incidence_type tiene el nombre del tipo
          // Ajusta según la estructura real de tu KanbanTask
          const taskType = task.type;
          return taskType.type === type;
        });

        // Mapear a opciones del dropdown
        this.parentOptions = filteredTasks.map(task => ({
          label: task.title,
          value: task.id
        }));

        // Si no hay opciones disponibles, mostrar mensaje
        if (this.parentOptions.length === 0) {
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin opciones',
            detail: `No hay ${type}s disponibles para seleccionar como padre`,
            life: 5000
          });
        }

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading parent options:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar las opciones de padre',
          life: 5000
        });
        this.parentOptions = [];
        this.loading = false;
      }
    });

    this.subscriptions.push(taskSub);
  }

  /**
   * Obtiene el nombre del estado por su ID
   */
  private getStateName(stateId: number): string {
    return this.stateMap[stateId] || 'Open';
  }

  /**
   * Prepara los datos para enviar al backend
   */
  private prepareTaskData(): TaskCreateModelRequest {
    const formValue = this.taskForm.getRawValue(); // getRawValue incluye campos disabled

    return {
      title: formValue.title || '',
      description: formValue.description || '',
      incidence_priority_id: this.getPriorityId(formValue.priority || 'medium'),
      incidence_type_id: this.getTypeId(formValue.type || 'task'),
      incidence_state_id: this.stateId,
      start_date: new Date().toISOString().split('T')[0],
      due_date: this.calculateDueDate(formValue.priority || 'medium'),
      parent_incidence_id: formValue.parent_id || null // Incluir el padre seleccionado
    };
  }

  /**
   * Convierte string de prioridad a ID
   */
  private getPriorityId(priority: string): number {
    const priorityMap: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };
    return priorityMap[priority] || 2;
  }

  /**
   * Convierte string de tipo a ID
   */
  private getTypeId(type: string): number {
    return this.typeIdMap[type] || 3;
  }

  /**
   * Calcula fecha de vencimiento basada en prioridad
   */
  private calculateDueDate(priority: string): string {
    const today = new Date();
    let daysToAdd = 7;

    switch (priority) {
      case 'high':
        daysToAdd = 2;
        break;
      case 'medium':
        daysToAdd = 7;
        break;
      case 'low':
        daysToAdd = 14;
        break;
    }

    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + daysToAdd);

    return dueDate.toISOString().split('T')[0];
  }

  /**
   * Muestra diálogo de éxito
   */
  private showSuccessDialog(taskTitle: string) {
    this.confirmationService.confirm({
      message: `La tarea "${taskTitle}" ha sido creada exitosamente en el estado "${this.stateName}".`,
      header: '¡Tarea Creada Correctamente!',
      acceptLabel: 'Ver Tareas',
      rejectLabel: 'Cerrar',
      acceptIcon: 'pi pi-eye',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-success p-button-raised mr-2 gap-2',
      rejectButtonStyleClass: 'p-button-text p-button-secondary gap-2',
      defaultFocus: 'accept',
      accept: () => {
        this.router.navigate([
          '/project-management/projects/kanban',
          this.projectId,
          'project-kanban'
        ])
      },
      reject: () => {
        console.log('Diálogo cerrado');
      }
    });
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();

      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Por favor completa todos los campos requeridos'
      });

      return;
    }

    this.loading = true;
    const taskData = this.prepareTaskData();

    this.projectService.createTask(taskData, this.projectId).subscribe({
      next: (response) => {
        this.loading = false;
        this.showSuccessDialog(response.title);
        this.taskForm.reset();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating task:', error);

        const errorMessage = error.error?.message || 'No se pudo crear la tarea';

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  onCancel() {
    this.router.navigate(['/projects', this.projectId, 'tasks']);
  }
}
