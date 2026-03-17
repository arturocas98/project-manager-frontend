// components/team/team.component.ts

import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { ToolbarModule } from 'primeng/toolbar';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { InputNumberModule } from 'primeng/inputnumber';
import { SkeletonModule } from 'primeng/skeleton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { ConfirmationService, MessageService } from 'primeng/api';
import {AuthService} from "../../../core/service/auth.service";
import {Team} from "../../../shared/models/team-models/team.model";
import {Profile} from "../../../shared/models/auth";
import {CreateTeamRequest, TeamFilters} from "../../../shared/models/team-models/team-request.model";
import {TooltipModule} from "primeng/tooltip";
import {TeamManagementComponent} from "../team-management/team-management.component";

interface PageEvent {
  first: number;
  rows: number;
  page: number;
  pageCount: number;
}

@Component({
  selector: 'app-team',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TableModule,
    DialogModule,
    CardModule,
    TagModule,
    AvatarModule,
    AvatarGroupModule,
    ToolbarModule,
    ConfirmDialogModule,
    ToastModule,
    InputNumberModule,
    SkeletonModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    TeamManagementComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: 'team.component.html',
})
export class TeamComponent implements OnInit {
  // Datos
  teams: Team[] = [];
  profiles: Profile[] = [];
  filteredProfiles: Profile[] = [];
  selectedTeam: Team | null = null;

  // Estados
  loading = false;
  loadingProfiles = false;
  teamDialogVisible = false;
  memberDialogVisible = false;
  detailsDialogVisible = false;
  editingTeam = false;

  // Formularios
  teamFormData: CreateTeamRequest = {
    name: '',
    type: 'default'
  };

  // Filtros
  filters: TeamFilters = {
    search: '',
    type: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    per_page: 10,
    page: 1
  };

  // Paginación
  totalRecords = 0;

  // Búsqueda de miembros
  memberSearchTerm = '';

  // Opciones para dropdowns
  typeOptions = [
    { label: 'Default', value: 'default' },
    { label: 'Premium', value: 'premium' },
    { label: 'Enterprise', value: 'enterprise' }
  ];

  sortByOptions = [
    { label: 'Nombre', value: 'name' },
    { label: 'Fecha creación', value: 'created_at' }
  ];

  sortOrderOptions = [
    { label: 'Ascendente', value: 'asc' },
    { label: 'Descendente', value: 'desc' }
  ];

