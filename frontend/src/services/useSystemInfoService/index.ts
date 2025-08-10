import { request, type IResponse } from "../request";
import type { SystemInfo, SystenDailyInfo } from "./type";

const useSystemInfoService = () => {
  const getSystemInfo = (): Promise<IResponse<SystemInfo>> => {
    return request("get", "/systeminfo/getsysteminfo");
  };

  const getDailySystemInfo = (): Promise<IResponse<SystenDailyInfo>> => {
    return request("get", "/systeminfo/getdailysysteminfo");
  }

  const getSystemInfoByDate = (
    date: string
  ): Promise<IResponse<SystenDailyInfo>> => {
    return request("get", `/systeminfo/getdailysysteminfobydate?date=${date}`);
  }; 
  return {
    getSystemInfo,
    getDailySystemInfo,
    getSystemInfoByDate
  }
}

export default useSystemInfoService;