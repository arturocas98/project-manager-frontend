import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ResponseMeta } from '../models/response';
import { User } from '../models/user';

export interface UserCollectionResponse {
    data: User[];
    meta: ResponseMeta;
}

@Injectable({
    providedIn: 'root',
})
export class ResourceService {
    constructor(
        private http: HttpClient,
    ) { }

    getUsers(): Observable<UserCollectionResponse> {
        const url = `${environment.apiUrl}/crm/resources/users`;
        return this.http.get<any>(url)
    }
}
