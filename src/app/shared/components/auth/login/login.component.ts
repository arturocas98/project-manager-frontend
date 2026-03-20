import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/core/service/auth.service';
import { GeneralService } from 'src/app/core/service/general.service';
import { LocalStorageService } from 'src/app/core/service/local-storage.service';
import { TokenService } from 'src/app/core/service/token.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Constants, LOCAL_STORAGE_KEYS, NUMBERS, ROLE } from 'src/app/shared/constants/constants';
import { LoginResponseData } from 'src/app/shared/models/user';

@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent {
  showPassword: boolean = false;
  isLoading: boolean = false;
  ngForm: FormGroup;
  alertName: string = Constants.alert.alertName;

  constructor(
    private layoutService: LayoutService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private readonly generalService: GeneralService,
    private translateService: TranslateService,
    private messageService: MessageService
  ) {
    this.ngForm = this.fb.group({
      id_card: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  get dark(): boolean {
    return this.layoutService.config().colorScheme !== 'light';
  }

  onSubmit(): void {
    if (this.ngForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.ngForm.disable();
    const data = {
      ...this.ngForm.value,
      lang: this.translateService.currentLang,
    };
    console.log(data);
    this.authService.login(data).subscribe({
      next: response => {
        localStorage.setItem(LOCAL_STORAGE_KEYS.token, response.data.access_token);
        this.isLoading = false;
        this.ngForm.enable();
        this.getProfile();
        return;
      },
      error: ({ error }) => {
        this.isLoading = false;
        this.ngForm.enable();
        this.messageService.add({
          life: NUMBERS.TEN_THOUSAND,
          key: this.alertName,
          severity: 'error',
          detail: error.message,
        });
      },
    });
  }

  getProfile(): void {
    this.authService.getProfile().subscribe({
      next: profile => {
        this.router.navigate([Constants.routes.root]);
        this.isLoading = false;
      },
      error: ({ error }) => {
        this.generalService.messageError(error);
        this.isLoading = false;
      },
    });
  }
}
