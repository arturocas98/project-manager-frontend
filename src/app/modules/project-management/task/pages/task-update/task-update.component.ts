import {Component, OnDestroy, OnInit} from '@angular/core';
import {IncidenceModel, TaskUpdateModelRequest} from "../../../../../shared/models/task-models/task-create-model";
import {ProjectMember} from "../../../../../shared/models/kanban.models";
import {Subject, Subscription, takeUntil} from "rxjs";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../../../../core/service/project.service";
import {KanbanService} from "../../../../../core/service/kanban-service";
import {ConfirmationService, MessageService} from "primeng/api";
import {ToastModule} from "primeng/toast";
import {ProgressSpinnerModule} from "primeng/progressspinner";
import {ButtonModule} from "primeng/button";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {ChipsModule} from "primeng/chips";
import {InputTextareaModule} from "primeng/inputtextarea";
import {DropdownModule} from "primeng/dropdown";
import {CalendarModule} from "primeng/calendar";
import {AccordionModule} from "primeng/accordion";
import {ConfirmDialogModule} from "primeng/confirmdialog";

@Component({
  selector: 'app-task-update',
  standalone: true,
  imports: [
    ToastModule,
    ProgressSpinnerModule,
    ButtonModule,
    NgIf,
    ReactiveFormsModule,
    ChipsModule,
    NgClass,
    InputTextareaModule,
    DropdownModule,
    CalendarModule,
    AccordionModule,
    DatePipe,
    ConfirmDialogModule
  ],
  templateUrl: './task-update.component.html',
})
export class TaskUpdateComponent implements OnInit, OnDestroy {
  loading = true;
  saving = false;
  projectId!: number;
  taskId!: number;
  task: IncidenceModel | null = null;
  error: string | null = null;
  stateName: string = '';

  // Lista de miembros del proyecto
  members: ProjectMember[] = [];
  memberOptions: { label: string, value: number, role: string }[] = [];

  // Lista de tareas para seleccionar padre
  parentOptions: { label: string, value: number }[] = [];
  showParentSelector = false;
  parentLabel = '';

  readonly EPIC_TYPE = 1;
  readonly HISTORY_USER_TYPE = 2;

  get taskType(): number | null {
    return this.taskForm.get('type')?.value ?? null;
  }

  // Subscripciones
  private subscriptions: Subscription[] = [];
  private destroy$ = new Subject<void>();

  priorities = [
    { label: 'Alta', value: 3 },    // high = 3
    { label: 'Media', value: 2 },    // medium = 2
    { label: 'Baja', value: 1 }      // low = 1
  ];

  // Mapeo de tipos a valores para el dropdown (solo para mostrar)
  types = [
    { label: 'Epic', value: 1 },
    { label: 'History', value: 2 },
    { label: 'Task', value: 3 },
    { label: 'Bug', value: 4 },
    { label: 'Subtask', value: 5 }
  ];

  private readonly stateMap: Record<number, string> = {
    1: 'Open',
    2: 'In Progress',
    3: 'Review',
    4: 'Closed',
    5: 'Locked',
    6: 'Finished'
  };

  // Mapeo de tipos para el selector de padre
  private readonly typeParentMap: Record<number, { parentType: number, label: string }> = {
    2: { parentType: 1, label: 'Epic Padre' },      // History -> Epic
    3: { parentType: 2, label: 'History Padre' },   // Task -> History
    4: { parentType: 3, label: 'Task Padre' },      // Bug -> Task
    5: { parentType: 3, label: 'Task Padre' }       // Subtask -> Task
  };

  taskForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', Validators.required],
    priority: [<number | null>null, Validators.required],
    type: [{value: <number | null>null, disabled: true}, Validators.required], // Tipo no editable
    assigned_user_id: [<number | null>null],
    parent_id: [<number | null>null],
    state_id: [{value: <number | null>null, disabled: true}, Validators.required],
    start_date: [<string | null>null],
    due_date: [<string | null>null]
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

    // Obtener taskId de los parámetros de ruta
    const taskSub = this.route.paramMap.subscribe(params => {
      this.taskId = Number(params.get('IncidenceId'));

      if (this.taskId) {
        this.loadTaskDetails();
        this.loadMembers();
      } else {
        this.error = 'No se proporcionó un ID de tarea válido';
        this.loading = false;
        this.showError('Error', 'ID de tarea no válido');
      }
    });

    this.subscriptions.push(taskSub);

