// ============================================
// MODELO DE RESPUESTA PARA CREACIÓN DE PROYECTO
// ============================================

/**
 * Rol de usuario asignado al proyecto
 */
export interface UserRole {
  id: number;
  type: string;
  user_id: number;
  assigned_at: string;
}

/**
 * Proyecto creado (dentro del response)
 */
export interface CreatedProject {
  id: number;
  name: string;
  key: string;
  description: string;
  created_at: string;
  user_role: UserRole;
}

/**
 * Rol disponible para asignar
 */
export interface AvailableRole {
  type: string;
  description: string;
}

/**
 * Data principal de la respuesta
 */
export interface ProjectCreationData {
  message: string;
  project: CreatedProject;
  available_roles: AvailableRole[];
}

// ============================================
// METADATA
// ============================================

/**
 * Metadata de la respuesta
 */
export interface ProjectMeta {
  api_version: string;
  timestamp: string;
  resource_type: string;
  action: string;
  status: string;
}

// ============================================
// LINKS HATEOAS
// ============================================

/**
 * Links de la respuesta
 */
export interface ProjectLinks {
  self: string;
  parent: string;
  project: string;
  incidences: string;
  members: string;
}

// ============================================
// RESPUESTA COMPLETA
// ============================================

/**
 * Respuesta completa de creación de proyecto
 */
export interface ProjectCreationResponse {
  data: ProjectCreationData;
  meta: ProjectMeta;
  links: ProjectLinks;
}
