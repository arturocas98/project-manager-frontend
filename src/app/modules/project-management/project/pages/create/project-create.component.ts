  import {Component, OnInit} from '@angular/core';
  import { AvatarModule } from 'primeng/avatar';
  import { MultiSelectModule } from 'primeng/multiselect';
  import { NgClass, NgForOf, NgIf } from '@angular/common';
  import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
  import { ButtonModule } from 'primeng/button';
  import { InputTextareaModule } from 'primeng/inputtextarea';
  import { ChipsModule } from 'primeng/chips';
  import { AvailableRole } from '../../../../../shared/models/projects-models/project-create-response';
  import { ProjectService } from '../../../../../core/service/project.service';
  import {ProjectMemberRequest, ProjectRequest} from '../../../../../shared/models/projects-models/project-request';
  import { TagModule } from 'primeng/tag';
  import {ConfirmationService, MessageService} from 'primeng/api';
  import { ConfirmDialogModule } from 'primeng/confirmdialog';
  import {AuthService} from "../../../../../core/service/auth.service";
  import {ToastModule} from "primeng/toast";
  import {DropdownModule} from "primeng/dropdown";
  import {DialogModule} from "primeng/dialog";
  import {TooltipModule} from "primeng/tooltip";
  import {Profile} from "../../../../../shared/models/auth";
  import {InputTextModule} from "primeng/inputtext";

  interface SelectedMember {
    user_id: number;
    name: string;
    email: string;
    role_type: string;
    role_label: string;
    profile_photo?: string;
  }

  @Component({
    selector: 'app-project-create',
    standalone: true,
    imports: [
      AvatarModule,
      MultiSelectModule,
      NgClass,
      ReactiveFormsModule,
      ButtonModule,
      InputTextareaModule,
      ChipsModule,
      TagModule,
      ConfirmDialogModule,
      DialogModule,
      DropdownModule,
      ToastModule,
      NgIf,
      NgForOf,
      FormsModule,
      TooltipModule,
      InputTextModule,
    ],
    providers: [MessageService],
    templateUrl: './project-create.component.html',
  })
  export class ProjectCreateComponent implements OnInit {

    projectForm = this.fb.group({
      ContractNo: ['', Validators.required],
      client: ['', Validators.required],
      project_type: ['', Validators.required],
      objectContract: [''],

      // Fechas y duración
      start_date: ['', Validators.required],
      duration_days: [0],
      end_date: [{ value: '', disabled: true }],

      // Información de contacto y empresa
      administrator_email: ['', [Validators.email]],
      contracted_company: [''],

      // Estado del proyecto
      project_state_id: [1, Validators.required],

      // Fase opcional
      last_phase: ['']
    });

    // Variables para miembros
    allUsers: Profile[] = [];
    userOptions: { label: string; value: number }[] = [];
    availableUserOptions: { label: string; value: number }[] = []; // <-- NUEVA VARIABLE
    selectedMembers: SelectedMember[] = [];

    // Variables para selectores de miembros
    selectedUserId: number | null = null;
    selectedRoleType: string | null = null;

    // Opciones de roles
    roleOptions = [
      { label: 'Lider', value: 'LDR' },
      { label: 'Desarrollador', value: 'DEV' },
      { label: 'Ensayador', value: 'TST' },
      { label: 'Documentador', value: 'DOC' }
    ];

    // Diálogos
    showAddMemberDialog = false;
    showEditRoleDialog = false;

    // Miembro seleccionado para editar
    memberToEdit: SelectedMember | null = null;

    // Formularios
    editRoleForm: FormGroup;
    addMemberForm: FormGroup;

    // Loading states
    addMemberLoading = false;
    editRoleLoading = false;
    loading = false;
    addingMember = false;

    // Mensajes y respuestas
    errorMessage: string | null = null;
    createdProject: any = null;
    availableRoles: AvailableRole[] = [];

    constructor(
      private fb: FormBuilder,
      private projectService: ProjectService,
      private authService: AuthService,
      private messageService: MessageService,
      public confirmationService: ConfirmationService
    ) {
      // Calcular end_date automáticamente cuando cambian start_date o duration_days
      this.setupEndDateCalculation();

      // Inicializar formularios
      this.editRoleForm = this.fb.group({
        role_type: [null, Validators.required]
      });

      this.addMemberForm = this.fb.group({
        user_id: [null, Validators.required],
        role_type: [null, Validators.required]
      });
    }

    ngOnInit(): void {
      this.loadAllUsers();
    }

    private setupEndDateCalculation(): void {
      this.projectForm.get('start_date')?.valueChanges.subscribe(() => {
        this.calculateEndDate();
      });

      this.projectForm.get('duration_days')?.valueChanges.subscribe(() => {
        this.calculateEndDate();
      });
    }

    private calculateEndDate(): void {
      const startDate = this.projectForm.get('start_date')?.value;
      const durationDays = this.projectForm.get('duration_days')?.value;

      if (startDate && durationDays && durationDays > 0) {
        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(start.getDate() + durationDays);

        // Formatear fecha como YYYY-MM-DD
        const endDateStr = end.toISOString().split('T')[0];
        this.projectForm.patchValue({ end_date: endDateStr });
      } else {
        this.projectForm.patchValue({ end_date: '' });
      }
    }

    /**
     * Carga todos los usuarios disponibles
     */
    loadAllUsers(): void {
      this.authService.getProfiles().subscribe({
        next: (users) => {
          this.allUsers = users;
          this.userOptions = users.map(user => ({
            label: `${user.name} (${user.email})`,
            value: user.id
          }));
          this.updateAvailableUsers(); // <-- Actualiza usuarios disponibles
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudieron cargar los usuarios'
          });
        }
      });
    }

    /**
     * Actualiza la lista de usuarios disponibles (no seleccionados)
     */
    updateAvailableUsers(): void {
      const selectedIds = this.selectedMembers.map(m => m.user_id);
      this.availableUserOptions = this.userOptions.filter(
        option => !selectedIds.includes(option.value)
      );
    }

    /**
     * Obtiene las iniciales del nombre
     */
    getInitials(name: string): string {
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    }

    /**
     * Obtiene el color de la etiqueta según el rol
     */
    getRoleSeverity(roleType: string): string {
      const severities: { [key: string]: string } = {
        'LDR': 'warning',
        'DEV': 'info',
        'TST': 'success',
        'DOC': 'help'
      };
      return severities[roleType] || 'secondary';
    }

    /**
     * Abre el diálogo para añadir miembro
     */
    openAddMemberDialog(): void {
      this.addMemberForm.reset();
      this.showAddMemberDialog = true;
    }

    /**
     * Añade miembro a la selección temporal
     */
    addMemberToList(): void {
      if (this.addMemberForm.invalid) {
        this.addMemberForm.markAllAsTouched();
        return;
      }

      this.addMemberLoading = true;

      const userId = this.addMemberForm.value.user_id;
      const roleType = this.addMemberForm.value.role_type;

      // Buscar el usuario seleccionado
      const user = this.allUsers.find(u => u.id === userId);
      if (!user) {
        this.addMemberLoading = false;
        return;
      }

      // Verificar que no esté ya seleccionado
      if (this.selectedMembers.some(m => m.user_id === userId)) {
        this.messageService.add({
          severity: 'warn',
          summary: 'Usuario ya añadido',
          detail: 'Este usuario ya está en la lista de miembros'
        });
        this.addMemberLoading = false;
        return;
      }

      // Buscar el label del rol
      const role = this.roleOptions.find(r => r.value === roleType);

      // Añadir a la lista
      this.selectedMembers.push({
        user_id: user.id,
        name: user.name,
        email: user.email,
        role_type: roleType,
        role_label: role?.label || roleType,
        profile_photo: typeof user.photo === 'string' ? user.photo : undefined
      });

      // Actualizar usuarios disponibles
      this.updateAvailableUsers();

      // Cerrar diálogo y resetear
      this.showAddMemberDialog = false;
      this.addMemberForm.reset();
      this.addMemberLoading = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Miembro añadido',
        detail: `${user.name} ha sido añadido a la lista`
      });
    }

    /**
     * Elimina miembro de la selección temporal
     */
    removeMember(userId: number): void {
      const member = this.selectedMembers.find(m => m.user_id === userId);
      this.selectedMembers = this.selectedMembers.filter(m => m.user_id !== userId);

      // Actualizar usuarios disponibles
      this.updateAvailableUsers();

      if (member) {
        this.messageService.add({
          severity: 'info',
          summary: 'Miembro eliminado',
          detail: `${member.name} ha sido eliminado de la lista`
        });
      }
    }

    /**
     * Abre el diálogo para editar rol
     */
    openEditRoleDialog(member: SelectedMember): void {
      this.memberToEdit = member;
      this.editRoleForm.patchValue({
        role_type: member.role_type
      });
      this.showEditRoleDialog = true;
    }

    /**
     * Actualiza el rol del miembro en la selección temporal
     */
    updateMemberRole(): void {
      if (this.editRoleForm.invalid || !this.memberToEdit) {
        this.editRoleForm.markAllAsTouched();
        return;
      }

      this.editRoleLoading = true;

      const newRoleType = this.editRoleForm.value.role_type;
      const role = this.roleOptions.find(r => r.value === newRoleType);

      // Actualizar el miembro en la lista
      const index = this.selectedMembers.findIndex(m => m.user_id === this.memberToEdit!.user_id);
      if (index !== -1) {
        this.selectedMembers[index].role_type = newRoleType;
        this.selectedMembers[index].role_label = role?.label || newRoleType;
      }

      this.showEditRoleDialog = false;
      this.memberToEdit = null;
      this.editRoleForm.reset();
      this.editRoleLoading = false;

      this.messageService.add({
        severity: 'success',
        summary: 'Rol actualizado',
        detail: 'El rol ha sido actualizado correctamente'
      });
    }

    onSubmit() {
      if (this.projectForm.valid) {
        this.loading = true;
        this.errorMessage = null;

        // Obtener el valor de end_date calculado
        const formValue = this.projectForm.getRawValue();

        const projectData: ProjectRequest = {
          ContractNo: formValue.ContractNo!,
          client: formValue.client!,
          project_type: formValue.project_type!,
          start_date: formValue.start_date!,
          duration_days: formValue.duration_days || undefined,
          end_date: formValue.end_date || undefined,
          administrator_email: formValue.administrator_email || undefined,
          contracted_company: formValue.contracted_company || undefined,
          last_phase: formValue.last_phase || undefined,
          project_state_id: formValue.project_state_id!,
          objectContract: formValue.objectContract || undefined
        };

        console.log('Enviando datos:', projectData);

        this.projectService.createProject(projectData).subscribe({
          next: response => {
            console.log('Respuesta del servidor:', response);

            this.createdProject = response.project;
            this.availableRoles = response.available_roles;

            // Si hay miembros seleccionados, asignarlos al proyecto
            if (this.selectedMembers.length > 0) {
              this.assignMembersToProject(response.project.id);
            } else {
              this.finishProjectCreation(response.project);
            }
          },
          error: error => {
            console.error('Error creando proyecto:', error);
            this.errorMessage = error.error?.message || 'Error al crear el proyecto';
            this.loading = false;
          },
        });
      } else {
        this.projectForm.markAllAsTouched();
      }
    }

    /**
     * Asigna los miembros seleccionados al proyecto creado
     */
    assignMembersToProject(projectId: number): void {
      let assignedCount = 0;
      const totalMembers = this.selectedMembers.length;

      this.selectedMembers.forEach(member => {
        const memberData: ProjectMemberRequest = {
          user_id: member.user_id,
          role_type: member.role_type
        };

        this.projectService.addMember(projectId, memberData).subscribe({
          next: () => {
            assignedCount++;

            // Cuando todos los miembros hayan sido asignados
            if (assignedCount === totalMembers) {
              this.finishProjectCreation(this.createdProject);
            }
          },
          error: (error) => {
            console.error(`Error asignando miembro ${member.name}:`, error);
            assignedCount++;

            // Continuar con los demás aunque uno falle
            if (assignedCount === totalMembers) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Advertencia',
                detail: 'Algunos miembros no pudieron ser asignados'
              });
              this.finishProjectCreation(this.createdProject);
            }
          }
        });
      });
    }

    /**
     * Finaliza la creación del proyecto
     */
    finishProjectCreation(project: any): void {
      this.loading = false;
      this.projectForm.reset({
        project_state_id: 1,
        duration_days: 0
      });

      // Limpiar la lista de miembros seleccionados
      this.selectedMembers = [];
      this.updateAvailableUsers(); // <-- Actualizar usuarios disponibles

      // Mostrar diálogo de éxito
      this.showSuccessDialog(project.client || project.ContractNo);
    }

    showSuccessDialog(projectName: string) {
      this.confirmationService.confirm({
        message: `El proyecto "${projectName}" ha sido creado exitosamente.`,
        header: '¡Creado Correctamente!',
        acceptLabel: 'Ver Proyecto',
        rejectLabel: 'Cerrar',
        acceptIcon: 'pi pi-eye',
        rejectIcon: 'pi pi-times',
        acceptButtonStyleClass: 'p-button-success p-button-raised',
        rejectButtonStyleClass: 'p-button-text p-button-secondary',
        defaultFocus: 'accept',
        accept: () => {
          // Aquí puedes navegar a la vista del proyecto si tienes el router
          // this.router.navigate(['/projects', this.createdProject.id]);
        },
        reject: () => {
          console.log('Diálogo cerrado');
        },
      });
    }
  }
