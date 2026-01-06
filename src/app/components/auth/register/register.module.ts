import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { AppConfigModule } from 'src/app/layout/config/app.config.module';

@NgModule({
    imports: [
        CommonModule,
        RegisterRoutingModule,
        FormsModule,
        ButtonModule,
        RippleModule,
        InputTextModule,
        CheckboxModule,
        AppConfigModule,
        ReactiveFormsModule
    ],
    declarations: [RegisterComponent]
})
export class RegisterModule { }
