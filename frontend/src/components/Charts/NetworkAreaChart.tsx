/* eslint-disable @typescript-eslint/no-explicit-any */
import * as echarts from "echarts";
import { type FC, useMemo, useRef, useEffect } from "react";

export interface NetworkAreaChartProps {
  height?: number;
  data?: {
    time: number;
    bytes_sent_kb: number;
    bytes_recv_kb: number;
    packets_sent: number;
    packets_recv: number;
  }[];
}

export const NetworkAreaChart: FC<NetworkAreaChartProps> = ({ height, data }) => {
  const options = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        if (params && params.length > 0) {
          const timestamp = params[0].value[0];
          let result = '时间: ' + new Date(timestamp).toLocaleString();
          result += '<br/>';
          result += params[0].seriesName + ': ' + (params[0].value[1]).toFixed(2) + 'MB<br/>';
          result += params[1].seriesName + ': ' + (params[1].value[1]).toFixed(2) + 'MB<br/>';
          result += params[2].seriesName + ': ' + (params[2].value[1]).toFixed(2) + '万个<br/>';
          result += params[3].seriesName + ': ' + (params[3].value[1]).toFixed(2) + '万个<br/>';
          return result;
        }
        return '';
      }
    },
    legend: {
      data: ['接收字节数', '发送字节数', '接收包数', '发送包数']
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '4%',
      right: '5%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'time',
        splitLine: {
          show: false
        },
        axisLabel: {
          formatter: function (value: any) {
            const date = new Date(Number(value));
            return date.getHours() + ':' + date.getMinutes().toString().padStart(2, '0');
          }
        },
        
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '字节数/MB',
        position: 'left',
        axisLine: {
          lineStyle: {
            color: '#5793f3'
          }
        },
        axisLabel: {
          formatter: '{value}',
          color: '#5793f3'
        },
        splitLine: {
          show: true
        }
      },
      {
        type: 'value',
        name: '包数/万个',
        position: 'right',
        axisLine: {
          lineStyle: {
            color: '#d14a61'
          }
        },
        axisLabel: {
          formatter: '{value}',
          color: '#d14a61'
        },
        splitLine: {
          show: true
        }
      }
    ],
    series: [
      {
        name: '接收字节数',
        type: 'line',
        yAxisIndex: 0, // 使用左侧y轴
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data?.map(item => [item.time, item.bytes_recv_kb / 1024]),
        smooth: true,
        showSymbol: false,
      },
      {
        name: '发送字节数',
        type: 'line',
        yAxisIndex: 0, // 使用左侧y轴
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data?.map(item => [item.time, item.bytes_sent_kb / 1024]),
        smooth: true,
        showSymbol: false,
      },
      {
        name: '接收包数',
        type: 'line',
        yAxisIndex: 1, // 使用右侧y轴
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data?.map(item => [item.time, item.packets_recv / 10000]),
        smooth: true,
        showSymbol: false,
      },
      {
        name: '发送包数',
        type: 'line',
        yAxisIndex: 1, // 使用右侧y轴
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: data?.map(item => [item.time, item.packets_sent / 10000]),
        smooth: true,
        showSymbol: false,
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