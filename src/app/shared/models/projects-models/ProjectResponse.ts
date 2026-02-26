export interface ProjectResponse {
  id: number;
  name: string;
  key: string;
  description?: string;
  created_at: string;
  updated_at: string;

  created_by: {
    id: number;
    name: string;
    email: string;
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
