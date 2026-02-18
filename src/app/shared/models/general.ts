export type Replace_Type<T, R> = Omit<T, keyof R> & R;

export type Severity = 'success' | 'secondary' | 'info' | 'warning' | 'danger' | 'contrast' | undefined;

export enum COLLECTION_FILE_NAME {
  EMPLOYEE_PHOTO = 'employee_photo',
}

export enum MODELS_NAME {
  EMPLOYEE = 'employees',
  USERS = 'users',
  EQUIPMENTS = 'equipments',
  ORDERS = 'orders',
  ORDER_FILES = 'order-files',
}

export enum DEFAULT_STATUS {
  INACTIVE = 0,
  ACTIVE = 1,
}

export interface DefaultPaginatorI {
  from: number;
  to: number;
  total: number;
  current_page: number;
  last_page: number;
}

export interface ItemOption {
  name: string;
  value: string | number;
}

export interface ErrorResponse {
  errors: Record<string, string | string[]>;
  message: string;
}

export enum DOCUMENT_TYPE {
  DNI = 1,
  RUC,
}

export interface Dashboard {
  [DashboardCardType.CLIENT]: DashboardCard;
  [DashboardCardType.EMPLOYEE]: DashboardCard;
  [DashboardCardType.ORDER]: DashboardCard;
  [DashboardCardType.PROFILE]: DashboardCard;
  [DashboardCardType.QUOTE]: DashboardCard;
  [DashboardCardType.WORK_ORDER]: DashboardCard;
}

export enum DashboardCardType {
  CLIENT = 'client',
  EMPLOYEE = 'employee',
  ORDER = 'order',
  PROFILE = 'profile',
  QUOTE = 'quote',
  WORK_ORDER = 'work_order',
}

export interface DashboardCard {
  header: string;
  loading: boolean;
  count?: number;
  percentage?: number;
  variation?: number[];
}

export interface ChartData {
  labels: string[];
  datasets: {
    label?: string;
    data: number[];
    backgroundColor?: string[];
    hoverBackgroundColor?: string[];
    borderColor?: string;
    tension?: number;
  }[];
}

export interface PercentageProps {
  color: string;
  positive: boolean;
}

export interface UploadEvent {
  files: File[];
}
