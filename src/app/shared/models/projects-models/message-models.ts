export interface MessageResource {
  id: number;
  project_id: number;
  text: string | null;
  imagen_online: string | null;
  alert: boolean;
  message_id: {
    id: number;
    text: string | null;
    alert: boolean;
    user_name: string | null;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
    role_name: string | null;
  } | null;
  attachments: Array<{  // <-- Ahora está aquí directamente
    id: number;
    name: string;
    url: string;
    size: number;
    mime_type: string;
  }>;
  created_at: string;
  updated_at: string;
}

export interface MessageRequest {
  project_id: number;
  text?: string | null;
  archivo?: string | null;
  imagen_online?: string | null;
  alert?: boolean;
  message_id?: number | null;
}

export interface MessageUpdateRequest {
  text?: string | null;
  archivo?: string | null;
  imagen_online?: string | null;
  alert?: boolean;
}
