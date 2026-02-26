export interface TaskCreateModelRequest {
  title: string;
  description: string;
  incidence_priority_id: number;
  incidence_type_id: number;
  incidence_state_id: number | null;
  due_date: string | null;
  start_date: string | null;
  parent_incidence_id: number | null;
}

export interface TaskUpdateModelRequest {
  title: string | null;
  description: string | null;
  incidence_priority_id: number | null;
  incidence_type_id: number | null;
  parent_incidence_id: number | null;
  incidence_state_id: number | null;
  due_date: string | null;
  start_date: string | null;
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
export interface IncidenceType {
  id: number;
  type: string;
}

export interface IncidenceState {
  id: number;
  state: string;
}

export interface Created_by {
  id: number;
  name: string;
  email: string;
}
export interface AssignedTo {
  id: number;
  name: string;
  email: string;
}

export interface IncidenceParent {
  id: number;
  title: string;
}
