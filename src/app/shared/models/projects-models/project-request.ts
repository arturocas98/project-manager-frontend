export interface ProjectRequest {
  name: string;
  description: string;
}

export type UpdateProjectRequest = {
  [K in keyof ProjectRequest]?: ProjectRequest[K] | null;
};


export interface ProjectMemberRequest {
  user_id: number;
  role_type: string;
}


export type ProjectMemberUpdateRequest = {
  [K in keyof ProjectMemberRequest]?: ProjectMemberRequest[K] | null;
}
