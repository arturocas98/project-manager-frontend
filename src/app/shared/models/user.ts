import { MenuItem } from 'primeng/api';
import { Permission } from './role';

export interface User {
  id: number;
  name: string;
  email: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
  role: string;
  permissions?: Permission[];
  modality_id: string;
  address: string;
  telephone: string;
  menu?: MenuItem[];
  expires_at?: string;
  rols?: string[];
  password?: string;
  password_confirmation?: string;
  deleted_at?: string;
}
export interface UserData {
  id: number;
  name: string;
  email: string;
  last_login_at?: string;
  created_at?: string;
  updated_at?: string;
  role_id: number;
  permissions?: Permission[];
  modality_id: string;
  address: string;
  telephone: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
}

export interface LoginData {
  id_card: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponseData {
  token: string;
  token_type: string;
  expires_in: number;
  user: User;
}
