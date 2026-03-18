import { Component, OnInit } from '@angular/core';
import { MenubarModule } from "primeng/menubar";
import { BadgeModule } from "primeng/badge";
import { CardModule } from "primeng/card";
import { MenuModule } from "primeng/menu";
import { ButtonModule } from "primeng/button";
import { MenuItem } from 'primeng/api';
import { ActivatedRoute, Router } from "@angular/router";

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

  constructor(private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    // Ahora el ID está en la ruta actual, no en el padre
    this.projectId = Number(this.route.snapshot.paramMap.get('id'));
    this.updateMenuItems();

    // O usando observable por si cambia
    this.route.paramMap.subscribe(params => {
      this.projectId = Number(params.get('id'));
      this.updateMenuItems();
    });
  }

  menuItems: MenuItem[] = [];

  updateMenuItems() {
    const roleType = localStorage.getItem('role_type');

    this.menuItems = [
      {
        label: 'Resumen',
        icon: 'ph ph-chart-bar',
        command: () => this.router.navigate([
          '/project-management/projects/kanban',
          this.projectId,
          'project-summary'
        ])
      },
      {
        label: 'Lista Kanban',
        icon: 'ph ph-list-dashes',
        command: () => this.router.navigate([
          '/project-management/projects/kanban',
          this.projectId,
          'project-listkanban'
        ])
      },
      {
        label: 'Tablero Kanban',
        icon: 'ph ph-kanban',
        command: () => this.router.navigate([
          '/project-management/projects/kanban',
          this.projectId,
          'project-kanban'
        ])
      }
    ];

    if (roleType === 'administrator') {
      this.menuItems.push({
        label: 'Configuración',
        icon: 'ph ph-gear',
        command: () => this.router.navigate([
          '/project-management/projects/kanban',
          this.projectId,
          'project-settings'
        ])
      });
    }
  }
}
