export interface ProjectResponse {
  id: number;
  name: string;
  key: string;
  objectContract?: string;
  ContractNo?: string;
  start_date: string;
  client: string;
  contracted_company: string;
  project_type: string;
  last_phase: string;
  end_date: string;
  duration_days: string;

  administrator: {
    id: number;
    name: string;
    email: string;
  };


  state: {
    id: number;
    name: string;
  };

  user_role: {
    id: number;
    type: string;
    permissions: string[];
  } | null;

  details: {
    members: Member[];
    stats: {
      total_members: number;
      total_roles: number;
      roles_breakdown: {
        role_id: number;
        role_type: string;
        members_count: number;
      }[];
    };
    settings: {
      is_private: boolean;
      default_assignee: string;
    };
  };
}

export interface Member {
  id: number;
  name: string;
  email: string;
  role: {
    id: number;
    type: string;
  };
  assigned_at: string;
}
