import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Constants, NUMBERS, SEVERITY } from 'src/app/shared/constants/constants';
import { Option, Severity } from 'src/app/shared/models/general';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../../roles/services/role.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { ParamJson } from 'src/app/shared/models/response';
import * as moment from 'moment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextModule } from 'primeng/inputtext';
import { KeyFilterModule } from 'primeng/keyfilter';

@Component({
  templateUrl: './user-create.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    ButtonModule,
    PasswordModule,
    MultiSelectModule,
    DropdownModule,
    CalendarModule,
    InputTextModule,
    KeyFilterModule,
  ],
})
export class UserCreateComponent {
  userForm: FormGroup;
  roles: Option[] = [];
  rolPartner = 'Partner';
  isPartner = false;
  isCustomRol = false;
  shortFormatDate: string = Constants.shortFormatDate;
  shortLocalFormatDate = Constants.shortLocalFormatDate;
  modalities: Option[] = [
    {
      id: 1,
      name: 'Presencial',
    },
    {
      id: 2,
      name: 'Teletrabajo',
    },
  ];

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private router: Router,
    private messageService: MessageService,
    private translateService: TranslateService
  ) {
    const params: ParamJson = {
      ...Constants.pageParams.all,
    };
    this.roleService.getRoles(params).subscribe(rols => {
      this.roles = rols.data;
    });

    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      id_card: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      expires_at: [''],
      institutions: [''],
      rols: ['', Validators.required],
      university_id: [''],
      agreement_id: [''],
      reset_password: false,
      lang: [false],
      modality_id: [''],
      address: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
    });
  }

  changeRol(roles: Option[]): void {
    this.isCustomRol = false;
    this.isPartner = false;
  }

  alertMessage(severity: string, detail: string, summary: string): void {
    this.messageService.add({
      life: NUMBERS.TEN_THOUSAND,
      summary: summary,
      key: Constants.alert.alertName,
      severity: severity as Severity,
      detail: detail,
    });
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      this.alertMessage(
        'error',
        this.translateService.instant('general.formInvalid'),
        this.translateService.instant('general.formValidation')
      );
      return;
    }
    const expires_at = this.userForm.value.expires_at
      ? moment(this.userForm.value.expires_at).format(this.shortFormatDate)
      : null;
    const body = {
      ...this.userForm.value,
      expires_at,
      rols: this.userForm.value.rols.map((rol: { name: string }) => ({ name: rol.name })),
    };
    this.userService.createUser(body).subscribe({
      next: () => {
        this.alertMessage(
          SEVERITY.SUCCESS,
          this.translateService.instant('general.formCreateUserSucceful'),
          this.translateService.instant('alertMessage.success')
        );
        this.navigateToUserList();
      },
      error: error => {
        this.alertMessage(SEVERITY.ERROR, error.error.message, this.translateService.instant('general.formValidation'));
      },
    });
  }

  navigateToUserList() {
    this.router.navigate([Constants.routes.userList]);
  }

  getClass(): string {
    const passwordControl = this.userForm?.get('password');
    return passwordControl?.invalid && passwordControl.touched ? 'ng-invalid ng-dirty' : Constants.emptyString;
  }
}
