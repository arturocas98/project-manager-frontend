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
import { Role } from "src/app/shared/models/role";
import { RoleService } from "../../services/role.service";
import { MessageService } from "primeng/api";
import {ParamJson} from "../../../../../shared/models/params.model";
import {isSuccessfulResponse} from "../../../../../shared/models/general";

@Component({
  templateUrl: "./role-list.component.html",
  providers: [ConfirmationService, MessageService],
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
    private messageService: MessageService,
  ) {}

  onLazy(): void {
    this.loadingTable.set(true);
    const params = this.getParams();

    this.roleservice.getRoles(params).subscribe({
      next: (response) => {
        if (isSuccessfulResponse(response)) {
          this.roles = response.data;
          this.totalRecords = response.meta?.total ?? 0;
        } else {
          this.handleError('Error al cargar los roles');
        }
        this.loadingTable.set(false);
      },
      error: () => {
        this.handleError('Error al cargar los roles');
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
      "filter[name]": globalFilter || "",
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
    this.roleservice.deleteRole(id).subscribe({
      next: (success: boolean) => {
        if (success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Rol eliminado correctamente'
          });

          // Recargar la lista después de eliminar
          this.refreshTable();
        } else {
          this.handleError('Error al eliminar el rol');
        }
      },
      error: () => {
        this.handleError('Error al eliminar el rol');
      }
    });
  }

  confirmDelete(key: string): void {
    this.confirmationService.confirm({
      key,
      message: "¿Está seguro de que desea eliminar este rol?",
      header: "Confirmar eliminación",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sí, eliminar",
      rejectLabel: "Cancelar",
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

  private handleError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message
    });
  }

  refreshTable(): void {
    if (this.tableLazyLoadEvent) {
      this.loadRolesLazy(this.tableLazyLoadEvent);
    } else {
      this.onLazy();
    }
  }
}
