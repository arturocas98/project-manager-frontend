/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { FilterMetadata } from 'primeng/api';
import { ColumnTable, ParamJson, ResponseMeta } from '../shared/models/response';
import { BehaviorSubject } from 'rxjs';
import { Table, TableFilterEvent, TableLazyLoadEvent } from 'primeng/table';
import { ActivatedRoute, Router } from '@angular/router';
import { inject } from '@angular/core';
import { PaginatorState } from 'primeng/paginator';
import { Constants, NUMBERS } from '../shared/constants/constants';

export class LazyPaginator {
  firstPage: number = 1;
  paginator: ResponseMeta = Constants.defaultPaginator;
  zero: number = Constants.zero;
  one: number = NUMBERS.ONE;
  rowPerPage: number = 15;
  filters: ParamJson = {};
  currentPage: number = this.firstPage;
  sortField?: string;
  descOrder: number = -1;
  defaultSortField: string;
  defaultSort: string;
  totalRecords: number = Constants.zero;
  globalFilter: BehaviorSubject<string> = new BehaviorSubject<string>('');
  page: BehaviorSubject<number> = new BehaviorSubject<number>(this.firstPage);
  columns: ColumnTable[] = [];
  selectedColumns: ColumnTable[] = [];
  loading: boolean = false;
  activatedRouteLazy: ActivatedRoute = inject(ActivatedRoute);
  routerServiceLazy: Router = inject(Router);
  cleanFiltersToSearch: ParamJson = {};
  storageIdentifier: string = '';
  previousParams: ParamJson = {};

  constructor(defaultSortField: string = 'name') {
    this.defaultSortField = defaultSortField;
    this.defaultSort = `-${this.defaultSortField}`;

    this.activatedRouteLazy.queryParams.subscribe(params => {
      this.formatFilters(params);
    });
  }

  formatFilters(filters: { [s: string]: FilterMetadata }): ParamJson {
    const formattedFilters: ParamJson = {};
    for (const key of Object.keys(filters)) {
      this.filters[key] = {
        value: filters[key],
        matchMode: 'startsWith',
      };
    }
    return formattedFilters;
  }

  lazyLoad(event: TableLazyLoadEvent, id: string = ''): void {
    if (!this.storageIdentifier && id) {
      this.storageIdentifier = id;
      this.previousParams = JSON.parse(localStorage.getItem(id) || '{}');
      this.formatFilters(this.previousParams);
    }

    if (event.filters) {
      this.cleanFiltersToSearch = this.getFilters(event.filters);
    } else {
      this.filters = {};
    }

    this.onLazy();
  }

  onLazy(): void {}

  onPage(event: PaginatorState): void {
    if (this.loading) return;
    if (!event.page) return;
    this.currentPage = ++event.page;
    this.onLazy();
  }

  getSorts(sortField: string, sortOrder: number): string {
    let field = sortField;
    if (sortOrder < this.zero) {
      field = '-' + field;
    }
    return field;
  }

  getFilters(filterFields: TableFilterEvent): ParamJson {
    const filtros: ParamJson = {};
    const filtroQuery: ParamJson = {};

    if (filterFields) {
      for (const key of Object.keys(filterFields)) {
        const filter = (filterFields as Record<string, any>)[key];
        if (filter?.value !== undefined && filter.value !== null && filter.value !== '') {
          filtroQuery[key] = filter.value;
          const keyFilter = `filter[${key}]`;
          filtros[keyFilter] = filter.value;
        }
      }
    }

    this.setQueryParams(filtroQuery);
    return filtros;
  }

  getParams(): ParamJson {
    return {
      page: this.currentPage.toString(),
      perPage: this.rowPerPage.toString(),
      ...this.cleanFiltersToSearch,
    };
  }

  setQueryParams(params: ParamJson): void {
    localStorage.setItem(this.storageIdentifier, JSON.stringify(params));
    this.routerServiceLazy.navigate([], {
      relativeTo: this.activatedRouteLazy,
      queryParams: params,
    });
  }

  setGlobalFilter(filter: string): void {
    this.globalFilter.next(filter);
  }

  setPage(page: number): void {
    this.page.next(page);
  }

  onChangeSelectedColumns(columns: ColumnTable[]): void {
    this.selectedColumns = this.columns.filter(col => columns.some(column => column.name === col.name));
  }

  onGlobalFilter(table: Table, event: Event): void {
    this.currentPage = this.firstPage;
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }
}
