import { AfterViewChecked } from '@angular/core';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Constants } from 'src/app/constants/constants';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements AfterViewChecked {
    model: MenuItem[] = [];

    constructor(private translateService: TranslateService) {}

    ngAfterViewChecked(): void {
        if (Object.keys(this.translateService.store.translations).length > Constants.zero && this.model.length === Constants.zero) {
            this.model.push(
                {
                    label: this.translateService.instant('menu.management'),
                    items: [
                        {
                            label: this.translateService.instant('menu.userList'),
                            icon: Constants.icons.menuList,
                            routerLink: [Constants.routes.userList],
                        },
                        {
                            label: this.translateService.instant('menu.roleList'),
                            icon: Constants.icons.menuList,
                            routerLink: [Constants.routes.roleList],
                        },
                    ],
                },
            );
        }
    }
}
