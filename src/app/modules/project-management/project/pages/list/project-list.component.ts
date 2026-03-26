import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { TableModule } from 'primeng/table';
import { ProjectCardComponent } from 'src/app/shared/components/project/card/project-card.component';
import { Project } from 'src/app/shared/models/project';
import { CardModule } from 'primeng/card';
import { ProjectService } from 'src/app/core/service/project.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ApiListResponse } from '../../../../../shared/models/api-response.model';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {AuthService} from "../../../../../core/service/auth.service";
import {Profile} from "../../../../../shared/models/auth";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-project-list',
  templateUrl: './project-list.component.html',
  providers: [ConfirmationService],
  imports: [
    CommonModule,
    RippleModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    ConfirmDialogModule,
    TranslateModule,
    ProjectCardComponent,
    CardModule,
    ProgressSpinnerModule,
    RouterLink,
    RouterLinkActive,
    FormsModule
  ],
  standalone: true,
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  searchQuery: string = '';
  loading: boolean = false;
  isAdmin: boolean = false;
  profile?: Profile;

  constructor(
    private projectService: ProjectService,
    private authservice: AuthService,
    private router: Router
  ) {
    this.profile = this.authservice.getProfileLocal();
    console.log(this.profile);

    this.isAdmin = this.profile?.role?.includes('Admin') ?? false;
  }

  goToProject(id: number) {
    this.projectService.getMyRole(id).subscribe({
      next: (res) => {
        if (res && res.role_type) {
          localStorage.setItem('role_type', res.role_type);
        }
        this.router.navigate(['/project-management/projects/kanban', id]);
      },
      error: (err) => {
        console.error('Error al obtener el rol del proyecto:', err);
        // Navega de todas formas por si falla la llamada
        this.router.navigate(['/project-management/projects/kanban', id]);
      }
    });
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;

    this.projectService.getAll().subscribe({
      next: (projects: Project[]) => {
        this.projects = projects;
        this.filteredProjects = [...this.projects];

        console.log('Proyectos cargados:', this.projects);
        console.log('Total de proyectos:', this.projects.length);

        this.loading = false;
      },
      error: error => {
        console.error('Error cargando proyectos:', error);
        this.loading = false;
      }
    });
  }

  filterProjects() {
    if (!this.searchQuery) {
      this.filteredProjects = [...this.projects];
    } else {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredProjects = this.projects.filter(p => 
        p.objectContract?.toLowerCase().includes(query) ||
        p.ContractNo?.toLowerCase().includes(query) ||
        p.client?.Nombre?.toLowerCase().includes(query) ||
        p.administrator?.name?.toLowerCase().includes(query) ||
        p.state?.name?.toLowerCase().includes(query) ||
        p.project_type?.toLowerCase().includes(query)
      );
    }
  }
}
