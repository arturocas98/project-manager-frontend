import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants } from 'src/app/constants/constants';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { environment } from 'src/environments/environment';

@Component({
	templateUrl: './newpassword.component.html'
})
export class NewPasswordComponent {
    ngForm: FormGroup;

    constructor(
        private layoutService: LayoutService,
        private fb: FormBuilder,
        private http: HttpClient,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        this.ngForm = this.fb.group({
            password: ['', [Validators.required]],
            password_confirmation: ['', [Validators.required]],
        });
    }

	get dark(): boolean {
		return this.layoutService.config.colorScheme !== 'light';
	}

    onSubmit() {
        if (this.ngForm.valid) {
            this.http.post(`${environment.apiUrl}/auth/reset-password`, {
                token: this.activatedRoute.snapshot.paramMap.get('token'),
                email: this.activatedRoute.snapshot.queryParams['email'],
                ...this.ngForm.value,
            }).subscribe(() => {
                this.router.navigate([Constants.routes.login]);
            });
        }
    }

}
