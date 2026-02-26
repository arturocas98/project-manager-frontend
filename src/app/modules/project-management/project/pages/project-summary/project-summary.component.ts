import { Component, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';
import {CardModule} from "primeng/card";
import {ChartModule} from "primeng/chart";
import {AvatarModule} from "primeng/avatar";
import {TagModule} from "primeng/tag";
import {TableModule} from "primeng/table";
import {NgClass, NgForOf, NgIf} from "@angular/common";
import {ButtonModule} from "primeng/button";
import {CalendarModule} from "primeng/calendar";
import {FormsModule} from "@angular/forms";
import {ActivatedRoute} from "@angular/router";
import {ProjectService} from "../../../../../core/service/project.service";
import {
  HighPriorityTask,
  ProjectSummaryData,
  KpiItem,
  RecentIncidence,
  WeeklyTrend
} from "../../../../../shared/models/summary-response";

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
    FormsModule,
    NgIf
  ],
  templateUrl: './project-summary.component.html',
})
export class ProjectSummaryComponent implements OnInit {
  Math = Math;
  projectId!: number;
  selectedMonth: Date = new Date();

  // Datos reales que vendrán del API
  summaryData: ProjectSummaryData | null = null;
  loading: boolean = true;
  error: string | null = null;

  // KPIs transformados para la vista
  kpis: any[] = [];

  // Issues críticas de alta prioridad
  criticalIssues: HighPriorityTask[] = [];

  // Actividad reciente
  activity: any[] = [];

  // OPCIONES DE GRÁFICOS
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

  // Datos para los gráficos
  statusData: any;
  priorityData: any;
  userLoadData: any;
  trendData: any;

  constructor(
    private route: ActivatedRoute,
    private projectService: ProjectService
  ) {}

  ngOnInit() {
    this.projectId = Number(this.route.parent?.snapshot.paramMap.get('id'));
    this.loadSummaryData();
  }

  refresh(){
    this.loadSummaryData();
  }
  /**
   * Carga los datos del summary desde el API
   */
  loadSummaryData() {
    this.loading = true;
    this.error = null;

    this.projectService.getProjectSummary(this.projectId).subscribe({
      next: (data) => {
        this.summaryData = data;
        this.transformDataForView();
        this.initCharts();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading project summary:', error);
        this.error = 'Error al cargar los datos del proyecto';
        this.loading = false;
      }
    });
  }

  /**
   * Transforma los datos del API al formato que necesita la vista
   */
  private transformDataForView() {
    if (!this.summaryData) return;

    // Transformar KPIs
    this.kpis = [
      {
        label: 'Total Tareas',
        value: this.summaryData.kpis.total_tasks.value,
        icon: 'pi pi-briefcase',
        bgClass: 'surfarce-card',
        iconClass: 'text-blue-500',
        trend: this.extractTrendValue(this.summaryData.kpis.total_tasks.comparison)
      },
      {
        label: 'En Progreso',
        value: this.summaryData.kpis.in_progress_tasks.value,
        icon: 'pi pi-clock',
        bgClass: 'surfarce-card',
        iconClass: 'text-gray-900',
        trend: this.extractTrendValue(this.summaryData.kpis.in_progress_tasks.comparison)
      },
      {
        label: 'Finalizadas',
        value: this.summaryData.kpis.finished_tasks.value,
        icon: 'pi pi-check-circle',
        bgClass: 'surfarce-card',
        iconClass: 'text-green-500',
        trend: this.extractTrendValue(this.summaryData.kpis.finished_tasks.comparison)
      },
      {
        label: 'Por vencer esta semana',
        value: this.summaryData.kpis.expiring_this_week,
        icon: 'pi pi-calendar-times',
        bgClass: 'surfarce-card',
        iconClass: 'text-yellow-500',
        trend: null
      },
      {
        label: 'Críticas activas',
        value: this.summaryData.kpis.critical_priority_tasks.value,
        icon: 'pi pi-exclamation-triangle',
        bgClass: 'surfarce-card',
        iconClass: 'text-red-600',
        trend: this.extractTrendValue(this.summaryData.kpis.critical_priority_tasks.comparison)
      }
    ];

    // Asignar issues críticas
    this.criticalIssues = this.summaryData.high_priority_tasks;

    // Transformar actividad reciente
    this.activity = this.summaryData.recent_incidences.map(inc => ({
      user: inc.created_by_name,
      action: `creó la issue ${inc.title}`,
      project: inc.title || 'Proyecto actual',
      time: this.getRelativeTime(inc.created_at),
      priority: inc.priority,
      state: inc.state
    }));
  }

