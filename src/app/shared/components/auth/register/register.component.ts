import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Router } from '@angular/router';
import {AuthService, RegisterData} from 'src/app/core/service/auth.service';

@Component({
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  ngForm: FormGroup;
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  loading: boolean = false;

  constructor(
    private layoutService: LayoutService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {
    this.ngForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirmation: ['', [Validators.required, Validators.minLength(6)]],
        terms: [false, [Validators.requiredTrue]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const passwordConfirm = group.get('password_confirmation')?.value;

    return password === passwordConfirm ? null : { passwordsMismatch: true };
  }

  get dark(): boolean {
    return this.layoutService.config().colorScheme !== 'light';
  }

  getSelectedValues(fields: string[]) {
    const result: any = {};
    fields.forEach(field => {
      result[field] = this.ngForm.get(field)?.value;
    });
    return result;
  }

  onSubmit(): void {

    if (this.ngForm.invalid) {
      return;
    }

    this.loading = true;

    const formValue: RegisterData = this.getSelectedValues([
      "name",
      "email",
      "password"
    ]);

    this.authService.register(formValue).subscribe({

      next: (response) => {

        this.loading = false;

        if (response.status === 201) {
          this.router.navigate(["/auth/login"]);
        }

      },

      error: (error) => {
        console.error("Register failed:", error);
        this.loading = false;
      }

    });
  }
}
