import {Component, OnDestroy, OnInit} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {TableModule} from "primeng/table";
import {InputTextModule} from "primeng/inputtext";
import {TeamManagement} from "../../../shared/models/team-models/team.model";
import {AuthService} from "../../../core/service/auth.service";
import {NgClass, UpperCasePipe} from "@angular/common";

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TagModule,
    TableModule,
    InputTextModule,
    UpperCasePipe,
    NgClass
  ],
  templateUrl: './team-management.component.html',
})
export class TeamManagementComponent implements OnInit, OnDestroy{
  teamData: TeamManagement[] = [];
  loading: boolean = true;
  searchValue: string = '';
  first: number = 0;

  // Usamos any como alternativa si Subscription no funciona
  private subscription: any = null;

  // Resumen ejecutivo
  executiveSummary = {
    activeTeams: 0,
    totalCollaborators: 0,
    totalTasks: 0,
    tasksExecuting: 0,
    overdueTasks: 0,
    avgProgress: '0%',
    completedTasks: 0,
    contractsUnder30Days: '0%'
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadTeamManagement();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadTeamManagement(): void {
    this.loading = true;
    this.subscription = this.authService.getTeamManagement().subscribe({
      next: (data) => {
        this.teamData = data;
        this.calculateExecutiveSummary();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading team management:', error);
        this.loading = false;
      }
    });
  }

  calculateExecutiveSummary(): void {
    if (!this.teamData.length) return;

    // Equipos activos (con estado "Activo")
    const activeTeams = this.teamData.filter(team => team.state === 'Activo');

    // Total colaboradores
    const totalCollaborators = this.teamData.reduce((sum, team) => sum + (team.members_count || 0), 0);

    // Total tareas
    const totalTasks = this.teamData.reduce((sum, team) => sum + team.total_tasks, 0);

    // Tareas atrasadas
    const overdueTasks = this.teamData.reduce((sum, team) => sum + team.overdue_tasks, 0);

    // Promedio de avance
    let totalProgress = 0;
    let teamsWithProgress = 0;

    this.teamData.forEach(team => {
      const progressStr = team.progress?.replace('%', '') || '0';
      const progressValue = parseFloat(progressStr);
      if (!isNaN(progressValue)) {
        totalProgress += progressValue;
        teamsWithProgress++;
      }
    });

    const avgProgress = teamsWithProgress > 0
      ? (totalProgress / teamsWithProgress).toFixed(2) + '%'
      : '0%';

    // Contratos con menos de 30 días
    const contractsUnder30 = this.teamData.filter(team => team.days_remaining < 30).length;
    const uniqueContracts = new Set(this.teamData.map(team => team.contract_number)).size;
    const percentageUnder30 = uniqueContracts > 0
      ? Math.round((contractsUnder30 / uniqueContracts) * 100) + '%'
      : '0%';

    this.executiveSummary = {
      activeTeams: activeTeams.length,
      totalCollaborators: totalCollaborators,
      totalTasks: totalTasks,
      tasksExecuting: 0,
      overdueTasks: overdueTasks,
      avgProgress: avgProgress,
      completedTasks: 0,
      contractsUnder30Days: percentageUnder30
    };
  }

  getSeverity(state: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (state?.toLowerCase()) {
      case 'activo':
        return 'success';
      case 'completado':
        return 'info';
      case 'suspendido':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  getProgressColor(progress: string): string {
    const value = parseFloat(progress?.replace('%', '') || '0');
    if (value >= 75) return 'bg-green-500';
    if (value >= 50) return 'bg-blue-500';
    if (value >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  }

  getProgressValue(progress: string): number {
    return parseFloat(progress?.replace('%', '') || '0');
  }

  getDaysRemainingColor(days: number): string {
    if (days <= 0) return 'text-red-600 font-bold';
    if (days < 30) return 'text-orange-600 font-semibold';
    if (days < 60) return 'text-yellow-600';
    return 'text-green-600';
  }

  onSearch(event: any): void {
    this.searchValue = event.target.value;
  }

  clearSearch(): void {
    this.searchValue = '';
    this.first = 0;
  }

  navigateToTasks(team: TeamManagement): void {
    console.log('Navegar a tareas:', team.manage_tasks, 'para contrato:', team.contract_number);
  }

  refreshData(): void {
    this.first = 0;
    this.loadTeamManagement();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-EC', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }
}
