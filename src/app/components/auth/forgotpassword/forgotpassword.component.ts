import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { environment } from 'src/environments/environment';

@Component({
    templateUrl: './forgotpassword.component.html'
})
export class ForgotPasswordComponent {
    ngForm: FormGroup;
    emailSent: boolean = false;

    constructor(
        private layoutService: LayoutService,
        private fb: FormBuilder,
        private http: HttpClient,
    ) {
        this.ngForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
        });
    }

	get dark(): boolean {
		return this.layoutService.config.colorScheme !== 'light';
	}

    onSubmit() {
        if (this.ngForm.valid) {
            this.http.post(`${environment.apiUrl}/auth/forgot-password`, this.ngForm.value).subscribe(() => {
                this.emailSent = true;
            });
        }
    }

}
