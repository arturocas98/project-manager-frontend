import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ColumnTable } from 'src/app/shared/models/column-table.model';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  constructor(private http: HttpClient) {}

  getLinks(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/link`);
  }

  deleteLink(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/link/${id}`);
  }

  createOrEditLink(link: any): Observable<boolean> {
    if (link.id) {
      return this.http.put<boolean>(`${environment.apiUrl}/link/${link.id}`, link);
    }
    return this.http.post<boolean>(`${environment.apiUrl}/link`, link);
  }

  getMenus(): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/menus`);
  }

  deleteMenu(id: number): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/menus/${id}`);
  }

  createOrEditMenu(link: any): Observable<boolean> {
    if (link.id) {
      return this.http.put<boolean>(`${environment.apiUrl}/menus/${link.id}`, link);
    }
    return this.http.post<boolean>(`${environment.apiUrl}/menus`, link);
  }

  getTableMenuColumns(): ColumnTable[] {
    return [
      {
        name: 'general.#',
        show: true,
        filter: false,
        sort: {
          show: false,
          field: '',
        },
        value: [''],
        index: true,
      },
      {
        name: 'navMenu.table.name',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'name',
        },
        value: ['name'],
      },
      {
        name: 'navMenu.table.role',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'role.name',
        },
        value: ['role', 'name'],
      },
      {
        name: 'general.createdAt',
        show: true,
        filter: false,
        toDate: 'MM/dd/yyyy',
        sort: {
          show: true,
          field: 'created_at',
        },
        value: ['created_at'],
      },
      {
        name: 'general.activity',
        show: true,
        filter: false,
        sort: {
          show: false,
          field: '',
        },
        value: [],
        action: true,
      },
    ];
  }
  getTableLinksColumns(): ColumnTable[] {
    return [
      {
        name: 'navMenu.table.name',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'name',
        },
        value: ['name'],
      },
      {
        name: 'navMenu.table.type',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'type',
        },
        value: ['type'],
      },
      {
        name: 'navMenu.table.route',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'route',
        },
        value: ['route'],
      },
      {
        name: 'navMenu.table.icon',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'icon',
        },
        value: ['icon'],
      },
      {
        name: 'general.createdAt',
        show: true,
        filter: false,
        toDate: 'MM/dd/yyyy',
        sort: {
          show: true,
          field: 'created_at',
        },
        value: ['created_at'],
      },
      {
        name: 'general.activity',
        show: true,
        filter: false,
        sort: {
          show: false,
          field: '',
        },
        value: [],
        action: true,
      },
    ];
  }
}
