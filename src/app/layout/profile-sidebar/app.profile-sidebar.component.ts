import { Component } from '@angular/core';
// import * as packageJson from "../../../../package.json";
import { getUserInitials } from 'src/app/shared/helpers/functions.helper';
import { LayoutService } from '../service/app.layout.service';
import { AuthService } from 'src/app/core/service/auth.service';
import { DATE_FORMATS, IMAGES_ASSETS } from 'src/app/shared/constants/constants';

@Component({
  selector: 'app-profilemenu',
  templateUrl: './app.profile-sidebar.component.html',
})
export class AppProfileSidebarComponent {
  //   version: string = packageJson.version;
  //   dateBuild: string = packageJson.config.date_build;
  version: string = '';
  dateBuild: string = '';
  protected readonly BUILD_DATE_FORMAT_PIPE = DATE_FORMATS.build_date_format_pipe;
  protected readonly profile = this.authService.getProfileLocal();
  userInitials = getUserInitials(this.profile.name);

  constructor(
    public layoutService: LayoutService,
    private authService: AuthService
  ) {}

  signOut(): void {
    this.authService.logOut();
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
}
