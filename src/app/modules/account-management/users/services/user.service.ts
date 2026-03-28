import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { User, UserData } from 'src/app/shared/models/user';
import { environment } from 'src/environments/environment';
import { ParamJson } from '../../../../shared/models/params.model';
import { ApiSingleResponse, MetaData } from '../../../../shared/models/api-response.model';
import { USER } from 'src/app/shared/constants/constants';
import { ColumnTable } from 'src/app/shared/models/column-table.model';
import { ResponseMeta } from 'src/app/shared/models/response';

export interface UserCollectionResponse {
  data: User[];
  meta: ResponseMeta;
}

export interface UserResponse {
  data: User;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private globalFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private page: BehaviorSubject<number> = new BehaviorSubject<number>(1);

  constructor(private http: HttpClient) {}

  setGlobalFilter(filter: string) {
    this.globalFilter.next(filter);
  }

  setPage(page: number) {
    this.page.next(page);
  }

  getUsers(params: ParamJson = {}): Observable<UserCollectionResponse> {
    const url = `${environment.apiUrl}/auth/users`;
    return this.http.get<UserCollectionResponse>(url, { params });
  }
  deleteUser(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${environment.apiUrl}/auth/users/${id}`);
  }

  createUser(user: UserData): Observable<boolean> {
    return this.http.post<boolean>(`${environment.apiUrl}/auth/users`, user);
  }

  updateUser(user: User, userId: number): Observable<boolean> {
    return this.http.put<boolean>(`${environment.apiUrl}/auth/users/${userId}`, user);
  }

  getUser(id: number): Observable<ApiSingleResponse<User>> {
    return this.http.get<UserResponse>(`${environment.apiUrl}/auth/users/${id}`);
  }

  getTableColumns(): ColumnTable[] {
    return [
      {
        name: 'general.#',
        show: true,
        filter: false,
        sort: {
          show: false,
          field: 'id',
        },
        value: ['id'],
      },
      {
        name: 'user.name',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'name',
        },
        value: ['name'],
      },
      {
        name: USER.USER_IDENTIFICATION_COLUMN,
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'id_card',
        },
        value: ['id_card'],
      },
      {
        name: 'user.email',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'email',
        },
        value: ['email'],
      },
      {
        name: 'general.createdAt',
        show: true,
        filter: false,
        toDate: 'dd/MM/yyyy',
        sort: {
          show: true,
          field: 'created_at',
        },
        value: ['created_at'],
      },
      {
        name: 'user.modality',
        show: true,
        filter: true,
        sort: {
          show: false,
          field: 'modality_id',
        },
        value: ['modality', 'description'],
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
