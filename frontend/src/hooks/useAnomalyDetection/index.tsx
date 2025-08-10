import { SystemInfoContext } from "@/contexts/SystemInfoContext";
import { useContext, useEffect } from "react";
import { notification } from "antd";
import { ExclamationCircleOutlined, WarningOutlined, AlertOutlined } from "@ant-design/icons";

// 异常类型映射
const AnomalyTypeMap: { [key: number]: string } = {
  1: "负载-进程矛盾",
  2: "CPU 中断风暴消耗内存",
  3: "流量激增",
  4: "网络断开",
  5: "CPU杀手进程",
  6: "进程内存占用异常",
  7: "内存泄漏",
  8: "swap过度使用",
  9: "磁盘空间不足",
  10: "磁盘io故障"
};

// 风险级别配置
const RiskLevelConfig = {
  high: {
    color: '#ff4d4f',
    text: '高危',
    icon: <AlertOutlined style={{ color: '#ff4d4f' }} />,
    notificationType: 'error' as const
  },
  medium: {
    color: '#faad14',
    text: '中危',
    icon: <WarningOutlined style={{ color: '#faad14' }} />,
    notificationType: 'warning' as const
  },
  low: {
    color: '#52c41a',
    text: '低危',
    icon: <ExclamationCircleOutlined style={{ color: '#52c41a' }} />,
    notificationType: 'info' as const
  }
};

interface UseAnomalyDetectionOptions {
  enableNotification?: boolean; // 是否启用通知功能，默认false
}

export const useAnomalyDetection = (options: UseAnomalyDetectionOptions = {}) => {
  const { enableNotification = false } = options;
  const { state, dispatch } = useContext(SystemInfoContext);

  // 获取当前的异常检测状态
  const anomalyDetection = state.anomalyDetection;

  // 从SystemInfo中获取异常相关数据
  const anomalyId = state.anomaly_id || 0;
  const riskScore = state.risk_score;

  // 手动更新异常检测状态
  const updateAnomalyDetection = (anomalyId: number, riskScore?: number) => {
    dispatch({
      type: 'Update_Anomaly_Detection',
      payload: {
        anomalyId,
        riskScore
      }
    });
  };

  // 设置检测错误
  const setDetectionError = (error: string) => {
    dispatch({
      type: 'Set_Detection_Error',
      payload: error
    });
  };

  // 清除检测错误
  const clearDetectionError = () => {
    dispatch({
      type: 'Clear_Detection_Error'
    });
  };

  // 显示异常通知
  const showAnomalyNotification = (anomalyId: number, riskLevel: 'high' | 'medium' | 'low', detectionTime: string) => {
    const anomalyType = AnomalyTypeMap[anomalyId];
    const riskConfig = RiskLevelConfig[riskLevel];

    if (!anomalyType || !riskConfig) return;

    const formatTime = new Date(detectionTime).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    notification[riskConfig.notificationType]({
      message: '系统异常检测',
      description: (
        <div>
          <div style={{ marginBottom: 8 }}>
            <strong>异常类型：</strong>{anomalyType}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>严重程度：</strong>
            <span style={{ color: riskConfig.color, marginLeft: 4 }}>
              {riskConfig.icon} {riskConfig.text}
            </span>
          </div>
          <div>
            <strong>检测时间：</strong>{formatTime}
          </div>
        </div>
      ),
      placement: 'topRight',
      duration: riskLevel === 'high' ? 0 : 6, // 高危异常不自动关闭
      style: {
        borderLeft: `4px solid ${riskConfig.color}`
      }
    });
  };

  // 监听异常状态变化，自动显示通知（仅在启用通知时）
  useEffect(() => {
    if (!enableNotification) return;

    // 检查是否有新的异常
    if (anomalyId > 0 && anomalyDetection?.riskLevel && anomalyDetection?.lastDetectionTime) {
      // 避免重复通知：检查是否是新的检测结果（基于时间戳）
      const detectionTime = new Date(anomalyDetection.lastDetectionTime).getTime();
      const now = Date.now();

      // 如果检测时间在10秒内，认为是新的异常，显示通知
      if (now - detectionTime < 10000) {
        // 使用setTimeout确保在下一个事件循环中执行，避免状态更新冲突
        setTimeout(() => {
          if (anomalyDetection?.riskLevel && anomalyDetection?.lastDetectionTime) {
            showAnomalyNotification(anomalyId, anomalyDetection.riskLevel, anomalyDetection.lastDetectionTime);
          }
        }, 100);
      }
    }
  }, [enableNotification, anomalyId, anomalyDetection?.riskLevel, anomalyDetection?.lastDetectionTime]);

  return {
    // 状态数据
    anomalyDetection,
    anomalyId,
    riskScore,

    // 操作方法
    updateAnomalyDetection,
    setDetectionError,
    clearDetectionError,
    showAnomalyNotification,

    // 便捷属性
    isNormal: anomalyId === 0,
    hasAnomaly: anomalyId > 0,
    riskLevel: anomalyDetection?.riskLevel,
    isDetecting: anomalyDetection?.isDetecting || false,
    detectionError: anomalyDetection?.detectionError,
    lastDetectionTime: anomalyDetection?.lastDetectionTime
  };
};

export default useAnomalyDetection; 