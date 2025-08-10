/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CpuInfo,
  DiskInfo,
  MemoryInfo,
  NetworkInfo,
  ProcessInfo,
} from "../useSystemInfoService/type";

export enum AnomalyType {
  TYPE_1 = "负载-进程矛盾",
  TYPE_2 = "CPU 中断风暴消耗内存",
  TYPE_3 = "流量激增",
  TYPE_4 = "网络断开",
  TYPE_5 = "CPU杀手进程",
  TYPE_6 = "进程内存占用异常",
  TYPE_7 = "内存泄漏",
  TYPE_8 = "swap过度使用",
  TYPE_9 = "磁盘空间不足",
  TYPE_10 = "磁盘io故障",
}

export interface CauseReport {
  anomalies: PurpleAnomaly[];
  anomaly_count: number;
  date: string;
  id: number;
  overall_risk_level: number
}

export interface PurpleAnomaly {
  data: AnomalyData;
  original_timestamp: string;
  system_info_id: string;
}

export interface AnomalyData {
  anomalies: (
    | LoadProcessConflict
    | ProcessMemoryAnomaly
    | MemoryLeak
    | DiskSpaceInsufficient
    | CPUInterruptStorm
    | SwapOveruse
    | CPUKillerProcess
    | TrafficSurge
    | NetworkDisconnection
    | DiskIoFailure
  )[]; // 十种类型的数组
}

/**
 * ApifoxModel
 */
export interface LoadProcessConflict {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  index: number;
  process_cpu_sum: number;
  process_detail: {
    cpu_percent: number;
    name: string;
    pid: number;
  }[];
  risk_level: string;
  system_cpu_percent: number;
}

/**
 * ApifoxModel
 */
export interface ProcessMemoryAnomaly {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  index: number;
  memory_percent: number;
  process_detail: {
    memory_percent: number;
    name: string;
    pid: number;
  }[];
  risk_level: string;
}

/**
 * ApifoxModel
 */
export interface MemoryLeak {
  anomaly_type: string;
  available_memory_gb: number;
  current_status: string;
  detail_analysis: string;
  index: number;
  memory_percent: number;
  risk_level: string;
  used_memory_gb: number;
}

/**
 * ApifoxModel
 */
export interface DiskSpaceInsufficient {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  disk_info: DiskInfo[];
  index: number;
  risk_level: string;
}

/**
 * ApifoxModel
 */
export interface CPUInterruptStorm {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  index: number;
  metrics: Metrics;
  risk_level: string;
}

export interface Metrics {
  cpu_info: CpuInfo;
  disk_info: DiskInfo[];
  memory_info: MemoryInfo;
  network_info: NetworkInfo;
  process_info: ProcessInfo[];
}

export interface SwapOveruse {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  index: number;
  risk_level: string;
  swap_memory_gb: number;
  swap_percent: number;
  swap_used_gb: number;
}

/**
 * ApifoxModel
 */
export interface CPUKillerProcess {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  index: number;
  process_detail: {
    cpu_percent: number;
    name: string;
    pid: number;
  }[];
  risk_level: string;
  system_cpu_percent: number;
}

/**
 * ApifoxModel
 */
export interface TrafficSurge {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  index: number;
  metrics: Metrics;
  risk_level: string;
}

/**
 * ApifoxModel
 */
export interface NetworkDisconnection {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  index: number;
  metrics: Metrics;
  risk_level: string;
}

/**
 * ApifoxModel
 */
export interface DiskIoFailure {
  anomaly_type: string;
  current_status: string;
  detail_analysis: string;
  disk_info: DiskInfo[];
  disk_io_detail: { [key: string]: any }[];
  index: number;
  risk_level: string;
}
