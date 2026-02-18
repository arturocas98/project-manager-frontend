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
            icon: Constants.icons.recent,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
              items: [
                  {
                      label: this.translateService.instant("configuracion"),
                      icon: Constants.icons.settings,
                      routerLink: [Constants.routes.dashboard],
                      expanded: false,
                  },
              ],
          },
          {
            label: this.translateService.instant("favoritos"),
            icon: Constants.icons.favorites,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
              items: [
                  {
                      label: this.translateService.instant("configuracion"),
                      icon: Constants.icons.settings,
                      routerLink: [Constants.routes.dashboard],
                      expanded: false,
                  },
              ],
          },
          {
            label: this.translateService.instant("planes"),
            icon: Constants.icons.goals,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
          },
          {
            label: this.translateService.instant("espacios"),
            icon: Constants.icons.spaces,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
          },
          {
            label: this.translateService.instant("filtros"),
            icon: Constants.icons.filters,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
              items: [
                  {
                      label: this.translateService.instant("configuracion"),
                      icon: Constants.icons.settings,
                      routerLink: [Constants.routes.dashboard],
                      expanded: false,
                  },
              ],
          },
          {
            label: this.translateService.instant("paneles"),
            icon: Constants.icons.panels,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
          },
          {
            label: this.translateService.instant("personalizar"),
            icon: Constants.icons.customize,
            routerLink: [Constants.routes.dashboard],
            expanded: false,
            items: [
              {
                label: this.translateService.instant("configuracion"),
                icon: Constants.icons.settings,
                routerLink: [Constants.routes.dashboard],
                expanded: false,
              },
            ],
          },
            {
                label: this.translateService.instant("metas"),
                icon: Constants.icons.goals,
                routerLink: [Constants.routes.dashboard],
                more: true,
                expanded: false,
            },
            {
                label: this.translateService.instant("equipos"),
                icon: Constants.icons.teams,
                routerLink: [Constants.routes.dashboard],
                more: true,
                expanded: false,
            },
            {
                label: this.translateService.instant("proyectos"),
                icon: Constants.icons.projects,
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
