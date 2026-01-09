import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { Table, TableLazyLoadEvent, TableModule } from 'primeng/table';
import { Constants, NUMBERS } from 'src/app/constants/constants';
import { ParamJson, ResponseData } from 'src/app/models/response';
import { Role } from 'src/app/models/role';
import { RoleService } from 'src/app/service/role.service';
import { ProjectCardComponent } from "src/app/components/project/card/project-card.component";
import { Project } from 'src/app/models/project';
import { ProjectService } from 'src/app/service/project.service';
import { CardModule } from 'primeng/card';

@Component({
  templateUrl: "./project-list.component.html",
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
    CardModule
  ],
  standalone: true,
})
export class ProjectListComponent {
  projects: Project[] = [];

  constructor(private projectService: ProjectService) {}

  ngOnInit() {
    this.projectService.getAll().subscribe((data:ResponseData<Project>) => {
      this.projects = data.data;
      console.log(this.projects)
    });
  }
}
