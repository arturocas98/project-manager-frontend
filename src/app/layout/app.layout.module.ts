import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { InputTextModule } from "primeng/inputtext";
import { SidebarModule } from "primeng/sidebar";
import { BadgeModule } from "primeng/badge";
import { RadioButtonModule } from "primeng/radiobutton";
import { InputSwitchModule } from "primeng/inputswitch";
import { TooltipModule } from "primeng/tooltip";
import { RippleModule } from "primeng/ripple";
import { AppLayoutComponent } from "./app.layout.component";
import { RouterModule } from "@angular/router";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { AuthInterceptor } from "../core/interceptors/auth.interceptor";
import { AppSidebarComponent } from "./sidebar/app.sidebar.component";
import { AppMenuComponent } from "./menu/app.menu.component";
import { AppMenuitemComponent } from "./menu/menu-item/app.menui-tem.component";
import { AppTopbarComponent } from "./topbar/app.topbar.component";
import { AppProfileSidebarComponent } from "./profile-sidebar/app.profile-sidebar.component";
import { TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { InputGroupModule } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { TieredMenuModule } from "primeng/tieredmenu";
import { OverlayPanelModule } from "primeng/overlaypanel";
import { AvatarModule } from "primeng/avatar";
import { AppConfigModule } from "./config/app.config.module";
import { AppConfigComponent } from "./config/app.config.component";

@NgModule({
  declarations: [
    AppLayoutComponent,
    AppSidebarComponent,
    AppTopbarComponent,
    AppProfileSidebarComponent,
    AppMenuComponent,
    AppMenuitemComponent,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
  imports: [
    BrowserModule,
    OverlayPanelModule,
    TieredMenuModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    InputTextModule,
    SidebarModule,
    BadgeModule,
    RadioButtonModule,
    InputSwitchModule,
    TooltipModule,
    RippleModule,
    RouterModule,
    TranslateModule,
    ButtonModule,
    InputGroupModule,
    InputGroupAddonModule,
    ReactiveFormsModule,
    AvatarModule,
    AppConfigComponent,
  ],
})
export class AppLayoutModule {}
