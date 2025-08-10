import SystemLayout from "@/components/SystemLayout";
import { UserOutlined, FormOutlined, SyncOutlined, FilterOutlined, DownloadOutlined } from "@ant-design/icons";
import { Calendar, ConfigProvider, Flex, Pagination, message } from "antd";
import type { FC } from "react";
import { useContext, useEffect, useState } from "react";
import './index.less';
import useAbnormal from "@/hooks/useAbnormal";
import { LogChart } from "@/components/Charts/LogChart";
import type dayjs from "dayjs";
import { generateAndUploadReportPDF } from "@/components/AnomalyReportTemplate";
import useSystemInfoService from "@/services/useSystemInfoService";
import { SystemInfoContext } from "@/contexts/SystemInfoContext";

const ICalendarComponent: FC<{
  CalendarOnChange: (date: dayjs.Dayjs) => void
}> = ({ CalendarOnChange }) => {
  return (
    <ConfigProvider theme={{
      components: {
        Calendar: {
          miniContentHeight: 100
        }
      }
    }}>
      <Calendar
        onChange={CalendarOnChange}
        fullscreen={false}
        style={{
          height: '300px',
        }}
        className="abnormal-calendar" />
    </ConfigProvider>
  )
}

const AbnormaDetectionlLog: FC = () => {
  const {
    dailySystemInfo,
    logStatistics,
    clearDailySystemInfo,
    selectedDailySystemInfo,
    getAllCauseReport
  } = useAbnormal();

  // 选择模式状态
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  // 选中的报告ID
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 7;

  const CalendarOnChange: ((date: dayjs.Dayjs) => void) = async (date) => {
    await selectedDailySystemInfo(date.format('YYYY-MM-DD'))
    // 清空选中状态和选择模式
    setSelectedReportId(null);
    setSelectedDate(date.format('YYYY-MM-DD'));
    setIsSelectionMode(false);
    // 重置到第一页
    setCurrentPage(1);
  }

  // 处理行点击选择
  const handleRowClick = (reportId: number) => {
    if (!isSelectionMode) {
      return;
    }

    if (selectedReportId === reportId) {
      // 如果点击的是已选中的行，则取消选中
      setSelectedReportId(null);
    } else {
      // 选中新的行
      setSelectedReportId(reportId);
    }
  };

  // 切换筛选模式
  const handleToggleSelectionMode = () => {
    if (!dailySystemInfo || dailySystemInfo.length === 0) {
      message.warning('暂无数据可筛选');
      return;
    }

    if (isSelectionMode) {
      // 退出选择模式
      setIsSelectionMode(false);
      setSelectedReportId(null);
    } else {
      // 进入选择模式
      setIsSelectionMode(true);
    }
  };

  // 清空日志数据
  const handleClearData = () => {
    clearDailySystemInfo();
    setSelectedReportId(null);
    setIsSelectionMode(false);
    setCurrentPage(1);
    message.success('已清空日志数据');
  };

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // 清空选中状态，因为切换页面时选中的项可能不在当前页
    setSelectedReportId(null);
  };

  // 计算当前页显示的数据
  const getCurrentPageData = () => {
    if (!dailySystemInfo) return [];

    // 如果在筛选模式，只显示异常报告
    const filteredData = isSelectionMode
      ? dailySystemInfo.filter(item => item.anomaly_id > 0)
      : dailySystemInfo;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredData.slice(startIndex, endIndex);
  };

  // 获取筛选后的总数据量
  const getFilteredDataCount = () => {
    if (!dailySystemInfo) return 0;
    return isSelectionMode
      ? dailySystemInfo.filter(item => item.anomaly_id > 0).length
      : dailySystemInfo.length;
  };

  const downloadReportPDF = async () => {
    return generateAndUploadReportPDF(`异常检测报告_${selectedDate.replace(/[: ]/g, '_')}.pdf`, () => getAllCauseReport(selectedDate));
  }
  const { getSystemInfo } = useSystemInfoService();
  const { dispatch } = useContext(SystemInfoContext);
  useEffect(() => {
    selectedDailySystemInfo(selectedDate);
  }, [])
  return (
    <SystemLayout>
      <Flex
        gap="middle"
        vertical
        className="dashboard-wrapper abnormal-detection-log-wrapper"
      >
        <div className="dashboard-info dashboard-card">
          <div className="dashboard-info-left">
            <div className="dashboard-info-left-item">
              <UserOutlined className="dashboard-info-left-item-icon" /> 19812312233
            </div>
            <div className="dashboard-info-left-item">
              <FormOutlined className="dashboard-info-left-item-icon" /> TODO-List
            </div>
          </div>
          <div className="dashboard-info-right">
            <SyncOutlined className="dashboard-info-left-item-icon" onClick={async () => {
              const hide = message.loading('刷新中……')
              try {
                const res = await getSystemInfo();
                const systemInfo = res.data;
                if (!systemInfo) return;
                hide(); // 隐藏loading消息
                message.success('刷新完成！')
                dispatch({
                  type: 'Update_State',
                  payload: systemInfo
                });
              } catch (error) {
                hide(); // 出错时也要隐藏loading消息
                message.error('刷新失败');
                console.error(error);
              }
            }} />
          </div>
        </div>
        <div className="abnormal-detection-log-content">
          <div className="abnormal-detection-log-content-left">
            <div className="abnormal-detection-log-chart" style={{ maxHeight: '300px' }}>
              <ICalendarComponent CalendarOnChange={CalendarOnChange} />
            </div>
            <LogChart height={250} data={logStatistics} />
          </div>
          <div className="abnormal-detection-log-content-right">
            <div className="abnormal-detection-log-table">
              <header className="abnormal-detection-log-table-header">
                <div className="abnormal-detection-log-table-header-left">
                  <div
                    className="abnormal-detection-log-table-header-left-item"
                    onClick={handleToggleSelectionMode}
                  >
                    <FilterOutlined style={{ marginRight: '4px' }} />
                    {isSelectionMode ? '退出筛选' : '筛选异常日志'}
                  </div>
                  {isSelectionMode && (
                    <div
                      className="abnormal-detection-log-table-header-left-item"
                      onClick={downloadReportPDF}
                      style={{ cursor: 'pointer' }}
                    >
                      <DownloadOutlined style={{ marginRight: '4px' }} />
                      导出异常检测报告
                    </div>
                  )}
                  <div
                    className="abnormal-detection-log-table-header-left-item"
                    onClick={handleClearData}
                    style={{ cursor: 'pointer' }}
                  >
                    清空日志
                  </div>
                </div>
              </header>
              <table className="abnormal-detection-log-table-content">
                <thead className="abnormal-detection-log-table-content-header">
                  <tr className="abnormal-detection-log-table-content-tr">
                    <td className="abnormal-detection-log-table-content-td">
                      状态
                    </td>
                    <td className="abnormal-detection-log-table-content-td">
                      详情
                    </td>
                    <td className="abnormal-detection-log-table-content-td time">
                      时间
                    </td>
                  </tr>
                </thead>
                <tbody className="abnormal-detection-log-table-content-body">
                  {
                    getCurrentPageData().map((item, index, arr) => {
                      const isSelected = selectedReportId === item.id;
                      return (
                        <tr
                          key={item.id}
                          className={`abnormal-detection-log-table-content-tr ${index === arr.length - 1 ? 'abnormal-detection-log-table-content-tr-last' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleRowClick(item.id)}
                          style={{
                            cursor: isSelectionMode ? 'pointer' : 'default',
                            backgroundColor: isSelected ? '#d6f3ff' : 'transparent',
                            ...(isSelectionMode && !isSelected ? {
                              transition: 'all 0.2s ease',
                              border: '1px solid transparent'
                            } : {})
                          }}
                          onMouseEnter={(e) => {
                            if (isSelectionMode && !isSelected) {
                              e.currentTarget.style.backgroundColor = '#f0f0f0';
                              e.currentTarget.style.borderColor = '#d9d9d9';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (isSelectionMode && !isSelected) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.borderColor = 'transparent';
                            }
                          }}
                        >
                          <td className="abnormal-detection-log-table-content-td">
                            {item.anomaly_id > 0 ? <span style={{ color: 'red' }}>异常</span> : '正常'}
                          </td>
                          <td className="abnormal-detection-log-table-content-td">
                            CPU: {item.cpu_info.cpu_percent}%，内存: {item.memory_info.memory_percent}%，
                            {
                              item.disk_info.map((item) => `${item.device}：${item.disk_percent}%，`)
                            }
                            网络: ↑{(item.network_info.bytes_sent_kb / 1024).toFixed(1)}MB ↓{(item.network_info.bytes_recv_kb / 1024).toFixed(1)}MB
                          </td>
                          <td className={`abnormal-detection-log-table-content-td time`}>
                            {item.timestamp}
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
              <Pagination
                current={currentPage}
                total={getFilteredDataCount()}
                pageSize={pageSize}
                onChange={handlePageChange}
                className="abnormal-detection-log-table-pagination"
                showSizeChanger={false}
                showQuickJumper={false}
                showTotal={(total) => `共 ${total} 条记录`}
              />
            </div>
          </div>
        </div>
      </Flex>
    </SystemLayout>
  )
}

export default AbnormaDetectionlLog;