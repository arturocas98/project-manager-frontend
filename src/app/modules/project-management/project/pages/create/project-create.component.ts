import { Component } from '@angular/core';
import {AvatarModule} from "primeng/avatar";
import {MultiSelectModule} from "primeng/multiselect";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ButtonModule} from "primeng/button";
import {InputTextareaModule} from "primeng/inputtextarea";
import {ChipsModule} from "primeng/chips";
import {AvailableRole} from "../../../../../shared/models/projects-models/project-create-response";
import {Router} from "@angular/router";
import {ProjectService} from "../../../../../core/service/project.service";
import {ProjectRequest} from "../../../../../shared/models/projects-models/project-request";
import {TagModule} from "primeng/tag";
import {ConfirmationService} from "primeng/api";
import {ConfirmDialogModule} from "primeng/confirmdialog";

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
    NgIf,
    NgForOf
  ],
  templateUrl: './project-create.component.html',
})
export class ProjectCreateComponent {
  projectForm = this.fb.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  loading = false;
  errorMessage: string | null = null;
  createdProject: any = null;
  availableRoles: AvailableRole[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private projectService: ProjectService,
    public confirmationService: ConfirmationService
  ) {}

  onSubmit() {
    if (this.projectForm.valid) {
      // Limpiar mensajes anteriores
      this.loading = true;
      this.errorMessage = null;

      const projectData: ProjectRequest = {
        name: this.projectForm.value.name!,
        description: this.projectForm.value.description!
      };

      console.log('Enviando datos:', projectData);

      // Usar el servicio createProject
      this.projectService.createProject(projectData).subscribe({
        next: (response) => {
          console.log('Respuesta del servidor:', response);

          this.createdProject = response.project;
          this.availableRoles = response.available_roles;

          this.loading = false;
          this.projectForm.reset();

          // Mostrar diálogo de éxito
          this.showSuccessDialog(response.project.name);
        },
        error: (error) => {
          console.error('Error creando proyecto:', error);
          this.errorMessage = error.error?.message || 'Error al crear el proyecto';
          this.loading = false;
        }
      });
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      this.projectForm.markAllAsTouched();
    }
  }

  /**
   * Muestra el diálogo de confirmación de éxito
   */
  showSuccessDialog(projectName: string) {
    this.confirmationService.confirm({
      message: `El proyecto "${projectName}" ha sido creado exitosamente.`,
      header: '¡Creado Correctamente!',
      acceptLabel: 'Ver Proyecto',
      rejectLabel: 'Cerrar',
      acceptIcon: 'pi pi-eye',
      rejectIcon: 'pi pi-times',

      // Personalización de estilos
      acceptButtonStyleClass: 'p-button-success p-button-raised',
      rejectButtonStyleClass: 'p-button-text p-button-secondary',

      // Personalización de colores (verde oscuro para el texto)
      defaultFocus: 'accept',

      reject: () => {
        // Solo cerrar el diálogo
        console.log('Diálogo cerrado');
      }
    });
  }
}
