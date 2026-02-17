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
import { User } from "src/app/shared/models/user";
import {
  UserCollectionResponse,
  UserService,
} from "../../services/user.service";

@Component({
  templateUrl: "./user-list.component.html",
  providers: [ConfirmationService],
  standalone: true,
  imports: [
    CommonModule,
    RippleModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    ConfirmDialogModule,
    TranslateModule,
  ],
})
export class UserListComponent {
  loadingTable = signal<boolean>(false);
  users: User[] = [];
  totalRecords: number = 0;
  tableLazyLoadEvent?: TableLazyLoadEvent;

  constructor(
    private userService: UserService,
    private router: Router,
    private confirmationService: ConfirmationService,
  ) {}

  onLazy(): void {
    this.loadingTable.set(true);
    const params = this.getParams();
    this.userService.getUsers(params).subscribe({
      next: (response: UserCollectionResponse) => {
        this.users = response.data;
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

  navigateToCreateUser(): void {
    this.router.navigate([Constants.routes.userCreate]);
  }

  navigateToEditUser(id: number): void {
    this.router.navigate([Constants.routes.userEdit, id]);
  }

  deleteUser(id: number): void {
    this.userService.deleteUser(id).subscribe(() => {
      this.users = this.users.filter((user: User) => user.id !== id);
    });
  }

  confirmDelete(key: string): void {
    this.confirmationService.confirm({
      key,
      message: "Are you sure to perform this action?",
      accept: () => {
        this.deleteUser(Number.parseInt(key));
      },
    });
  }

  navigateToDashboard(): void {
    this.router.navigate([Constants.routes.dashboard]);
  }

  loadUsersLazy(event: TableLazyLoadEvent): void {
    this.tableLazyLoadEvent = event;
    this.onLazy();
  }
}
