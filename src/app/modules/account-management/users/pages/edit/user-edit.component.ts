import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Constants, NUMBERS, SEVERITY } from 'src/app/shared/constants/constants';
import { Role } from 'src/app/shared/models/role';
import { UserResponse, UserService } from '../../services/user.service';
import { RoleService } from '../../../roles/services/role.service';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import * as moment from 'moment';
import { ParamJson } from 'src/app/shared/models/response';
import { User } from 'src/app/shared/models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { KeyFilterModule } from 'primeng/keyfilter';
import { InputTextModule } from 'primeng/inputtext';
import { Option } from 'src/app/shared/models/general';
import { AuthService } from 'src/app/core/service/auth.service';
import { LocateResponse } from 'src/app/shared/models/locate.response';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  templateUrl: './user-edit.component.html',
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
    ToggleButtonModule,
    CalendarModule,
    ToastModule,
    KeyFilterModule,
    InputTextModule,
    CheckboxModule,
  ],
})
export class UserEditComponent implements OnInit {
  userForm: FormGroup;
  roles: Role[] = [];
  rolPartner = 'Partner';
  isPartner = false;
  isCustomRol = false;
  shortFormatDate: string = Constants.shortFormatDate;
  shortLocalFormatDate = Constants.shortLocalFormatDate;
  private readonly userId?: number;
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

  locations: LocateResponse[] = [];
  provinces: any[] = [];
  cantons: any[] = [];
  
