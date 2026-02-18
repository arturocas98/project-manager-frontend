export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  two_factor_confirmed_at: string | null;
  profile_photo_url: string;
  permissions: string[];
  roles: string[];
  access_permissions: string[];
  last_login_at: string;
}

export interface UserRole {
  id: number;
  name: string;
  parent_id: number | null;
  created_at: string;
  locked_to_modify: boolean | null;
}
