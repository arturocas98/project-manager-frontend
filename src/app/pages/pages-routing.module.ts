import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "user",
        data: { breadcrumb: "User Management" },
        loadChildren: () =>
          import("./user/user.module").then((m) => m.UserModule),
      },
      {
        path: "role",
        data: { breadcrumb: "Role Management" },
        loadChildren: () =>
          import("./role/role.module").then((m) => m.RoleModule),
      },
      {
        path: "project",
        data: { breadcrumb: "Project Management" },
        loadChildren: () =>
          import("./project/project.module").then((m) => m.ProjectModule),
      },
      { path: "**", redirectTo: "/notfound" },
    ]),
  ],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
