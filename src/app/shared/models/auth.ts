export interface Profile {
  id: number;
  name: string;
  email: string;
  photo: File | string;
  roles: string[];
}

export interface ProfileDataResponse {
  data: Profile;
}
