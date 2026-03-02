import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { Constants } from 'src/app/shared/constants/constants';
import { UserService } from '../../services/user.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { Option } from 'src/app/shared/models/general';
import { RoleService } from '../../../roles/services/role.service';
import { ParamJson } from 'src/app/shared/models/params.model';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
  templateUrl: './user-create.component.html',
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
    MultiSelectModule,
    KeyFilterModule,
  ],
})
export class UserCreateComponent {
  ngForm: FormGroup;
  roles: Option[] = [];
  modalities: Option[] = [
    {
      id: 1,
      name: 'Presencial',
    },
    {
      id: 1,
      name: 'Teletrabajo',
    },
  ];

  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private roleService: RoleService
  ) {
    this.ngForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      password_confirmation: ['', [Validators.required]],
      role_id: ['', Validators.required],
      modality_id: [''],
      telephone: [''],
      address: [''],
    });

    const params: ParamJson = {
      ...Constants.pageParams.all,
    };

    this.roleService.getRoles(params).subscribe(rols => {
      this.roles = rols.data;
    });
  }

  onSubmit(): void {
    if (this.ngForm.invalid) {
      this.ngForm.markAllAsTouched();
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
