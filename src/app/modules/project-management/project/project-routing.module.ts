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
  { path: "", redirectTo: "list", pathMatch: "full" },
  { path: "**", redirectTo: "/notfound" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
