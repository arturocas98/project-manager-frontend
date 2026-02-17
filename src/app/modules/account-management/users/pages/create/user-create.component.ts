import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateModule } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputTextModule } from "primeng/inputtext";
import { InputTextareaModule } from "primeng/inputtextarea";
import { RippleModule } from "primeng/ripple";
import { Constants } from "src/app/shared/constants/constants";
import { UserService } from "../../services/user.service";

@Component({
  templateUrl: "./user-create.component.html",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    RippleModule,
    InputTextModule,
    DropdownModule,
    FileUploadModule,
    InputTextareaModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
})
export class UserCreateComponent {
  ngForm: FormGroup;

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.ngForm = this.fb.group({
      name: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
      password_confirmation: ["", [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.ngForm.invalid) {
      return;
    }

    this.userService.createUser(this.ngForm.value).subscribe(() => {
      this.navigateToUserList();
    });
  }

  navigateToUserList(): void {
    this.router.navigate([Constants.routes.userList]);
  }
}
