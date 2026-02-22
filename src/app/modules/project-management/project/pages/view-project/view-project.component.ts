import { Component } from '@angular/core';
import {MenubarModule} from "primeng/menubar";
import {BadgeModule} from "primeng/badge";
import {CardModule} from "primeng/card";
import {MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import { MenuItem } from 'primeng/api';
import { Router} from "@angular/router";

@Component({
  selector: 'app-view-project',
  standalone: true,
  imports: [
    MenubarModule,
    BadgeModule,
    CardModule,
    MenuModule,
    ButtonModule,
  ],
  templateUrl: './view-project.component.html',
})
export class ViewProjectComponent {
  constructor(private router: Router) {}

  menuItems: MenuItem[] = [
    {
      label: 'summary',
      icon: 'pi pi-star',
      command: () => this.router.navigate(['/project-management/projects/kanban/project-summary'])
    },
    {
      label: 'Board',
      icon: 'pi pi-th-large',
      command: () => this.router.navigate(['board'])
    },
    {
      label: 'List',
      icon: 'pi pi-list',
      command: () => this.router.navigate(['backlog'])
    },
    {
      label: 'Reports',
      icon: 'pi pi-chart-bar',
      command: () => this.router.navigate(['reports'])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate(['settings'])
    }
  ];
}
