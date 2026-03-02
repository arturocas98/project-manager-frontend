export interface Project {
  id: number;
  name: string;
  key: string;
  description?: string;
  created_at?: string;
  created_by?: {
    id: number;
    name: string;
    email: string;
  };
  user_role?: {
    id: number;
    type: string;
  } | null;
  stats?: {
    members_count?: number;
  };
}

export interface ProjectItem {
  data: Project;
  meta?: any;
  links?: any;
}

export interface RawProjectResponse {
  data: ProjectItem[];
  links?: any;
  meta?: any;
}
