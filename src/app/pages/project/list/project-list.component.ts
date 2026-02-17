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
import { Constants, NUMBERS } from 'src/app/shared/constants/constants';
import { ParamJson, ResponseData } from 'src/app/shared/models/response';
import { Role } from 'src/app/shared/models/role';
import { ProjectCardComponent } from "src/app/shared/components/project/card/project-card.component";
import { Project } from 'src/app/shared/models/project';
import { CardModule } from 'primeng/card';
import { ProjectService } from 'src/app/core/service/project.service';

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
