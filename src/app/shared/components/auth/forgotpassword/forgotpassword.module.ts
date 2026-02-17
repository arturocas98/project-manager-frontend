import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordRoutingModule } from './forgotpassword-routing.module';
import { ForgotPasswordComponent } from './forgotpassword.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        ButtonModule,
        InputTextModule,
        ForgotPasswordRoutingModule,
        AppConfigModule,
        ReactiveFormsModule,
        TranslateModule
    ],
    declarations: [ForgotPasswordComponent]
})
export class ForgotPasswordModule { }
