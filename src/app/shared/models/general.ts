

// Tipos originales que se mantienen igual
import {ApiResponse} from "./api-response.model";

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

// Actualizamos ErrorResponse para que sea compatible con ApiErrorResponse
// pero mantenemos la interfaz original para compatibilidad
export interface ErrorResponse {
  errors: Record<string, string | string[]>;
  message: string;
  status?: number;
  success?: false;
}

export enum DOCUMENT_TYPE {
  DNI = 1,
  RUC,
}

// Mejoramos el Dashboard con tipos más específicos
export interface Dashboard {
  [DashboardCardType.CLIENT]?: DashboardCard;
  [DashboardCardType.EMPLOYEE]?: DashboardCard;
  [DashboardCardType.ORDER]?: DashboardCard;
  [DashboardCardType.PROFILE]?: DashboardCard;
  [DashboardCardType.QUOTE]?: DashboardCard;
  [DashboardCardType.WORK_ORDER]?: DashboardCard;

  // Propiedades adicionales que podrían venir de la API
  totalClients?: number;
  totalEmployees?: number;
  totalOrders?: number;
  totalQuotes?: number;
  recentActivities?: Activity[];
  statistics?: DashboardStatistics;
  charts?: DashboardCharts;
}

export interface Activity {
  id: number;
  description: string;
  user: string;
  userId?: number;
  timestamp: string | Date;
  type: 'create' | 'update' | 'delete' | 'view' | 'login' | 'logout';
  icon?: string;
  color?: string;
}

export interface DashboardStatistics {
  ordersByStatus?: { [key: string]: number };
  clientsByMonth?: { month: string; count: number }[];
  topEmployees?: { id: number; name: string; count: number }[];
  revenueData?: { date: string; amount: number }[];
}

export interface DashboardCharts {
  ordersChart?: ChartData;
  clientsChart?: ChartData;
  revenueChart?: ChartData;
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
  icon?: string;
  color?: string;
  route?: string;
  queryParams?: { [key: string]: any };
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
    fill?: boolean;
    borderWidth?: number;
  }[];
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: any;
    scales?: any;
  };
}

export interface PercentageProps {
  color: string;
  positive: boolean;
}

export interface UploadEvent {
  files: File[];
  originalEvent?: Event;
}

// ============================================
// NUEVOS TIPOS UTILIZANDO ApiResponse
// ============================================


export type DashboardResponse = ApiResponse<Dashboard>;


export type DashboardListResponse = ApiResponse<Dashboard[]>;


export type DashboardCardResponse = ApiResponse<DashboardCard>;


export type ChartDataResponse = ApiResponse<ChartData>;


export type ActivitiesResponse = ApiResponse<Activity[]>;


export type StatisticsResponse = ApiResponse<DashboardStatistics>;

// ============================================
// UTILIDADES PARA TRABAJAR CON RESPUESTAS
// ============================================


export function isSuccessfulResponse<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true } {
  return response.success !== false;
}


export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.message !== undefined && (response.errors !== undefined || response.success === false);
}


export function toDefaultPaginator(meta: any): DefaultPaginatorI {
  return {
    from: meta?.from || 0,
    to: meta?.to || 0,
    total: meta?.total || 0,
    current_page: meta?.current_page || 1,
    last_page: meta?.last_page || 1
  };
}

