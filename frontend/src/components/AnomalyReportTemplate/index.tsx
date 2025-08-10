import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import { AnomalyType } from '../../services/useCauseService/type';
import type {
  CauseReport,
  LoadProcessConflict,
  ProcessMemoryAnomaly,
  MemoryLeak,
  DiskSpaceInsufficient,
  CPUInterruptStorm,
  SwapOveruse,
  CPUKillerProcess,
  TrafficSurge,
  NetworkDisconnection,
  DiskIoFailure,
} from '../../services/useCauseService/type';
import { Font } from '@react-pdf/renderer';
import { message } from 'antd';
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
  anomalyContainer: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    marginBottom: 15,
    borderRadius: 5,
  },
  anomalyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#e74c3c',
  },
  anomalyDetail: {
    fontSize: 11,
    marginBottom: 5,
    color: '#2c3e50',
  },
  riskLevel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
  },
  riskHigh: {
    color: '#e74c3c',
  },
  riskMedium: {
    color: '#f39c12',
  },
  riskLow: {
    color: '#27ae60',
  },
  processTable: {
    marginTop: 8,
    marginBottom: 8,
  },
  processRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottom: '1px solid #ecf0f1',
  },
  processCell: {
    fontSize: 10,
    padding: 3,
    flex: 1,
  },
  processHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    backgroundColor: '#ecf0f1',
    padding: 3,
    flex: 1,
  },
});

// 获取风险等级样式
const getRiskLevelStyle = (riskLevel: string) => {
  switch (riskLevel.toLowerCase()) {
    case 'high':
    case '高':
      return styles.riskHigh;
    case 'medium':
    case '中':
      return styles.riskMedium;
    case 'low':
    case '低':
      return styles.riskLow;
    default:
      return styles.riskMedium;
  }
};

