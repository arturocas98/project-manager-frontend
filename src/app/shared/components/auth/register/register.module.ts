import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RegisterRoutingModule } from "./register-routing.module";
import { RegisterComponent } from "./register.component";
import { ButtonModule } from "primeng/button";
import { RippleModule } from "primeng/ripple";
import { InputTextModule } from "primeng/inputtext";
import { CheckboxModule } from "primeng/checkbox";
import { AppConfigModule } from "src/app/layout/config/app.config.module";
import { TranslateModule } from "@ngx-translate/core";
import { AppConfigComponent } from "src/app/layout/config/app.config.component";

@NgModule({
  imports: [
    CommonModule,
    RegisterRoutingModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    CheckboxModule,
    AppConfigComponent,
    ReactiveFormsModule,
    TranslateModule,
  ],
  declarations: [RegisterComponent],
})
export class RegisterModule {}
