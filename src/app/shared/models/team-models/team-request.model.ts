export interface CreateTeamRequest {
  name: string;
  type?: string;
  client_id?: number | null;
}

export interface UpdateTeamRequest {
  name?: string;
  type?: string;
  client_id?: number | null;
}

export interface TeamMemberRequest {
  user_id: number;
}

export interface TeamFilters {
  search?: string;
  type?: string;
  user_id?: number;
  created_by?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}
