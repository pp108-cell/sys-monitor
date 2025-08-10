import useCauseService from "@/services/useCauseService";
import useSystemInfoService from "@/services/useSystemInfoService";
import type { SystemInfo } from "@/services/useSystemInfoService/type";
import { useState, useMemo } from "react";

// 统计数据类型
export interface LogStatistics {
  normal: number;
  abnormal: number;
}

const useAbnormal = () => {
  const { getDailySystemInfo, getSystemInfoByDate } = useSystemInfoService();
  const { postDailyCauseReport } = useCauseService();
  // 按照天数选择需要查看的日志，如果没有传递天数参数，则显示全部日志
  const [dailySystemInfo, setDailySystemInfo] = useState<SystemInfo[] | undefined>(undefined);

  // 计算统计数据
  const logStatistics = useMemo((): LogStatistics => {
    if (!dailySystemInfo || dailySystemInfo.length === 0) {
      return { normal: 0, abnormal: 0 };
    }

    const stats = dailySystemInfo.reduce(
      (acc, item) => {
        if (item.anomaly_id > 0) {
          acc.abnormal += 1;
        } else {
          acc.normal += 1;
        }
        return acc;
      },
      { normal: 0, abnormal: 0 }
    );

    return stats;
  }, [dailySystemInfo]);

  const getAllDailySystemInfo = async () => {
    return getDailySystemInfo().then(res => {
      return res.data;
    });
  }

  const selectedDailySystemInfo = async (date: string) => {
    return getSystemInfoByDate(date).then(res => {
      setDailySystemInfo(res.data[0].system_info);
    });
  }

  // 清空dailySystemInfo数据
  const clearDailySystemInfo = () => {
    setDailySystemInfo(undefined);
  }


  // 点击生成报告，根据选择的日期生成检测报告
  const getAllCauseReport = async (date_str: string) => {
    return postDailyCauseReport(date_str).then(res => res.data);
  }

  return {
    dailySystemInfo,
    logStatistics,
    clearDailySystemInfo,
    getAllCauseReport,
    selectedDailySystemInfo,
  }
}

export default useAbnormal;