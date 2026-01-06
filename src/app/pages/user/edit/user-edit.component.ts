import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormsModule,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { Constants } from 'src/app/constants/constants';
import { UserResponse, UserService } from 'src/app/service/user.service';

@Component({
    templateUrl: './user-edit.component.html',
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
export class UserEditComponent implements OnInit {
    ngForm: FormGroup;
    private userId?: number;

    constructor(
        private userService: UserService,
        private fb: FormBuilder,
        private router: Router,
        private activatedRoute: ActivatedRoute
    ) {
        const userId = this.activatedRoute.snapshot.paramMap.get('id');
        if (userId) {
            this.userId = +userId;
        }

        this.ngForm = this.fb.group({
            name: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
            password_confirmation: ['', [Validators.required]],
        });
    }

    ngOnInit(): void {
        if (this.userId) {
            this.userService
                .getUser(this.userId)
                .subscribe((response: UserResponse) => {
                    this.ngForm.patchValue(response.data);
                });
        }
    }

    onSubmit() {
        if (this.ngForm.invalid || !this.userId) {
            return;
        }

        this.userService
            .updateUser(this.ngForm.value, this.userId)
            .subscribe(() => {
                this.navigateToUserList();
            });
    }

    navigateToUserList() {
        this.router.navigate([Constants.routes.userList]);
    }
}
