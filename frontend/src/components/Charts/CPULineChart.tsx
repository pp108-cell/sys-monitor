/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from "echarts";
import { type FC, useMemo, useRef, useEffect } from "react";

export interface CPULineChartProps {
  height?: number;
  data?: {
    time: number;
    percent: number;
  }[];
}

export const CPULineChart: FC<CPULineChartProps> = ({ height, data }) => {
  const options = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (params && params.length > 0) {
          const timestamp = params[0].value[0];
          const percent = params[0].value[1];
          const date = new Date(timestamp);
          return `时间: ${date.toLocaleString()}<br/>CPU使用率: ${percent.toFixed(2)}%`;
        }
        return '';
      }
    },
    xAxis: {
      type: 'time',
      splitLine: {
        show: false
      },
      axisLabel: {
        formatter: function (value: any) {
          const date = new Date(value);
          return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
        }
      }
    },
    yAxis: {
      label: '百分比',
      type: 'value',
      min: 0,
      max: 100,
      boundaryGap: [0, '100%'],
      splitLine: {
        show: true
      }
    },
    series: [
      {
        name: 'CPU使用率',
        type: 'line',
        showSymbol: false,
        data: data?.map(item => [item.time, item.percent]) || []
      }
    ]
  }), [data]);

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

  return (
    <div
      ref={chartRef}
      style={{ height }} />
  );
}; 