export interface Client {
  id: number;
  ruc: string;
  name: string;
  email: string;
  locate?: {
    id: number;
    name_provinces: string;
    name_canton: string;
  };
  locate_id?: number | null;
  phone: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientRequest {
  ruc: string;
  name: string;
  email: string;
  locate_id: number | null;
  phone: string;
}
