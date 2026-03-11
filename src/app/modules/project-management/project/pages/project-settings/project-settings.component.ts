import {Component, OnInit, ViewChild} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {InputTextareaModule} from "primeng/inputtextarea";
import {DatePipe, NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../../../../core/service/project.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {
  ProjectMemberRequest,
  ProjectMemberUpdateRequest,
  UpdateProjectRequest
} from "../../../../../shared/models/projects-models/project-request";
import {InputTextModule} from "primeng/inputtext";
import {DropdownModule} from "primeng/dropdown";
import {DialogModule} from "primeng/dialog";
import {HttpClient} from "@angular/common/http";
import {unassignedUsersData} from "../../../../../shared/models/auth";
import {ProjectMember} from "../../../../../shared/models/kanban.models";
import {KanbanService} from "../../../../../core/service/kanban-service";
import {TooltipModule} from "primeng/tooltip";
import {Option} from "../../../../../shared/models/general";
import {TranslateModule} from "@ngx-translate/core";

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [
    ButtonModule,
    ConfirmDialogModule,
    ToastModule,
    InputTextareaModule,
    NgClass,
    ReactiveFormsModule,
    NgIf,
    InputTextModule,
    DatePipe,
    DropdownModule,
    DialogModule,
    TooltipModule,
    NgForOf,
    TranslateModule
  ],
  templateUrl: './project-settings.component.html',
})
export class ProjectSettingsComponent implements OnInit {
  state_options: Option[] = [
    {
      id: 1,
      name: 'abierto',
    },
    {
      id: 2,
      name: 'En proceso',
    },
    {
      id: 3,
      name: 'finalizado',
    },
    {
      id: 3,
      name: 'suspendido',
    },
  ];
  @ViewChild('cd') confirmDialog: any;

  projectForm: FormGroup;
  projectId!: number;
  projectKey: string = '';
  createdAt: Date | null = null;
  updatedAt: Date | null = null;

  loading = false;
  updateLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Variables para los diálogos
  showAddMemberDialog = false;
  showRemoveMemberDialog = false;
  showEditRoleDialog = false;

  addMemberLoading = false;
  deleteMemberLoading = false;
  editRoleLoading = false;

  profiles: unassignedUsersData[] = [];
  profileOptions: { label: string, value: number }[] = [];
  memberOptions: { label: string, value: number }[] = [];
  member: ProjectMember[] = [];

  // Miembro seleccionado para editar
  selectedMember: ProjectMember | null = null;

  // Opciones de roles

  roleOptions = [
    { label: 'Lider', value: 'LDR' },
    { label: 'Desarrollador', value: 'DEV' },
      { label: 'Ensayador', value: 'TST' },
    { label: 'Documentador', value: 'DOC' }
  ];

