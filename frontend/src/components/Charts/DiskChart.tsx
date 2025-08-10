/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from "echarts";
import { type FC, useMemo, useRef, useEffect } from "react";

export interface DiskChartProps {
  height?: number;
  data: {
    name: string,
    usage: string,
    free: string
  }[]
}

export const DiskChart: FC<DiskChartProps> = ({ height, data }) => {

  // 使用 useMemo 缓存 options，只有当 data 真正变化时才重新计算
  const options = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        // Use axis to trigger tooltip
        type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
      },
      formatter: function (params: any) {
        let result = '设备名：' + params[0].name + '<br/>';
        params.forEach((param: any) => {
          result += param.marker + param.seriesName + ': ' + param.value + ' GB<br/>';
        });
        return result;
      }
    },
    legend: {},
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: data.map(item => item.name)
    },
    series: [
      {
        name: '已用容量',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          formatter: function (params: any) {
            const currentData = data[params.dataIndex];
            const usage = Number(currentData.usage);
            const free = Number(currentData.free);
            const total = usage + free;
            return total > 0 ? (usage / total * 100).toFixed(1) + '%' : '0%';
          }
        },
        data: data.map(item => item.usage)
      },
      {
        name: '空闲容量',
        type: 'bar',
        stack: 'total',
        label: {
          show: true,
          color: 'white',
          formatter: function (params: any) {
            const currentData = data[params.dataIndex];
            const usage = Number(currentData.usage);
            const free = Number(currentData.free);
            const total = usage + free;
            return total > 0 ? (free / total * 100).toFixed(1) + '%' : '0%';
          }
        },
        data: data.map(item => item.free)
      }
    ]
  }), [data]);

  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  // 初始化图表
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

  // 更新图表配置
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