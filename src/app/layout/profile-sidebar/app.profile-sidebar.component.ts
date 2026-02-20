import { Component, computed } from '@angular/core';
import { getUserInitials } from 'src/app/shared/helpers/functions.helper';
import { LayoutService } from '../service/app.layout.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { DATE_FORMATS, IMAGES_ASSETS } from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-profilemenu',
  templateUrl: './app.profile-sidebar.component.html',
})
export class AppProfileSidebarComponent {
  version: string = '';
  dateBuild: string = '';
  protected readonly BUILD_DATE_FORMAT_PIPE = DATE_FORMATS.build_date_format_pipe;

  // Usar el signal directamente en lugar de getProfileLocal()
  protected readonly profile = this.authService.profile;

  // Computed para las iniciales (se actualiza automáticamente cuando cambia el profile)
  userInitials = computed(() => {
    const profile = this.profile();
    return profile?.name ? getUserInitials(profile.name) : '';
  });

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService
  ) {}

  signOut(): void {
    this.authService.logout(); // Cambiado de logOut a logout
  }

  onConfigButtonClick() {
    console.log('entro a configuración');
    this.layoutService.showConfigSidebar();
  }

  get visible(): boolean {
    return this.layoutService.state.profileSidebarVisible;
  }

  set visible(_val: boolean) {
    this.layoutService.state.profileSidebarVisible = _val;
  }

  protected readonly FOOTER_PROFILE_SIDEBAR = IMAGES_ASSETS.PROFILE_SIDEBAR_FOOTER;
  // En app.profile-sidebar.component.ts
  formatRoles(roles: any): string {
    if (!roles) return '';

    // Si es un array
    if (Array.isArray(roles)) {
      return roles.map(r => r.name || r).join(', ');
    }

    // Si es un objeto
    if (typeof roles === 'object') {
      return roles.name || JSON.stringify(roles);
    }

    // Si es string directamente
    return String(roles);
  }
}
