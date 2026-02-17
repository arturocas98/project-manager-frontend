import { NgModule } from "@angular/core";
import { ExtraOptions, RouterModule, Routes } from "@angular/router";
import { AppLayoutComponent } from "./layout/app.layout.component";
import { AuthGuard } from "./shared/guards/auth.guard";
import { AppGuard } from "./shared/guards/app.guard";

const routerOptions: ExtraOptions = {
  anchorScrolling: "enabled",
};

const routes: Routes = [
  //{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: "auth",
    data: { breadcrumb: "Auth" },
    loadChildren: () =>
      import("./shared/components/auth/auth.module").then((m) => m.AuthModule),
    canActivate: [AppGuard],
  },
  {
    path: "notfound",
    loadChildren: () =>
      import("./shared/components/notfound/notfound.module").then(
        (m) => m.NotfoundModule,
      ),
  },
  {
    path: "",
    component: AppLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: "",
        redirectTo: "dashboard",
        pathMatch: "full",
      },
      {
        path: "",
        data: { breadcrumb: "Pages" },
        loadChildren: () =>
          import("./pages/pages.module").then((m) => m.PagesModule),
      },
      {
        path: "account/management",
        data: { breadcrumb: "Account Management" },
        loadChildren: () =>
          import("./modules/account-management/account-management.module").then(
            (m) => m.AccountManagementModule,
          ),
      },
    ],
  },
  { path: "**", redirectTo: "/notfound" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
