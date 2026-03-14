import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
  {
    path: "list",
    data: { breadcrumb: "List" },
    loadComponent: () =>
      import("./pages/list/user-list.component").then(
        (m) => m.UserListComponent,
      ),
  },
  {
    path: "create",
    data: { breadcrumb: "Create" },
    loadComponent: () =>
      import("./pages/create/user-create.component").then(
        (m) => m.UserCreateComponent,
      ),
  },
  {
    path: "edit/:id",
    data: { breadcrumb: "Edit" },
    loadComponent: () =>
      import("./pages/edit/user-edit.component").then(
        (m) => m.UserEditComponent,
      ),
  },
  { path: "", redirectTo: "list", pathMatch: "full" },
  { path: "**", redirectTo: "/notfound" },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
