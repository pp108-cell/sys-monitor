import * as echarts from "echarts";
import { type FC, useMemo, useRef, useEffect } from "react";

// 基础接口定义
export interface ChartProps {
  height?: number;
}

export interface CPUChartProps extends ChartProps {
  data?: {
    time: number,
    percent: number
  }[]
}

export const CPUChart: FC<CPUChartProps> = ({ height, data }) => {
  const options = useMemo(() => ({
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      data: [
        '0-6',
        '6-12',
        '12-18',
        '18-24'
      ]
    },
    series: [
      {
        name: '时间段',
        type: 'pie',
        selectedMode: 'single',
        radius: [0, '30%'],
        label: {
          position: 'inner',
          fontSize: 14
        },
        labelLine: {
          show: false
        },
        data: [
          { value: 1548, name: '上午' },
          { value: 775, name: '下午' },
          { value: 679, name: '晚上', selected: true }
        ]
      },
      {
        name: 'CPU 各时间段占用率',
        type: 'pie',
        radius: ['45%', '60%'],
        labelLine: {
          length: 30
        },
        label: {
          formatter: '{a|{a}}{abg|}\n{hr|}\n  {b|{b}：}{c} {per|{d}%}  ',
          backgroundColor: '#F6F8FC',
          borderColor: '#8C8D8E',
          borderWidth: 1,
          borderRadius: 4,

          rich: {
            a: {
              color: '#6E7079',
              lineHeight: 22,
              align: 'center'
            },
            hr: {
              borderColor: '#8C8D8E',
              width: '100%',
              borderWidth: 1,
              height: 0
            },
            b: {
              color: '#4C5058',
              fontSize: 14,
              fontWeight: 'bold',
              lineHeight: 33
            },
            per: {
              color: '#fff',
              backgroundColor: '#4C5058',
              padding: [3, 4],
              borderRadius: 4
            }
          }
        },
        data: [
          { value: 335, name: '0-6' },
          { value: 251, name: '6-12' },
          { value: 147, name: '12-18' },
          { value: 102, name: '18-24' }
        ]
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
}

export interface NetWorkChartProps extends ChartProps {
  data?: {
    time: number,
    upstream: number,
    downloadstream: number
  }[]
}

export const NetWorkChart: FC<NetWorkChartProps> = ({ height, data }) => {
  // 使用 useMemo 缓存 options，只有当 data 真正变化时才重新计算
  const options = useMemo(() => ({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    legend: {
      data: ['Video Ads', 'Direct', 'Search Engine']
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        boundaryGap: false,
        data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: 'Union Ads',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [220, 182, 191, 234, 290, 330, 310]
      },
      {
        name: 'Video Ads',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [150, 232, 201, 154, 190, 330, 410]
      },
      {
        name: 'Direct',
        type: 'line',
        stack: 'Total',
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [320, 332, 301, 334, 390, 330, 320]
      },
      {
        name: 'Search Engine',
        type: 'line',
        stack: 'Total',
        label: {
          show: true,
          position: 'top'
        },
        areaStyle: {},
        emphasis: {
          focus: 'series'
        },
        data: [820, 932, 901, 934, 1290, 1330, 1320]
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
} 