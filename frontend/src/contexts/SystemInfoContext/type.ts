import type { SystemInfo } from "@/services/useSystemInfoService/type";

// 异常检测状态接口
export interface AnomalyDetectionState {
  isDetecting: boolean; // 是否正在检测
  currentAnomalyId: number; // 当前异常ID（0=正常，1-10对应异常类型）
  currentRiskScore?: number; // 当前风险评分
  riskLevel?: "high" | "medium" | "low" | null; // 风险级别
  lastDetectionTime?: string; // 最后检测时间
  detectionError?: string; // 检测错误信息
}

export type SystemInfoAction =
  | {
      type: "Init_State";
      payload: SystemInfo;
    }
  | {
      type: "Update_State";
      payload: SystemInfo;
    }
  | {
      type: "Update_Anomaly_Detection";
      payload: {
        anomalyId: number;
        riskScore?: number;
      };
    }
  | {
      type: "Set_Detection_Error";
      payload: string;
    }
  | {
      type: "Clear_Detection_Error";
    };
