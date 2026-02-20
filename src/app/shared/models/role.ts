// src/app/shared/models/role.ts

export interface Role {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}
