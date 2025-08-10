import useCauseService from "@/services/useCauseService";
import type { CauseReport } from "@/services/useCauseService/type";
import { useEffect, useState } from "react";
export interface CauseReportFull extends CauseReport {
  preview_url: string,
}

const useReport = () => {
  const { getCauseReportSummaryByDay } = useCauseService();
  const [dailyReport, setDailyReport] = useState<CauseReportFull[] | undefined>(undefined);
  const getAllCauseReport = async () => {
    return getCauseReportSummaryByDay().then(res => setDailyReport(prev => {
      const newList = [...(prev || []), ...res.data];
      return newList.map(item => ({
        ...item,
        preview_url: `${import.meta.env.VITE_API_FULL_URL}${import.meta.env.VITE_API_UPLOAD_URL}/${item.date.split('-').join('_')}.pdf`,
      }));
    }));
  }

  useEffect(() => {
    getAllCauseReport();
  }, []);

  useEffect(() => {
    console.log(dailyReport)
  }, [dailyReport])

  return {
    dailyReport
  }
}

export default useReport;