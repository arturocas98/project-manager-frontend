import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", redirectTo: "projects", pathMatch: "full" },
      {
        path: "projects",
        data: { breadcrumb: "projects" },
        loadChildren: () =>
          import("./project/project.module").then((m) => m.ProjectModule),
      },

      { path: "**", redirectTo: "/notfound" },
    ]),
  ],
  exports: [RouterModule],
})
export class ProjectManagementRoutingModule {}
