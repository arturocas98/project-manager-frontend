import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ResponseMeta } from "src/app/shared/models/response";
import { User } from "src/app/shared/models/user";
import { environment } from "src/environments/environment";

export interface UserCollectionResponse {
  data: User[];
  meta: ResponseMeta;
}

@Injectable({
  providedIn: "root",
})
export class ResourceService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserCollectionResponse> {
    const url = `${environment.apiUrl}/crm/resources/users`;
    return this.http.get<any>(url);
  }
}
