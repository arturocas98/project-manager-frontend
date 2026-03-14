import {Component, OnDestroy, OnInit} from '@angular/core';
import {ButtonModule} from "primeng/button";
import {TooltipModule} from "primeng/tooltip";
import {TagModule} from "primeng/tag";
import {DatePipe} from "@angular/common";
import {TableModule} from "primeng/table";
import {InputTextModule} from "primeng/inputtext";
import {TeamManagement} from "../../../shared/models/team-models/team.model";
import {AuthService} from "../../../core/service/auth.service";

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    ButtonModule,
    TooltipModule,
    TagModule,
    DatePipe,
    TableModule,
    InputTextModule
  ],
  templateUrl: './team-management.component.html',
})
export class TeamManagementComponent implements OnInit, OnDestroy{
  teamData: TeamManagement[] = [];
  loading: boolean = true;
  searchValue: string = '';


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

  private subscription: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadTeamManagement();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  loadTeamManagement(): void {
    this.loading = true;
    this.subscription.add(
      this.authService.getTeamManagement().subscribe({
        next: (data) => {
          this.teamData = data;
          this.calculateExecutiveSummary();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading team management:', error);
          this.loading = false;
        }
      })
    );
  }

  calculateExecutiveSummary(): void {
    if (!this.teamData.length) return;


    const activeTeams = this.teamData.filter(team => team.state === 'Activo');


    const uniqueMembers = new Set();
    this.teamData.forEach(team => {

      uniqueMembers.add(`${team.team_id}-${team.members_count}`);
    });


    const totalTasks = this.teamData.reduce((sum, team) => sum + team.total_tasks, 0);


    const overdueTasks = this.teamData.reduce((sum, team) => sum + team.overdue_tasks, 0);


    let totalProgress = 0;
    this.teamData.forEach(team => {
      const progressValue = parseFloat(team.progress.replace('%', ''));
      totalProgress += progressValue;
    });
    const avgProgress = this.teamData.length > 0
      ? (totalProgress / this.teamData.length).toFixed(2) + '%'
      : '0%';


    const contractsUnder30 = this.teamData.filter(team => team.days_remaining < 30).length;
    const uniqueContracts = new Set(this.teamData.map(team => team.contract_number)).size;
    const percentageUnder30 = uniqueContracts > 0
      ? Math.round((contractsUnder30 / uniqueContracts) * 100) + '%'
      : '0%';

    this.executiveSummary = {
      activeTeams: activeTeams.length,
      totalCollaborators: this.teamData.reduce((sum, team) => sum + team.members_count, 0),
      totalTasks: totalTasks,
      tasksExecuting: 0,
      overdueTasks: overdueTasks,
      avgProgress: avgProgress,
      completedTasks: 0,
      contractsUnder30Days: percentageUnder30
    };
  }

  getSeverity(state: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (state) {
      case 'Activo':
        return 'success';
      case 'Completado':
        return 'info';
      case 'Suspendido':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  getProgressColor(progress: string): string {
    const value = parseFloat(progress.replace('%', ''));
    if (value >= 75) return 'bg-green-500';
    if (value >= 50) return 'bg-blue-500';
    if (value >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
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
  }

  navigateToTasks(team: TeamManagement): void {

    console.log('Navegar a tareas:', team);

  }

  refreshData(): void {
    this.loadTeamManagement();
  }
}
