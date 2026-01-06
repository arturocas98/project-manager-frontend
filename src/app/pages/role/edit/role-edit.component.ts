import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Constants } from 'src/app/constants/constants';
import { RoleResponse, RoleService } from 'src/app/service/role.service';
import { FormComponent } from '../form/form.component';

@Component({
    templateUrl: './role-edit.component.html',
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
export class RoleEditComponent implements OnInit {
    ngForm: FormGroup;
    private roleId?: number;

    constructor(
        private roleservice: RoleService,
        private fb: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        const roleId = this.activatedRoute.snapshot.paramMap.get('id');
        if (roleId) {
            this.roleId = +roleId;
        }

        this.ngForm = this.fb.group({
            name: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        if (this.roleId) {
            this.roleservice
                .getRole(this.roleId)
                .subscribe((response: RoleResponse) => {
                    this.ngForm.patchValue(response.data);
                });
        }
    }

    onSubmit(): void {
        if (this.ngForm.invalid || !this.roleId) {
            return;
        }

        this.roleservice
            .updateRole(this.ngForm.value, this.roleId)
            .subscribe(() => {
                this.navigateToRoleList();
            });
    }

    navigateToRoleList(): void {
        this.router.navigate([Constants.routes.roleList]);
    }
}
