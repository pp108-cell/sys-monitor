import useSolutionService from "@/services/useSolutionService";
import type { RepairReport } from "@/services/useSolutionService/type";
import { useEffect, useState } from "react";

const useRepairReport = () => {
  const [repairReport, setRepairReport] = useState<RepairReport[] | undefined>(undefined);
  const {
    getSolutionReport,
  } = useSolutionService();

  const getAllSolutionReport = async () => {
    return getSolutionReport().then(res => {
      console.log(res);
      setRepairReport(res as unknown as RepairReport[])
      return res;
    });
  }

  useEffect(() => {
    getAllSolutionReport()
  }, []);

  return {
    repairReport
  }
}

export default useRepairReport;