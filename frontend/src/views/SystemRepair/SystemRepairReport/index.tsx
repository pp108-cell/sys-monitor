import SystemLayout from "@/components/SystemLayout";
import type { FC } from "react";
import { useState, useMemo } from 'react';
import { SwapOutlined, InsertRowLeftOutlined } from "@ant-design/icons";
import { Flex, Spin } from "antd";
import './index.less';
import myPDF from '@/assets/docs/项目商业计划书.pdf'
import useSolutionReport from "@/hooks/useSolutionReport";
import type { SolutionReportFull } from "@/hooks/useSolutionReport";

const SystemRepairReport: FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SolutionReportFull | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // 默认降序，最新的在前

  const { solutionReports } = useSolutionReport();

  // 处理排序逻辑
  const sortedSolutionReports = useMemo(() => {
    if (!solutionReports) return undefined;

    return [...solutionReports].sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      if (sortOrder === 'asc') {
        return dateA.getTime() - dateB.getTime();
      } else {
        return dateB.getTime() - dateA.getTime();
      }
    });
  }, [solutionReports, sortOrder]);

  const handleSortClick = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  };

  const handleRowClick = (item: SolutionReportFull) => {
    // 设置选中的报告并展开侧边栏
    setSelectedReport(item);
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <SystemLayout>
      <div className="system-repair-report-container">
        <Flex
          vertical
          className="system-repair-report-wrapper"
        >
          <header className="system-repair-report-header">
            <div className="system-repair-report-header-left">
              <div className="system-repair-report-header-left-tool">
                <div
                  className="system-repair-report-header-left-tool-item"
                  onClick={handleSortClick}
                  style={{ cursor: 'pointer' }}
                >
                  <SwapOutlined
                    style={{
                      rotate: sortOrder === 'asc' ? '90deg' : '-90deg',
                      transition: 'all 0.2s ease'
                    }}
                    className="system-repair-report-header-left-tool-item-icon"
                  /> 按日期排序 ({sortOrder === 'asc' ? '升序' : '降序'})
                </div>
              </div>
            </div>
            <div className="system-repair-report-header-right">
              <InsertRowLeftOutlined
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                style={{
                  fontSize: 22
                }} />
              预览
            </div>
          </header>

          <div className="system-repair-report-content">
            <div className={`system-repair-report-content-left ${isDrawerOpen ? 'open' : ''}`}>
              <table className="system-repair-report-table">
                <thead className="system-repair-report-table-header">
                  <tr className="system-repair-report-table-tr">
                    <td className="system-repair-report-table-td">
                      修复状态
                    </td>
                    <td className="system-repair-report-table-td">
                      解决方案类型
                    </td>
                    <td className="system-repair-report-table-td">
                      修复时间
                    </td>
                  </tr>
                </thead>
                <tbody className="system-repair-report-table-body">
                  {
                    solutionReports !== undefined ? (
                      sortedSolutionReports?.map((item, index) => (
                        <tr
                          onClick={() => handleRowClick(item)}
                          key={index}
                          className={`system-repair-report-table-tr`}
                          style={{
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'all 0.2s ease'
                          }}>
                          <td className="system-repair-report-table-td">
                            {/* 显示修复状态 */}
                            <span className={`status-badge status-completed`}>
                              已完成 ({item.solutions?.length || 0}个方案)
                            </span>
                          </td>
                          <td className="system-repair-report-table-td">
                            {Array.from(new Set(
                              item.solutions.map(item => item.anomaly_type)
                            )).join('，')}
                          </td>
                          <td className="system-repair-report-table-td">
                            {/* 显示修复时间 */}
                            {item.created_at}
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
            <div className={`system-repair-report-content-right ${isDrawerOpen ? 'open' : ''}`}>
              <div className="system-repair-report-content-preview-wrapper">
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

export default SystemRepairReport;