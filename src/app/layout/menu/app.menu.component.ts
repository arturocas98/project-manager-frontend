import { AfterViewChecked, OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from 'src/app/core/service/auth.service';
import { Constants, ROLE } from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
  export class AppMenuComponent implements OnInit {
  model: MenuItem[] = [];
  isAdmin: boolean = false;

  constructor(
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin;
    console.log(this.isAdmin);
  }
  ngOnInit(): void {
    // Cargar perfil desde storage
    this.authService.loadProfileFromStorage();

    // Suscribirse al rol actual para actualizar el menú
    this.authService.roleObservable$.subscribe(role => {
      console.log('role:', role);
      this.buildMenu(role);
    });

    // Suscribirse a cambios de idioma
    this.subscribeToLanguageChanges();
  }

  private subscribeToLanguageChanges(): void {
    this.translateService.onLangChange.subscribe(() => {
      const role = this.authService.role$.value; // obtener rol actual
      this.buildMenu(role);
    });
  }

  private buildMenu(role: string | null): void {
    this.model = [];

    const isAdmin = role === ROLE.ADMIN; // comparar directamente
    let items: any[] = [];

    if (isAdmin) {
      items = [
        {
          labelKey: 'dashboard',
          icon: Constants.icons.dashboard,
          routerLink: [Constants.routes.dashboard],
        },
        {
          labelKey: 'sideBar.users',
          icon: Constants.icons.users,
          routerLink: [Constants.routes.userList],
        },
        {
          labelKey: 'sideBar.projects',
          icon: Constants.icons.projects,
          routerLink: [Constants.routes.projectList],
        },
      ];
    } else {
      items = [
        {
          labelKey: 'dashboard',
          icon: Constants.icons.dashboard,
          routerLink: [Constants.routes.dashboard],
        },
      ];
    }

    this.model.push({
      label: this.translateService.instant('menu.management'),
      items: items,
    });
  }
  // ngAfterViewChecked(): void {
  //   if (
  //     Object.keys(this.translateService.store.translations).length > Constants.zero &&
  //     this.model.length === Constants.zero
  //   ) {
  //     this.model.push({
  //       label: this.translateService.instant('menu.management'),
  //       items: [
  //         {
  //           label: this.translateService.instant('dashboard'),
  //           icon: Constants.icons.dashboard,
  //           routerLink: [Constants.routes.dashboard],
  //           expanded: false,
  //         },
  //         // {
  //         //   label: this.translateService.instant('recents'),
  //         //   icon: Constants.icons.recent,
  //         //   expanded: false,
  //         //   items: [
  //         //     {
  //         //       label: this.translateService.instant('configuracion'),
  //         //       icon: Constants.icons.settings,
  //         //       expanded: false,
  //         //     },
  //         //   ],
  //         // },
  //         // {
  //         //   label: this.translateService.instant('favoritos'),
  //         //   icon: Constants.icons.favorites,
  //         //   expanded: false,
  //         //   items: [
  //         //     {
  //         //       label: this.translateService.instant('configuracion'),
  //         //       icon: Constants.icons.settings,
  //         //       expanded: false,
  //         //     },
  //         //   ],
  //         // },
  //         // {
  //         //   label: this.translateService.instant('filtros'),
  //         //   icon: Constants.icons.filters,
  //         //   expanded: false,
  //         //   items: [
  //         //     {
  //         //       label: this.translateService.instant('configuracion'),
  //         //       icon: Constants.icons.settings,
  //         //       expanded: false,
  //         //     },
  //         //   ],
  //         // },
  //         // {
  //         //   label: this.translateService.instant('personalizar'),
  //         //   icon: Constants.icons.customize,
  //         //   expanded: false,
  //         //   items: [
  //         //     {
  //         //       label: this.translateService.instant('configuracion'),
  //         //       icon: Constants.icons.settings,
  //         //       expanded: false,
  //         //     },
  //         //   ],
  //         // },
  //         // {
  //         //   label: this.translateService.instant('planes'),
  //         //   icon: Constants.icons.plans,
  //         //   expanded: false,
  //         // },
  //         // {
  //         //   label: this.translateService.instant('espacios'),
  //         //   icon: Constants.icons.spaces,
  //         //   expanded: false,
  //         // },
  //         // {
  //         //   label: this.translateService.instant('paneles'),
  //         //   icon: Constants.icons.panels,
  //         //   expanded: false,
  //         // },
  //         // {
  //         //   label: this.translateService.instant('metas'),
  //         //   icon: Constants.icons.goals,
  //         //   more: true,
  //         //   expanded: false,
  //         // },
  //         // {
  //         //   label: this.translateService.instant('equipos'),
  //         //   icon: Constants.icons.teams,
  //         //   more: true,
  //         //   expanded: false,
  //         // },
  //       ],
  //     });

  //     if (this.isAdmin) {
  //       this.model.push(
  //         {
  //           label: this.translateService.instant('sideBar.users'),
  //           icon: Constants.icons.users,
  //           expanded: false,
  //           routerLink: [Constants.routes.userList],
  //         },
  //         {
  //           label: this.translateService.instant('sideBar.projects'),
  //           icon: Constants.icons.projects,
  //           routerLink: [Constants.routes.projectList],
  //           // more: true,
  //           expanded: false,
  //         }
  //       );
  //     }
  //   }
  // }

  toggleSubmenu(item: any): void {
    item.expanded = !item.expanded;
  }
}
