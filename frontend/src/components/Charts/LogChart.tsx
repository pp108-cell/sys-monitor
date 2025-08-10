import { useEffect, useMemo, useRef, type FC } from "react"
import * as echarts from 'echarts';
import type { ChartProps } from "."

// 统计数据类型
export interface LogStatistics {
  normal: number;
  abnormal: number;
}

export interface LogChartProps extends ChartProps {
  data?: LogStatistics
}

export const LogChart: FC<LogChartProps> = ({ height, data }) => {
  const options = useMemo(() => {
    // 使用传入的数据或默认值
    const normalCount = data?.normal || 0;
    const abnormalCount = data?.abnormal || 0;

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        left: 'center',
        data: ['正常日志', '异常日志']
      },
      series: [
        {
          name: '日志统计',
          type: 'pie',
          radius: ['40%', '65%'],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: normalCount, name: '正常日志' },
            { value: abnormalCount, name: '异常日志' }
          ],
          color: ['#91CC75', '#FF5733']
        }
      ],
    }
  }, [data]);

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
    }
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
      chartInstanceRef.current.setOption(options);
    }
  }, [options]);

  return (
    <div style={{ height }} ref={chartRef} />
  )
}