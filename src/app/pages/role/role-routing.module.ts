import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', redirectTo: 'list', pathMatch: 'full' },
        { path: 'list', data: {breadcrumb: 'List'}, loadComponent: () => import('./list/role-list.component').then(m => m.RoleListComponent) },
        { path: 'create', data: {breadcrumb: 'Create'}, loadComponent: () => import('./create/role-create.component').then(m => m.RoleCreateComponent) },
        { path: 'edit/:id', data: {breadcrumb: 'Edit'}, loadComponent: () => import('./edit/role-edit.component').then(m => m.RoleEditComponent) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class RoleRoutingModule { }
