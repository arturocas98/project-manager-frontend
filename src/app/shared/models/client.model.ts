export interface Client {
  id: number;
  Ruc: string;
  Nombre: string;
  Correo: string;
  Provincia: string;
  Canton: string;
  Telefono: string;
  created_at?: string;
  updated_at?: string;
}

export interface ClientRequest {
  Ruc: string;
  Nombre: string;
  Correo: string;
  Provincia: string;
  Canton: string;
  Telefono: string;
}
