import { Permission, Role } from './role';

export interface User {
  id: number;
  name: string;
  email: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
  roles?: string[];
  rols: Role[];
  permissions?: Permission[];
  modality_id: string;
  address: string;
  telephone: string;
}

export interface LoginData {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponseData {
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
