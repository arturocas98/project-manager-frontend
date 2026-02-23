export interface ProjectSummaryData {
  kpis: KpisData;
  distribution_by_state: DistributionByState;
  distribution_by_priority: DistributionByPriority;
  user_workload: UserWorkload;
  high_priority_tasks: HighPriorityTask[];
  recent_incidences: RecentIncidence[];
  trends: TrendsData;
}

// ============================================
// KPIS
// ============================================

/**
 * KPIs con comparación mes a mes
 */
export interface KpisData {
  total_tasks: KpiItem;
  in_progress_tasks: KpiItem;
  finished_tasks: KpiItem;
  expiring_this_week: number;
  critical_priority_tasks: KpiItem;
}

/**
 * Estructura de un KPI individual (value + comparison)
 */
export interface KpiItem {
  value: number;
  comparison: string; // Ejemplo: "+12.5%", "-5.3%", "0%", "+100%"
}

// ============================================
// DISTRIBUCIONES
// ============================================

/**
 * Distribución por estado (dinámico según estados existentes)
 * Ejemplo: {
 *   "backlog": 25,
 *   "progress": 45,
 *   "review": 10,
 *   "finished": 80,
 *   "blocked": 5
 * }
 */
export interface DistributionByState {
  [stateName: string]: number;
}

/**
 * Distribución por prioridad (dinámico según prioridades existentes)
 * Ejemplo: {
 *   "critical": 15,
 *   "high": 30,
 *   "medium": 70,
 *   "low": 35
 * }
 */
export interface DistributionByPriority {
  [priorityName: string]: number;
}

// ============================================
// CARGA DE USUARIOS
// ============================================

/**
 * Workload de usuarios (dinámico por usuario)
 * Ejemplo: {
 *   "María González": 12,
 *   "Juan Pérez": 8,
 *   "Carlos López": 5
 * }
 */
export interface UserWorkload {
  [userName: string]: number;
}

// ============================================
// TAREAS DE ALTA PRIORIDAD
// ============================================

/**
 * Tarea de alta prioridad (critical/high)
 */
export interface HighPriorityTask {
  id: number;
  title: string;
  priority: string; // "critical", "high", "alta"
  status: string;
  assigned_user_name: string;
  project_name: string;
}

// ============================================
// INCIDENCIAS RECIENTES
// ============================================

/**
 * Incidencia reciente
 */
export interface RecentIncidence {
  id: number;
  title: string;
  description: string;
  priority: string;
  state: string;
  created_at: string; // Formato: "2024-01-15 14:30:22"
  created_by_name: string;
}

// ============================================
// TENDENCIAS
// ============================================

/**
 * Datos de tendencias
 */
export interface TrendsData {
  weekly: WeeklyTrend;
}

/**
 * Tendencia semanal (por día)
 */
export interface WeeklyTrend {
  monday: DailyStats;
  tuesday: DailyStats;
  wednesday: DailyStats;
  thursday: DailyStats;
  friday: DailyStats;
  saturday: DailyStats;
  sunday: DailyStats;
}

/**
 * Estadísticas diarias
 */
export interface DailyStats {
  tasks_created: number;
  tasks_completed: number;
}
