import { HttpClient } from '@angular/common/http';
import { Injectable, effect, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

export type MenuMode = 'static' | 'overlay' | 'horizontal' | 'slim' | 'slim-plus' | 'reveal' | 'drawer';

export type ColorScheme = 'light' | 'dark' | 'dim';

export type MenuColorScheme = 'colorScheme' | 'primaryColor' | 'transparent';

export interface AppConfig {
  inputStyle: string;
  colorScheme: ColorScheme;
  theme: string;
  ripple: boolean;
  menuMode: MenuMode;
  scale: number;
  menuTheme: MenuColorScheme;
}

interface LayoutState {
  staticMenuDesktopInactive: boolean;
  overlayMenuActive: boolean;
  profileSidebarVisible: boolean;
  configSidebarVisible: boolean;
  staticMenuMobileActive: boolean;
  menuHoverActive: boolean;
  sidebarActive: boolean;
  anchored: boolean;
  revealMenuActive: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  _config: AppConfig = {
    ripple: false,
    inputStyle: 'outlined',
    menuMode: 'static',
    colorScheme: 'light',
    theme: 'indigo',
    scale: 12,
    menuTheme: 'colorScheme',
  };

  config = signal<AppConfig>(this._config);

  state: LayoutState = {
    staticMenuDesktopInactive: false,
    overlayMenuActive: false,
    profileSidebarVisible: false,
    configSidebarVisible: false,
    staticMenuMobileActive: false,
    menuHoverActive: false,
    sidebarActive: false,
    anchored: false,
    revealMenuActive: false,
  };

  private readonly configUpdate = new Subject<AppConfig>();

  private readonly overlayOpen = new Subject<any>();

  configUpdate$ = this.configUpdate.asObservable();

  overlayOpen$ = this.overlayOpen.asObservable();

  constructor(private readonly http: HttpClient) {
    effect(() => {
      const config = this.config();
      if (this.updateStyle(config)) {
        this.changeTheme();
      }
      this.changeScale(config.scale);
      this.onConfigUpdate();
    });
  }

  updateStyle(config: AppConfig) {
    return config.theme !== this._config.theme || config.colorScheme !== this._config.colorScheme;
  }

  onMenuToggle() {
    if (this.isOverlay()) {
      this.state.overlayMenuActive = !this.state.overlayMenuActive;

      if (this.state.overlayMenuActive) {
        this.overlayOpen.next(null);
      }
    }

    if (this.isDesktop()) {
      this.state.staticMenuDesktopInactive = !this.state.staticMenuDesktopInactive;
    } else {
      this.state.staticMenuMobileActive = !this.state.staticMenuMobileActive;

      if (this.state.staticMenuMobileActive) {
        this.overlayOpen.next(null);
      }
    }
  }

  onOverlaySubmenuOpen() {
    this.overlayOpen.next(null);
  }

  showProfileSidebar() {
    this.state.profileSidebarVisible = true;
  }

  showConfigSidebar() {
    this.state.configSidebarVisible = true;
  }

  isOverlay() {
    return this.config().menuMode === 'overlay';
  }

  isDesktop() {
    return window.innerWidth > 991;
  }

  isSlim() {
    return this.config().menuMode === 'slim';
  }

  isSlimPlus() {
    return this.config().menuMode === 'slim-plus';
  }

  isHorizontal() {
    return this.config().menuMode === 'horizontal';
  }

  isMobile() {
    return !this.isDesktop();
  }

  onConfigUpdate() {
    this._config = { ...this.config() };
    this.configUpdate.next(this.config());
  }

  changeTheme(): void {
    const config = this.config();
    const themeLink = document.getElementById('theme-link') as HTMLLinkElement | null;

    if (!themeLink) return;

    const currentHref = themeLink.getAttribute('href');
    if (!currentHref) return;

    const newHref = currentHref
      .split('/')
      .map(segment => {
        if (segment === this._config.theme) {
          return config.theme;
        }
        if (segment === `theme-${this._config.colorScheme}`) {
          return `theme-${config.colorScheme}`;
        }
        return segment;
      })
      .join('/');

    this.replaceThemeLink(newHref);
  }

  replaceThemeLink(href: string) {
    const id = 'theme-link';
    let themeLink = <HTMLLinkElement>document.getElementById(id);
    const cloneLinkElement = <HTMLLinkElement>themeLink.cloneNode(true);

    cloneLinkElement.setAttribute('href', href);
    cloneLinkElement.setAttribute('id', id + '-clone');

    themeLink.parentNode!.insertBefore(cloneLinkElement, themeLink.nextSibling);
    cloneLinkElement.addEventListener('load', () => {
      themeLink.remove();
      cloneLinkElement.setAttribute('id', id);
    });
  }

  changeScale(value: number) {
    document.documentElement.style.fontSize = `${value}px`;
  }

  getMenus(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/menu`);
  }
}
