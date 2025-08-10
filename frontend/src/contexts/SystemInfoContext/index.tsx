import type { SystemInfo } from "@/services/useSystemInfoService/type"
import type { SystemInfoAction, AnomalyDetectionState } from "./type"
import { createContext, useMemo, useReducer } from "react"

interface ISystemInfoContext {
  state: Partial<SystemInfo> & { anomalyDetection: AnomalyDetectionState },
  dispatch: React.Dispatch<SystemInfoAction>
}

export const SystemInfoContext = createContext<ISystemInfoContext>({
  state: {
    anomalyDetection: {
      isDetecting: false,
      currentAnomalyId: 0,
      riskLevel: null
    }
  },
  dispatch: () => { }
});

// 根据 risk_score 判断风险级别的函数（仿照Dashboard）
const getRiskLevel = (score?: number): 'high' | 'medium' | 'low' | null => {
  if (score === undefined) return null;

  if (score > 0.75) {
    return 'high'; // 高危
  } else if (score >= 0.35) {
    return 'medium'; // 一般
  } else {
    return 'low'; // 轻微
  }
};

const systemReducer = (
  state: Partial<SystemInfo> & { anomalyDetection: AnomalyDetectionState },
  action: SystemInfoAction
): Partial<SystemInfo> & { anomalyDetection: AnomalyDetectionState } => {
  switch (action.type) {
    case 'Init_State':
      return {
        ...action.payload,
        anomalyDetection: {
          isDetecting: false,
          currentAnomalyId: action.payload.anomaly_id || 0,
          currentRiskScore: action.payload.risk_score,
          riskLevel: getRiskLevel(action.payload.risk_score),
          lastDetectionTime: new Date().toISOString()
        }
      }
    case 'Update_State': {
      const updatedSystemInfo = { ...state, ...action.payload };
      return {
        ...updatedSystemInfo,
        anomalyDetection: {
          ...state.anomalyDetection,
          isDetecting: false,
          currentAnomalyId: action.payload.anomaly_id || 0,
          currentRiskScore: action.payload.risk_score,
          riskLevel: getRiskLevel(action.payload.risk_score),
          lastDetectionTime: new Date().toISOString(),
          detectionError: undefined // 清除之前的错误
        }
      }
    }
    case 'Update_Anomaly_Detection':
      return {
        ...state,
        anomalyDetection: {
          ...state.anomalyDetection,
          isDetecting: false,
          currentAnomalyId: action.payload.anomalyId,
          currentRiskScore: action.payload.riskScore,
          riskLevel: getRiskLevel(action.payload.riskScore),
          lastDetectionTime: new Date().toISOString(),
          detectionError: undefined
        }
      }
    case 'Set_Detection_Error':
      return {
        ...state,
        anomalyDetection: {
          ...state.anomalyDetection,
          isDetecting: false,
          detectionError: action.payload
        }
      }
    case 'Clear_Detection_Error':
      return {
        ...state,
        anomalyDetection: {
          ...state.anomalyDetection,
          detectionError: undefined
        }
      }
    default:
      return state;
  }
}

export const SystemInfoProvider = ({ children }: { children: React.ReactNode }) => {
  // 使用 useReducer 管理状态，初始化异常检测状态
  const [state, dispatch] = useReducer(systemReducer, {
    anomalyDetection: {
      isDetecting: false,
      currentAnomalyId: 0,
      riskLevel: null
    }
  } as Partial<SystemInfo> & { anomalyDetection: AnomalyDetectionState });

  // 使用 useMemo 缓存上下文
  const contextValue = useMemo<ISystemInfoContext>(() => ({
    state,
    dispatch
  }), [state]); // state 变化时，重新计算 contextValue

  return (
    <SystemInfoContext.Provider value={contextValue}>
      {children}
    </SystemInfoContext.Provider>
  )
}