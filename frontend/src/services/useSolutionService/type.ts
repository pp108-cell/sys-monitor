export interface RepairReport {
  created_at: string;
  report_id: number;
  solution_id: number;
  solutions: Solution[];
}

export interface Solution {
  anomaly_details: AnomalyDetails;
  anomaly_type: string;
  implementation_steps: string[];
  recommended_actions: string[];
  solution_description: string;
  traffic_analysis?: TrafficAnalysis;
  validity_period: string;
  severity_based_recommendations?: SeverityBasedRecommendations;
  mitigation_strategy?: MitigationStrategy;
  diagnostic_data?: DiagnosticData;
  mitigation_strategies?: MitigationStrategies;
  recovery_priority?: RecoveryPriority;
}

export interface MitigationStrategies {
  immediate: string[];
  long_term: string[];
}
export interface RecoveryPriority {
  critical_services: string[];
  network_recovery_steps: string[];
}
export interface DiagnosticData {
  cpu_usage_discrepancy: string;
  kernel_threads: string[];
  potential_causes: string[];
}
export interface MitigationStrategy {
  immediate: string[];
  long_term: string[];
}
export interface SeverityBasedRecommendations {
  critical_actions: string[];
  preventive_measures: string[];
}
export interface AnomalyDetails {
  description: string;
  detection_time: string;
  severity: string;
}

export interface TrafficAnalysis {
  attack_type: string;
  is_potential_attack: boolean;
  recommended_protection_level: string;
}

/**
 * ApifoxModel
 */
export interface SolutionNote {
  content: string;
  id: number;
  like: boolean;
  timestamp: string;
  title: string;
  update_time: string;
  tag: number;
}

