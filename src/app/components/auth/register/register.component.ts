import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import {AuthService, RegisterResponseData} from "../../../service/auth.service";
import {Router} from "@angular/router";

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
        this.ngForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            password_confirmation: ['', [Validators.required, Validators.minLength(6)]],
            terms: [false, [Validators.requiredTrue]],
        },
            {
                validators: this.passwordMatchValidator
            }
        );
    }

    passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
        const password = group.get('password')?.value;
        const passwordConfirm = group.get('password_confirmation')?.value;

        return password === passwordConfirm ? null : { passwordsMismatch: true };
    }

	get dark(): boolean {
		return this.layoutService.config.colorScheme !== 'light';
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
        let FormValue = this.getSelectedValues(['name', 'email', 'password']);
        console.log(FormValue);
        this.authService.RegisterUser(FormValue).subscribe({
            next: (response: RegisterResponseData) => {
                console.log('Register successful:', response);
                this.loading = false;

                setTimeout(() => {
                    this.router.navigate(['/auth/login']);
                }, 1000);
            },
            error: (error) => {
                console.error('Register failed:', error);
                this.loading = false;

            }
        });
    }
}
