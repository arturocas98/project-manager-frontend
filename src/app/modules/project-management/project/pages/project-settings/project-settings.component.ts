import {Component, OnInit, ViewChild} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {ConfirmDialogModule} from "primeng/confirmdialog";
import {ToastModule} from "primeng/toast";
import {InputTextareaModule} from "primeng/inputtextarea";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {ProjectService} from "../../../../../core/service/project.service";
import {ConfirmationService, MessageService} from "primeng/api";
import {UpdateProjectRequest} from "../../../../../shared/models/projects-models/project-request";
import {InputTextModule} from "primeng/inputtext";

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
    DatePipe
  ],
  templateUrl: './project-settings.component.html',
})
export class ProjectSettingsComponent implements OnInit {
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

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {
    this.projectForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.loadProjectData();
  }

  /**
   * Carga los datos del proyecto
   */
  loadProjectData() {
    this.loading = true;
    this.projectService.getProject(this.projectId).subscribe({
      next: (project) => {
        this.projectForm.patchValue({
          name: project.name??'',
          description: project.description??''
        });

        this.projectKey = project.key;
        this.createdAt = project.created_at ? new Date(project.created_at) : null;
        this.updatedAt = project.updated_at ? new Date(project.updated_at) : null;

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
   * Actualiza el proyecto
   */
  onUpdate() {
    if (this.projectForm.valid && this.projectForm.dirty) {
      this.updateLoading = true;
      this.errorMessage = null;

      const projectData: UpdateProjectRequest = {
        name: this.projectForm.value.name,
        description: this.projectForm.value.description
      };

      this.projectService.updateProject(projectData, this.projectId).subscribe({
        next: (response) => {
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