  /**
   * Extrae el valor numérico del trend de un string como "+12.5%"
   */
  private extractTrendValue(trend: string): number | null {
    if (!trend || trend === '0%') return 0;
    const numericValue = parseFloat(trend.replace(/[^0-9.-]/g, ''));
    return isNaN(numericValue) ? null : numericValue;
  }

  /**
   * Convierte fecha ISO a texto relativo (hace X horas, etc)
   */
  private getRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffHrs < 1) return `Hace ${diffMins} minutos`;
    if (diffHrs < 24) return `Hace ${diffHrs} horas`;
    const diffDays = Math.floor(diffHrs / 24);
    return `Hace ${diffDays} días`;
  }

  initCharts() {
    if (!this.summaryData) return;

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');

    // DISTRIBUCIÓN POR ESTADO
    const stateLabels = Object.keys(this.summaryData.distribution_by_state);
    const stateValues = Object.values(this.summaryData.distribution_by_state);

    this.statusData = {
      labels: stateLabels.map(label => this.capitalizeFirst(label)),
      datasets: [
        {
          data: stateValues,
          backgroundColor: this.generateColors(stateLabels.length),
          borderWidth: 0,
          hoverOffset: 5,
          cutout: '60%'
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
    const priorityLabels = Object.keys(this.summaryData.distribution_by_priority);
    const priorityValues = Object.values(this.summaryData.distribution_by_priority);

    this.priorityData = {
      labels: priorityLabels.map(label => this.capitalizeFirst(label)),
      datasets: [
        {
          label: 'Issues por prioridad',
          data: priorityValues,
          backgroundColor: this.getPriorityColors(priorityLabels),
          borderRadius: 4,
          barPercentage: 0.6
        }
      ]
    };

    // CARGA POR USUARIO
    const userLabels = Object.keys(this.summaryData.user_workload);
    const userValues = Object.values(this.summaryData.user_workload);

    this.userLoadData = {
      labels: userLabels,
      datasets: [
        {
          label: 'Issues Activas',
          data: userValues,
          backgroundColor: '#3b82f6',
          borderRadius: 4,
          barPercentage: 0.5
        }
      ]
    };

    // TENDENCIA SEMANAL
    const weeklyTrend = this.summaryData.trends.weekly;
    const days: (keyof WeeklyTrend)[] = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday'
    ];
    const dayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

    const createdData = days.map(day => weeklyTrend[day]?.tasks_created || 0);
    const completedData = days.map(day => weeklyTrend[day]?.tasks_completed || 0);

    this.trendData = {
      labels: dayLabels,
      datasets: [
        {
          label: 'Creadas',
          data: createdData,
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
          data: completedData,
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

  /**
   * Genera colores para el gráfico de estados
   */
  private generateColors(count: number): string[] {
    const colors = [
      '#94a3b8', // gray
      '#f59e0b', // amber
      '#3b82f6', // blue
      '#ef4444', // red
      '#10b981', // green
      '#8b5cf6', // purple
      '#ec4899'  // pink
    ];

    return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
  }

  /**
   * Colores específicos para prioridades
   */
  private getPriorityColors(priorities: string[]): string[] {
    const colorMap: { [key: string]: string } = {
      'critical': '#ef4444',  // red
      'critica': '#ef4444',   // red
      'alta': '#f97316',      // orange
      'high': '#f97316',      // orange
      'media': '#eab308',     // yellow
      'medium': '#eab308',    // yellow
      'baja': '#22c55e',      // green
      'low': '#22c55e'        // green
    };

    return priorities.map(p => colorMap[p.toLowerCase()] || '#94a3b8');
  }

  /**
   * Capitaliza primera letra
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  getPrioritySeverity(priority: string): string {
    const priorityLower = priority.toLowerCase();
    switch (priorityLower) {
      case 'critical':
      case 'crítica':
      case 'critica':
        return 'danger';
      case 'alta':
      case 'high':
        return 'warning';
      case 'media':
      case 'medium':
        return 'info';
      case 'baja':
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  }

  getStatusSeverity(status: string): string {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'bloqueada':
      case 'blocked':
        return 'danger';
      case 'in progress':
      case 'progress':
        return 'warning';
      case 'review':
        return 'info';
      case 'finished':
      case 'done':
      case 'completada':
        return 'success';
      default:
        return 'secondary';
    }
  }

  /**
   * Refresca los datos cuando cambia el mes seleccionado
   */
  onMonthChange() {
    // Aquí podrías implementar lógica para cargar datos de un mes específico
    console.log('Month changed:', this.selectedMonth);
    this.loadSummaryData(); // Recarga los datos
  }
}
