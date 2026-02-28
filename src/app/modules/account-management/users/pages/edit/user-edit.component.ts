import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RippleModule } from 'primeng/ripple';
import { Constants } from 'src/app/shared/constants/constants';
import { UserResponse, UserService } from '../../services/user.service';
import { Option } from 'src/app/shared/models/general';
import { RoleService } from '../../../roles/services/role.service';
import { ParamJson } from 'src/app/shared/models/params.model';
import {AuthService} from "../../../../../core/service/auth.service";

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
  roles: Option[] = [];

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
    private authService: AuthService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private roleService: RoleService
  ) {
    const userId = this.activatedRoute.snapshot.paramMap.get('id');
    if (userId) {
      this.userId = +userId;
    }

    // Inicializar el formulario
    this.ngForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      password_confirmation: [''],
      role: [null],
      modality_id: [''],
      telephone: [''],
      address: [''],
    });

    // Cargar opciones de roles desde el backend
    const params: ParamJson = { ...Constants.pageParams.all };
    this.roleService.getRoles(params).subscribe(res => {
      this.roles = res.data;
    });
  }


  ngOnInit(): void {
    if (this.userId) {
      this.authService.getProfile().subscribe({
        next: response => {
          const user = response.data;

          // Encontrar la opción de rol que coincida con el role del usuario
          const selectedRole = this.roles.find(r => r.name === user.role) || null;

          // Patch del formulario
          this.ngForm.patchValue({
            name: user.name,
            email: user.email,
            telephone: user.telephone,
            address: user.address,
            modality_id: user.modality_id,
            role: selectedRole,
          });
        },
        error: err => console.error('Error al cargar perfil', err)
      });
    }
  }

  onSubmit() {
    if (this.ngForm.invalid || !this.userId) {
      return;
    }

    this.userService.updateUser(this.ngForm.value, this.userId).subscribe(() => {
      this.navigateToUserList();
    });
  }

  navigateToUserList() {
    this.router.navigate([Constants.routes.userList]);
  }
}
