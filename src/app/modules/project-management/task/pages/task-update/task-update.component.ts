import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {
  IncidenceDetail, IncidenceDetailChild,
  IncidenceModel,
  TaskUpdateModelRequest
} from "../../../../../shared/models/task-models/task-create-model";
import {ProjectMember} from "../../../../../shared/models/kanban.models";
import {Subject, Subscription, takeUntil} from "rxjs";
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
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
import {DialogModule} from "primeng/dialog";
import {TagModule} from "primeng/tag";

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
    ConfirmDialogModule,
    DialogModule,
    TagModule,
    FormsModule
  ],
  templateUrl: './task-update.component.html',
})
export class TaskUpdateComponent implements OnInit, OnDestroy {
  @ViewChild('deleteDialog') deleteDialog: any;
  @ViewChild('confirmDeleteWithChildrenDialog') confirmDeleteWithChildrenDialog: any;

  loading = true;
  saving = false;
  deleting = false;
  projectId!: number;
  taskId!: number;
  task: IncidenceDetail | null = null;
  error: string | null = null;
  stateName: string = '';

  // Control para eliminación con nombre de tarea
  deleteConfirmationName = '';
  deleteNameValid = false;
  hasChildren = false;
  childrenCount = 0;

  // Diálogos
  showDeleteDialog = false;
  showDeleteWithChildrenDialog = false;

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
    { label: 'Baja', value: 1 },
    { label: 'Media', value: 2 },
    { label: 'Alta', value: 3 },
    { label: 'Crítica', value: 4 }
  ];

  formatDate(date: Date | null): string | null {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  // Mapeo de tipos a valores para el dropdown (solo para mostrar)
  types = [
    { label: 'Epic', value: 1 },
    { label: 'History', value: 2 },
    { label: 'Task', value: 3 },
    { label: 'Bug', value: 4 },
    { label: 'Subtask', value: 5 }
  ];

  categories = [
    { label: 'Desarrollo', value: 1 },
    { label: 'Diseño', value: 2 },
    { label: 'Documentación', value: 3 },
    { label: 'Pruebas', value: 4 },
    { label: 'Despliegue', value: 5 },
    { label: 'Capacitación', value: 6 },
    { label: 'Soporte/Validación', value: 7 },
    { label: 'Corrección de errores', value: 8 },
    { label: 'Reunión/Coordinación', value: 9 },
    { label: 'Migración', value: 10 }
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
    type: [{value: <number | null>null, disabled: true}, Validators.required],
    category: [<number | null>null, Validators.required],
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
      next: (task: IncidenceDetail) => {
        this.task = task;
        this.stateName = this.getStateName(task.state?.id);
        this.checkChildren(task);
        this.patchFormValues(task);
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
   * Verifica si la tarea tiene hijos
   */
  private checkChildren(task: IncidenceDetail) {
    const countChildren = (children: IncidenceDetailChild[] | undefined): number => {
      if (!children) return 0;

      let count = 0;
      children.forEach(child => {
        count++;
        if (child.children && child.children.length > 0) {
          count += countChildren(child.children);
        }
      });
      return count;
    };

    this.childrenCount = countChildren(task.children);
    this.hasChildren = this.childrenCount > 0;
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
  private patchFormValues(task: IncidenceDetail) {
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
      type: task.type?.id,
      category: task.category?.id,
      assigned_user_id: task.assigned_to?.id || null,
      parent_id: task.parent?.id || null,
      state_id: task.state?.id,
      start_date: task.start_date,
      due_date: task.due_date
    });

    if (task.type?.id && task.type.id in this.typeParentMap) {
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
    if (typeId === 1 || typeId === 2) {
      this.taskForm.get('assigned_user_id')?.setValidators([Validators.required]);
    } else {
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
        const filteredTasks = tasks.filter(task => {
          return task.type.id === parentTypeId && task.id !== this.taskId;
        });

        this.parentOptions = filteredTasks.map(task => ({
          label: task.title,
          value: task.id
        }));

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
  private getStateName(stateId: number | undefined): string {
    if (!stateId) return 'Open';
    return this.stateMap[stateId] || 'Open';
  }

  /**
   * Obtiene la etiqueta del miembro seleccionado
   */
  getSelectedMemberLabel(): string {
    const selectedId = this.taskForm.get('assigned_user_id')?.value;
    if (selectedId == null) return '';
    const selectedMember = this.memberOptions.find(m => m.value === selectedId);
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
      incidence_type_id: this.task?.type?.id || null,
      incidence_category_id: this.task?.category?.id || null,
      incidence_state_id: this.task?.state?.id || null,
      assigned_user_id: formValue.assigned_user_id || null,
      parent_incidence_id: formValue.parent_id || null,
      start_date: this.formatDate(formValue.start_date ? new Date(formValue.start_date) : null),
      due_date: this.formatDate(formValue.due_date ? new Date(formValue.due_date) : null)
    };
  }

  /**
   * Muestra un toast de error
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
   * Verifica si el nombre de confirmación coincide
   */
  checkDeleteConfirmation() {
    this.deleteNameValid = this.deleteConfirmationName === this.task?.title;
  }

  /**
   * Abre el diálogo de eliminación según si tiene hijos o no
   */
  confirmDelete() {
    if (this.hasChildren) {
      this.showDeleteWithChildrenDialog = true;
    } else {
      this.showDeleteDialog = true;
    }
  }

  /**
   * Elimina la tarea
   */
  deleteTask() {
    this.deleting = true;
    this.showDeleteDialog = false;
    this.showDeleteWithChildrenDialog = false;

    this.projectService.removeIncidence(this.projectId, this.taskId).subscribe({
      next: () => {
        this.deleting = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Tarea eliminada correctamente',
          life: 3000
        });

        setTimeout(() => {
          this.router.navigate([
            '/project-management/projects/kanban',
            this.projectId,
            'project-kanban'
          ]);
        }, 1500);
      },
      error: (error) => {
        this.deleting = false;
        console.error('Error deleting task:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo eliminar la tarea',
          life: 5000
        });
      }
    });
  }

  /**
   * Navega a la tarea padre
   */
  navigateToParent() {
    if (this.task?.parent) {
      this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'task-update',
        this.task.parent.id
      ]);
    }
  }

  /**
   * Muestra diálogo de éxito
   */
  private showSuccessDialog(taskTitle: string) {
    this.confirmationService.confirm({
      message: `La tarea "${taskTitle}" ha sido actualizada exitosamente.`,
      header: '¡Tarea Actualizada!',
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
      }
    });
  }

  /**
   * Envía el formulario
   */
  onSubmit() {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();

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
  markAsDirty(fieldName: string) {
    this.taskForm.get(fieldName)?.markAsDirty();
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
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo actualizar la tarea',
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
