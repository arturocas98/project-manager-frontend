// types/team.types.ts

export interface User {
  id: number;
  name: string;
  email: string;
  profile_photo_url?: string;
  role?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
}

export interface Team {
  id: number;
  members_count: number;
  name: string;
  type: string;
  members: TeamMember[];
  created_by: User;
  created_at: string;
  updated_at: string;
}

export interface TeamManagement {
  contract_number: string;
  client: string;
  object_contract: string;
  team_name: string;
  members_count: number;
  created_at: string;
  state: string;
  progress: string;
  total_tasks: number;
  overdue_tasks: number;
  days_remaining: number;
  manage_tasks: boolean;
}
