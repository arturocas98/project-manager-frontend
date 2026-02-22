import { Component } from '@angular/core';
import { ChartOptions } from 'chart.js';
import {CardModule} from "primeng/card";
import {ChartModule} from "primeng/chart";

@Component({
  selector: 'app-project-summary',
  standalone: true,
  imports: [
    CardModule,
    ChartModule
  ],
  templateUrl: './project-summary.component.html',
})
export class ProjectSummaryComponent {

  // MÉTRICAS
  metrics = {
    created: 128,
    updated: 76,
    pending: 34,
    completed: 58
  };

  // PRIORIDADES
  priorityChartData = {
    labels: ['Alta', 'Media', 'Baja', 'Urgente'],
    datasets: [
      {
        label: 'Tareas',
        backgroundColor: [
          '#ef4444',
          '#f59e0b',
          '#10b981',
          '#7c3aed'
        ],
        data: [32, 48, 20, 12]
      }
    ]
  };

  // EFICIENCIA MIEMBROS
  memberEfficiencyData = {
    labels: ['Juan', 'María', 'Carlos', 'Ana'],
    datasets: [
      {
        label: 'Progreso (%)',
        backgroundColor: '#3b82f6',
        data: [85, 70, 92, 60]
      }
    ]
  };

  // TIPOS DE TAREA
  taskTypeData = {
    labels: ['Epic', 'History', 'Task', 'Subtask'],
    datasets: [
      {
        label: 'Cantidad',
        backgroundColor: '#6366f1',
        data: [5, 18, 42, 26]
      }
    ]
  };

  // OPCIONES BARRA VERTICAL
  barOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  };

  // OPCIONES BARRA HORIZONTAL
  horizontalOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      }
    }
  };
}
