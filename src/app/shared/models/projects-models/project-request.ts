export interface ProjectRequest {
  ContractNo: string;
  client: string;
  project_type: string;

  start_date: string;

  duration_days?: number;
  end_date?: string;

  administrator_email?: string;

  contracted_company?: string;

  last_phase?: string;

  project_state_id: number;

  objectContract?: string;
}

export type UpdateProjectRequest = {
  [K in keyof ProjectRequest]?: ProjectRequest[K] | null;
};


export interface ProjectMemberRequest {
  user_id: number;
  role_type: string;
}


export interface ProjectMemberUpdateRequest {
  role_type: string;
}
