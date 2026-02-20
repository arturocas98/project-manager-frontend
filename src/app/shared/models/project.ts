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
export interface RawProjectResponse {
  data: {
    [key: string]: {  // Índices numéricos como "0", "1", "2"
      data: Project;   // El proyecto real está aquí
      links?: any;
      meta?: any;
    }
  };
  links?: any;
  meta?: any;
}
