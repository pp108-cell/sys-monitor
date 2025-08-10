import SystemLayout from "@/components/SystemLayout";
import { Flex, message, Spin } from "antd";
import { useState, useMemo, type FC } from "react";
import './index.less';
import { AppstoreOutlined, InsertRowLeftOutlined, SwapOutlined, CloseOutlined } from "@ant-design/icons";
import myPDF from '@/assets/docs/项目商业计划书.pdf'
import useReport from "@/hooks/useCauseReport";
import useSolution from "@/hooks/useSolution";
import type { CauseReportFull } from "@/hooks/useCauseReport";


const AbnormalDetectionReport: FC = () => {
  const { generateSolution } = useSolution();
  const { dailyReport } = useReport();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CauseReportFull | null>(null);
  const [isExportMode, setIsExportMode] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 默认降序，最新的在前

  // 处理排序逻辑
  const sortedDailyReport = useMemo(() => {
    if (!dailyReport) return undefined;

    return [...dailyReport].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);

      if (sortOrder === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [dailyReport, sortOrder]);

  const handleSortClick = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleGenerateSolution = async (reportId: number) => {
    if (isGenerating) return; // 防止重复点击

    setIsGenerating(true);
    try {
      await generateSolution(reportId);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRowClick = (item: CauseReportFull) => {
    if (isExportMode) {
      // 导出模式下，只选中该行，不直接导出
      setSelectedReport(item);
    } else {
      // 正常模式下，设置选中的报告并展开侧边栏
      setSelectedReport(item);
      setIsDrawerOpen(!isDrawerOpen);
    }
  };

  // 修改筛选模式函数，用于生成解决方案
  const handleFilterClick = () => {
    setIsExportMode(!isExportMode);
    if (!isExportMode) {
      message.info('请先选择要操作的报告，然后生成解决方案', 2);
      // 进入筛选模式时清除选中状态
      setSelectedReport(null);
    }
  };

  // 新增：处理筛选模式下的解决方案生成
  const handleFilterAction = (action: 'solution') => {
    if (isGenerating) return;

    if (!selectedReport) {
      message.warning('请先选择要操作的报告');
      return;
    }

    if (action === 'solution') {
      handleGenerateSolution(selectedReport.id);
    }
  };



  return (
    <SystemLayout>
      <div className="abnormal-detection-report-container">
        <Flex
          vertical
          className="abnormal-detection-report-wrapper">
          <header className="abnormal-detection-report-header">
            <div className="abnormal-detection-report-header-left">
              <div className="abnormal-detection-report-header-left-tools">
                <div
                  className="abnormal-detection-report-header-left-tools-item"
                  onClick={handleSortClick}
                  style={{ cursor: 'pointer' }}
                >
                  <SwapOutlined
                    style={{
                      rotate: sortOrder === 'asc' ? '90deg' : '-90deg',
                      transition: 'all 0.2s ease'
                    }}
                    className="abnormal-detection-report-header-left-tools-item-icon"
                  /> 按日期排序 ({sortOrder === 'asc' ? '升序' : '降序'})
                </div>
                <div
                  className={`abnormal-detection-report-header-left-tools-item`}
                  onClick={handleFilterClick}
                  style={{
                    cursor: 'pointer',

                    borderRadius: '4px'
                  }}
                >
                  {isExportMode ? (
                    <>
                      <CloseOutlined className="abnormal-detection-report-header-left-tools-item-icon" /> 取消筛选
                    </>
                  ) : (
                    <>
                      <AppstoreOutlined className="abnormal-detection-report-header-left-tools-item-icon" /> 筛选
                    </>
                  )}
                </div>
              </div>
              {
                isExportMode && (
                  <div
                    className="abnormal-detection-report-header-left-export"
                    style={{
                      cursor: (isGenerating || (isExportMode && !selectedReport)) ? 'not-allowed' : 'pointer',
                      opacity: (isGenerating || (isExportMode && !selectedReport)) ? 0.6 : 1,
                      display: 'flex',
                      gap: '8px'
                    }}>

                    <div
                      onClick={() => handleFilterAction('solution')}
                    >
                      {isGenerating ? '正在生成...' : '生成解决方案'}
                    </div>
                  </div>
                )
              }
            </div>
            <div className="abnormal-detection-report-header-right">
              <InsertRowLeftOutlined
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                style={{
                  fontSize: 22
                }} />
              预览
            </div>
          </header>


          <div className="abnormal-detection-report-content">
            <div className={`abnormal-detection-report-content-left ${isDrawerOpen ? 'open' : ''}`}>
              <table className="abnormal-detection-report-table">
                <thead className="abnormal-detection-report-table-header">
                  <tr className="abnormal-detection-report-table-tr">
                    <td className="abnormal-detection-report-table-td">
                      异常评级
                    </td>
                    <td className="abnormal-detection-report-table-td">
                      异常类别
                    </td>
                    <td
                      style={{ borderRight: 'none' }}
                      className="abnormal-detection-report-table-td">
                      检测时间
                    </td>
                  </tr>
                </thead>
                <tbody className="abnormal-detection-report-table-body">
                  {
                    sortedDailyReport !== undefined ? (
                      sortedDailyReport?.map((item) => (
                        <tr
                          onClick={() => handleRowClick(item)}
                          key={item.id}
                          className={`abnormal-detection-report-table-tr ${selectedReport?.id === item.id ? 'selected' : ''} ${isExportMode ? 'export-mode' : ''}`}
                          style={{
                            
                            cursor: 'pointer',
                            ...(selectedReport?.id === item.id && isExportMode ? {
                              backgroundColor: '#e6f7ff',
                              position: 'relative',
                              transition: 'all 0.2s ease'
                            } : {})
                          }}>
                          <td className="abnormal-detection-report-table-td">
                            <span style={{
                              color: item.overall_risk_level > 0.75 ? '#ff4d4f' : item.overall_risk_level > 0.5 ? '#fa8c16' : '#52c41a',
                            }}>
                              {item.overall_risk_level > 0.75 ? '高危' : item.overall_risk_level > 0.5 ? '中危' : '低危'}
                            </span>
                          </td>
                          <td className="abnormal-detection-report-table-td anomaly-types">
                            {
                              Array.from(new Set(
                                item.anomalies.flatMap(anomaly =>
                                  anomaly.data.anomalies.map(item1 => item1.anomaly_type)
                                )
                              )).join('，')
                            }
                          </td>
                          <td
                            style={{ borderRight: 'none' }}
                            className="abnormal-detection-report-table-td">
                            {item.date}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '60vh',
                        flexDirection: 'column'
                      }}>
                        <Spin size="large" />
                        <div style={{ marginTop: 16, color: '#666' }}>正在加载系统信息...</div>
                      </div>
                    )
                  }
                </tbody>
              </table>
            </div>
            <div className={`abnormal-detection-report-content-right ${isDrawerOpen ? 'open' : ''}`}>
              <div className="abnormal-detection-report-content-preview-wrapper">
                <embed
                  width='100%'
                  height='100%'
                  src={selectedReport?.preview_url || myPDF}
                  type="application/pdf" />
              </div>
            </div>
          </div>
        </Flex>
      </div>
    </SystemLayout>
  )
}

export default AbnormalDetectionReport;