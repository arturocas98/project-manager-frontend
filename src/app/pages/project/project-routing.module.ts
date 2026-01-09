import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [RouterModule.forChild([
        { path: '', redirectTo: 'list', pathMatch: 'full' },
        { path: 'list', data: {breadcrumb: 'List'}, loadComponent: () => import('./list/project-list.component').then(m => m.ProjectListComponent) },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }
