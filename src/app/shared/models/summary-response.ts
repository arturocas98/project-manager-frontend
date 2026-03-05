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

export interface KpisData {
  total_tasks: KpiItem;
  in_progress_tasks: number;
  completed_tasks: number;
  review_tasks: number;
  finished_tasks: number;
  expiring_this_week: number;
  critical_priority_tasks: KpiItem;
}

export interface KpiItem {
  value: number;
  comparison: string;
}

// ============================================
// DISTRIBUCIONES
// ============================================

export interface DistributionByState {
  [stateName: string]: number;
}

export interface DistributionByPriority {
  [priorityName: string]: number;
}

// ============================================
// CARGA DE USUARIOS
// ============================================

export interface UserWorkload {
  [userName: string]: number;
}

// ============================================
// TAREAS DE ALTA PRIORIDAD
// ============================================

export interface HighPriorityTask {
  id: number;
  title: string;
  priority: string;
  status: string;
  assigned_user_name: string;
  project_name: string;
}

// ============================================
// INCIDENCIAS RECIENTES
// ============================================

export interface RecentIncidence {
  id: number;
  title: string;
  description: string;
  priority: string;
  state: string;
  created_at: string;
  created_by_name: string;
}

// ============================================
// TENDENCIAS
// ============================================

export interface TrendsData {
  weekly: WeeklyTrend;
}

export interface WeeklyTrend {
  Lunes: DailyStats;
  Martes: DailyStats;
  Miercoles: DailyStats;
  Jueves: DailyStats;
  Viernes: DailyStats;
  Sabado: DailyStats;
  Domingo: DailyStats;
}

export interface DailyStats {
  tasks_created: number;
  tasks_completed: number;
}
