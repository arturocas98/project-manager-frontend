export interface Profile {
  id: number;
  name: string;
  email: string;
  photo: File | string;
  role: string;
}

export interface ProfileDataResponse {
  data: Profile;
}

export interface unassignedUsersData {
  id: number;
  name: string;
  email: string;
  profile_photo_url: string;
  email_verified_at: string | null;
  created_at: string;
}
