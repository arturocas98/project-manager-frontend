import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
        { path: 'register', loadChildren: () => import('./register/register.module').then(m => m.RegisterModule) },
        { path: 'forgotpassword', loadChildren: () => import('./forgotpassword/forgotpassword.module').then(m => m.ForgotPasswordModule) },
        { path: 'newpassword', loadChildren: () => import('./newpassword/newpassword.module').then(m => m.NewPasswordModule) },
        { path: 'accessdenied', loadChildren: () => import('./accessdenied/accessdenied.module').then(m => m.AccessdeniedModule) },
        { path: 'error', loadChildren: () => import('./error/error.module').then(m => m.ErrorModule) },
    ])],
    exports: [RouterModule]
})
export class AuthRoutingModule { }
