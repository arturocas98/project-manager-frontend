import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { LoginRoutingModule } from "./login-routing.module";
import { LoginComponent } from "./login.component";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { CheckboxModule } from "primeng/checkbox";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { AppConfigModule } from "src/app/layout/config/app.config.module";
import { TranslateModule } from "@ngx-translate/core";
import { AppConfigComponent } from "src/app/layout/config/app.config.component";

@NgModule({
  imports: [
    CommonModule,
    LoginRoutingModule,
    ButtonModule,
    InputTextModule,
    CheckboxModule,
    FormsModule,
    AppConfigComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [LoginComponent],
})
export class LoginModule {}
