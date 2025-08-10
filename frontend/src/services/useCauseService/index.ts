import { request, type IResponse } from "../request";
import type { CauseReport } from "./type";

const useCauseService = () => {
  const postDailyCauseReport = (
    date_str: string
  ): Promise<IResponse<CauseReport>> => {
    return request("post", "/causereport/causereport/summary_by_date_full", {
      date_str,
    });
  };

  const getCauseReportSummaryByDay = (): Promise<IResponse<CauseReport[]>> => {
    return request("get", "/causereport/causereport/summary_by_day");
  };

  const uploadPdfReport = (
    file: File
  ): Promise<
    IResponse<{
      file_id: string;
      preview_url: string;
      download_url: string;
      file_name: string;
    }>
  > => {
    const formData = new FormData();
    formData.append("file", file);
    return request("post", "/causereport/causereport/upload_pdf", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  };

  return {
    postDailyCauseReport,
    getCauseReportSummaryByDay,
    uploadPdfReport,
  };
};

export default useCauseService;
