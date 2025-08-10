import { useContext, useEffect, useState } from "react";
import type { CpuInfo, DiskInfo, MemoryInfo, NetworkInfo } from "../../services/useSystemInfoService/type";
import { SystemInfoContext } from "@/contexts/SystemInfoContext";
import { useDashboardContext } from "@/contexts/DashboardContext";
const useDashBoard = () => {
  // 获取系统信息 - 直接解构使用
  const { state } = useContext(SystemInfoContext);

  // 获取仪表板数据 context
  const { state: dashboardState, dispatch } = useDashboardContext();

  // 添加网络数据历史记录用于计算速率
  const [prevNetworkInfo, setPrevNetworkInfo] = useState<NetworkInfo | undefined>(undefined);
  const [prevNetworkTime, setPrevNetworkTime] = useState<number | undefined>(undefined);

  const updateCPULineChartInfo = (cpuInfo: CpuInfo) => {
    const thisInfo = {
      time: +new Date(),
      percent: cpuInfo.cpu_percent
    };
    dispatch({ type: 'UPDATE_CPU_LINE_DATA', payload: thisInfo });
  };

  const updateDiskChartInfo = (diskInfo: DiskInfo[]) => {
    const thisInfo = diskInfo.map(item => ({
      name: item.device,
      usage: item.used_disk_gb.toFixed(2),
      free: (item.total_disk_gb - item.used_disk_gb).toFixed(2)
    }));
    dispatch({ type: 'UPDATE_DISK_DATA', payload: thisInfo });
  };

  const updateNetworkChartInfo = (networkInfo: NetworkInfo) => {
    const currentTime = +new Date();

    // 如果没有上一次的数据，只保存当前数据
    if (!prevNetworkInfo || !prevNetworkTime) {
      setPrevNetworkInfo(networkInfo);
      setPrevNetworkTime(currentTime);
      return;
    }

    // 计算时间间隔（秒）
    const timeDiff = (currentTime - prevNetworkTime) / 1000;

    // 计算字节差值
    const bytesSentDiff = networkInfo.bytes_sent_kb - prevNetworkInfo.bytes_sent_kb;
    const bytesRecvDiff = networkInfo.bytes_recv_kb - prevNetworkInfo.bytes_recv_kb;

    // 计算速率（字节/秒）并转换为 KB/s
    const uploadSpeed = bytesSentDiff / timeDiff; // KB/s
    const downloadSpeed = bytesRecvDiff / timeDiff; // KB/s

    const thisInfo = {
      time: currentTime,
      upstream: Math.max(0, uploadSpeed), // 确保不为负数
      downloadstream: Math.max(0, downloadSpeed)
    };

    dispatch({ type: 'UPDATE_NETWORK_LINE_DATA', payload: thisInfo });

    // 更新历史数据
    setPrevNetworkInfo(networkInfo);
    setPrevNetworkTime(currentTime);
  };

  const updateMemoryChartInfo = (memoryInfo: MemoryInfo) => {
    const thisInfo = {
      time: +new Date(),
      percent: memoryInfo.memory_percent
    };
    dispatch({ type: 'UPDATE_MEMORY_SINGLE_DATA', payload: thisInfo });
  };

  const updateNetworkAreaChartInfo = (networkInfo: NetworkInfo) => {
    const thisInfo = {
      time: +new Date(),
      bytes_sent_kb: networkInfo.bytes_sent_kb,
      bytes_recv_kb: networkInfo.bytes_recv_kb,
      packets_sent: networkInfo.packets_sent,
      packets_recv: networkInfo.packets_recv
    };
    dispatch({ type: 'UPDATE_NETWORK_AREA_DATA', payload: thisInfo });
  };

  const updateMemoryUsageChartInfo = (memoryInfo: MemoryInfo) => {
    const thisInfo = {
      time: +new Date(),
      used_memory: memoryInfo.used_memory_gb,
      used_swap: memoryInfo.swap_memory_info.used_smemory_gb
    };
    dispatch({ type: 'UPDATE_MEMORY_USAGE_DATA', payload: thisInfo });
  };
  useEffect(() => {
    if (state?.cpu_info) {
      updateCPULineChartInfo(state.cpu_info);
    }
    if (state.disk_info) {
      updateDiskChartInfo(state.disk_info);
    }
    if (state.network_info) {
      updateNetworkChartInfo(state.network_info);
      updateNetworkAreaChartInfo(state.network_info);
    }
    if (state.memory_info) {
      updateMemoryChartInfo(state.memory_info)
      updateMemoryUsageChartInfo(state.memory_info)
    }
  }, [state]);

  return {
    cpuLineChartInfo: dashboardState.cpuLineChartInfo,
    diskChartInfo: dashboardState.diskChartInfo,
    networkTwoLineChartInfo: dashboardState.networkTwoLineChartInfo,
    memorySingleChartInfo: dashboardState.memorySingleChartInfo,
    networkAreaChartInfo: dashboardState.networkAreaChartInfo,
    memoryUsageChartInfo: dashboardState.memoryUsageChartInfo
  }
}

export default useDashBoard;