// 负载-进程矛盾异常组件
const LoadProcessConflictComponent: React.FC<{ data: LoadProcessConflict }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>系统CPU占用: {data.system_cpu_percent}%</Text>
    <Text style={styles.anomalyDetail}>进程CPU总和: {data.process_cpu_sum}%</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.process_detail && data.process_detail.length > 0 && (
      <View style={styles.processTable}>
        <Text style={styles.anomalyDetail}>相关进程:</Text>
        <View style={styles.processRow}>
          <Text style={styles.processHeader}>进程名</Text>
          <Text style={styles.processHeader}>PID</Text>
          <Text style={styles.processHeader}>CPU占用</Text>
        </View>
        {data.process_detail.map((process, index) => (
          <View key={index} style={styles.processRow}>
            <Text style={styles.processCell}>{process.name}</Text>
            <Text style={styles.processCell}>{process.pid}</Text>
            <Text style={styles.processCell}>{process.cpu_percent}%</Text>
          </View>
        ))}
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// 进程内存占用异常组件
const ProcessMemoryAnomalyComponent: React.FC<{ data: ProcessMemoryAnomaly }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>内存占用: {data.memory_percent}%</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.process_detail && data.process_detail.length > 0 && (
      <View style={styles.processTable}>
        <Text style={styles.anomalyDetail}>相关进程:</Text>
        <View style={styles.processRow}>
          <Text style={styles.processHeader}>进程名</Text>
          <Text style={styles.processHeader}>PID</Text>
          <Text style={styles.processHeader}>内存占用</Text>
        </View>
        {data.process_detail.map((process, index) => (
          <View key={index} style={styles.processRow}>
            <Text style={styles.processCell}>{process.name}</Text>
            <Text style={styles.processCell}>{process.pid}</Text>
            <Text style={styles.processCell}>{process.memory_percent}%</Text>
          </View>
        ))}
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// 内存泄漏异常组件
const MemoryLeakComponent: React.FC<{ data: MemoryLeak }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}> {data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>内存占用: {data.memory_percent}%</Text>
    <Text style={styles.anomalyDetail}>已用内存: {data.used_memory_gb}GB</Text>
    <Text style={styles.anomalyDetail}>可用内存: {data.available_memory_gb}GB</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// 磁盘空间不足异常组件
const DiskSpaceInsufficientComponent: React.FC<{ data: DiskSpaceInsufficient }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.disk_info && data.disk_info.length > 0 && (
      <View style={styles.processTable}>
        <Text style={styles.anomalyDetail}>磁盘信息:</Text>
        <View style={styles.processRow}>
          <Text style={styles.processHeader}>设备</Text>
          <Text style={styles.processHeader}>挂载点</Text>
          <Text style={styles.processHeader}>使用率</Text>
        </View>
        {data.disk_info.map((disk, index) => (
          <View key={index} style={styles.processRow}>
            <Text style={styles.processCell}>{disk.device}</Text>
            <Text style={styles.processCell}>{disk.mountpoint}</Text>
            <Text style={styles.processCell}>{disk.disk_percent}%</Text>
          </View>
        ))}
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// CPU中断风暴异常组件
const CPUInterruptStormComponent: React.FC<{ data: CPUInterruptStorm }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.metrics && (
      <View>
        <Text style={styles.anomalyDetail}>CPU信息: {data.metrics.cpu_info.cpu_percent}%</Text>
        <Text style={styles.anomalyDetail}>内存信息: {data.metrics.memory_info.memory_percent}%</Text>
        <Text style={styles.anomalyDetail}>网络信息: 发送 {data.metrics.network_info.bytes_sent_kb}KB / 接收 {data.metrics.network_info.bytes_recv_kb}KB</Text>
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// Swap过度使用异常组件
const SwapOveruseComponent: React.FC<{ data: SwapOveruse }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>Swap使用率: {data.swap_percent}%</Text>
    <Text style={styles.anomalyDetail}>Swap已使用: {data.swap_used_gb}GB</Text>
    <Text style={styles.anomalyDetail}>Swap总量: {data.swap_memory_gb}GB</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// CPU杀手进程异常组件
const CPUKillerProcessComponent: React.FC<{ data: CPUKillerProcess }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>系统CPU占用: {data.system_cpu_percent}%</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.process_detail && data.process_detail.length > 0 && (
      <View style={styles.processTable}>
        <Text style={styles.anomalyDetail}>异常进程:</Text>
        <View style={styles.processRow}>
          <Text style={styles.processHeader}>进程名</Text>
          <Text style={styles.processHeader}>PID</Text>
          <Text style={styles.processHeader}>CPU占用</Text>
        </View>
        {data.process_detail.map((process, index) => (
          <View key={index} style={styles.processRow}>
            <Text style={styles.processCell}>{process.name}</Text>
            <Text style={styles.processCell}>{process.pid}</Text>
            <Text style={styles.processCell}>{process.cpu_percent}%</Text>
          </View>
        ))}
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// 流量激增异常组件
const TrafficSurgeComponent: React.FC<{ data: TrafficSurge }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.metrics && (
      <View>
        <Text style={styles.anomalyDetail}>网络流量: 发送 {data.metrics.network_info.bytes_sent_kb}KB / 接收 {data.metrics.network_info.bytes_recv_kb}KB</Text>
        <Text style={styles.anomalyDetail}>CPU占用: {data.metrics.cpu_info.cpu_percent}%</Text>
        <Text style={styles.anomalyDetail}>内存占用: {data.metrics.memory_info.memory_percent}%</Text>
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// 网络断开异常组件
const NetworkDisconnectionComponent: React.FC<{ data: NetworkDisconnection }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.metrics && (
      <View>
        <Text style={styles.anomalyDetail}>网络状态: 发送 {data.metrics.network_info.bytes_sent_kb}KB / 接收 {data.metrics.network_info.bytes_recv_kb}KB</Text>
        <Text style={styles.anomalyDetail}>系统状态: CPU {data.metrics.cpu_info.cpu_percent}% / 内存 {data.metrics.memory_info.memory_percent}%</Text>
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// 磁盘IO故障异常组件
const DiskIoFailureComponent: React.FC<{ data: DiskIoFailure }> = ({ data }) => (
  <View style={styles.anomalyContainer}>
    <Text style={styles.anomalyTitle}>{data.anomaly_type}</Text>
    <Text style={styles.anomalyDetail}>当前状态: {data.current_status}</Text>
    <Text style={styles.anomalyDetail}>详细分析: {data.detail_analysis}</Text>

    {data.disk_info && data.disk_info.length > 0 && (
      <View style={styles.processTable}>
        <Text style={styles.anomalyDetail}>磁盘信息:</Text>
        <View style={styles.processRow}>
          <Text style={styles.processHeader}>设备</Text>
          <Text style={styles.processHeader}>挂载点</Text>
          <Text style={styles.processHeader}>使用率</Text>
        </View>
        {data.disk_info.map((disk, index) => (
          <View key={index} style={styles.processRow}>
            <Text style={styles.processCell}>{disk.device}</Text>
            <Text style={styles.processCell}>{disk.mountpoint}</Text>
            <Text style={styles.processCell}>{disk.disk_percent}%</Text>
          </View>
        ))}
      </View>
    )}

    <Text style={[styles.riskLevel, getRiskLevelStyle(data.risk_level)]}>
      风险等级: {data.risk_level}
    </Text>
  </View>
);

// 异常组件渲染器
const renderAnomalyComponent = (anomaly: LoadProcessConflict | ProcessMemoryAnomaly | MemoryLeak | DiskSpaceInsufficient | CPUInterruptStorm | SwapOveruse | CPUKillerProcess | TrafficSurge | NetworkDisconnection | DiskIoFailure) => {
  const anomalyType = anomaly.anomaly_type;

  switch (anomalyType) {
    case AnomalyType.TYPE_1:
      return <LoadProcessConflictComponent data={anomaly as LoadProcessConflict} />;
    case AnomalyType.TYPE_2:
      return <CPUInterruptStormComponent data={anomaly as CPUInterruptStorm} />;
    case AnomalyType.TYPE_3:
      return <TrafficSurgeComponent data={anomaly as TrafficSurge} />;
    case AnomalyType.TYPE_4:
      return <NetworkDisconnectionComponent data={anomaly as NetworkDisconnection} />;
    case AnomalyType.TYPE_5:
      return <CPUKillerProcessComponent data={anomaly as CPUKillerProcess} />;
    case AnomalyType.TYPE_6:
      return <ProcessMemoryAnomalyComponent data={anomaly as ProcessMemoryAnomaly} />;
    case AnomalyType.TYPE_7:
      return <MemoryLeakComponent data={anomaly as MemoryLeak} />;
    case AnomalyType.TYPE_8:
      return <SwapOveruseComponent data={anomaly as SwapOveruse} />;
    case AnomalyType.TYPE_9:
      return <DiskSpaceInsufficientComponent data={anomaly as DiskSpaceInsufficient} />;
    case AnomalyType.TYPE_10:
      return <DiskIoFailureComponent data={anomaly as DiskIoFailure} />;
    default:
      return (
        <View style={styles.anomalyContainer}>
          <Text style={styles.anomalyTitle}>未知异常类型</Text>
          <Text style={styles.anomalyDetail}>异常类型: {anomalyType}</Text>
        </View>
      );
  }
};

// 主要的PDF文档组件
export const AnomalyReportDocument: React.FC<{ reportData: CauseReport }> = ({ reportData }) => {
  console.log(reportData.anomalies.length);
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>系统异常检测报告</Text>

        <View style={styles.section}>
          <Text style={styles.subtitle}>报告概要</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>检测时间:</Text>
            <Text style={styles.value}>{reportData.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>异常个数:</Text>
            <Text style={styles.value}>{reportData.anomaly_count} 个</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>报告ID:</Text>
            <Text style={styles.value}>{reportData.id}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.subtitle}>异常详情</Text>
          {reportData.anomalies.map((anomaly, index) => (
            <View key={index}>
              <Text style={styles.anomalyDetail}>
                异常时间: {anomaly.original_timestamp}
              </Text>
              <Text style={styles.anomalyDetail}>
                系统信息ID: {anomaly.system_info_id}
              </Text>
              {renderAnomalyComponent(anomaly.data.anomalies[0])}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
};

export const generateAndUploadReportPDF = async (fileName: string, downloadFunc: () => Promise<CauseReport>) => {
  try {
    // 检查数据是否有效
    const data = await downloadFunc();
    console.log('报告数据:', data);

    try {
      const doc = <AnomalyReportDocument reportData={data} />
      const blob = await pdf(doc).toBlob();

      // 将blob转换为File对象
      const file = new File([blob], fileName, { type: 'application/pdf' });

      // 直接使用request进行API调用
      const { request } = await import('../../services/request');

      const formData = new FormData();
      formData.append('file', file);
      console.log('我执行了')
      // 上传到后端
      await request("post", "/causereport/causereport/upload_pdf", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      message.success('异常检测报告生成成功！前往【检测报告】页面查看')

    } catch (err) {
      console.error('PDF处理错误:', err);
      return {
        success: false,
        error: err instanceof Error ? err.message : '未知错误'
      };
    }

  } catch (error) {
    console.error('PDF生成失败:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};
