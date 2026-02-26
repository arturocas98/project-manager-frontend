import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "list",
    data: { breadcrumb: "List" },
    loadComponent: () =>
      import("./pages/list/project-list.component").then(
        (m) => m.ProjectListComponent,
      ),
  },
  {
    path: "create",
    data: { breadcrumb: "Create" },
    loadComponent: () =>
      import("./pages/create/project-create.component").then(
        (m) => m.ProjectCreateComponent,
      ),
  },
  {
    path: "kanban/:id",
    data: { breadcrumb: "Create" },
    loadComponent: () =>
      import("./pages/view-project/view-project.component").then(
        (m) => m.ViewProjectComponent,
      ),
    children: [
      { path: "", redirectTo: "project-summary", pathMatch: "full" },
      {
        path: "project-summary",
        data: { breadcrumb: "summary" },
        loadComponent: () =>
          import("./pages/project-summary/project-summary.component").then(
            (m) => m.ProjectSummaryComponent,
          ),
      },
      {
        path: "project-schedule",
        data: { breadcrumb: "schedule" },
        loadComponent: () =>
          import("./pages/project-schedule/project-schedule.component").then(
            (m) => m.ProjectScheduleComponent,
          ),
      },
      {
        path: "project-kanban",
        data: { breadcrumb: "kanban" },
        loadComponent: () =>
          import("./pages/kanban-project/kanban-project.component").then(
            (m) => m.KanbanProjectComponent,
          ),
      },
      {
        path: "project-settings",
        data: { breadcrumb: "schedule" },
        loadComponent: () =>
          import("./pages/project-settings/project-settings.component").then(
            (m) => m.ProjectSettingsComponent,
          ),
      },
      {
        path: "create-task/:stateId",
        data: { breadcrumb: "create" },
        loadComponent: () =>
          import("../task/pages/create/task-create.component").then(
            (m) => m.TaskCreateComponent,
          ),
      },
      {
        path: "task-update/:IncidenceId",
        data: { breadcrumb: "update" },
        loadComponent: () =>
          import("../task/pages/task-update/task-update.component").then(
            (m) => m.TaskUpdateComponent,
          ),
      },
      {
        path: "task-details/:IncidenceId",
        data: { breadcrumb: "details" },
        loadComponent: () =>
          import("../task/pages/task-details/task-details.component").then(
            (m) => m.TaskDetailsComponent,
          ),
      },
    ]
  },
  { path: "", redirectTo: "list", pathMatch: "full" },
  { path: "**", redirectTo: "/notfound" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
