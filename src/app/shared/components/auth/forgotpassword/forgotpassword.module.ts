import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ForgotPasswordRoutingModule } from './forgotpassword-routing.module';
import { ForgotPasswordComponent } from './forgotpassword.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AppConfigComponent } from 'src/app/layout/config/app.config.component';

@NgModule({
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    ForgotPasswordRoutingModule,
    AppConfigComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [ForgotPasswordComponent],
})
export class ForgotPasswordModule {}
