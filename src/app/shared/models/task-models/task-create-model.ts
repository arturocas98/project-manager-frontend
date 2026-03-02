export interface TaskCreateModelRequest {
  title: string;
  description: string;
  incidence_priority_id: number;
  incidence_type_id: number;
  incidence_state_id: number | null;
  assigned_user_id: number | null;
  parent_incidence_id: number | null;
  due_date: string | null;
  start_date: string | null;
}

export interface TaskUpdateModelRequest {
  title: string | null;
  description: string | null;
  incidence_priority_id: number | null;
  incidence_type_id: number | null;
  parent_incidence_id: number | null;
  incidence_state_id: number | null;
  assigned_user_id: number | null;
  due_date: string | null;
  start_date: string | null;
}

// Modelo base de Incidencia (para listas o vistas simples)
export interface Incidence {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  project_id: number;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  start_date: string | null;

  type: IncidenceType | null;
  state: IncidenceState | null;

  created_by: CreatedBy | null;
  assigned_to: AssignedTo | null;

  parent: IncidenceParent | null;
}

// Modelo extendido para cuando necesitas los hijos (vista de árbol)
export interface IncidenceWithChildren extends Incidence {
  children: IncidenceChild[];
}

// Modelo para hijos (versión simplificada pero con estructura recursiva)
export interface IncidenceChild {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  created_at: string;
  start_date: string | null;
  due_date: string | null;

  type: IncidenceType | null;
  state: IncidenceState | null;

  created_by: CreatedBy | null;
  assigned_to: AssignedTo | null;

  // Hijos recursivos
  children: IncidenceChild[];
}

// Modelo completo que coincide con la respuesta del Resource
export interface IncidenceDetailResponse {
  data: IncidenceDetail;
}

export interface IncidenceDetail {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  project_id: number;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  start_date: string | null;

  type: IncidenceType | null;
  state: IncidenceState | null;

  created_by: CreatedBy | null;
  assigned_to: AssignedTo | null;

  parent: IncidenceParent | null;

  // Hijos ordenados cronológicamente
  children: IncidenceDetailChild[];
}

  export interface IncidenceDetailChild {
  id: number;
  title: string;
  description: string | null;
  priority: string | null;
  created_at: string;
  start_date: string | null;
  due_date: string | null;

  type: IncidenceType | null;
  state: IncidenceState | null;

  created_by: CreatedBy | null;
  assigned_to: AssignedTo | null;

  // Hijos recursivos (misma estructura)
  children: IncidenceDetailChild[];
}

// Tipos auxiliares (manteniendo tu nomenclatura)
export interface IncidenceType {
  id: number;
  type: string;
}

export interface IncidenceState {
  id: number;
  state: string;
}

export interface CreatedBy {
  id: number;
  name: string;
  email: string;
}

export interface AssignedTo {
  id: number;
  name: string;
  email: string;
  role_name?: string; // Añadido porque está presente en tu resource
}

export interface IncidenceParent {
  id: number;
  title: string;
}

export interface IncidenceModel {
  id: number;
  title: string;
  description: string | null;
  date: string | null;
  priority: string | null;
  project_id: number;
  created_at: string;
  updated_at: string;
  due_date: string | null;
  start_date: string | null;

  type: IncidenceType;
  state: IncidenceState;

  created_by: Created_by;
  assigned_to: AssignedTo | null;

  parent: IncidenceParent | null;
}


export interface Created_by {
  id: number;
  name: string;
  email: string;
}
