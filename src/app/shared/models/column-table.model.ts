// src/app/shared/models/column-table.model.ts
import { TABLE_KEY_FIELDS } from '../constants/constants';
import { ApiPaginatedResponse, ApiResponse } from './api-response.model';

export interface ColumnSort {
  show: boolean;
  field: string;
}

export interface ColumnTable {
  key?: string; // Para identificar columnas especiales como acciones
  name: string; // Clave de traducción o nombre
  show: boolean;
  filter: boolean;
  width?: number;
  sort: ColumnSort;
  value: string[]; // Campos del objeto a mostrar
  action?: boolean; // Si es columna de acciones
  field?: string; // Campo alternativo para ordenamiento
  header?: string; // Texto del header (si no se usa traducción),
  index?: boolean;
  toDate?: string;
}

/**
 * Tipo para respuesta de columnas
 */
export type ColumnsResponse = ApiResponse<ColumnTable[]>;

/**
 * Tipo para respuesta de columnas con paginación
 */
export type ColumnsPaginatedResponse = ApiPaginatedResponse<ColumnTable>;

// Re-exportamos para mantener compatibilidad
export { TABLE_KEY_FIELDS };
