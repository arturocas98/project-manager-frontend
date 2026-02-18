// models/api-response.model.ts

/**
 * Interfaz base para metadatos de paginación
 */
export interface MetaPagination {
  total: number;
  per_page?: number;
  current_page?: number;
  last_page?: number;
  from?: number;
  to?: number;
}

/**
 * Interfaz para metadatos de proyecto (como en tu ejemplo)
 */
export interface MetaProject {
  id: number;
  name: string;
  [key: string]: any; // Para propiedades adicionales
}

/**
 * Interfaz genérica para metadatos flexibles
 * Puede contener cualquier estructura adicional
 */
export interface MetaData {
  total?: number;
  project?: MetaProject;
  pagination?: MetaPagination;
  [key: string]: any; // Para cualquier otro campo de metadata
}

/**
 * Interfaz para links HATEOAS (como en tu ejemplo)
 */
export interface ResponseLinks {
  self?: string;
  parent?: string;
  create?: string;
  update?: string;
  delete?: string;
  first?: string;
  last?: string;
  prev?: string;
  next?: string;
  [key: string]: string | undefined; // Para otros links personalizados
}

/**
 * MODELO GENÉRICO PRINCIPAL
 * T representa el tipo de los datos en 'data'
 */
export interface ApiResponse<T = any> {
  data: T;
  meta?: MetaData;
  links?: ResponseLinks;
  message?: string; // Algunas APIs incluyen mensajes
  status?: number; // Algunas APIs incluyen código de estado
  success?: boolean; // Algunas APIs incluyen indicador de éxito
}

/**
 * Para respuestas que siempre son un array (lista de items)
 */
export interface ApiListResponse<T = any> extends ApiResponse<T[]> {
  data: T[];
}

/**
 * Para respuestas que siempre son un objeto único
 */
export interface ApiSingleResponse<T = any> extends ApiResponse<T> {
  data: T;
}

/**
 * Para respuestas con paginación (cuando meta tiene info de paginación)
 */
export interface ApiPaginatedResponse<T = any> extends ApiListResponse<T> {
  meta: Required<MetaData> & {
    total: number;
    pagination: MetaPagination;
  };
}

/**
 * Tipo útil para cuando la respuesta puede ser cualquier cosa
 */
export type AnyApiResponse = ApiResponse<any>;

/**
 * Tipo para extraer el tipo de los datos de una respuesta
 */
export type ApiDataType<T extends ApiResponse> = T['data'];

/**
 * Tipo para respuestas sin datos (solo mensaje, éxito, etc)
 */
export interface ApiEmptyResponse {
  message?: string;
  success?: boolean;
  status?: number;
  meta?: MetaData;
  links?: ResponseLinks;
}
