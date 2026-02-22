import { Component } from '@angular/core';
import { ChartOptions } from 'chart.js';
import {CardModule} from "primeng/card";
import {ChartModule} from "primeng/chart";
import {AvatarModule} from "primeng/avatar";
import {TagModule} from "primeng/tag";
import {TableModule} from "primeng/table";
import {NgClass, NgForOf} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-project-summary',
  standalone: true,
  imports: [
    CardModule,
    ChartModule,
    AvatarModule,
    TagModule,
    TableModule,
    NgClass,
    NgForOf,
    ButtonModule,
    CalendarModule,
    FormsModule
  ],
  templateUrl: './project-summary.component.html',
})
export class ProjectSummaryComponent {
  selectedMonth: Date = new Date();
  kpis = [
    {
      label: 'Proyectos activos',
      value: 4,
      icon: 'pi pi-briefcase',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-500',
      trend: 12
    },
    {
      label: 'Issues abiertas',
      value: 86,
      icon: 'pi pi-folder-open',
      bgClass: 'bg-indigo-50',
      iconClass: 'text-indigo-500',
      trend: 8
    },
    {
      label: 'En progreso',
      value: 34,
      icon: 'pi pi-clock',
      bgClass: 'bg-gray-100',
      iconClass: 'text-color',
      trend: -5
    },
    {
      label: 'Bloqueadas',
      value: 7,
      icon: 'pi pi-lock',
      bgClass: 'bg-red-50',
      iconClass: 'text-red-500',
      trend: -15
    },
    {
      label: 'Cerradas semana',
      value: 22,
      icon: 'pi pi-check-circle',
      bgClass: 'bg-green-50',
      iconClass: 'text-green-500',
      trend: 25
    },
    {
      label: 'Críticas activas',
      value: 5,
      icon: 'pi pi-exclamation-triangle',
      bgClass: 'bg-red-50',
      iconClass: 'text-red-600',
      trend: 40
    }
  ];

  criticalIssues = [
    { id: 'INC-12', title: 'Error en login con autenticación', project: 'Core', priority: 'Alta', assignee: 'Ana García', days: 6, status: 'Bloqueada' },
    { id: 'INC-18', title: 'Pago duplicado en facturación', project: 'Billing', priority: 'Crítica', assignee: 'Luis Martínez', days: 9, status: 'Abierta' },
    { id: 'INC-23', title: 'Base de datos desconectada', project: 'Infra', priority: 'Crítica', assignee: 'Carlos Ruiz', days: 2, status: 'Bloqueada' },
    { id: 'INC-31', title: 'Error 500 en API', project: 'Backend', priority: 'Alta', assignee: 'María López', days: 4, status: 'Review' },
    { id: 'INC-45', title: 'Fallo en notificaciones', project: 'Mobile', priority: 'Media', assignee: 'Pedro Sánchez', days: 7, status: 'In Progress' }
  ];

  activity = [
    { user: 'Ana García', action: 'creó la issue INC-32', project: 'Core', time: 'Hace 1 hora' },
    { user: 'Luis Martínez', action: 'movió INC-18 a Done', project: 'Billing', time: 'Hace 2 horas' },
    { user: 'Carlos Ruiz', action: 'cambió prioridad a Alta', project: 'Infra', time: 'Hace 4 horas' },
    { user: 'María López', action: 'comentó en INC-31', project: 'Backend', time: 'Hace 5 horas' },
    { user: 'Pedro Sánchez', action: 'actualizó estado de INC-45', project: 'Mobile', time: 'Hace 6 horas' },
    { user: 'Laura Torres', action: 'asignó nueva issue', project: 'Frontend', time: 'Hace 8 horas' }
  ];

  // OPCIONES DE GRÁFICOS CORREGIDAS
  barOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f3f4f6' }, beginAtZero: true }
    }
  };

  horizontalOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, beginAtZero: true },
      y: { grid: { display: false } }
    }
  };

  // OPCIONES PARA GRÁFICO DONUT (CORREGIDO)
  doughnutOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { usePointStyle: true, boxWidth: 8 }
      }
    }
  };

  horizontalBarOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false }, beginAtZero: true },
      y: { grid: { display: false } }
    }
  };

  verticalBarOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f3f4f6' }, beginAtZero: true }
    }
  };

  lineOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    elements: {
      line: {
        tension: 0.4
      }
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: '#f3f4f6' }, beginAtZero: true }
    }
  };

  statusData: any;
  priorityData: any;
  userLoadData: any;
  trendData: any;

  constructor() {}

  ngOnInit(): void {
    this.initCharts();
  }
  initCharts() {
    // DISTRIBUCIÓN POR ESTADO - Configuración específica para doughnut

    let documentStyle = getComputedStyle(document.documentElement);
    let textColor = documentStyle.getPropertyValue('--text-color');
    this.statusData = {
      labels: ['To Do', 'In Progress', 'Review', 'Bloqueadas', 'Done'],
      datasets: [
        {
          data: [10, 5, 3, 2, 8],
          backgroundColor: [
            '#94a3b8', // gray
            '#f59e0b', // amber
            '#3b82f6', // blue
            '#ef4444', // red
            '#10b981'  // green
          ],
          borderWidth: 0,
          hoverOffset: 5,
          cutout: '60%' // EL CUTOUT VA AQUÍ, NO EN OPTIONS
        }
      ]
    };
    this.doughnutOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      }
    };

    // DISTRIBUCIÓN POR PRIORIDAD
    this.priorityData = {
      labels: ['Crítica', 'Alta', 'Media', 'Baja'],
      datasets: [
        {
          label: 'Issues por prioridad',
          data: [2, 6, 10, 4],
          backgroundColor: [
            '#ef4444', // red
            '#f97316', // orange
            '#eab308', // yellow
            '#22c55e'  // green
          ],
          borderRadius: 4,
          barPercentage: 0.6
        }
      ]
    };

    // CARGA POR USUARIO - Mejorado con colores
    this.userLoadData = {
      labels: ['Juan Pérez', 'Ana García', 'Carlos Ruiz', 'María López', 'Pedro Sánchez'],
      datasets: [
        {
          label: 'Issues Activas',
          data: [5, 8, 3, 6, 4],
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.5
        }
      ]
    };

    // TENDENCIA - Con dos datasets mejorados
    this.trendData = {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Creadas',
          data: [2, 4, 3, 5, 6, 3, 2],
          borderColor: '#94a3b8',
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#94a3b8',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4
        },
        {
          label: 'Cerradas',
          data: [1, 3, 4, 2, 5, 4, 3],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#10b981',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          pointRadius: 4
        }
      ]
    };
  }

  getPrioritySeverity(priority: string): string {
    switch (priority) {
      case 'Crítica':
        return 'danger';
      case 'Alta':
        return 'warning';
      case 'Media':
        return 'info';
      case 'Baja':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(status: string): string {
    switch (status) {
      case 'Bloqueada':
        return 'danger';
      case 'In Progress':
        return 'warning';
      case 'Review':
        return 'info';
      case 'Done':
        return 'success';
      default:
        return 'secondary';
    }
  }
}
