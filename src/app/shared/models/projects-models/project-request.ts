export interface ProjectRequest {
  name: string;
  description: string;
}

export type UpdateProjectRequest = {
  [K in keyof ProjectRequest]?: ProjectRequest[K] | null;
};
