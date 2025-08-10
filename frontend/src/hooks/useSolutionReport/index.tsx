import useSolutionService from "@/services/useSolutionService";
import type { RepairReport } from "@/services/useSolutionService/type";
import { useEffect, useState } from "react";

export interface SolutionReportFull extends RepairReport {
  preview_url: string
}

const useSolutionReport = () => {
  const { getSolutionReport } = useSolutionService();
  const [solutionReports, setSolutionReports] = useState<SolutionReportFull[] | undefined>(undefined);

  const getAllSolutionReports = async () => {
    return getSolutionReport().then(res => setSolutionReports(prev => {
      const newList = [...(prev || []), ...res.data];
      return newList.map(item => ({
        ...item,
        preview_url: `${import.meta.env.VITE_API_FULL_URL}${import.meta.env.VITE_API_UPLOAD_SOLUTION_URL}/solution_${item.created_at?.split(' ')[0]?.split('-').join('_')}.pdf`
      }));
    }));
  }
  
  useEffect(() => {
    getAllSolutionReports();
  }, [])
  return {
    solutionReports,
    getAllSolutionReports
  }
}

export default useSolutionReport; 