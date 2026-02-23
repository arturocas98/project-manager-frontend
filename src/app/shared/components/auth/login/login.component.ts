import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/core/service/auth.service';
import { GeneralService } from 'src/app/core/service/general.service';
import { LocalStorageService } from 'src/app/core/service/local-storage.service';
import { TokenService } from 'src/app/core/service/token.service';
import { LayoutService } from 'src/app/layout/service/app.layout.service';
import { Constants, LOCAL_STORAGE_KEYS } from 'src/app/shared/constants/constants';

@Component({
  templateUrl: './login.component.html',
})
export class LoginComponent {
  showPassword: boolean = false;
  isLoading: boolean = false;
  ngForm: FormGroup;

  constructor(
    private layoutService: LayoutService,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private localStorage: LocalStorageService,
    private tokenService: TokenService,
    private readonly generalService: GeneralService
  ) {
    this.ngForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false],
    });
  }

  get dark(): boolean {
    return this.layoutService.config().colorScheme !== 'light';
  }

  //   onSubmit(): void {
  //     if (this.ngForm.invalid) {
  //       return;
  //     }
  //     this.isLoading = true;

  //     this.authService.loginUser(this.ngForm.value).subscribe({
  //       next: (response: LoginResponseData) => {
  //         console.log('Login successful:', response);
  //         this.isLoading = false;

  //         // Guardar token
  //         this.tokenService.saveUserCredentials(response.access_token);

  //         setTimeout(() => {
  //           this.router.navigate(['/dashboard']);
  //         }, 1000);
  //       },
  //       error: error => {
  //         console.error('Login failed:', error);
  //         this.isLoading = false;

  //         if (error.status === 401) {
  //           this.localStorage.removeValueFromLocal('USER_PASSWORD');
  //         }
  //       },
  //     });
  //   }

  onSubmit(): void {
    if (this.ngForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.login(this.ngForm.value).subscribe(({ data }) => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.token, data.access_token);
      this.getProfile();
    });
  }

  getProfile(): void {
    this.authService.getProfile().subscribe({
      next: profile => {
        this.authService.getProfile().subscribe(() => {
          this.router.navigate([Constants.routes.root]);
        });
        this.isLoading = false;
      },
      error: ({ error }) => {
        this.generalService.messageError(error);
        this.isLoading = false;
      },
    });
  }
}
