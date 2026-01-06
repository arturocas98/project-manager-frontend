import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { BadgeModule } from 'primeng/badge';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { AppLayoutComponent } from './app.layout.component';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../auth/auth.interceptor';
import { AppSidebarComponent } from './sidebar/app.sidebar.component';
import { AppMenuComponent } from './menu/app.menu.component';
import { AppMenuitemComponent } from './menu/menu-item/app.menui-tem.component';
import { AppTopbarComponent } from './topbar/app.topbar.component';
import { AppProfileSidebarComponent } from './profile-sidebar/app.profile-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';

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
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
    ],
    imports: [
        BrowserModule,
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
    ]
})
export class AppLayoutModule { }