  // Formularios
  addMemberForm: FormGroup;
  deleteMemberForm: FormGroup;
  editRoleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private http: HttpClient,
    private kanbanService: KanbanService
  ) {
    this.projectForm = this.fb.group({
      ContractNo: ['', Validators.required],
      client: ['', Validators.required],
      project_type: ['', Validators.required],

      start_date: ['', Validators.required],

      duration_days: [null],
      end_date: [''],

      administrator_email: [''],

      contracted_company: [''],

      last_phase: [''],

      project_state_id: [null, Validators.required],

      objectContract: ['']
    });

    this.addMemberForm = this.fb.group({
      user_id: [null, Validators.required],
      role_type: [null, Validators.required]
    });

    this.deleteMemberForm = this.fb.group({
      user_id: [null, Validators.required],
    });

    this.editRoleForm = this.fb.group({
      role_type: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.loadProjectData();
    this.loadUnassignedUsers();
    this.loadMembers();
  }

  /**
   * Carga los datos del proyecto
   */
  loadProjectData() {
    this.loading = true;
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        console.log(project);
          this.projectForm.patchValue({
          ContractNo: project.ContractNo ?? '',
          client: project.client ?? '',
          project_type: project.project_type ?? '',

          start_date: project.start_date ?? '',
          end_date: project.end_date ?? '',
          duration_days: project.duration_days ?? null,

          administrator_email: project.administrator?.email ?? '',

          contracted_company: project.contracted_company ?? '',
          last_phase: project.last_phase ?? '',

          project_state_id: project.state?.id ?? null,

          objectContract: project.objectContract ?? ''
        });

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading project:', error);
        this.errorMessage = 'Error al cargar los datos del proyecto';
        this.loading = false;
      }
    });
  }

  /**
   * Carga los perfiles de usuario no asignados
   */
  loadUnassignedUsers() {
    this.projectService.getUnassignedUsers(this.projectId).subscribe({
      next: (profiles) => {
        this.profiles = profiles;

        this.profileOptions = profiles.map(profile => ({
          label: `${profile.name} (${profile.email})`,
          value: profile.id
        }));
      },
      error: (error) => {
        console.error('Error loading profiles:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los perfiles de usuario'
        });
      }
    });
  }

  /**
   * Carga los miembros del proyecto
   */
  loadMembers() {
    this.kanbanService.getProjectMembers(this.projectId).subscribe({
      next: (members) => {
        this.member = members;

        this.memberOptions = members.map(member => ({
          label: `${member.user.name} (${this.getRoleName(member.role.type)})`,
          value: member.user.id
        }));
      },
      error: (error) => {
        console.error('Error loading members:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los miembros del proyecto'
        });
      }
    });
  }

  /**
   * Obtiene las iniciales del nombre
   */
  getInitials(name: string): string {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  }

  /**
   * Obtiene el nombre legible del rol
   */
  getRoleName(roleCode: string): string {
    const role = this.roleOptions.find(r => r.value === roleCode);
    return role ? role.label : roleCode;
  }

  /**
   * Abre el diálogo para añadir miembro
   */
  openAddMemberDialog() {
    this.addMemberForm.reset();
    this.showAddMemberDialog = true;
  }

  /**
   * Abre el diálogo para eliminar miembro
   */
  openRemoveMemberDialog() {
    this.deleteMemberForm.reset();
    this.showRemoveMemberDialog = true;
  }

  /**
   * Abre el diálogo para editar rol
   */
  openEditRoleDialog(member: ProjectMember) {
    this.selectedMember = member;
    this.editRoleForm.patchValue({
      role_type: member.role.type
    });
    this.showEditRoleDialog = true;
  }

  /**
   * Añade un miembro al proyecto
   */
  addMember() {
    if (this.addMemberForm.invalid) {
      this.addMemberForm.markAllAsTouched();
      return;
    }

    this.addMemberLoading = true;
    const memberData: ProjectMemberRequest = {
      user_id: this.addMemberForm.value.user_id,
      role_type: this.addMemberForm.value.role_type
    };

    this.projectService.addMember(this.projectId, memberData).subscribe({
      next: () => {
        this.addMemberLoading = false;
        this.showAddMemberDialog = false;
        this.addMemberForm.reset();

        // Recargar la lista de miembros
        this.loadMembers();
        // Recargar usuarios no asignados
        this.loadUnassignedUsers();

        this.messageService.add({
          severity: 'success',
          summary: 'Miembro añadido',
          detail: 'Usuario añadido correctamente al proyecto',
          life: 3000
        });
      },
      error: (error) => {
        this.addMemberLoading = false;
        console.error('Error adding member:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo añadir el miembro al proyecto',
          life: 5000
        });
      }
    });
  }

  /**
   * Elimina un miembro del proyecto
   */
  RemoveMember() {
    if (this.deleteMemberForm.invalid) {
      this.deleteMemberForm.markAllAsTouched();
      return;
    }

    this.deleteMemberLoading = true;

    this.projectService.removeMember(this.projectId, this.deleteMemberForm.value.user_id).subscribe({
      next: () => {
        this.deleteMemberLoading = false;
        this.showRemoveMemberDialog = false;
        this.deleteMemberForm.reset();

        // Recargar la lista de miembros
        this.loadMembers();
        // Recargar usuarios no asignados
        this.loadUnassignedUsers();

        this.messageService.add({
          severity: 'success',
          summary: 'Miembro eliminado',
          detail: 'Usuario eliminado correctamente del proyecto',
          life: 3000
        });
      },
      error: (error) => {
        this.deleteMemberLoading = false;
        console.error('Error removing member:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo eliminar el miembro del proyecto',
          life: 5000
        });
      }
    });
  }

  /**
   * Actualiza el rol de un miembro
   */
  updateMemberRole() {
    if (this.editRoleForm.invalid || !this.selectedMember) {
      this.editRoleForm.markAllAsTouched();
      return;
    }

    this.editRoleLoading = true;

    const updateData: ProjectMemberUpdateRequest = {
      role_type: this.editRoleForm.value.role_type
    };

    this.projectService.updateMember(this.projectId, this.selectedMember.user.id, updateData).subscribe({
      next: () => {
        this.editRoleLoading = false;
        this.showEditRoleDialog = false;
        this.editRoleForm.reset();

        // Recargar la lista de miembros
        this.loadMembers();

        this.messageService.add({
          severity: 'success',
          summary: 'Rol actualizado',
          detail: `Rol actualizado correctamente para ${this.selectedMember?.user.name}`,
          life: 3000
        });
      },
      error: (error) => {
        this.editRoleLoading = false;
        console.error('Error updating member role:', error);

        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo actualizar el rol del miembro',
          life: 5000
        });
      }
    });
  }

  /**
   * Actualiza el proyecto
   */
  onUpdate() {
    if (this.projectForm.valid && this.projectForm.dirty) {
      this.updateLoading = true;
      this.errorMessage = null;

      const projectData: UpdateProjectRequest = {
        ContractNo: this.projectForm.value.ContractNo,
        client: this.projectForm.value.client,
        project_type: this.projectForm.value.project_type,

        start_date: this.projectForm.value.start_date,

        duration_days: this.projectForm.value.duration_days,
        end_date: this.projectForm.value.end_date,

        administrator_email: this.projectForm.value.administrator_email,

        contracted_company: this.projectForm.value.contracted_company,

        last_phase: this.projectForm.value.last_phase,

        project_state_id: this.projectForm.value.project_state_id,

        objectContract: this.projectForm.value.objectContract
      };

      this.projectService.updateProject(projectData, this.projectId).subscribe({
        next: () => {
          this.updateLoading = false;
          this.projectForm.markAsPristine();

          // Mostrar mensaje de éxito
          this.showSuccessDialog('Proyecto actualizado correctamente');
        },
        error: (error) => {
          console.error('Error updating project:', error);
          this.errorMessage = error.error?.message || 'Error al actualizar el proyecto';
          this.updateLoading = false;
        }
      });
    }
  }

  /**
   * Confirma la eliminación del proyecto
   */
  confirmDelete() {
    this.confirmationService.confirm({
      key: 'deleteDialog',
      header: '¿Eliminar Proyecto?',
      message: `¿Estás seguro que deseas eliminar el proyecto "${this.projectForm.get('name')?.value}"?`,
      accept: () => {
        this.deleteProject();
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'La eliminación fue cancelada'
        });
      }
    });
  }

  /**
   * Elimina el proyecto
   */
  deleteProject() {
    this.loading = true;

    this.projectService.deletProject(this.projectId).subscribe({
      next: () => {
        this.loading = false;

        // Mostrar mensaje y redirigir
        this.messageService.add({
          severity: 'success',
          summary: 'Eliminado',
          detail: 'Proyecto eliminado correctamente',
          life: 3000
        });

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      },
      error: (error) => {
        console.error('Error deleting project:', error);
        this.errorMessage = error.error?.message || 'Error al eliminar el proyecto';
        this.loading = false;
      }
    });
  }

  /**
   * Muestra diálogo de éxito
   */
  showSuccessDialog(message: string) {
    this.confirmationService.confirm({
      key: 'successDialog',
      header: '¡Actualizado!',
      message: message,
      accept: () => {
        // Recargar datos para mostrar la última actualización
        this.loadProjectData();
      }
    });
  }

  /**
   * Resetea el formulario a los valores originales
   */
  resetForm() {
    this.loadProjectData();
    this.projectForm.markAsPristine();
  }
}
