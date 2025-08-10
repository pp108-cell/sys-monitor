/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from "echarts";
import { type FC, useMemo, useRef, useEffect } from "react";
import type { ProcessInfo } from "@/services/useSystemInfoService/type";

export interface CPUPieChartProps {
  height?: number;
  data?: ProcessInfo[];
}

export const CPUPieChart: FC<CPUPieChartProps> = ({ height = 300, data = [] }) => {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }
    console.log(data[0])
    // 按CPU使用率降序排序
    const sortedData = [...data].sort((a, b) => b.cpu_percent - a.cpu_percent);

    // 取前5个
    const top5 = sortedData.slice(1, 6);
    const others = sortedData.slice(6);

    // 计算其他进程的总CPU使用率
    const othersTotal = others.reduce((sum, process) => sum + process.cpu_percent, 0);

    const result = top5.map(process => ({
      value: Math.round(process.cpu_percent * 100) / 100, // 保留2位小数
      name: process.name,
      pid: process.pid,
      username: process.username
    }));

    // 如果有其他进程，添加"其他"项
    if (othersTotal > 0) {
      result.push({
        value: Math.round(othersTotal * 100) / 100,
        name: '其他',
        pid: 0,
        username: 'multiple'
      });
    }

    return result;
  }, [data]);

  const options = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.data.name === '其他') {
          return `${params.data.name}<br/>CPU 使用率: ${params.data.value}%`;
        }
        return `${params.data.name} (PID: ${params.data.pid})<br/>用户: ${params.data.username}<br/>CPU 使用率: ${params.data.value}%`;
      }
    },
    legend: {
 
      left: 'left',
      data: chartData.map(item => item.name),
      textStyle: {
        fontSize: 12
      }
    },
    series: [
      {
        name: '进程 CPU 占用率',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold',
            formatter: (params: any) => {
              return `${params.name}\n${params.value}%`;
            }
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }), [chartData]);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && !chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
    }

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption(options);
    }
  }, [options]);

  // 当没有数据时显示空状态
  if (chartData.length === 0) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: '14px'
        }}
      >
        暂无进程数据
      </div>
    );
  }

  return (
    <div
      ref={chartRef}
      style={{ height }} />
  );
}; 