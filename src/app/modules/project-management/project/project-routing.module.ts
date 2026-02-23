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
    ]
  },
  {
    path: "create-task",
    data: { breadcrumb: "Create" },
    loadComponent: () =>
      import("../task/pages/create/task-create.component").then(
        (m) => m.TaskCreateComponent,
      ),
  },
  { path: "", redirectTo: "list", pathMatch: "full" },
  { path: "**", redirectTo: "/notfound" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
