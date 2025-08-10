/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from "echarts";
import { type FC, useMemo, useRef, useEffect } from "react";

export interface NetworkLineChartProps {
  height?: number;
  data?: {
    time: number;
    upstream: number;
    downloadstream: number;
  }[];
}

export const NetworkLineChart: FC<NetworkLineChartProps> = ({ height, data }) => {
  const options = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        if (params && params.length > 0) {
          const timestamp = params[0].value[0];
          const date = new Date(timestamp);
          let tooltipContent = `时间: ${date.toLocaleString()}<br/>`;

          params.forEach((param: any) => {
            const speed = param.value[1];
            if (param.seriesName === '上传') {
              tooltipContent += `上传速率: ${speed.toFixed(2)} KB/s<br/>`;
            } else if (param.seriesName === '下载') {
              tooltipContent += `下载速率: ${speed.toFixed(2)} KB/s`;
            }
          });

          return tooltipContent;
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
      type: 'value',
      name: 'KB/s',
      boundaryGap: [0, '100%'],
      splitLine: {
        show: true
      }
    },
    series: [
      {
        name: '上传',
        type: 'line',
        showSymbol: false,
        itemStyle: {
          color: '#1890ff'
        },
        data: data?.map(item => [item.time, item.upstream]) || []
      },
      {
        name: '下载',
        type: 'line',
        showSymbol: false,
        itemStyle: {
          color: '#52c41a'
        },
        data: data?.map(item => [item.time, item.downloadstream]) || []
      },
    ],
    legend: {
      data: ['上传', '下载']
    }
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