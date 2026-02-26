import {Component, OnInit} from '@angular/core';
import {DropdownModule} from "primeng/dropdown";
import {InputTextModule} from "primeng/inputtext";
import {TableModule} from "primeng/table";
import {TooltipModule} from "primeng/tooltip";
import {NgForOf, NgIf} from "@angular/common";
import {ActivatedRoute} from "@angular/router";
import {ProjectService} from "../../../../../core/service/project.service";


interface Actividad {
  nombre: string;
  icono: string;
  colorClass: string;
  epic: string;
  categoria: string;
  planificacion: {
    [key: string]: string; // 'planificado' | 'en-progreso' | 'completado' | 'retrasado'
  };
}


@Component({
  selector: 'app-project-schedule',
  standalone: true,
  imports: [
    DropdownModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    NgIf,
    NgForOf
  ],
  templateUrl: './project-schedule.component.html',
})
export class ProjectScheduleComponent implements OnInit  {
  projectId!: number;
  constructor(
    private route: ActivatedRoute,
  ) {}
  meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  ngOnInit() {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
  }
  epicOptions = [
    { label: 'Todos los Epics', value: null },
    { label: 'Frontend', value: 'frontend' },
    { label: 'Backend', value: 'backend' },
    { label: 'DevOps', value: 'devops' },
    { label: 'UX/UI', value: 'uxui' }
  ];

  categoriaOptions = [
    { label: 'Todas las Categorías', value: null },
    { label: 'Desarrollo', value: 'desarrollo' },
    { label: 'Testing', value: 'testing' },
    { label: 'Documentación', value: 'documentacion' },
    { label: 'Investigación', value: 'investigacion' }
  ];

  actividades: Actividad[] = [
    {
      nombre: 'Dashboard Analítico',
      icono: 'pi pi-chart-line',
      colorClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
      epic: 'frontend',
      categoria: 'desarrollo',
      planificacion: {
        'Ene': 'completado',
        'Feb': 'completado',
        'Mar': 'en-progreso',
        'Abr': 'planificado',
        'May': 'planificado'
      }
    },
    {
      nombre: 'API RESTful',
      icono: 'pi pi-database',
      colorClass: 'bg-gradient-to-br from-green-500 to-green-600',
      epic: 'backend',
      categoria: 'desarrollo',
      planificacion: {
        'Ene': 'completado',
        'Feb': 'completado',
        'Mar': 'completado',
        'Abr': 'en-progreso',
        'Jun': 'planificado',
        'Jul': 'planificado'
      }
    },
    {
      nombre: 'Infraestructura Cloud',
      icono: 'pi pi-cloud',
      colorClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
      epic: 'devops',
      categoria: 'documentacion',
      planificacion: {
        'Feb': 'en-progreso',
        'Mar': 'retrasado',
        'Abr': 'planificado',
        'May': 'planificado',
        'Sep': 'planificado'
      }
    },
    {
      nombre: 'Investigación UX',
      icono: 'pi pi-users',
      colorClass: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      epic: 'uxui',
      categoria: 'investigacion',
      planificacion: {
        'Ene': 'completado',
        'Feb': 'completado',
        'Mar': 'completado',
        'Jun': 'planificado',
        'Jul': 'planificado',
        'Ago': 'planificado'
      }
    }
  ];

  getEpicClass(epic: string): string {
    const classes: {[key: string]: string} = {
      'frontend': 'bg-blue-100 text-blue-700',
      'backend': 'bg-green-100 text-green-700',
      'devops': 'bg-purple-100 text-purple-700',
      'uxui': 'bg-yellow-100 text-yellow-700'
    };
    return classes[epic] || 'bg-gray-100 text-gray-700';
  }

  getCategoriaClass(categoria: string): string {
    const classes: {[key: string]: string} = {
      'desarrollo': 'bg-indigo-100 text-indigo-700',
      'testing': 'bg-red-100 text-red-700',
      'documentacion': 'bg-gray-100 text-gray-700',
      'investigacion': 'bg-teal-100 text-teal-700'
    };
    return classes[categoria] || 'bg-gray-100 text-gray-700';
  }

  getEstadoClass(estado: string): string {
    const classes: {[key: string]: string} = {
      'planificado': 'bg-gray-200 text-gray-600',
      'en-progreso': 'bg-blue-500 text-white',
      'completado': 'bg-green-500 text-white',
      'retrasado': 'bg-red-500 text-white'
    };
    return classes[estado] || 'bg-gray-200';
  }

  getEstadoIcono(estado: string): string {
    const icons: {[key: string]: string} = {
      'planificado': 'pi pi-calendar',
      'en-progreso': 'pi pi-spinner pi-spin',
      'completado': 'pi pi-check',
      'retrasado': 'pi pi-exclamation-triangle'
    };
    return icons[estado] || 'pi pi-circle';
  }

  getTooltip(actividad: Actividad, mes: string): string {
    const estado = actividad.planificacion[mes];
    const estadoTexto = {
      'planificado': 'Planificado',
      'en-progreso': 'En progreso',
      'completado': 'Completado',
      'retrasado': 'Retrasado'
    };
    return `${actividad.nombre} - ${mes}: ${estadoTexto[estado as keyof typeof estadoTexto] || estado}`;
  }
}
