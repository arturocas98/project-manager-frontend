import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { environment } from 'src/environments/environment';

@Component({
	templateUrl: './register.component.html'
})
export class RegisterComponent {
    ngForm: FormGroup;

	constructor(
        private layoutService: LayoutService,
        private fb: FormBuilder,
        private http: HttpClient,
    ) {
        this.ngForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            password_confirmation: ['', [Validators.required, Validators.minLength(6)]],
        });
    }

	get dark(): boolean {
		return this.layoutService.config.colorScheme !== 'light';
	}

    onSubmit(): void {
        if (this.ngForm.invalid) {
            return;
        }

        this.http.post(`${environment.apiUrl}/register`, this.ngForm.value).subscribe((response) => {
            console.log(response);
        });
    }
}