  selectedProvince: string = '';
  selectedCanton: string = '';

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private messageService: MessageService,
    private translateService: TranslateService,
    private authService: AuthService
  ) {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');
    if (userId) {
      this.userId = +userId;
    }

    this.userForm = this.fb.group({
      name: ['', [Validators.required]],
      id_card: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      expires_at: [''],
      rols: [''],
      university_id: [''],
      agreement_id: [''],
      password_confirmation: [''],
      status: [false],
      modality_id: [''],
      address: ['', [Validators.required]],
      telephone: ['', [Validators.required]],
      birthdate: [''],
      employee_type: [''],
      title: [''],
      senescyt_record: [''],
      locate_id: [null],
      has_electronic_signature: [false],
      administrative_direction: [''],
      administrative_unit: [''],
      entity_ruc: [''],
      entity_name: [''],
    });
  }

  ngOnInit(): void {
    this.getRoles();
    if (this.userId) {
      this.authService.getLocations().subscribe({
        next: (res) => {
          this.locations = Array.isArray(res) ? res : (res as any).data || [];
          const uniqueProvinces = [...new Set(this.locations.map(loc => loc.name_provinces))];
          this.provinces = uniqueProvinces.map(p => ({ label: p, value: p }));
          
          this.loadUser();
        },
        error: () => {
          console.error('Error loading locations');
          this.loadUser(); // Intentar cargar el usuario de todas formas
        }
      });
    }
  }

  loadUser(): void {
    if (!this.userId) return;
    this.userService.getUser(this.userId).subscribe((response: UserResponse) => {
      const expires_at = response.data.expires_at ? moment(response.data.expires_at).toDate() : null;
      const birthdate = response.data.birthdate ? moment(response.data.birthdate).toDate() : null;
      
      const locationProv = response.data.locate?.name_provinces || '';
      const locationCant = response.data.locate?.name_canton || '';

      const matchingProvince = this.provinces.find(p => p.value.toLowerCase() === locationProv.toLowerCase());
      if (matchingProvince) {
        this.selectedProvince = matchingProvince.value;
        const filteredCantons = this.locations
          .filter(loc => loc.name_provinces?.toLowerCase() === this.selectedProvince.toLowerCase())
          .map(loc => loc.name_canton);
        this.cantons = [...new Set(filteredCantons)].map(c => ({ label: c, value: c }));
        
        const matchingCanton = this.cantons.find(c => c.value.toLowerCase() === locationCant.toLowerCase());
        if (matchingCanton) {
          this.selectedCanton = matchingCanton.value;
        }
      }

      const data = {
        ...response.data,
        locate_id: response.data.locate_id || null,
        expires_at,
        birthdate,
        rols: response.data.rols,
        password: null,
        status: !response.data.deleted_at,
      };
      
      this.userForm.patchValue(data);
      this.userForm.updateValueAndValidity();
      this.changeRol();
    });
  }

  onProvinceChange() {
    if (!this.selectedProvince) {
      this.cantons = [];
      this.selectedCanton = '';
      this.userForm.get('locate_id')?.setValue(null);
      return;
    }

    this.selectedCanton = '';
    this.userForm.get('locate_id')?.setValue(null);

    const filteredCantons = this.locations
      .filter(loc => loc.name_provinces === this.selectedProvince)
      .map(loc => loc.name_canton);

    this.cantons = [...new Set(filteredCantons)].map(c => ({ label: c, value: c }));
  }

  onCantonChange() {
    if(this.selectedProvince && this.selectedCanton) {
      const location = this.locations.find(
        loc => loc.name_provinces === this.selectedProvince && loc.name_canton === this.selectedCanton
      );
      this.userForm.get('locate_id')?.setValue(location ? location.id : null);
    } else {
      this.userForm.get('locate_id')?.setValue(null);
    }
  }

  changeRol(): void {
    this.isPartner = false;
  }

  getRoles(): void {
    const params: ParamJson = {
      ...Constants.pageParams.all,
    };
    this.roleService.getRoles(params).subscribe(rols => {
      this.roles = rols.data;
    });
  }

  onSubmit() {
    if (this.userForm.invalid || !this.userId) {
      let firstInvalidControlName = '';
      for (const controlName in this.userForm.controls) {
        if (this.userForm.controls[controlName].invalid) {
          firstInvalidControlName = controlName;
          break;
        }
      }

      const fieldNames: { [key: string]: string } = {
        name: 'Nombre',
        id_card: 'Cédula',
        email: 'Correo Electrónico',
        address: 'Dirección',
        telephone: 'Teléfono',
      };

      const friendlyName = fieldNames[firstInvalidControlName] || firstInvalidControlName;
      let errorMessage = `El campo ${friendlyName} es requerido o inválido.`;

      if (firstInvalidControlName === 'email') {
        const emailControl = this.userForm.get('email');
        if (emailControl?.hasError('required')) {
          errorMessage = 'El campo Correo Electrónico es requerido.';
        } else if (emailControl?.hasError('email')) {
          errorMessage = 'El formato del Correo Electrónico es inválido.';
        }
      }

      this.messageService.add({
        life: NUMBERS.TEN_THOUSAND,
        severity: SEVERITY.ERROR,
        summary: Constants.alert.error,
        detail: firstInvalidControlName ? errorMessage : 'Por favor, resuelva los errores del formulario.',
      });
      this.userForm.markAllAsTouched();
      return;
    }

    const filteredFormValue = Object.keys(this.userForm.value).reduce((acc, key) => {
      if (this.userForm.value[key]) {
        acc[key] = this.userForm.value[key];
      }
      return acc;
    }, {} as any);

    const expires_at = this.userForm.value.expires_at
      ? moment(this.userForm.value.expires_at).format(this.shortFormatDate)
      : null;

    const birthdate = this.userForm.value.birthdate
      ? moment(this.userForm.value.birthdate).format(this.shortFormatDate)
      : null;

    const body = {
      ...filteredFormValue,
      status: this.userForm.value.status,
      expires_at,
      birthdate,
      reset_password: Constants.zero,
      rols: this.userForm.value.rols.map((rol: { name: string }) => ({ name: rol.name })),
    } as User;

    if (body.password !== body.password_confirmation) {
      this.messageService.add({
        life: NUMBERS.TEN_THOUSAND,
        severity: SEVERITY.ERROR,
        summary: Constants.alert.error,
        detail: this.translateService.instant('password.notMatch'),
      });
      return;
    }

    this.userService.updateUser(body, this.userId).subscribe({
      next: () => {
        this.messageService.add({
          life: 3000,
          severity: SEVERITY.SUCCESS,
          summary: 'Éxito',
          detail: 'Proceso completado correctamente.',
        });
        setTimeout(() => {
          this.navigateToUserList();
        }, 1500);
      },
      error: err => {
        this.messageService.add({
          life: NUMBERS.TEN_THOUSAND,
          severity: SEVERITY.ERROR,
          summary: Constants.alert.error,
          detail: err.error.message,
        });
      },
    });
  }

  navigateToUserList() {
    this.router.navigate([Constants.routes.userList]);
  }
}
