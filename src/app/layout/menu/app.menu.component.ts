import { AfterViewChecked } from "@angular/core";
import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MenuItem } from "primeng/api";
import { Constants } from "src/app/shared/constants/constants";

@Component({
  selector: "app-menu",
  templateUrl: "./app.menu.component.html",
})
export class AppMenuComponent implements AfterViewChecked {
  model: MenuItem[] = [];

  constructor(private translateService: TranslateService) {}

  ngAfterViewChecked(): void {
    if (
      Object.keys(this.translateService.store.translations).length >
        Constants.zero &&
      this.model.length === Constants.zero
    ) {
      this.model.push({
        label: this.translateService.instant("menu.management"),
        items: [
          {
            label: this.translateService.instant("dashboard"),
            icon: Constants.icons.dashboard,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
          },
          {
            label: this.translateService.instant("recents"),
            icon: Constants.icons.recents,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
              items: [
                  {
                      label: this.translateService.instant("configuracion"),
                      icon: Constants.icons.configuracion,
                      routerLink: [Constants.routes.dashboard],
                      expanded: false,
                  },
              ],
          },
          {
            label: this.translateService.instant("favoritos"),
            icon: Constants.icons.favoritos,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
              items: [
                  {
                      label: this.translateService.instant("configuracion"),
                      icon: Constants.icons.configuracion,
                      routerLink: [Constants.routes.dashboard],
                      expanded: false,
                  },
              ],
          },
          {
            label: this.translateService.instant("planes"),
            icon: Constants.icons.planes,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
          },
          {
            label: this.translateService.instant("espacios"),
            icon: Constants.icons.espacios,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
          },
          {
            label: this.translateService.instant("filtros"),
            icon: Constants.icons.filtros,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
              items: [
                  {
                      label: this.translateService.instant("configuracion"),
                      icon: Constants.icons.configuracion,
                      routerLink: [Constants.routes.dashboard],
                      expanded: false,
                  },
              ],
          },
          {
            label: this.translateService.instant("paneles"),
            icon: Constants.icons.paneles,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
          },
          {
            label: this.translateService.instant("personalizar"),
            icon: Constants.icons.personality,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
            items: [
              {
                label: this.translateService.instant("configuracion"),
                icon: Constants.icons.configuracion,
                routerLink: [Constants.routes.dashboard],
                expanded: false,
              },
            ],
          },
            {
                label: this.translateService.instant("metas"),
                icon: Constants.icons.metas,
                routerLink: [Constants.routes.dashboard],
                more: true,
                expanded: false,
            },
            {
                label: this.translateService.instant("equipos"),
                icon: Constants.icons.equipos,
                routerLink: [Constants.routes.dashboard],
                more: true,
                expanded: false,
            },
            {
                label: this.translateService.instant("proyectos"),
                icon: Constants.icons.proyectos,
                routerLink: [Constants.routes.projectList],
                more: true,
                expanded: false,
            },
        ],
      });
    }
  }
  toggleSubmenu(item: any): void {
    item.expanded = !item.expanded;
  }
}
