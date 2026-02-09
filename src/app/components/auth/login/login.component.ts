import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import {AuthService, LoginResponseData} from 'src/app/service/auth.service';
import {LocalStorageService} from "../../../service/local-storage.service";
import {TokenService} from "../../../service/token.service";

@Component({
	templateUrl: './login.component.html',
})
export class LoginComponent {
    showPassword: boolean = false;
    isLoading: boolean = false;
    ngForm: FormGroup;

	constructor(
        private layoutService: LayoutService,
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
        private localStorage: LocalStorageService,
        private tokenService: TokenService,
    ) {
        this.ngForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
	        rememberMe: [false]
        });
    }

	get dark(): boolean {
		return this.layoutService.config.colorScheme !== 'light';
	}

    onSubmit(): void {
        if (this.ngForm.invalid) {
            return;
        }
        this.isLoading = true;

        this.authService.loginUser(this.ngForm.value).subscribe({
            next: (response: LoginResponseData) => {
                console.log('Login successful:', response);
                this.isLoading = false;

                // Guardar token
                this.tokenService.saveUserCredentials(response.access_token);

                setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                }, 1000);
            },
            error: (error) => {
                console.error('Login failed:', error);
                this.isLoading = false;

                if (error.status === 401) {
                    this.localStorage.removeValueFromLocal('USER_PASSWORD');
                }
            }
        });
    }

}
