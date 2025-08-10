export interface SystemInfo {
  _id: string;
  anomaly_id: number;
  cpu_info: CpuInfo;
  disk_info: DiskInfo[];
  id: number;
  memory_info: MemoryInfo;
  network_info: NetworkInfo;
  process_info: ProcessInfo[];
  timestamp: string;
  risk_score?: number;
}

export interface CpuInfo {
  cpu_count: number;
  cpu_freq: number;
  cpu_model: string;
  cpu_percent: number;
  cpu_stats: CpuStats;
  logical_cpu_count: number;
}

export interface CpuStats {
  ctx_switches: number;
  interrupts: number;
  soft_interrupts: number;
  syscalls: number;
}

export interface DiskInfo {
  device: string;
  disk_percent: number;
  mountpoint: string;
  total_disk_gb: number;
  used_disk_gb: number;
}

export interface MemoryInfo {
  active_memory_gb: number;
  available_memory_gb: number;
  buffers_memory_gb: number;
  cached_memory_gb: number;
  inactive_memory_gb: number;
  memory_percent: number;
  swap_memory_info: SwapMemoryInfo;
  total_memory_gb: number;
  used_memory_gb: number;
}

export interface SwapMemoryInfo {
  free_smemory_gb: number;
  smemory_percent: number;
  total_smemory_gb: number;
  used_smemory_gb: number;
}

export interface NetworkInfo {
  bytes_recv_kb: number;
  bytes_sent_kb: number;
  packets_recv: number;
  packets_sent: number;
}

export interface ProcessInfo {
  cpu_percent: number;
  memory_percent: number;
  name: string;
  pid: number;
  username: string;
}

export type SystenDailyInfo = {
  date: string;
  system_info: SystemInfo[];
}[];
