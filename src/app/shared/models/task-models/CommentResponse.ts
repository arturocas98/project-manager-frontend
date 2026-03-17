export interface UserRole {
  id: number;
  type: string;
}

export interface CreatedBy {
  id: number;
  name: string;
  user_role: UserRole | null;
}

export interface Incidence {
  id: number;
  name: string;
}

export interface CommentResponse {
  id: number;
  description: string;
  created_at: string;
  updated_at: string;
  incidence: Incidence;
  createdBy: CreatedBy;
}
