import { Component } from '@angular/core';
import { LayoutService } from '../service/app.layout.service';

@Component({
    selector: 'app-profilemenu',
    templateUrl: './app.profile-sidebar.component.html'
})
export class AppProfileSidebarComponent {

    constructor(public layoutService: LayoutService) { }

    get visible(): boolean {
        return this.layoutService.state.profileSidebarVisible;
    }

    set visible(_val: boolean) {
        this.layoutService.state.profileSidebarVisible = _val;
    }

    signOut() {
        localStorage.removeItem('token');
        window.location.href = '/auth/login';
    }
}
