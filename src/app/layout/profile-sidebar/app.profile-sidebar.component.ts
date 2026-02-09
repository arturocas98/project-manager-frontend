import { Component } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';
import {TokenService} from "../../service/token.service";

@Component({
    selector: 'app-profilemenu',
    templateUrl: './app.profile-sidebar.component.html'
})
export class AppProfileSidebarComponent {

    constructor(public layoutService: LayoutService, private tokenService: TokenService) { }

    get visible(): boolean {
        return this.layoutService.state.profileSidebarVisible;
    }

    set visible(_val: boolean) {
        this.layoutService.state.profileSidebarVisible = _val;
    }

    signOut() {
        this.tokenService.clearCredentials();
        window.location.href = '/auth/login';
    }
}
