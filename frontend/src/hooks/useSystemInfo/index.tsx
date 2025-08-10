import { SystemInfoContext } from "@/contexts/SystemInfoContext";
import useSystemInfoService from "@/services/useSystemInfoService";
import { useCallback, useContext, useEffect } from "react";
import useSWR from "swr";

const useSystemInfo = () => {
  const { getSystemInfo } = useSystemInfoService();

  // 获取 SystemInfo 的 Dispatch 函数
  const { dispatch } = useContext(SystemInfoContext);

  // 第一步封装原始 getDashBoardSystemInfo，解构出 data
  const getAllSystemInfo = useCallback(async () => {
    const res = await getSystemInfo();
    return res.data;
  }, [getSystemInfo])

  // 使用 useSWR 进行轮询
  const SWROptions = {
    refreshInterval: 30000, // 30s 轮询一次
    refreshWhenHidden: true, // 页面离开时继续轮询
    refreshWhenOffline: false, // 离线时轮询
  }

  const { data: systemInfo, error } = useSWR('/systeminfo/getsysteminfo', getAllSystemInfo, SWROptions);

  // systemInfo 获取到以后，更新 state（包括异常检测状态）
  useEffect(() => {
    if (!systemInfo) return;
    dispatch({
      type: 'Update_State',
      payload: systemInfo
    });
  }, [systemInfo, dispatch]);

  // 处理获取数据时的错误
  useEffect(() => {
    if (error) {
      dispatch({
        type: 'Set_Detection_Error',
        payload: error.message || '获取系统信息失败'
      });
    } else {
      dispatch({
        type: 'Clear_Detection_Error'
      });
    }
  }, [error, dispatch]);
}

export default useSystemInfo;