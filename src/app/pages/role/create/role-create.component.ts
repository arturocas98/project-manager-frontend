import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Constants } from 'src/app/constants/constants';
import { RoleService } from 'src/app/service/role.service';
import { FormComponent } from '../form/form.component';

@Component({
    templateUrl: './role-create.component.html',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        ReactiveFormsModule,
        TranslateModule,
        FormComponent,
    ],
})
export class RoleCreateComponent {
    ngForm: FormGroup;

    constructor(
        private roleservice: RoleService,
        private fb: FormBuilder,
        private router: Router
    ) {
        this.ngForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            password_confirmation: ['', [Validators.required]],
        });
    }

    onSubmit(): void {
        if (this.ngForm.invalid) {
            return;
        }

        this.roleservice.createRole(this.ngForm.value).subscribe(() => {
            this.navigateToRoleList();
        });
    }

    navigateToRoleList(): void {
        this.router.navigate([Constants.routes.roleList]);
    }
}
