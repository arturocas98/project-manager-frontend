import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NewPasswordComponent } from './newpassword.component';
import { NewPasswordRoutingModule } from './newpassword-routing.module';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { AppConfigComponent } from 'src/app/layout/config/app.config.component';

@NgModule({
    imports: [
        CommonModule,
        NewPasswordRoutingModule,
        FormsModule,
        ButtonModule,
        InputTextModule,
        RippleModule,
        AppConfigComponent,
        ReactiveFormsModule,
    ],
    declarations: [NewPasswordComponent]
})
export class NewPasswordModule { }
