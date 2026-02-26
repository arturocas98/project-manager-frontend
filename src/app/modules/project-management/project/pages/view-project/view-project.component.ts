import {Component, OnInit} from '@angular/core';
import {MenubarModule} from "primeng/menubar";
import {BadgeModule} from "primeng/badge";
import {CardModule} from "primeng/card";
import {MenuModule} from "primeng/menu";
import {ButtonModule} from "primeng/button";
import { MenuItem } from 'primeng/api';
import {ActivatedRoute, Router} from "@angular/router";

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
export class ViewProjectComponent implements OnInit {
  projectId!: number;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    // Ahora el ID está en la ruta actual, no en el padre
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));

    // O usando observable por si cambia
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
    });
  }

  menuItems: MenuItem[] = [
    {
      label: 'Summary',
      icon: 'pi pi-star',
      command: () => this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'project-summary'
      ])
    },
    {
      label: 'Schedule',
      icon: 'pi pi-calendar',
      command: () => this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'project-schedule'
      ])
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
      label: 'Kanban',
      icon: 'pi pi-th-large',
      command: () => this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'project-kanban'
      ])
    },
    {
      label: 'Settings',
      icon: 'pi pi-cog',
      command: () => this.router.navigate([
        '/project-management/projects/kanban',
        this.projectId,
        'project-settings'
      ])
    }
  ];
}
