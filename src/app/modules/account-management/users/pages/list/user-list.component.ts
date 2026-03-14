import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { LazyPaginator } from 'src/app/extends/lazy';
import { UserService } from '../../services/user.service';
import { User } from 'src/app/shared/models/user';
import { Constants, USER } from 'src/app/shared/constants/constants';
import { getRoleName } from 'src/app/shared/helpers/functions.helper';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { NgIf } from '@angular/common';
import { NgFor } from '@angular/common';
import { PipeModule } from 'src/app/shared/Pipes/pipe.module';

@Component({
  templateUrl: './user-list.component.html',
  providers: [ConfirmationService],
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    MenuModule,
    ButtonModule,
    MultiSelectModule,
    InputTextModule,
    PaginatorModule,
    TranslateModule,
    ConfirmDialogModule,
    ToastModule,
    NgIf,
    NgFor,
    PipeModule,
  ],
})
export class UserListComponent extends LazyPaginator implements OnInit {
  users: User[] = [];
  loadingTable = false;
  userRoleCol = USER.USER_ROLE_COLUMN;
  userRolValue = USER.USER_ROLE_VALUE;

  constructor(
    private userService: UserService,
    private router: Router,
    private translateService: TranslateService,
    private confirmationService: ConfirmationService
  ) {
    super();
  }

  ngOnInit() {
    this.getColumns();
    this.getUsers();
  }

  getUsers(): void {
    this.loadingTable = true;
    this.userService.getUsers(this.getParams()).subscribe({
      next: (response): void => {
        this.users = response.data;
        this.paginator = response.meta;
        this.loadingTable = false;
      },
      error: () => {
        this.loadingTable = false;
      },
    });
  }

  getColumns(): void {
    this.columns = this.userService.getTableColumns();
    this.selectedColumns = this.columns;
  }

  getMenuItemsForItem(item: User): void {
    const itemEdit: MenuItem = {
      label: this.translateService.instant('general.edit'),
      escape: false,
      icon: Constants.icons.edit,
      iconClass: 'text-xl',
      command: () => this.router.navigate([Constants.routes.userEdit, item?.id]),
    };

    const items: MenuItem[] = [itemEdit];

    item.menu = [
      {
        label: this.translateService.instant('general.options'),
        items,
      },
    ];
  }

  navigateToCreateUser() {
    this.router.navigate([Constants.routes.userCreate]);
  }

  navigateToEditUser(id: number) {
    this.router.navigate([Constants.routes.userEdit, id]);
  }

  deleteUser(id: number) {
    this.userService.deleteUser(id).subscribe(() => {
      this.users = this.users.filter((user: User) => user.id !== id);
    });
  }

  confirmDelete(key: string) {
    this.confirmationService.confirm({
      key,
      message: 'Estas seguro de querer eliminar este usuario?',
      accept: () => {
        this.deleteUser(Number.parseInt(key));
      },
    });
  }

  navigateToDashboard() {
    this.router.navigate([Constants.routes.dashboard]);
  }

  loadUsersLazy(event: any) {
    this.userService.setGlobalFilter(event.globalFilter);
    this.userService.setPage(event.first / event.rows + 1);
  }

  override onLazy(): void {
    if (this.loadingTable) return;
    this.getUsers();
  }

  protected readonly getRoleName = getRoleName;
}
