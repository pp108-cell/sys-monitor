import type {
  CPUChartProps,
  NetWorkChartProps,
} from "@/components/Charts/LegacyCharts";
import type { DiskChartProps } from "@/components/Charts/DiskChart";
import type { CPUPieChartProps } from "@/components/Charts/CPUPieChart";
import type { MemoryChartProps } from "@/components/Charts/MemoryChart";
import type { NetworkAreaChartProps } from "@/components/Charts/NetworkAreaChart";
import type { MemoryUsageChartProps } from "@/components/Charts/MemoryUsageChart";
import type { ProcessInfo } from "@/services/useSystemInfoService/type";

export interface DashboardState {
  cpuLineChartInfo: CPUChartProps["data"];
  cpuPieChartInfo: CPUPieChartProps["data"];
  diskChartInfo: DiskChartProps["data"];
  networkTwoLineChartInfo: NetWorkChartProps["data"];
  memorySingleChartInfo: MemoryChartProps["data"];
  networkAreaChartInfo: NetworkAreaChartProps["data"];
  memoryUsageChartInfo: MemoryUsageChartProps["data"];
  lastUpdateTime: number;
}

export type DashboardAction =
  | { type: "INIT_DATA"; payload: DashboardState }
  | { type: "UPDATE_CPU_LINE_DATA"; payload: CPUChartProps["data"][0] }
  | { type: "UPDATE_CPU_PIE_DATA"; payload: ProcessInfo[] }
  | { type: "UPDATE_DISK_DATA"; payload: DiskChartProps["data"] }
  | { type: "UPDATE_NETWORK_LINE_DATA"; payload: NetWorkChartProps["data"][0] }
  | { type: "UPDATE_MEMORY_SINGLE_DATA"; payload: MemoryChartProps["data"][0] }
  | {
      type: "UPDATE_NETWORK_AREA_DATA";
      payload: NetworkAreaChartProps["data"][0];
    }
  | {
      type: "UPDATE_MEMORY_USAGE_DATA";
      payload: MemoryUsageChartProps["data"][0];
    }
  | { type: "LOAD_PERSISTED_DATA"; payload: DashboardState }
  | { type: "CLEAR_DATA" };

export interface DashboardContextType {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
}
