import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from 'src/app/core/service/auth.service';
import { MenuService } from 'src/app/core/service/menu.service';
import { ROLE } from 'src/app/shared/constants/constants';
import { Profile } from 'src/app/shared/models/auth';

@Component({
  selector: 'app-menu',
  templateUrl: './app.menu.component.html',
})
export class AppMenuComponent implements OnInit {
  model: MenuItem[] = [];
  profile?: Profile;
  ROLE = ROLE;

  constructor(
    private translateService: TranslateService,
    private menuService: MenuService,
    private authService: AuthService
  ) {
    this.profile = this.authService.getProfileLocal();
    this.translateService.onLangChange.subscribe(() => this.loadMenu());
  }

  ngOnInit(): void {
    console.log('es admin:', this.profile?.roles.toString());

    this.loadMenu();
  }

  loadMenu(): void {
    this.menuService.getMenus().subscribe(menu => {
      let myMenu = menu.data[0];
      if (this.profile?.roles.includes('Admin')) {
        myMenu = menu.data.find(({ id }: any) => id === 1);
      }
      this.model = [
        {
          items: myMenu.links.map(({ link, links }: any) => {
            const menu: MenuItem = {
              label: link?.name,
              icon: link?.icon,
              routerLink: ['/' + link?.route],
            };
            if (links?.length) {
              menu.items =
                links.map(({ link }: any) => {
                  return {
                    label: link.name,
                    icon: link.icon,
                    routerLink: ['/' + link.route],
                  };
                }) ?? [];
            }
            return menu;
          }),
        },
      ];
    });
  }

  toggleSubmenu(item: any): void {
    item.expanded = !item.expanded;
  }
}
