import { Component, Input } from "@angular/core";
import { Project } from "src/app/shared/models/project";
import { AvatarModule } from "primeng/avatar";
import { CardModule } from "primeng/card";
import {CommonModule, DatePipe} from "@angular/common";
import {AvatarGroupModule} from "primeng/avatargroup";
import {TooltipModule} from "primeng/tooltip";
import {ButtonModule} from "primeng/button";
import {ProgressBarModule} from "primeng/progressbar";
import {TagModule} from "primeng/tag";
import {ChipModule} from "primeng/chip";


@Component({
  selector: "app-project-card",
  standalone: true,
  imports: [CardModule, AvatarModule, DatePipe, CommonModule, AvatarGroupModule, TooltipModule, ButtonModule, ProgressBarModule, TagModule, ChipModule],
  templateUrl: "./project-card.component.html",
  styleUrls: ["./project-card.component.scss"],
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
  getStatusSeverity(status: string): string {
    const severities: {[key: string]: string} = {
      'active': 'success',
      'pending': 'warning',
      'completed': 'info',
      'archived': 'secondary',
      'on_hold': 'danger'
    };
    return severities[status] || 'info';
  }
  getRoleBadgeClass(roleType: string): string {
    const classes: {[key: string]: string} = {
      'administrators': 'bg-red-100 text-red-700',
      'project manager': 'bg-blue-100 text-blue-700',
      'developer': 'bg-green-100 text-green-700',
      'tester': 'bg-purple-100 text-purple-700',
      'client': 'bg-yellow-100 text-yellow-700'
    };
    return classes[roleType] || 'bg-gray-100 text-gray-700';
  }

  getHeaderGradientClass(projectId: number): string {
    const gradients = [
      'bg-gradient-to-br from-blue-600 to-purple-700',
      'bg-gradient-to-br from-green-600 to-teal-700',
      'bg-gradient-to-br from-orange-600 to-red-700',
      'bg-gradient-to-br from-indigo-600 to-pink-700'
    ];
    return gradients[projectId % gradients.length];
  }

  getChipTextColor(projectId: number): string {
    const colors = ['var(--blue-700)', 'var(--green-700)', 'var(--orange-700)', 'var(--purple-700)'];
    return colors[projectId % colors.length];
  }

  getArrowColor(projectId: number): string {
    const colors = ['var(--blue-500)', 'var(--green-500)', 'var(--orange-500)', 'var(--purple-500)'];
    return colors[projectId % colors.length];
  }

  // Array de colores disponibles
  colorPalette = [
    {
      name: 'indigo',
      header: 'bg-indigo-600',
      text: 'text-indigo-600',
      hover: 'group-hover:text-indigo-600',
      badge: 'text-indigo-700',
      iconBg: 'bg-indigo-100',
      icon: 'text-indigo-600',
      number: 'text-indigo-600',
      progress: 'bg-indigo-600'
    },
    {
      name: 'green',
      header: 'bg-green-600',
      text: 'text-green-600',
      hover: 'group-hover:text-green-600',
      badge: 'text-green-700',
      iconBg: 'bg-green-100',
      icon: 'text-green-600',
      number: 'text-green-600',
      progress: 'bg-green-600'
    },
    {
      name: 'red',
      header: 'bg-red-600',
      text: 'text-red-600',
      hover: 'group-hover:text-red-600',
      badge: 'text-red-700',
      iconBg: 'bg-red-100',
      icon: 'text-red-600',
      number: 'text-red-600',
      progress: 'bg-red-600'
    },
    {
      name: 'yellow',
      header: 'bg-yellow-600',
      text: 'text-yellow-600',
      hover: 'group-hover:text-yellow-600',
      badge: 'text-yellow-700',
      iconBg: 'bg-yellow-100',
      icon: 'text-yellow-600',
      number: 'text-yellow-600',
      progress: 'bg-yellow-600'
    },
    {
      name: 'purple',
      header: 'bg-purple-600',
      text: 'text-purple-600',
      hover: 'group-hover:text-purple-600',
      badge: 'text-purple-700',
      iconBg: 'bg-purple-100',
      icon: 'text-purple-600',
      number: 'text-purple-600',
      progress: 'bg-purple-600'
    },
    {
      name: 'pink',
      header: 'bg-pink-600',
      text: 'text-pink-600',
      hover: 'group-hover:text-pink-600',
      badge: 'text-pink-700',
      iconBg: 'bg-pink-100',
      icon: 'text-pink-600',
      number: 'text-pink-600',
      progress: 'bg-pink-600'
    },
    {
      name: 'blue',
      header: 'bg-blue-600',
      text: 'text-blue-600',
      hover: 'group-hover:text-blue-600',
      badge: 'text-blue-700',
      iconBg: 'bg-blue-100',
      icon: 'text-blue-600',
      number: 'text-blue-600',
      progress: 'bg-blue-600'
    },
    {
      name: 'orange',
      header: 'bg-orange-600',
      text: 'text-orange-600',
      hover: 'group-hover:text-orange-600',
      badge: 'text-orange-700',
      iconBg: 'bg-orange-100',
      icon: 'text-orange-600',
      number: 'text-orange-600',
      progress: 'bg-orange-600'
    }
  ];

// Método para obtener un color basado en el ID del proyecto
  getProjectColor(projectId: number) {
    const index = (projectId || 0) % this.colorPalette.length;
    return this.colorPalette[index];
  }

// Métodos helper para cada elemento del card
  getHeaderColorClass(projectId: number): string {
    return this.getProjectColor(projectId).header;
  }

  getAvatarTextColor(projectId: number): string {
    return this.getProjectColor(projectId).text.replace('text-', '');
  }

  getBadgeTextColor(projectId: number): string {
    return this.getProjectColor(projectId).badge;
  }

  getHoverTextColor(projectId: number): string {
    return this.getProjectColor(projectId).hover;
  }

  getIconBgColor(projectId: number): string {
    return this.getProjectColor(projectId).iconBg;
  }

  getIconColor(projectId: number): string {
    return this.getProjectColor(projectId).icon;
  }

  getNumberColor(projectId: number): string {
    return this.getProjectColor(projectId).number;
  }

  getProgressBarColor(projectId: number): string {
    return this.getProjectColor(projectId).progress;
  }
}
