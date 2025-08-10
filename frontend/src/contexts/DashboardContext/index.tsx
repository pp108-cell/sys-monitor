import React, { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import type { DashboardState, DashboardAction, DashboardContextType } from './types';

const STORAGE_KEY = 'dashboard_chart_data';
const MAX_DATA_POINTS = 100;
const DATA_EXPIRY_TIME = 60 * 60 * 1000; // 1小时过期

// 持久化工具函数
const saveToStorage = (data: DashboardState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save dashboard data to localStorage:', error);
  }
};

const loadFromStorage = (): DashboardState | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      // 检查数据是否过期
      if (Date.now() - data.lastUpdateTime < DATA_EXPIRY_TIME) {
        return data;
      }
    }
  } catch (error) {
    console.warn('Failed to load dashboard data from localStorage:', error);
  }
  return null;
};

// 生成初始的 mock 数据
const generateInitialMockData = (): DashboardState => {
  const now = new Date();
  const baseTime = now.getTime();

  // 生成CPU线性数据
  const cpuLineChartInfo = Array.from({ length: 100 }, (_, i) => ({
    time: baseTime - (100 - i) * 10000,
    percent: 0
  }));

  // 生成网络线性数据
  const networkTwoLineChartInfo = Array.from({ length: 100 }, (_, i) => ({
    time: baseTime - (100 - i) * 10000,
    upstream: 0,
    downloadstream: 0
  }));

  // 生成内存单一数据
  const memorySingleChartInfo = Array.from({ length: 100 }, (_, i) => ({
    time: baseTime - (100 - i) * 10000,
    percent: 0
  }));

  // 生成网络区域数据
  const networkAreaChartInfo = Array.from({ length: 100 }, (_, i) => ({
    time: baseTime - (100 - i) * 10000,
    bytes_sent_kb: 0,
    bytes_recv_kb: 0,
    packets_sent: 0,
    packets_recv: 0
  }));

  // 生成内存使用数据
  const memoryUsageChartInfo = Array.from({ length: 100 }, (_, i) => ({
    time: baseTime - (100 - i) * 10000,
    used_memory: 0,
    used_swap: 0
  }));

  return {
    cpuLineChartInfo,
    cpuPieChartInfo: [],
    diskChartInfo: [],
    networkTwoLineChartInfo,
    memorySingleChartInfo,
    networkAreaChartInfo,
    memoryUsageChartInfo,
    lastUpdateTime: Date.now()
  };
};

// Reducer 函数
const dashboardReducer = (state: DashboardState, action: DashboardAction): DashboardState => {
  switch (action.type) {
    case 'INIT_DATA':
      return action.payload;

    case 'UPDATE_CPU_LINE_DATA': {
      const newCpuData = [...(state.cpuLineChartInfo || []), action.payload];
      if (newCpuData.length > MAX_DATA_POINTS) {
        newCpuData.shift();
      }
      return {
        ...state,
        cpuLineChartInfo: newCpuData,
        lastUpdateTime: Date.now()
      };
    }

    case 'UPDATE_CPU_PIE_DATA':
      return {
        ...state,
        cpuPieChartInfo: action.payload,
        lastUpdateTime: Date.now()
      };

    case 'UPDATE_DISK_DATA':
      return {
        ...state,
        diskChartInfo: action.payload,
        lastUpdateTime: Date.now()
      };

    case 'UPDATE_NETWORK_LINE_DATA': {
      const newNetworkData = [...(state.networkTwoLineChartInfo || []), action.payload];
      if (newNetworkData.length > MAX_DATA_POINTS) {
        newNetworkData.shift();
      }
      return {
        ...state,
        networkTwoLineChartInfo: newNetworkData,
        lastUpdateTime: Date.now()
      };
    }

    case 'UPDATE_MEMORY_SINGLE_DATA': {
      const newMemoryData = [...(state.memorySingleChartInfo || []), action.payload];
      if (newMemoryData.length > MAX_DATA_POINTS) {
        newMemoryData.shift();
      }
      return {
        ...state,
        memorySingleChartInfo: newMemoryData,
        lastUpdateTime: Date.now()
      };
    }

    case 'UPDATE_NETWORK_AREA_DATA': {
      const newNetworkAreaData = [...(state.networkAreaChartInfo || []), action.payload];
      if (newNetworkAreaData.length > MAX_DATA_POINTS) {
        newNetworkAreaData.shift();
      }
      return {
        ...state,
        networkAreaChartInfo: newNetworkAreaData,
        lastUpdateTime: Date.now()
      };
    }

    case 'UPDATE_MEMORY_USAGE_DATA': {
      const newMemoryUsageData = [...(state.memoryUsageChartInfo || []), action.payload];
      if (newMemoryUsageData.length > MAX_DATA_POINTS) {
        newMemoryUsageData.shift();
      }
      return {
        ...state,
        memoryUsageChartInfo: newMemoryUsageData,
        lastUpdateTime: Date.now()
      };
    }

    case 'LOAD_PERSISTED_DATA':
      return action.payload;

    case 'CLEAR_DATA':
      return generateInitialMockData();

    default:
      return state;
  }
};

// Context 创建
const DashboardContext = createContext<DashboardContextType | null>(null);

// Provider 组件
export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 初始化状态，尝试从本地存储加载
  const getInitialState = (): DashboardState => {
    const persisted = loadFromStorage();
    if (persisted) {
      return persisted;
    }
    return generateInitialMockData();
  };

  const [state, dispatch] = useReducer(dashboardReducer, undefined, getInitialState);

  // 自动保存到本地存储
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveToStorage(state);
    }, 1000); // 防抖，1秒后保存

    return () => clearTimeout(timeoutId);
  }, [state]);

  const contextValue = useMemo(() => ({
    state,
    dispatch
  }), [state]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};

// Hook 用于使用 Context
export const useDashboardContext = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within a DashboardProvider');
  }
  return context;
};

export { DashboardContext };
export type { DashboardState, DashboardAction, DashboardContextType }; 