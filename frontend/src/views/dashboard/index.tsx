/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, type FC, useMemo, useState, useContext, useCallback } from "react";
import SystemLayout from "../../components/SystemLayout";
import './index.less';
import { Flex, message, Progress, Segmented, Spin } from "antd";
import { AppstoreOutlined, FormOutlined, SyncOutlined, UserOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import HoverBoard, { HoverBoardCPU, HoverBoardDisk, HoverBoardMemory } from "../../components/HoverBoard";
import useDashBoard from "../../hooks/useDashBoard";
import '@/components/HoverBoard/index.less'
import {
  CPULineChart,
  CPUPieChart,
  MemoryChart,
  MemoryUsageChart,
  NetworkLineChart,
  NetworkAreaChart,
  DiskChart
} from "@/components/Charts";
import DashBoardDrawer from "@/components/DashBoardDrawer";
import { SystemInfoContext } from "@/contexts/SystemInfoContext";
import useAnomalyDetection from "@/hooks/useAnomalyDetection";
import useSystemInfoService from "@/services/useSystemInfoService";

// 定义异常数据接口 - 与DashBoardDrawer保持一致
interface AnomalyItem {
  anomaly_id: number;  // 异常ID，用于映射到AnomalyType (0代表正常，1-10对应异常类型)
  score: number;       // 异常分数，用于计算风险等级
  current_status?: string;
  detail_analysis?: string;
  index?: number;
  timestamp?: number;  // 添加时间戳
  risk_level?: 'high' | 'medium' | 'low';  // 添加风险级别
}

// 异常类型映射
const AnomalyTypeMap: { [key: number]: string } = {
  1: "负载-进程矛盾",
  2: "CPU 中断风暴消耗内存",
  3: "流量激增",
  4: "网络断开",
  5: "CPU杀手进程",
  6: "进程内存占用异常",
  7: "内存泄漏",
  8: "swap 过度使用",
  9: "磁盘空间不足",
  10: "磁盘io故障"
};

// 根据异常类型和系统数据生成详细信息
const generateAnomalyDetails = (anomalyType: string, systemState: any) => {
  const { cpu_info, memory_info, disk_info } = systemState;

  switch (anomalyType) {
    case "负载-进程矛盾":
      return {
        current_status: "系统负载与进程数量不匹配",
        detail_analysis: "当前系统负载异常，进程数量与负载不成正比，可能存在进程调度问题",
        risk_level: "中危"
      };

    case "CPU 中断风暴消耗内存":
      return {
        current_status: `CPU中断频繁，内存使用率: ${memory_info?.memory_percent?.toFixed(2) || 'N/A'}%`,
        detail_analysis: "系统出现大量中断请求，导致内存消耗异常增加，可能影响系统性能",
        risk_level: "高危"
      };

    case "流量激增":
      return {
        current_status: "网络流量出现异常激增",
        detail_analysis: "检测到网络流量突然大幅增加，可能存在异常网络活动或DDoS攻击",
        risk_level: "高危"
      };

    case "网络断开":
      return {
        current_status: "网络连接异常断开",
        detail_analysis: "系统网络连接不稳定或完全断开，影响正常网络通信",
        risk_level: "高危"
      };

    case "CPU杀手进程":
      return {
        current_status: `CPU使用率: ${cpu_info?.cpu_percent?.toFixed(2) || 'N/A'}%`,
        detail_analysis: "检测到异常进程占用大量CPU资源，可能是恶意进程或程序异常",
        risk_level: cpu_info?.cpu_percent > 90 ? "高危" : "中危"
      };

    case "进程内存占用异常":
      return {
        current_status: `内存使用率: ${memory_info?.memory_percent?.toFixed(2) || 'N/A'}%`,
        detail_analysis: "某些进程占用异常大量内存，可能存在内存泄漏或恶意行为",
        risk_level: memory_info?.memory_percent > 95 ? "高危" : "中危"
      };

    case "内存泄漏":
      return {
        current_status: `内存持续增长，当前使用率: ${memory_info?.memory_percent?.toFixed(2) || 'N/A'}%`,
        detail_analysis: "检测到内存使用量持续增长而不释放，存在内存泄漏风险",
        risk_level: "中危"
      };

    case "swap 过度使用":
      return {
        current_status: "虚拟内存使用率过高",
        detail_analysis: "系统大量使用swap空间，物理内存不足，严重影响系统性能",
        risk_level: "中危"
      };

    case "磁盘空间不足": {
      const criticalDisk = disk_info?.find((disk: any) => disk.disk_percent > 90);
      return {
        current_status: criticalDisk
          ? `磁盘${criticalDisk.device}使用率: ${criticalDisk.disk_percent?.toFixed(2)}%`
          : "磁盘空间不足",
        detail_analysis: "磁盘空间严重不足，可能影响系统正常运行和数据写入",
        risk_level: criticalDisk?.disk_percent > 95 ? "高危" : "中危"
      };
    }

    case "磁盘io故障":
      return {
        current_status: "磁盘I/O响应异常",
        detail_analysis: "磁盘读写操作响应缓慢或出现错误，可能存在硬件故障",
        risk_level: "高危"
      };

    default:
      return {
        current_status: "未知异常类型",
        detail_analysis: "检测到异常但类型未识别，建议进一步调查",
        risk_level: "中危"
      };
  }
};

const DashBoard: FC = () => {
  // ---------------- 仪表板状态栏数据渲染 ---------------------------
  // 获取系统信息 - 直接解构使用
  const { state, dispatch } = useContext(SystemInfoContext);
  const { getSystemInfo } = useSystemInfoService();

  // 使用异常检测hook获取异常相关状态（不启用通知，避免与全局通知重复）
  const {
    anomalyId,
    riskScore,
    riskLevel: currentRiskLevel
  } = useAnomalyDetection({ enableNotification: false });

  // 直接从 state 中解构获取数据，避免不必要的 useState
  const cpuInfo = state?.cpu_info;
  const memoryInfo = state?.memory_info;
  const diskInfo = state?.disk_info;
  const processInfo = state?.process_info;

  // 持久化存储的key
  const ANOMALIES_STORAGE_KEY = 'dashboard_anomalies_history';

  // 从localStorage读取异常历史记录
  const loadAnomaliesFromStorage = (): AnomalyItem[] => {
    try {
      const stored = localStorage.getItem(ANOMALIES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AnomalyItem[];
        const now = Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        // 过滤掉过期的异常（超过5分钟）
        return parsed.filter(anomaly =>
          anomaly.timestamp && (now - anomaly.timestamp) < fiveMinutes
        );
      }
    } catch (error) {
      console.error('读取异常历史记录失败:', error);
    }
    return [];
  };

  // 保存异常历史记录到localStorage
  const saveAnomaliesToStorage = useCallback((anomalies: AnomalyItem[]) => {
    try {
      localStorage.setItem(ANOMALIES_STORAGE_KEY, JSON.stringify(anomalies));
    } catch (error) {
      console.error('保存异常历史记录失败:', error);
    }
  }, [ANOMALIES_STORAGE_KEY]);

  // 添加异常历史记录状态，初始化时从localStorage读取
  const [anomaliesHistory, setAnomaliesHistory] = useState<AnomalyItem[]>(() =>
    loadAnomaliesFromStorage()
  );

  // 当检测到新异常时，添加到历史记录中
  useEffect(() => {
    if (anomalyId && anomalyId !== 0 && riskScore !== undefined) {
      const anomalyType = AnomalyTypeMap[anomalyId];

      if (currentRiskLevel && anomalyType) {
        const details = generateAnomalyDetails(anomalyType, state);
        const newAnomaly: AnomalyItem = {
          anomaly_id: anomalyId,
          score: riskScore,
          current_status: details.current_status,
          detail_analysis: details.detail_analysis,
          index: anomalyId,
          timestamp: Date.now(),
          risk_level: currentRiskLevel
        };

        setAnomaliesHistory(prev => {
          // 检查是否已存在相同的异常（避免重复添加）
          const exists = prev.some(item =>
            item.anomaly_id === anomalyId &&
            Math.abs(item.timestamp! - newAnomaly.timestamp!) < 5000 // 5秒内的相同异常视为重复
          );

          if (!exists) {
            const updated = [...prev, newAnomaly];
            // 可选：限制历史记录数量，保留最近的50条
            const finalUpdated = updated.slice(-50);
            // 保存到localStorage
            saveAnomaliesToStorage(finalUpdated);
            return finalUpdated;
          }
          return prev;
        });
      }
    }
  }, [anomalyId, riskScore, currentRiskLevel, state, saveAnomaliesToStorage]);

  // 基于异常历史计算各级别的数量
  const riskCounts = useMemo(() => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000; // 5分钟过期时间

    // 过滤出最近5分钟内的异常
    const recentAnomalies = anomaliesHistory.filter(anomaly =>
      anomaly.timestamp && (now - anomaly.timestamp) < fiveMinutes
    );

    // 计算各级别数量
    const counts = { high: 0, medium: 0, low: 0 };
    recentAnomalies.forEach(anomaly => {
      if (anomaly.risk_level) {
        counts[anomaly.risk_level]++;
      }
    });

    return counts;
  }, [anomaliesHistory]);

  // 页面卸载时保存数据
  useEffect(() => {
    return () => {
      saveAnomaliesToStorage(anomaliesHistory);
    };
  }, [anomaliesHistory, saveAnomaliesToStorage]);

  // ----------------------- 异常数据生成逻辑 ---------------------------
  // 根据异常历史生成抽屉中展示的数据
  const generateAnomalyData = useMemo((): AnomalyItem[] => {
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;

    // 返回最近5分钟内的所有异常
    return anomaliesHistory.filter(anomaly =>
      anomaly.timestamp && (now - anomaly.timestamp) < fiveMinutes
    ).sort((a, b) => (b.timestamp! - a.timestamp!)); // 按时间倒序排列
  }, [anomaliesHistory]);

  // 获取风险级别的颜色和文本
  const getRiskLevelDisplay = (level: string, count: number) => {
    // 根据数量动态计算宽度，最小20%，每增加1个异常增加20%宽度，最大100%
    const dynamicWidth = count > 0 ? Math.min(20 + count * 20, 100) : 10; // 没有数据时保持最小宽度10%

    switch (level) {
      case 'high':
        return { text: '严重异常', color: '#ff4d4f', width: `${dynamicWidth}%` };
      case 'medium':
        return { text: '一般异常', color: '#faad14', width: `${dynamicWidth}%` };
      case 'low':
        return { text: '轻微异常', color: '#52c41a', width: `${dynamicWidth}%` };
      default:
        return { text: '', color: '', width: '0%' };
    }
  };

  const {
    cpuLineChartInfo,
    diskChartInfo,
    networkTwoLineChartInfo,
    memorySingleChartInfo,
    networkAreaChartInfo,
    memoryUsageChartInfo
  } = useDashBoard();
  // 仪表板状态渲染数据
  const [statusRenderArray, setStatusRenderArray] = useState<({
    label: string,
    percent: number,
    details?: string,
    [property: string]: any
  } | undefined)[]>([{
    label: 'CPU 使用率',
    percent: 0,
  }, {
    label: '内存使用率',
    percent: 0
  }]);

  // memo 缓存未改变的渲染内容
  useMemo(() => {
    if (diskInfo === undefined || cpuInfo === undefined || memoryInfo === undefined) return;
    console.log(diskInfo[0].used_disk_gb)
    const diskInfos = diskInfo.map(item => ({
      label: item.device,
      percent: item.disk_percent || 0,
      details: `${item.used_disk_gb.toFixed(2)}/${item.total_disk_gb.toFixed(2)} (GB)`
    }))


    setStatusRenderArray([{
      label: 'CPU 使用率',
      percent: cpuInfo.cpu_percent || 0,
      details: `${cpuInfo.cpu_count} 核心`
    }, {
      label: '内存使用率',
      percent: memoryInfo.memory_percent || 0,
      details: `${memoryInfo.used_memory_gb.toFixed(2)}/${memoryInfo.total_memory_gb.toFixed(2)} (GB)`
    },
    ...diskInfos
    ])
  }, [cpuInfo, diskInfo, memoryInfo]);

  // ------------------------------------------------------------

  /**
   * ---------------状态 hover 白板逻辑----------------
   * */
  const [hoverBoardVisible, setHoverBoardVisible] = useState(false);
  const [hoverBoardTop, setHoverBoardTop] = useState(0);
  const [hoverBoardLeft, setHoverBoardLeft] = useState(0);

  // 白板渲染项
  const [hoverBoardRenderItem, setHoverBoardRenderItem] = useState<React.ReactNode | undefined>(undefined);
  const sourceContainerRef = useRef<HTMLDivElement | null>(null);
  const hoverBoardRef = useRef<HTMLDivElement | null>(null);
  const [targetContainerRef, setTargetContainerRef] = useState<React.RefObject<HTMLDivElement | null> | null>(null);
  const ref1 = useRef<HTMLDivElement | null>(null);
  const ref2 = useRef<HTMLDivElement | null>(null);
  const ref3 = useRef<HTMLDivElement | null>(null);
  const ref4 = useRef<HTMLDivElement | null>(null);
  const ref5 = useRef<HTMLDivElement | null>(null);

  // 获取白板位置函数
  const getHoverBoardPosition = (targetContainer: HTMLDivElement, sourceContainer: HTMLDivElement) => {
    if (!hoverBoardRef.current) return;
    const targetRect = targetContainer.getBoundingClientRect();
    const sourceRect = sourceContainer.getBoundingClientRect();

    // Top: 目标元素底部位置 + 间距
    let Top = targetRect.bottom - sourceRect.top;

    // Left: 目标元素左边界相对于源容器的位置
    let Left = targetRect.left - sourceRect.left;

    // HoverBoard 的宽度（默认 360px）
    const hoverBoardWidth = hoverBoardRef.current.clientWidth;

    // 检查右边是否超出屏幕
    const absoluteLeft = targetRect.left;
    const rightBoundary = absoluteLeft + hoverBoardWidth;

    if (rightBoundary > window.innerWidth) {
      // 如果超出屏幕，设置为距离屏幕右边 30px
      Left = window.innerWidth - hoverBoardWidth - 30 - sourceRect.left;
    }

    // 检查下面是否超出屏幕
    const absoluteTop = targetRect.top;
    const bottomBoundary = absoluteTop + hoverBoardRef.current.clientHeight;
    if (bottomBoundary > window.innerHeight) {
      // 如果超出屏幕，设置为距离屏幕下边 30px
      Top = window.innerHeight - hoverBoardRef.current.clientHeight - 30 - sourceRect.top;
    }

    setHoverBoardTop(Top);
    setHoverBoardLeft(Left);
  }

  // 白板鼠标移入执行函数
  const OnMouseEnter = (ref: React.RefObject<HTMLDivElement | null> | null) => {
    if (ref && ref.current) {
      setTargetContainerRef(ref);
      setHoverBoardVisible(true);
    }
  }

  // 白板鼠标移出执行函数
  const OnMouseLeave = () => {
    setHoverBoardVisible(false);
    setTargetContainerRef(null);
  }

  // 不同仪表板切换后应该执行什么
  useEffect(() => {
    if (!sourceContainerRef.current || !targetContainerRef || !targetContainerRef.current) {
      return;
    }
    getHoverBoardPosition(targetContainerRef.current, sourceContainerRef.current);

    // 根据 ref 类型判断白板渲染项
    switch (targetContainerRef) {
      case ref1:
        setHoverBoardRenderItem(() => HoverBoardCPU({ cpuInfo }));
        break;
      case ref2:
        setHoverBoardRenderItem(HoverBoardMemory({ memoryInfo }));
        break;
      case ref3:
        setHoverBoardRenderItem(HoverBoardDisk({ diskInfo: diskInfo?.[0] }));
        break;
      case ref4:
        setHoverBoardRenderItem(HoverBoardDisk({ diskInfo: diskInfo?.[1] }));
        break;
      case ref5:
        setHoverBoardRenderItem(HoverBoardDisk({ diskInfo: diskInfo?.[2] }));
        break;
      default:
        return;
    }
  }, [sourceContainerRef, targetContainerRef, cpuInfo, memoryInfo, diskInfo]);

  // ----------------------------------------------------------------

  // ------------------------图表切换逻辑-------------------------------
  const [cpuChartType, setCpuChartType] = useState('CPU 利用率');
  const [memoryChartType, setMemoryChartType] = useState('实时内存使用监控');
  const [networkChartType, setNetworkChartType] = useState('实时网络监控');

  // -----------------------------------------------------------------

  // ------------------------侧边抽屉逻辑-------------------------------
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const clickFlexCloseDrawer = () => {
    if (isDrawerOpen) {
      setIsDrawerOpen(false);
      // DONE: 暂时留一个报错标记，应当封装为一个函数
    }
  }

  // -----------------------------------------------------------------

  // ------------------------进程表格排序逻辑-------------------------------
  type SortField = 'pid' | 'cpu_percent' | 'memory_percent' | 'name';
  type SortOrder = 'asc' | 'desc';

  const [sortField, setSortField] = useState<SortField>('pid');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 处理表头点击排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // 如果点击的是当前排序字段，切换排序方向
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 如果点击的是新字段，设置为该字段并默认升序
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // 排序图标渲染函数
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return null;
    }
    return sortOrder === 'asc' ? (
      <CaretUpOutlined style={{ marginLeft: 4, fontSize: 12 }} />
    ) : (
      <CaretDownOutlined style={{ marginLeft: 4, fontSize: 12 }} />
    );
  };

  // 排序后的进程信息
  const sortedProcessInfo = useMemo(() => {
    if (!processInfo) return [];

    return processInfo
      .filter(item => item.pid !== 0)
      .sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case 'pid':
            aValue = a.pid;
            bValue = b.pid;
            break;
          case 'cpu_percent':
            aValue = a.cpu_percent;
            bValue = b.cpu_percent;
            break;
          case 'memory_percent':
            aValue = a.memory_percent;
            bValue = b.memory_percent;
            break;
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          default:
            return 0;
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      }).slice(0, 10);
  }, [processInfo, sortField, sortOrder]);

  // -----------------------------------------------------------------
  // 如果 state 为空，显示加载状态
  if (!state) {
    return (
      <SystemLayout>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          flexDirection: 'column',
          marginTop: '20%',
        }}>
          <Spin size="large" />
          <div style={{ marginTop: 16, color: '#666' }}>正在加载系统信息...</div>
        </div>
      </SystemLayout>
    );
  }
  return (
    <SystemLayout>
      {/* 悬浮白板 */}
      <HoverBoard
        renderItem={hoverBoardRenderItem}
        ref={hoverBoardRef}
        onMouseEnter={() => OnMouseEnter(targetContainerRef)}
        onMouseLeave={OnMouseLeave}
        open={hoverBoardVisible}
        top={hoverBoardTop}
        left={hoverBoardLeft}
        width={450}
      />
      {/* 主体部分 */}
      <Flex
        ref={sourceContainerRef}
        gap="middle"
        vertical
        onClick={clickFlexCloseDrawer}
        className="dashboard-wrapper">
        {/* 侧边抽屉 */}
        <DashBoardDrawer
          open={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          getContainer={sourceContainerRef.current!}
          data={generateAnomalyData}
        />
        {/* 顶部信息栏 */}
        <div className="dashboard-info">
          <div className="dashboard-info-left">
            <div className="dashboard-info-left-item">
              <UserOutlined className="dashboard-info-left-item-icon" /> 19812312233
            </div>
            <div className="dashboard-info-left-item">
              <FormOutlined className="dashboard-info-left-item-icon" /> TODO-List
            </div>
          </div>
          <div className="dashboard-info-right">
            <SyncOutlined className="dashboard-info-left-item-icon" onClick={async () => {
              const hide = message.loading('刷新中……')
              try {
                const res = await getSystemInfo();
                const systemInfo = res.data;
                if (!systemInfo) return;
                hide(); // 隐藏loading消息
                message.success('刷新完成！')
                dispatch({
                  type: 'Update_State',
                  payload: systemInfo
                });
              } catch (error) {
                hide(); // 出错时也要隐藏loading消息
                message.error('刷新失败');
                console.error(error);
              }
            }} />
          </div>
        </div>
        <Flex
          gap="middle"
          vertical
          className="dashboard-content">
          {/* 状态栏展示 警告图表*/}
          <div className="dashboard-overview-wrapper">
            <div className="dashboard-overview dashboard-card">
              <h3 className="dashboard-overview-h3">
                <AppstoreOutlined style={{ fontSize: 24 }} /> 状态
              </h3>
              <div className="dashboard-overview-content">
                {
                  statusRenderArray.map((item, index) => {
                    const refs = [ref1, ref2, ref3, ref4, ref5];
                    return (
                      item && (
                        <div
                          key={index}
                          className="dashboard-overview-content-item"
                        >
                          <div className="dashboard-overview-content-item-title">
                            {item.label}
                          </div>
                          <div
                            className="dashboard-overview-content-item-content"
                            onMouseLeave={OnMouseLeave}
                            onMouseEnter={() => OnMouseEnter(refs[index])}
                            ref={refs[index]}
                          >
                            <Progress
                              type="circle"
                              percent={item.percent}
                              strokeColor="#20A53A"
                              size={100}
                              style={{ cursor: 'pointer' }}
                              format={(value) => (
                                <span
                                  style={{
                                    color: '#20A53A',
                                    fontSize: 20
                                  }}>
                                  {value}%
                                </span>
                              )}
                              className="dashboard-overview-content-item-progress" />
                            <div className="dashboard-overview-content-item-footer">
                              {item.details}
                            </div>
                          </div>
                        </div>
                      )
                    )
                  })
                }

              </div>
            </div>
            <div className="dashboard-overview-chart">
              <div className="dashboard-overview-chart-wrapper">
                {/* 高危风险显示 */}
                <div
                  style={{
                    width: getRiskLevelDisplay('high', riskCounts.high).width,
                    backgroundColor: getRiskLevelDisplay('high', riskCounts.high).color,
                    height: '50px'
                  }}
                  className="dashboard-overview-chart-item hard"
                  onClick={() => setIsDrawerOpen(true)}>
                  {getRiskLevelDisplay('high', riskCounts.high).text}：{riskCounts.high}
                </div>
                {/* 中危风险显示 */}
                <div
                  style={{
                    width: getRiskLevelDisplay('medium', riskCounts.medium).width,
                    backgroundColor: getRiskLevelDisplay('medium', riskCounts.medium).color
                  }}
                  className="dashboard-overview-chart-item middle"
                  onClick={() => setIsDrawerOpen(true)}>
                  {getRiskLevelDisplay('medium', riskCounts.medium).text}：{riskCounts.medium}
                </div>
                {/* 低危风险显示 */}
                <div
                  style={{
                    width: getRiskLevelDisplay('low', riskCounts.low).width,
                    backgroundColor: getRiskLevelDisplay('low', riskCounts.low).color
                  }}
                  className="dashboard-overview-chart-item light"
                  onClick={() => setIsDrawerOpen(true)}>
                  {getRiskLevelDisplay('low', riskCounts.low).text}：{riskCounts.low}
                </div>
              </div>
            </div>
          </div>
          {/* 图表信息展示 */}
          <div className="dashboard-charts" >
            <div className="dashboard-charts-column">
              <div className="dashboard-charts-item dashboard-card">
                <header className="dashboard-charts-item-header">
                  <div className="dashboard-charts-item-header-left">
                    <AppstoreOutlined style={{ fontSize: 22 }} />
                    <span>CPU</span>
                  </div>
                  <Segmented
                    options={['CPU 利用率', 'CPU利用率占比分布']}
                    value={cpuChartType}
                    onChange={setCpuChartType}
                    className="dashboard-charts-item-header-right"
                  />
                </header>
                <div className="dashboard-charts-item-content">
                  {cpuChartType === 'CPU 利用率' ? (
                    <CPULineChart
                      data={cpuLineChartInfo}
                      height={450} />
                  ) : (
                    <CPUPieChart
                      data={processInfo}
                      height={450} />
                  )}
                </div>
              </div>
              <div className="dashboard-charts-item dashboard-card">
                <header className="dashboard-charts-item-header">
                  <div className="dashboard-charts-item-header-left">
                    <AppstoreOutlined style={{ fontSize: 22 }} />
                    <span>内存</span>
                  </div>
                  <Segmented
                    options={['实时内存使用监控', '内存使用率']}
                    value={memoryChartType}
                    onChange={setMemoryChartType}
                    className="dashboard-charts-item-header-right"
                  />
                </header>
                <div className="dashboard-charts-item-content">
                  {memoryChartType === '实时内存使用监控' ? (
                    <MemoryUsageChart
                      data={memoryUsageChartInfo}
                      height={350} />
                  ) : (
                    <MemoryChart
                      data={memorySingleChartInfo}
                      height={350} />
                  )}
                </div>
              </div>
            </div>
            <div className="dashboard-charts-column">
              <div className="dashboard-charts-item dashboard-card">
                <header className="dashboard-charts-item-header">
                  <div className="dashboard-charts-item-header-left">
                    <AppstoreOutlined
                      style={{ fontSize: 22 }} />
                    <span>磁盘 I/O</span>
                  </div>
                  <Segmented
                    options={['磁盘信息概览']}
                    className="dashboard-charts-item-header-right"
                  />
                </header>
                <div className="dashboard-charts-item-content">
                  <DiskChart height={350} data={diskChartInfo} />
                </div>
              </div>
              <div className="dashboard-charts-item dashboard-card">
                <header className="dashboard-charts-item-header">
                  <div className="dashboard-charts-item-header-left">
                    <AppstoreOutlined style={{ fontSize: 22 }} />
                    <span>网络 I/O</span>
                  </div>
                  <Segmented
                    options={['实时网络监控', '网络速率监控']}
                    value={networkChartType}
                    onChange={setNetworkChartType}
                    className="dashboard-charts-item-header-right"
                  />
                </header>
                <div className="dashboard-charts-item-content">
                  {networkChartType === '实时网络监控' ? (
                    <NetworkLineChart
                      data={networkTwoLineChartInfo}
                      height={450} />
                  ) : (
                    <NetworkAreaChart height={450} data={networkAreaChartInfo} />
                  )}
                </div>
              </div>
            </div>
            <div className="dashboard-charts-item"></div>
          </div>
          {/* 进程表格展示 */}
          <div className="dashboard-table dashboard-card">
            <header className="dashboard-table-header">
              <div className="dashboard-table-header-left">
                <AppstoreOutlined style={{ fontSize: 22 }} />
                <span>进程</span>
              </div>
              <div className="dashboard-table-header-right">
                <SyncOutlined className="dashboard-info-left-item-icon" onClick={async () => {
                  const hide = message.loading('刷新中……')
                  try {
                    const res = await getSystemInfo();
                    const systemInfo = res.data;
                    if (!systemInfo) return;
                    hide(); // 隐藏loading消息
                    message.success('刷新完成！')
                    dispatch({
                      type: 'Update_State',
                      payload: systemInfo
                    });
                  } catch (error) {
                    hide(); // 出错时也要隐藏loading消息
                    message.error('刷新失败');
                    console.error(error);
                  }
                }} />
              </div>
            </header>
            <table className="dashboard-table-content">
              <thead className="dashboard-table-content-title">
                <tr className="dashboard-table-content-tr">
                  <td
                    className="dashboard-table-content-td dashboard-table-content-td-name dashboard-table-content-td-sortable"
                    onClick={() => handleSort('name')}
                  >
                    进程名称
                    {renderSortIcon('name')}
                  </td>
                  <td
                    className="dashboard-table-content-td dashboard-table-content-td-sortable"
                    onClick={() => handleSort('pid')}
                  >
                    PID
                    {renderSortIcon('pid')}
                  </td>
                  <td
                    className="dashboard-table-content-td dashboard-table-content-td-sortable"
                    onClick={() => handleSort('cpu_percent')}
                  >
                    CPU（%）
                    {renderSortIcon('cpu_percent')}
                  </td>
                  <td
                    className="dashboard-table-content-td dashboard-table-content-td-sortable"
                    onClick={() => handleSort('memory_percent')}
                  >
                    内存（%）
                    {renderSortIcon('memory_percent')}
                  </td>
                </tr>
              </thead>
              <tbody>
                {
                  sortedProcessInfo.map((item) => (
                    <tr
                      key={item.pid}
                      className="dashboard-table-content-tr">
                      <td className="dashboard-table-content-td dashboard-table-content-td-name">
                        {item.name}
                      </td>
                      <td className="dashboard-table-content-td">
                        {item.pid}
                      </td>
                      <td className="dashboard-table-content-td">
                        {item.cpu_percent.toFixed(2)}
                      </td>
                      <td className="dashboard-table-content-td">
                        {item.memory_percent.toFixed(2)}
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </Flex>
      </Flex>
    </SystemLayout>
  )
}

export default DashBoard;