export interface ResponseMeta {
    total: number;
    to: number;
    from: number;
}

export interface EventPage {
    page: number;
}

export interface ParamJson {
    [key: string]: string;
}

export interface ResponseData<T> {
  data: T[];
  meta: ResponseMeta;
}
