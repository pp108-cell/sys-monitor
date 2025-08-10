/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { Font } from '@react-pdf/renderer';
import type {
  RepairReport,
  Solution,
  AnomalyDetails,
  TrafficAnalysis,
  SeverityBasedRecommendations,
  MitigationStrategy,
  DiagnosticData,
  MitigationStrategies,
  RecoveryPriority,
} from '../../services/useSolutionService/type';
import { message } from 'antd';

// 注册中文字体
Font.register({
  family: '思源雅黑',
  src: '/fonts/SourceHanSerifCN-Regular.ttf' // 字体文件需要放在 public/fonts/ 目录下
});

// PDF 样式定义
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: '思源雅黑',
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#34495e',
  },
  section: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 10,
    color: '#2c3e50',
    minWidth: 80,
  },
  value: {
    fontSize: 12,
    color: '#34495e',
  },
  solutionContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  solutionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2980b9',
  },
  solutionDetail: {
    fontSize: 11,
    marginBottom: 5,
    color: '#2c3e50',
  },
  severityLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  severityHigh: {
    color: '#e74c3c',
  },
  severityMedium: {
    color: '#f39c12',
  },
  severityLow: {
    color: '#27ae60',
  },
  stepsList: {
    marginTop: 8,
    marginBottom: 8,
  },
  stepItem: {
    fontSize: 10,
    marginBottom: 3,
    paddingLeft: 10,
    color: '#2c3e50',
  },
  listContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 3,
    paddingLeft: 10,
    color: '#2c3e50',
  },
  anomalyContainer: {
    backgroundColor: '#fdf2e9',
    padding: 10,
    marginBottom: 10,
    borderRadius: 3,
  },
  anomalyTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#d68910',
  },
  trafficContainer: {
    backgroundColor: '#fbeee6',
    padding: 10,
    marginBottom: 10,
    borderRadius: 3,
  },
});

// 获取严重程度样式
const getSeverityStyle = (severity: string) => {
  switch (severity.toLowerCase()) {
    case 'critical':
    case 'high':
    case '严重':
    case '高':
      return styles.severityHigh;
    case 'medium':
    case '中':
      return styles.severityMedium;
    case 'low':
    case '低':
      return styles.severityLow;
    default:
      return styles.severityMedium;
  }
};

// 异常详情组件
const AnomalyDetailsComponent: React.FC<{ data: AnomalyDetails }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>异常详情</Text>
    <Text style={styles.solutionDetail}>描述: {data.description}</Text>
    <Text style={styles.solutionDetail}>检测时间: {data.detection_time}</Text>
    <Text style={[styles.severityLevel, getSeverityStyle(data.severity)]}>
      严重程度: {data.severity}
    </Text>
  </View>
);

// 流量分析组件
const TrafficAnalysisComponent: React.FC<{ data: TrafficAnalysis }> = ({ data }) => (
  <View style={styles.trafficContainer}>
    <Text style={styles.anomalyTitle}>流量分析</Text>
    <Text style={styles.solutionDetail}>攻击类型: {data.attack_type}</Text>
    <Text style={styles.solutionDetail}>潜在攻击: {data.is_potential_attack ? '是' : '否'}</Text>
    <Text style={styles.solutionDetail}>推荐防护级别: {data.recommended_protection_level}</Text>
  </View>
);

// 严重程度建议组件
const SeverityRecommendationsComponent: React.FC<{ data: SeverityBasedRecommendations }> = ({ data }) => (
  <View>
    <Text style={styles.solutionTitle}>严重程度建议</Text>

    <Text style={styles.solutionDetail}>关键操作:</Text>
    <View style={styles.listContainer}>
      {data.critical_actions.map((action, index) => (
        <Text key={index} style={styles.listItem}>• {action}</Text>
      ))}
    </View>

    <Text style={styles.solutionDetail}>预防措施:</Text>
    <View style={styles.listContainer}>
      {data.preventive_measures.map((measure, index) => (
        <Text key={index} style={styles.listItem}>• {measure}</Text>
      ))}
    </View>
  </View>
);

// 缓解策略组件
const MitigationStrategyComponent: React.FC<{ data: MitigationStrategy | MitigationStrategies }> = ({ data }) => (
  <View>
    <Text style={styles.solutionTitle}>缓解策略</Text>

    <Text style={styles.solutionDetail}>立即措施:</Text>
    <View style={styles.listContainer}>
      {data.immediate.map((action, index) => (
        <Text key={index} style={styles.listItem}>• {action}</Text>
      ))}
    </View>

    <Text style={styles.solutionDetail}>长期措施:</Text>
    <View style={styles.listContainer}>
      {data.long_term.map((action, index) => (
        <Text key={index} style={styles.listItem}>• {action}</Text>
      ))}
    </View>
  </View>
);

