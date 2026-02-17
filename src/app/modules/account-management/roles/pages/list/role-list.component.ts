import { CommonModule } from "@angular/common";
import { Component, signal } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { ConfirmationService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { InputTextModule } from "primeng/inputtext";
import { RippleModule } from "primeng/ripple";
import { Table, TableLazyLoadEvent, TableModule } from "primeng/table";
import { Constants, NUMBERS } from "src/app/shared/constants/constants";
import { ParamJson } from "src/app/shared/models/response";
import { Role } from "src/app/shared/models/role";
import { RoleService } from "../../services/role.service";

@Component({
  templateUrl: "./role-list.component.html",
  providers: [ConfirmationService],
  imports: [
    CommonModule,
    RippleModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    ConfirmDialogModule,
    TranslateModule,
  ],
  standalone: true,
})
export class RoleListComponent {
  roles: Role[] = [];
  totalRecords: number = 0;
  rows = 10;
  loadingTable = signal<boolean>(false);
  tableLazyLoadEvent?: TableLazyLoadEvent;

  constructor(
    private roleservice: RoleService,
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {}

  onLazy(): void {
    this.loadingTable.set(true);
    const params = this.getParams();
    this.roleservice.getRoles(params).subscribe({
      next: (response) => {
        this.roles = response.data;
        this.totalRecords = response.meta.total;
        this.loadingTable.set(false);
      },
      error: () => {
        this.loadingTable.set(false);
      },
    });
  }

  getParams(): ParamJson {
    let globalFilter: string | null | undefined = "";
    if (Array.isArray(this.tableLazyLoadEvent?.globalFilter)) {
      globalFilter = globalFilter[NUMBERS.ZERO] || "";
    } else {
      globalFilter = this.tableLazyLoadEvent?.globalFilter;
    }
    return {
      "filter[search]": globalFilter || "",
    };
  }

  onGlobalFilter(table: Table, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, "contains");
  }

  navigateToCreateRole(): void {
    this.router.navigate([Constants.routes.roleCreate]);
  }

  navigateToEditRole(id: number): void {
    this.router.navigate([Constants.routes.roleEdit, id]);
  }

  deleteRole(id: number): void {
    this.roleservice.deleteRole(id).subscribe(() => {
      this.roles = this.roles.filter((role: Role) => role.id !== id);
    });
  }

  confirmDelete(key: string): void {
    this.confirmationService.confirm({
      key,
      message: "Are you sure to perform this action?",
      accept: () => {
        this.deleteRole(Number.parseInt(key));
      },
    });
  }

  navigateToDashboard(): void {
    this.router.navigate([Constants.routes.dashboard]);
  }

  loadRolesLazy(event: TableLazyLoadEvent): void {
    this.tableLazyLoadEvent = event;
    this.onLazy();
  }
}
