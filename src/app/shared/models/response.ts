export interface ResponseMeta {
  total: number;
  to: number;
  from: number;
  current_page: number;
  last_page: number;
}

export interface ResponseData<T> {
  data: T[];
  meta: ResponseMeta;
}

export interface ResponseDataWithoutMeta<T> {
  data: T[];
}
export interface ResponseSingleData<T> {
  data: T;
}

export interface EventPage {
  page: number;
  rows: number;
}

export interface ParamJson {
  [key: string]: any;
}

export interface ColumnTableGroup {
  name: string;
  columns: ColumnTable[];
  action?: boolean;
}

export interface ColumnTable {
  name: string;
  show: boolean;
  filter: boolean;
  filterStatus?: boolean;
  sort: {
    show: boolean;
    field: string;
    fieldOther?: string;
  };
  value: string[];
  action?: boolean;
  center?: boolean;
  index?: boolean;
  toDate?: string;
  toAnchor?: boolean;
  toMoney?: boolean;
  fromBoolean?: boolean;
  filterStatusApplication?: boolean;
  progress?: boolean;
  showDetail?: boolean;
  key?: string;
  rowSpan?: number;
  colSpan?: number;
  frozen?: boolean;
  width?: number;
}

export enum TypeColumn {
  default = "default",
  fromBoolean = "fromBoolean",
  toDate = "toDate",
  toAnchor = "toAnchor",
  progress = "progress",
}

export interface ValidateSectionsError {
  errors: FormErrors[];
}

export interface SectionErrors {
  [key: string]: string[];
}

export interface FormErrors {
  section: string;
  errors: SectionErrors;
}

export interface FileCollection {
  id: number;
  model: string;
  name: string;
  file_collection: string;
  file: string;
}

export interface DeleteFileI {
  model: string;
  id: string;
  file_collection: string;
}
