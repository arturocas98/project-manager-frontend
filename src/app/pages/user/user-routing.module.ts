import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', redirectTo: 'list', pathMatch: 'full' },
        { path: 'list', data: {breadcrumb: 'List'}, loadComponent: () => import('./list/user-list.component').then(m => m.UserListComponent) },
        { path: 'create', data: {breadcrumb: 'Create'}, loadComponent: () => import('./create/user-create.component').then(m => m.UserCreateComponent) },
        { path: 'edit/:id', data: {breadcrumb: 'Edit'}, loadComponent: () => import('./edit/user-edit.component').then(m => m.UserEditComponent) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class UserRoutingModule { }
