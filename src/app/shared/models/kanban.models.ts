export interface ProjectMember{
  user: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    type: string;
  };
}
export interface User {
  id: number;
  name: string;
  email: string;
}
export interface KanbanTask {
  id: number;
  title: string;
  description?: string;

  created_at: string;
  updated_at: string;
  due_date?: string | null;
  start_date?: string | null;

  priority: 'critical' | 'high' | 'medium' | 'low' | null;

  type: {
    id: number;
    type: 'task' | 'bug' | 'subtask' | 'history_user';
  };

  state: {
    id: number;
    state: string;
    color: string;
  };

  created_by: User;
  assigned_to?: AssignedTo | null;

  parent?: {
    id: number;
    title: string;
  } | null;

  project_id: number;
}

export interface KanbanColumn {
  id: number;
  title: string;
  icon: string;
  color: string;
  tasks: KanbanTask[];
  limit?: number;
}

export interface KanbanFilters {
  search: string;
  priority: string[];
  type: string[];
  assignee: number[];
}

export interface KanbanBoard {
  columns: KanbanColumn[];
  filters: KanbanFilters;
}

export interface AssignedTo {
  id: number;
  name: string;
  email: string;
  role:string;
}
