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
  ],
  standalone: true,
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
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

    this.isAdmin = this.profile?.roles?.includes('Admin') ?? false;
  }

  goToProject(id: number) {
    this.router.navigate(['/project-management/projects/kanban', id]);
  }

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.loading = true;

    this.projectService.getAll().subscribe({
      next: (response: ApiListResponse<Project>) => {
        this.projects = response.data;
        console.log('Proyectos cargados:', this.projects);
        this.loading = false;

        if (response.meta?.pagination) {
          console.log('Total de proyectos:', response.meta.total);
        }
      },
      error: error => {
        console.error('Error cargando proyectos:', error);
        this.loading = false;
      },
    });
  }
}
