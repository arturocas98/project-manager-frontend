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
  name: string;
  type: string;
  members: TeamMember[];
  created_by: User;
  created_at: string;
  updated_at: string;
}
