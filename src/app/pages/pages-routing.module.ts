import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

@NgModule({
  imports: [
    RouterModule.forChild([
      { path: "", redirectTo: "dashboard", pathMatch: "full" },
      {
        path: "dashboard",
        loadComponent: () =>
          import("./dashboard/dashboard.component").then(
            (m) => m.DashboardComponent,
          ),
      },
      { path: "**", redirectTo: "/notfound" },
    ]),
  ],
  exports: [RouterModule],
})
export class PagesRoutingModule {}