  perPageOptions = [
    { label: '5 por página', value: 5 },
    { label: '10 por página', value: 10 },
    { label: '20 por página', value: 20 },
    { label: '50 por página', value: 50 }
  ];

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadTeams();
  }

  loadTeams() {
    this.loading = true;
    this.authService.getTeams(this.filters).subscribe({
      next: (response: any) => {
        // Asumiendo que ApiService ya extrajo el data
        this.teams = response.data || response;
        console.log(this.teams);
        this.totalRecords = response.meta?.total || this.teams.length;
        this.loading = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los equipos'
        });
        this.loading = false;
      }
    });
  }

  loadTeamsLazy(event: any) {
    this.filters.page = (event.first / event.rows) + 1;
    this.filters.per_page = event.rows;
    this.loadTeams();
  }

  onFilterChange() {
    this.filters.page = 1;
    this.loadTeams();
  }

  getTagSeverity(type: string): string {
    switch(type) {
      case 'premium': return 'warning';
      case 'enterprise': return 'success';
      default: return 'info';
    }
  }

  getRoleSeverity(role: string): string {
    switch(role) {
      case 'admin': return 'danger';
      case 'editor': return 'warning';
      default: return 'info';
    }
  }

  // Diálogo de equipo
  showTeamDialog() {
    this.editingTeam = false;
    this.teamFormData = { name: '', type: 'default' };
    this.teamDialogVisible = true;
  }

  hideTeamDialog() {
    this.teamDialogVisible = false;
  }

  editTeam(team: Team) {
    this.editingTeam = true;
    this.teamFormData = {
      name: team.name,
      type: team.type as 'default' | 'premium' | 'enterprise' // Type assertion
    };
    this.selectedTeam = team;
    this.teamDialogVisible = true;
  }

  saveTeam() {
    if (this.editingTeam && this.selectedTeam) {
      // Actualizar equipo
      this.authService.updateTeam(this.selectedTeam.id, this.teamFormData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Equipo actualizado correctamente'
          });
          this.teamDialogVisible = false;
          this.loadTeams();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo actualizar el equipo'
          });
        }
      });
    } else {
      // Crear equipo
      this.authService.createTeam(this.teamFormData).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Equipo creado correctamente'
          });
          this.teamDialogVisible = false;
          this.loadTeams();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo crear el equipo'
          });
        }
      });
    }
  }

  // Gestión de miembros
  openAddMemberDialog(team: Team) {
    this.selectedTeam = team;
    this.memberDialogVisible = true;
    this.loadProfiles();
  }

  closeMemberDialog() {
    this.memberDialogVisible = false;
    this.memberSearchTerm = '';
  }

  loadProfiles() {
    this.loadingProfiles = true;
    this.authService.getProfiles().subscribe({
      next: (profiles) => {
        this.profiles = profiles;
        this.filteredProfiles = profiles;
        this.loadingProfiles = false;
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudieron cargar los usuarios'
        });
        this.loadingProfiles = false;
      }
    });
  }

  filterProfiles() {
    if (!this.memberSearchTerm) {
      this.filteredProfiles = this.profiles;
      return;
    }

    const term = this.memberSearchTerm.toLowerCase();
    this.filteredProfiles = this.profiles.filter(p =>
      p.name.toLowerCase().includes(term) ||
      p.email.toLowerCase().includes(term)
    );
  }

  isUserInTeam(userId: number): boolean {
    return this.selectedTeam?.members?.some(m => m.id === userId) || false;
  }

  addMemberToTeam(userId: number) {
    if (!this.selectedTeam) return;

    this.authService.addTeamMember(this.selectedTeam.id, { user_id: userId }).subscribe({
      next: (updatedTeam) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Miembro agregado correctamente'
        });

        // Actualizar el equipo en la lista
        const index = this.teams.findIndex(t => t.id === updatedTeam.id);
        if (index !== -1) {
          this.teams[index] = updatedTeam;
        }

        // Actualizar selectedTeam
        this.selectedTeam = updatedTeam;

        // Actualizar lista filtrada
        this.filterProfiles();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo agregar el miembro'
        });
      }
    });
  }

  confirmRemoveMember(userId: number) {
    this.confirmationService.confirm({
      message: '¿Estás seguro de eliminar este miembro?',
      header: 'Confirmar eliminación',
      icon: 'ph-bold ph-warning text-yellow-500 text-2xl mr-3',
      accept: () => {
        this.removeMember(userId);
      }
    });
  }

  removeMember(userId: number) {
    if (!this.selectedTeam) return;

    this.authService.removeTeamMember(this.selectedTeam.id, { user_id: userId }).subscribe({
      next: (updatedTeam) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Miembro eliminado correctamente'
        });

        // Actualizar el equipo en la lista
        const index = this.teams.findIndex(t => t.id === updatedTeam.id);
        if (index !== -1) {
          this.teams[index] = updatedTeam;
        }

        // Actualizar selectedTeam
        this.selectedTeam = updatedTeam;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo eliminar el miembro'
        });
      }
    });
  }

  // Vista de detalles
  viewTeamDetails(team: Team) {
    this.selectedTeam = team;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog() {
    this.detailsDialogVisible = false;
    this.selectedTeam = null;
  }

  // Eliminar equipo
  confirmDeleteTeam(team: Team) {
    this.confirmationService.confirm({
      message: `¿Estás seguro de eliminar el equipo "${team.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'ph-bold ph-warning text-yellow-500 text-2xl mr-3',
      accept: () => {
        this.deleteTeam(team.id);
      }
    });
  }

  deleteTeam(id: number) {
    this.authService.deleteTeam(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Equipo eliminado correctamente'
        });
        this.loadTeams();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo eliminar el equipo'
        });
      }
    });
  }
}