// 诊断数据组件
const DiagnosticDataComponent: React.FC<{ data: DiagnosticData }> = ({ data }) => (
  <View>
    <Text style={styles.solutionTitle}>诊断数据</Text>
    <Text style={styles.solutionDetail}>CPU使用差异: {data.cpu_usage_discrepancy}</Text>

    <Text style={styles.solutionDetail}>内核线程:</Text>
    <View style={styles.listContainer}>
      {data.kernel_threads.map((thread, index) => (
        <Text key={index} style={styles.listItem}>• {thread}</Text>
      ))}
    </View>

    <Text style={styles.solutionDetail}>潜在原因:</Text>
    <View style={styles.listContainer}>
      {data.potential_causes.map((cause, index) => (
        <Text key={index} style={styles.listItem}>• {cause}</Text>
      ))}
    </View>
  </View>
);

// 恢复优先级组件
const RecoveryPriorityComponent: React.FC<{ data: RecoveryPriority }> = ({ data }) => (
  <View>
    <Text style={styles.solutionTitle}>恢复优先级</Text>

    <Text style={styles.solutionDetail}>关键服务:</Text>
    <View style={styles.listContainer}>
      {data.critical_services.map((service, index) => (
        <Text key={index} style={styles.listItem}>• {service}</Text>
      ))}
    </View>

    <Text style={styles.solutionDetail}>网络恢复步骤:</Text>
    <View style={styles.listContainer}>
      {data.network_recovery_steps.map((step, index) => (
        <Text key={index} style={styles.listItem}>• {step}</Text>
      ))}
    </View>
  </View>
);

// 解决方案组件
const SolutionComponent: React.FC<{ solution: Solution; index: number }> = ({ solution, index }) => (
  <View style={styles.solutionContainer}>
    <Text style={styles.solutionTitle}>解决方案 {index + 1}: {solution.anomaly_type}</Text>

    {/* 异常详情 */}
    <AnomalyDetailsComponent data={solution.anomaly_details} />

    {/* 解决方案描述 */}
    <Text style={styles.solutionDetail}>解决方案描述: {solution.solution_description}</Text>

    {/* 实施步骤 */}
    <Text style={styles.solutionDetail}>实施步骤:</Text>
    <View style={styles.stepsList}>
      {solution.implementation_steps.map((step, stepIndex) => (
        <Text key={stepIndex} style={styles.stepItem}>
          {stepIndex + 1}. {step}
        </Text>
      ))}
    </View>

    {/* 推荐操作 */}
    <Text style={styles.solutionDetail}>推荐操作:</Text>
    <View style={styles.listContainer}>
      {solution.recommended_actions.map((action, actionIndex) => (
        <Text key={actionIndex} style={styles.listItem}>• {action}</Text>
      ))}
    </View>

    {/* 有效期 */}
    <Text style={styles.solutionDetail}>有效期: {solution.validity_period}</Text>

    {/* 可选字段 */}
    {solution.traffic_analysis && (
      <TrafficAnalysisComponent data={solution.traffic_analysis} />
    )}

    {solution.severity_based_recommendations && (
      <SeverityRecommendationsComponent data={solution.severity_based_recommendations} />
    )}

    {solution.mitigation_strategy && (
      <MitigationStrategyComponent data={solution.mitigation_strategy} />
    )}

    {solution.mitigation_strategies && (
      <MitigationStrategyComponent data={solution.mitigation_strategies} />
    )}

    {solution.diagnostic_data && (
      <DiagnosticDataComponent data={solution.diagnostic_data} />
    )}

    {solution.recovery_priority && (
      <RecoveryPriorityComponent data={solution.recovery_priority} />
    )}
  </View>
);

// 主要的PDF文档组件
export const RepairReportDocument: React.FC<{ reportData: RepairReport }> = ({ reportData }) => {
  console.log('修复报告数据:', reportData);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>系统修复建议报告</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>报告概要</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>创建时间:</Text>
            <Text style={styles.value}>{reportData.created_at}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>报告ID:</Text>
            <Text style={styles.value}>{reportData.report_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>解决方案ID:</Text>
            <Text style={styles.value}>{reportData.solution_id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>解决方案数量:</Text>
            <Text style={styles.value}>{reportData.solutions.length} 个</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>解决方案详情</Text>
          {reportData.solutions.map((solution, index) => (
            <SolutionComponent key={index} solution={solution} index={index} />
          ))}
        </View>
      </Page>
    </Document>
  );
};


// 生成和上传修复报告PDF
export const generateAndUploadRepairReportPDF = async (
  fileName: string,
  downloadFunc: () => Promise<RepairReport>
) => {
  try {
    // 检查数据是否有效
    const data = await downloadFunc();
    console.log('修复报告数据:', data);

    try {
      const doc = <RepairReportDocument reportData={data} />
      const blob = await pdf(doc).toBlob();

      // 将blob转换为File对象
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // 直接使用request进行API调用
      const { request } = await import('../../services/request');

      const formData = new FormData();
      formData.append('file', file);
      console.log('开始上传解决方案PDF')

      // 上传到后端
      return await request("post", "/solution/upload_pdf", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then(() => message.success('解决方案生成成功！前往【修复报告】页面查看'));

     
      
    } catch (err) {
      console.error('解决方案PDF处理错误:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : '未知错误'
      };
    }

  } catch (error) {
    console.error('解决方案PDF生成失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};
