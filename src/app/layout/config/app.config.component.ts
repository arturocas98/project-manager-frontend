import { Component, inject, Input, OnInit } from "@angular/core";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { SidebarModule } from "primeng/sidebar";
import { RadioButtonModule } from "primeng/radiobutton";
import { ButtonModule } from "primeng/button";
import { InputSwitchModule } from "primeng/inputswitch";
import { TranslateModule } from "@ngx-translate/core";
import {
  LOCAL_STORAGE_KEYS,
  NUMBERS,
} from "src/app/shared/constants/constants";
import {
  ColorScheme,
  LayoutService,
  MenuColorScheme,
  MenuMode,
} from "../service/app.layout.service";
import { MenuService } from "../service/app.menu.service";
import { LocalStorageService } from "src/app/core/service/local-storage.service";

@Component({
  selector: "app-config",
  templateUrl: "./app.config.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SidebarModule,
    RadioButtonModule,
    ButtonModule,
    InputSwitchModule,
    TranslateModule,
  ],
})
export class AppConfigComponent implements OnInit {
  @Input() minimal: boolean = false;
  scales: number[] = [12, 13, 14, 15, 16];
  NUMBERS = NUMBERS;
  localStorageService = inject(LocalStorageService);

  constructor(
    public layoutService: LayoutService,
    public menuService: MenuService,
  ) {}

  get visible(): boolean {
    return this.layoutService.state.configSidebarVisible;
  }
  set visible(_val: boolean) {
    this.layoutService.state.configSidebarVisible = _val;
  }

  get scale(): number {
    return this.layoutService.config().scale;
  }
  set scale(_val: number) {
    this.layoutService.config.update((config) => {
      const newConfig = {
        ...config,
        scale: _val,
      };
      this.localStorageService.setItem(LOCAL_STORAGE_KEYS.theme, newConfig);
      return newConfig;
    });
  }

  get menuMode(): MenuMode {
    return this.layoutService.config().menuMode;
  }
  set menuMode(_val: MenuMode) {
    this.layoutService.config.update((config) => {
      const newConfig = {
        ...config,
        menuMode: _val,
      };
      this.localStorageService.setItem(LOCAL_STORAGE_KEYS.theme, newConfig);
      return newConfig;
    });
    if (
      this.layoutService.isSlimPlus() ||
      this.layoutService.isSlim() ||
      this.layoutService.isHorizontal()
    ) {
      this.menuService.reset();
    }
  }

  get colorScheme(): ColorScheme {
    return this.layoutService.config().colorScheme;
  }
  set colorScheme(_val: ColorScheme) {
    this.layoutService.config.update((config) => {
      const newConfig = {
        ...config,
        colorScheme: _val,
      };
      this.localStorageService.setItem(LOCAL_STORAGE_KEYS.theme, newConfig);
      return newConfig;
    });
  }

  get inputStyle(): string {
    return this.layoutService.config().inputStyle;
  }
  set inputStyle(_val: string) {
    this.layoutService.config.update((config) => {
      const newConfig = {
        ...config,
        inputStyle: _val,
      };
      this.localStorageService.setItem(LOCAL_STORAGE_KEYS.theme, newConfig);
      return newConfig;
    });
  }

  get ripple(): boolean {
    return this.layoutService.config().ripple;
  }
  set ripple(_val: boolean) {
    this.layoutService.config.update((config) => {
      const newConfig = {
        ...config,
        ripple: _val,
      };
      this.localStorageService.setItem(LOCAL_STORAGE_KEYS.theme, newConfig);
      return newConfig;
    });
  }

  get menuTheme(): MenuColorScheme {
    return this.layoutService.config().menuTheme;
  }
  set menuTheme(_val: MenuColorScheme) {
    this.layoutService.config.update((config) => {
      const newConfig = {
        ...config,
        menuTheme: _val,
      };
      this.localStorageService.setItem(LOCAL_STORAGE_KEYS.theme, newConfig);
      return newConfig;
    });
  }

  get theme(): string {
    return this.layoutService.config().theme;
  }
  set theme(_val: string) {
    this.layoutService.config.update((config) => {
      const newConfig = {
        ...config,
        theme: _val,
      };
      this.localStorageService.setItem(LOCAL_STORAGE_KEYS.theme, newConfig);
      return newConfig;
    });
  }

  ngOnInit(): void {
    const config = this.localStorageService.getItem(LOCAL_STORAGE_KEYS.theme);
    if (config) {
      this.layoutService.config.update((_) => config);
    }
  }

  changeColorScheme(colorScheme: ColorScheme): void {
    this.colorScheme = colorScheme;
  }

  changeTheme(theme: string): void {
    this.theme = theme;
  }

  decrementScale(): void {
    this.scale--;
  }

  incrementScale(): void {
    this.scale++;
  }
}
