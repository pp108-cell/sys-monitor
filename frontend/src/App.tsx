import { HashRouter, Route, Routes } from "react-router-dom"
import DashBoard from "./views/dashboard"
import AbnormalDetection from "./views/AbnormalDetection"
import AbnormalDetectionLog from "./views/AbnormalDetection/AbnormalDetectionLog"
import { ConfigProvider, type ThemeConfig } from "antd"
import { SystemInfoProvider } from "./contexts/SystemInfoContext"
import { DashboardProvider } from "./contexts/DashboardContext"
import useSystemInfo from "./hooks/useSystemInfo"
import useAnomalyDetection from "./hooks/useAnomalyDetection"
import type { FC } from "react"
import { SWRConfig } from "swr"
import KylinAI from "./views/KylinAI"
import AbnormalDetectionReport from "./views/AbnormalDetection/AbnormalDetectionReport"
import SystemRepair from "./views/SystemRepair"
import SystemRepairReport from "./views/SystemRepair/SystemRepairReport"
import SystemRepairSolution from "./views/SystemRepair/SystemRepairSolution"
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';
import dayjs from 'dayjs'
import Home from "./views/Home"
import type { ContextMenuOptionsProps } from "./components/ContextMenu"
import ContextMenu from "./components/ContextMenu"
dayjs.locale('zh-cn');
const GlobalTheme: Partial<ThemeConfig> = {
  token: {
    fontFamily: '@primary-font'
  },
  components: {
    Pagination: {
      itemActiveBg: ''
    }
  }
}
const contextMenuOptions: ContextMenuOptionsProps = {
  menus: [
    {
      name: '首页',
      onClick: () => console.log('1')
    },
    {
      name: '地点1',
      onClick: () => console.log('2')
    },
    {
      name: '地点2',
      onClick: () => console.log('3')
    },
  ]
}
// 新增一个内部组件来调用 useSystemInfo
const AppContent: FC = () => {
  // 开始获取系统数据
  useSystemInfo();

  // 全局异常通知监听 - 确保在任何页面都能收到通知
  useAnomalyDetection({ enableNotification: true });

  return (
    <HashRouter>
      {/* <ContextMenu options={contextMenuOptions}> */}
      <Routes>
        <Route element={<Home />} path="*" />
        <Route element={<DashBoard />} path="/dashboard" />
        <Route element={<AbnormalDetection />} path="/abnormal-detection" />
        <Route element={<AbnormalDetectionLog />} path="/abnormal-detection/log" />
        <Route element={<AbnormalDetectionReport />} path="/abnormal-detection/report" />
        <Route element={<KylinAI />} path="/kylin-ai" />
        <Route element={<SystemRepair />} path="/system-repair" />
        <Route element={<SystemRepairSolution />} path="/system-repair/solution" />
        <Route element={<SystemRepairReport />} path="/system-repair/report" />
      </Routes>
      {/* </ContextMenu> */}
    </HashRouter>
  );
}

function App() {
  return (
    <ConfigProvider
      theme={GlobalTheme}
      locale={zhCN}
    >
      <SWRConfig>
        <SystemInfoProvider>
          <DashboardProvider>
            <AppContent />
          </DashboardProvider>
        </SystemInfoProvider>
      </SWRConfig>
    </ConfigProvider>
  )
}

export default App
