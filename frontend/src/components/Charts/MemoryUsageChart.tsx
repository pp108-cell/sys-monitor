/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from "echarts";
import { type FC, useMemo, useRef, useEffect } from "react";

export interface MemoryUsageChartProps {
  height?: number;
  data?: {
    time: number;
    used_memory: number;
    used_swap: number;
  }[];
}

export const MemoryUsageChart: FC<MemoryUsageChartProps> = ({ height, data }) => {
  const options = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        const timestamp = params[0].value[0];
        let result = `时间：${new Date(timestamp).toLocaleString()} <br/ >`;
        params.forEach((item: any)  => {
          result += item.seriesName + ' ' + (item.value[1]).toFixed(2) + ' GB <br />'; 
        });
        return result;
      }
    },
    legend: {
      data: ['已使用内存', '已使用交换内存']
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLabel: {
        formatter: function (value: any) {
          const date = new Date(Number(value));
          return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
        }
      },
      splitLine: {
        show: false
      },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true
      }
    },
    series: [
      {
        name: '已使用内存',
        type: 'line',
        showSymbol: false,
        data: data?.map(item => [item.time, item.used_memory])
      },
      {
        name: '已使用交换内存',
        type: 'line',
        showSymbol: false,
        data: data?.map(item => [item.time, item.used_swap])
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