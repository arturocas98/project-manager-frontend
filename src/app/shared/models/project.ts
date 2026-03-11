export interface Project {
  id: number;

  ContractNo: string;
  client: string;
  project_type: string;
  objectContract: string;

  start_date?: string;
  end_date?: string;
  duration_days?: number;

  administrator_email?: string;
  contracted_company?: string;
  last_phase?: string;

  created_at?: string;

  administrator?: {
    id: number;
    name: string;
    email: string;
  };

  state?: {
    id: number;
    name: string;
  };

  user_role?: {
    id: number;
    type: string;
  } | null;

  stats?: {
    members_count?: number;
  };
}
