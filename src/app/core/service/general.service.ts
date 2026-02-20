import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { flattenErrors } from 'src/app/shared/helpers/functions.helper';
import { NUMBERS, SEVERITY, TABLE_KEY_FIELDS } from 'src/app/shared/constants/constants';
import { Dashboard, ErrorResponse } from 'src/app/shared/models/general';
import {ColumnTable} from "../../shared/models/column-table.model";
@Injectable({
  providedIn: 'root',
})
export class GeneralService {
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly http = inject(HttpClient);

  messageSuccess(customMessage = ''): void {
    this.messageService.add({
      life: NUMBERS.THREE_THOUSAND,
      severity: 'success',
      summary: this.translate.instant('general.information'),
      detail: customMessage || this.translate.instant('general.formUpdated'),
    });
  }

  messageError(error: ErrorResponse): void {
    const { errors, message } = error;
    const arrayErrors = flattenErrors(errors);
    if (Array.isArray(arrayErrors)) {
      arrayErrors.forEach(errorMessage => {
        this.messageService.add({
          severity: SEVERITY.ERROR,
          summary: this.translate.instant('general.error'),
          detail: errorMessage || this.translate.instant('general.information'),
          sticky: true,
        });
      });
    } else if (message) {
      this.messageService.add({
        severity: SEVERITY.ERROR,
        summary: this.translate.instant('general.error'),
        detail: message,
        sticky: true,
      });
    }
  }

  messageErrorCustom(customMessage: string): void {
    this.messageService.add({
      severity: SEVERITY.ERROR,
      summary: this.translate.instant('general.error'),
      detail: customMessage,
      sticky: true,
    });
  }

  fakeSave(data: any): Observable<any> {
    return new Observable(observer => {
      setTimeout(() => {
        observer.next({ success: true, ...data });
        observer.complete();
      }, NUMBERS.ONE_THOUSAND);
    });
  }

  getDashboard(): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${environment.apiUrl}/dashboard`);
  }

  getColumnsFiles(): ColumnTable[] {
    return [
      {
        name: 'commonFields.id',
        show: true,
        filter: false,
        width: NUMBERS.HUNDRED,
        sort: {
          show: false,
          field: '',
        },
        value: ['id'],
      },
      {
        name: 'commonFields.name',
        show: true,
        filter: false,
        sort: {
          show: false,
          field: '',
        },
        value: ['name'],
      },
      {
        key: TABLE_KEY_FIELDS.ACTION,
        name: 'commonFields.actions',
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
