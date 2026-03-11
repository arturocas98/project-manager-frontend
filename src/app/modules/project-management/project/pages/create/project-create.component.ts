import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ChipsModule } from 'primeng/chips';
import { AvailableRole } from '../../../../../shared/models/projects-models/project-create-response';
import { ProjectService } from '../../../../../core/service/project.service';
import { ProjectRequest } from '../../../../../shared/models/projects-models/project-request';
import { TagModule } from 'primeng/tag';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';


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
    NgForOf,
  ],
  templateUrl: './project-create.component.html',
})
export class ProjectCreateComponent {
  projectForm = this.fb.group({
    // Datos básicos del proyecto
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

  loading = false;
  errorMessage: string | null = null;
  createdProject: any = null;
  availableRoles: AvailableRole[] = [];

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    public confirmationService: ConfirmationService
  ) {
    // Calcular end_date automáticamente cuando cambian start_date o duration_days
    this.setupEndDateCalculation();
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

          this.loading = false;
          this.projectForm.reset({
            project_state_id: 1, // Resetear al estado por defecto
            duration_days: 0
          });

          // Mostrar diálogo de éxito con el nombre del cliente o ContractNo
          this.showSuccessDialog(response.project.client || response.project.ContractNo);
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
      reject: () => {
        console.log('Diálogo cerrado');
      },
    });
  }
}
