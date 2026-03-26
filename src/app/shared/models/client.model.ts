export interface Client {
  id: number;
  ruc: string;
  name: string;
  email: string;
  province: string;
  canton: string;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientRequest {
  ruc: string;
  name: string;
  email: string;
  province: string;
  canton: string;
  phone: string;
}
