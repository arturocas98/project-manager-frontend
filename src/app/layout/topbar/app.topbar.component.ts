import { Component, ElementRef, ViewChild, computed  } from '@angular/core';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import {getUserInitials} from "../../shared/helpers/functions.helper";
import {AuthService} from "../../core/service/auth.service";
@Component({
    selector: 'app-topbar',
    templateUrl: './app.topbar.component.html'
})
export class AppTopbarComponent {

    value3: string | undefined;

    @ViewChild('menubutton') menuButton!: ElementRef;
    protected readonly profile = this.authService.profile;

    userInitials = computed(() => {
      const profile = this.profile();
      return profile?.name ? getUserInitials(profile.name) : '';
    });

    constructor(
      public layoutService: LayoutService,
      private authService: AuthService
    ) { }

    onMenuButtonClick() {
        this.layoutService.onMenuToggle();
    }

    onProfileButtonClick() {
        this.layoutService.showProfileSidebar();
    }


}