    // Escuchar cambios en el tipo para actualizar el selector de padre
    this.setupTypeListener();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.destroy$.next();
    this.destroy$.complete();
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
        this.stateName = this.getStateName(task.state.id);
        this.patchFormValues(task);
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
   * Carga los miembros del proyecto
   */
  private loadMembers(): void {
    this.kanbanService.getProjectMembers(this.projectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (members) => {
          this.members = members;
          this.memberOptions = members.map(member => ({
            label: `${member.user.name} (${member.role.type})`,
            value: member.user.id,
            role: member.role.type
          }));
        },
        error: (error) => {
          console.error('Error loading members:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los miembros del proyecto',
            life: 5000
          });
        }
      });
  }

  /**
   * Parsea el formulario con los valores de la tarea
   */
  private patchFormValues(task: IncidenceModel) {
    // Mapear prioridad string a ID
    const priorityMap: Record<string, number> = {
      'low': 1,
      'medium': 2,
      'high': 3,
      'critical': 4
    };

    const priorityId = task.priority ? priorityMap[task.priority.toLowerCase()] : 2;

    this.taskForm.patchValue({
      title: task.title,
      description: task.description,
      priority: priorityId,
      type: task.type.id,
      assigned_user_id: task.assigned_to?.id || null,
      parent_id: task.parent?.id || null,
      state_id: task.state.id,
      start_date: task.start_date,
      due_date: task.due_date
    });

    // Actualizar selector de padre si es necesario
    if (task.type.id in this.typeParentMap) {
      this.updateParentSelector(task.type.id);
      this.updateAssignedUserValidator(task.type.id);
    }
  }

  /**
   * Configura el listener para cambios en el tipo
   */
  private setupTypeListener() {
    const typeSub = this.taskForm.get('type')?.valueChanges.subscribe(typeId => {
      if (typeId) {
        this.updateParentSelector(typeId);
        this.updateAssignedUserValidator(typeId);
      }
    });

    if (typeSub) {
      this.subscriptions.push(typeSub);
    }
  }

  /**
   * Actualiza el selector de padre según el tipo seleccionado
   */
  private updateParentSelector(typeId: number) {
    // Limpiar selección anterior
    this.taskForm.patchValue({ parent_id: null });

    const parentConfig = this.typeParentMap[typeId];

    if (parentConfig) {
      this.showParentSelector = true;
      this.parentLabel = parentConfig.label;
      this.loadParentOptions(parentConfig.parentType);
      this.taskForm.get('parent_id')?.setValidators([Validators.required]);
    } else {
      this.showParentSelector = false;
      this.parentLabel = '';
      this.parentOptions = [];
      this.taskForm.get('parent_id')?.clearValidators();
    }

    this.taskForm.get('parent_id')?.updateValueAndValidity();
  }

  /**
   * Actualiza los validadores del usuario asignado según el tipo
   */
  private updateAssignedUserValidator(typeId: number) {
    // Para Epic (1) y History (2), el usuario asignado es obligatorio
    if (typeId === 1 || typeId === 2) {
      this.taskForm.get('assigned_user_id')?.setValidators([Validators.required]);
    } else {
      // Para Task (3), Bug (4), Subtask (5), es opcional
      this.taskForm.get('assigned_user_id')?.clearValidators();
    }
    this.taskForm.get('assigned_user_id')?.updateValueAndValidity();
  }

  /**
   * Carga las opciones de padre según el tipo
   */
  private loadParentOptions(parentTypeId: number) {
    const taskSub = this.kanbanService.getProjectTasks(this.projectId).subscribe({
      next: (tasks) => {
        // Filtrar tareas por tipo y excluir la tarea actual
        const filteredTasks = tasks.filter(task => {
          return task.type.id === parentTypeId && task.id !== this.taskId;
        });

        // Mapear a opciones del dropdown
        this.parentOptions = filteredTasks.map(task => ({
          label: task.title,
          value: task.id
        }));

        // Si no hay opciones disponibles, mostrar mensaje
        if (this.parentOptions.length === 0 && this.showParentSelector) {
          const parentTypeName = this.getTypeName(parentTypeId);
          this.messageService.add({
            severity: 'warn',
            summary: 'Sin opciones',
            detail: `No hay ${parentTypeName}s disponibles para seleccionar como padre`,
            life: 5000
          });
        }
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
      }
    });

    this.subscriptions.push(taskSub);
  }

  /**
   * Obtiene el nombre del tipo por su ID
   */
  private getTypeName(typeId: number): string {
    const type = this.types.find(t => t.value === typeId);
    return type ? type.label : 'Tarea';
  }

  /**
   * Obtiene el nombre del estado por su ID
   */
  private getStateName(stateId: number): string {
    return this.stateMap[stateId] || 'Open';
  }

  /**
   * Obtiene la etiqueta del miembro seleccionado
   */
  getSelectedMemberLabel(): string {
    const selectedId = this.taskForm.get('assigned_user_id')?.value;

    if (selectedId == null) {
      return '';
    }

    const selectedMember = this.memberOptions.find(
      m => m.value === selectedId
    );

    return selectedMember ? selectedMember.label : '';
  }

  /**
   * Prepara los datos para enviar al backend
   */
  private prepareUpdateData(): TaskUpdateModelRequest {
    const formValue = this.taskForm.getRawValue();

    return {
      title: formValue.title || null,
      description: formValue.description || null,
      incidence_priority_id: formValue.priority || null,
      incidence_type_id: this.task?.type.id || null, // Usar el tipo original
      incidence_state_id: this.task?.state.id || null, // Usar el estado original
      assigned_user_id: formValue.assigned_user_id || null,
      parent_incidence_id: formValue.parent_id || null,
      start_date: formValue.start_date || null,
      due_date: formValue.due_date || null
    };
  }

  /**
   * Muestra un toast
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
   * Muestra diálogo de confirmación de éxito
   */
  currentDialogHeader: string = "Actualización"
  private showSuccessDialog(taskTitle: string) {
    this.confirmationService.confirm({
      message: `La tarea "${taskTitle}" ha sido actualizada exitosamente.`,
      header: this.currentDialogHeader,
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
        ]);
      },
      reject: () => {
        console.log('Diálogo cerrado');
      }
    });
  }

  /**
   * Envía el formulario
   */
  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();

      // Mostrar campos inválidos
      const invalidFields = [];
      if (this.taskForm.get('title')?.invalid) invalidFields.push('Título');
      if (this.taskForm.get('description')?.invalid) invalidFields.push('Descripción');
      if (this.taskForm.get('priority')?.invalid) invalidFields.push('Prioridad');
      if (this.taskForm.get('assigned_user_id')?.invalid) invalidFields.push('Usuario asignado');
      if (this.taskForm.get('parent_id')?.invalid) invalidFields.push(this.parentLabel);

      this.messageService.add({
        severity: 'error',
        summary: 'Formulario inválido',
        detail: `Campos requeridos: ${invalidFields.join(', ')}`,
        life: 5000
      });

      return;
    }

    // Confirmar actualización
    this.confirmationService.confirm({
      message: '¿Estás seguro de que deseas actualizar esta tarea?',
      header: 'Confirmar Actualización',
      acceptLabel: 'Actualizar',
      rejectLabel: 'Cancelar',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-primary p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',
      accept: () => {
        this.performUpdate();
      }
    });
  }

  /**
   * Ejecuta la actualización
   */
  private performUpdate() {
    this.saving = true;
    const updateData = this.prepareUpdateData();

    const updateSub = this.projectService.UpdateTask(updateData, this.projectId, this.taskId).subscribe({
      next: (response) => {
        this.saving = false;
        this.showSuccessDialog(response.title);
      },
      error: (error) => {
        this.saving = false;
        console.error('Error updating task:', error);

        const errorMessage = error.error?.message || 'No se pudo actualizar la tarea';
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: errorMessage,
          life: 5000
        });
      }
    });

    this.subscriptions.push(updateSub);
  }

  /**
   * Cancela la edición
   */
  onCancel() {
    if (this.taskForm.dirty) {
      this.confirmationService.confirm({
        message: 'Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?',
        header: 'Confirmar Cancelación',
        acceptLabel: 'Sí, salir',
        rejectLabel: 'No, continuar editando',
        acceptIcon: 'pi pi-check',
        rejectIcon: 'pi pi-times',
        acceptButtonStyleClass: 'p-button-danger p-button-raised',
        rejectButtonStyleClass: 'p-button-text p-button-secondary',
        accept: () => {
          this.router.navigate([
            '/project-management/projects/kanban',
            this.projectId,
            'project-kanban'
          ]);
        }
      });
    } else {
      this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'project-kanban'
      ]);
    }
  }
}
