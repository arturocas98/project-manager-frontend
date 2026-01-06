import { FilterMetadata } from 'primeng/api';
import { TableLazyLoadEvent } from 'primeng/table';
import { Constants } from '../constants/constants';
import { EventPage, ParamJson, ResponseMeta } from '../models/response';

export class LazyPaginator {
    firstPage: number = 1;
    paginator: ResponseMeta = Constants.defaultPaginator;
    zero: number = Constants.zero;
    rowPerPage: number = 15;
    filters: ParamJson = {};
    currentPage: number = this.firstPage;
    sortField?: string;
    descOrder: number = -1;
    defaultSortField: string;
    defaultSort: string;

    constructor(defaultSortField: string = 'name') {
        this.defaultSortField = defaultSortField;
        this.defaultSort = `-${this.defaultSortField}`;
    }

    lazyLoad(event: TableLazyLoadEvent): void {
        if (!!event.filters) {
            this.filters = this.getFilters(event.filters);
        } else {
            this.filters = {};
        }
        if (!!event.sortField && !!event.sortOrder) {
            this.sortField = this.getSorts(event.sortField, event.sortOrder);
        } else {
            this.sortField = undefined;
        }
        this.onLazy();
    }

    onLazy(): void {}

    onPage(event: EventPage): void {}

    getSorts(sortField: string | string[], sortOrder: number): string {
        let field = Array.isArray(sortField)
            ? sortField[Constants.zero]
            : sortField;
        if (sortOrder < this.zero) {
            field = '-' + field;
        }
        return field;
    }

    getFilters(filterFields: {
        [s: string]: FilterMetadata | FilterMetadata[] | undefined;
    }): ParamJson {
        let filtros = {};
        if (filterFields) {
            for (let key of Object.keys(filterFields)) {
                //@ts-ignore
                if (!!filterFields[key] && !!filterFields[key]?.value) {
                    const keyFilter: string = `filter[${key}]`;
                    //@ts-ignore
                    filtros[keyFilter] = filterFields[key].value;
                }
            }
        }
        return filtros;
    }

    getParams(): ParamJson {
        return {
            page: this.currentPage.toString(),
            perPage: this.rowPerPage.toString(),
            ...this.filters,
            sort: this.sortField || this.defaultSort,
        };
    }
}
