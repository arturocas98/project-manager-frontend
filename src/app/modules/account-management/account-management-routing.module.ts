import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", redirectTo: "users", pathMatch: "full" },
      {
        path: "users",
        data: { breadcrumb: "Users" },
        loadChildren: () =>
          import("./users/user.module").then((m) => m.UserModule),
      },
      {
        path: "roles",
        data: { breadcrumb: "Roles" },
        loadChildren: () =>
          import("./roles/role.module").then((m) => m.RoleModule),
      },
      { path: "**", redirectTo: "/notfound" },
    ]),
  ],
  exports: [RouterModule],
})
export class AccountManagementRoutingModule {}
