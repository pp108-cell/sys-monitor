import { request, type IResponse } from "../request";
import type { RepairReport, SolutionNote } from "./type";

const useSolutionService = () => {
  const getSolutionReport = (): Promise<IResponse<RepairReport[]>> => {
    return request("get", "/solution/all");
  };

  const postGenerateSolution = (
    report_id: number
  ): Promise<IResponse<RepairReport>> => {
    return request("post", `/solution/generate/${report_id}`);
  };

  const getSolutionNote = (): Promise<IResponse<SolutionNote[]>> => {
    return request("get", "/solution/getallSN");
  };

  const getSolutionByReportId = (
    reportId: number
  ): Promise<IResponse<RepairReport>> => {
    return request("get", `/solution/get/${reportId}`);
  };

  const getInsertSolutionNote = (
    title: string,
    content: string,
    tag: number
  ) => {
    return request(
      "get",
      `/solution/insertSN?title=${title}&content=${content}&tag=${tag}`
    );
  };

  const getEditSolutionNote = (
    id: number,
    title: string,
    content: string,
    tag: number
  ) => {
    return request(
      "get",
      `/solution/editSN?sn_id=${id}&title=${title}&content=${content}&tag=${tag}`
    );
  };

  const getDeleteSolutionNote = (id: number) => {
    return request("get", `/solution/delete_SN?sn_id=${id}`);
  };

  const getSetSolutionNoteLike = (id: number, like: boolean) => {
    return request("get", `/solution/set_SN_like?sn_id=${id}&like=${like}`);
  };
  return {
    getSolutionReport,
    postGenerateSolution,
    getSolutionNote,
    getSolutionByReportId,
    getDeleteSolutionNote,
    getInsertSolutionNote,
    getEditSolutionNote,
    getSetSolutionNoteLike,
  };
};

export default useSolutionService;
