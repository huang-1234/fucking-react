import React, { useEffect, useRef } from 'react';
import { Card } from 'antd';
import * as echarts from 'echarts';
import type { DPState } from '../al';

interface DPGraphProps {
  data: number[];
  originalData?: number[];
  highlightIndices?: number[];
  title?: string;
}

const DPGraph: React.FC<DPGraphProps> = ({
  data,
  originalData,
  highlightIndices = [],
  title = 'DP数组可视化'
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current) {
      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const option: echarts.EChartsOption = {
        title: {
          text: title,
          left: 'center'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params: any) {
            const dpValue = params[0].value;
            const originalValue = originalData ? originalData[params[0].dataIndex] : null;

            let result = `索引: ${params[0].dataIndex}<br/>DP值: ${dpValue}`;
            if (originalValue !== null) {
              result += `<br/>原始值: ${originalValue}`;
            }
            return result;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: data.map((_, index) => index.toString()),
          name: '索引'
        },
        yAxis: {
          type: 'value',
          name: '值'
        },
        series: [
          {
            name: 'DP值',
            type: 'bar',
            data: data.map((value, index) => ({
              value,
              itemStyle: {
                color: highlightIndices.includes(index) ? '#ff4d4f' : '#1890ff',
                borderWidth: highlightIndices.includes(index) ? 2 : 0,
                borderColor: highlightIndices.includes(index) ? '#ffccc7' : ''
              }
            }))
          }
        ]
      };

      // 如果有原始数据，添加第二个系列
      if (originalData) {
        const series = option.series as echarts.SeriesOption[];
        series.push({
          name: '原始值',
          type: 'bar',
          data: originalData.map((value) => ({
            value,
            itemStyle: {
              color: '#52c41a',
              opacity: 0.5
            }
          })),
          z: -1
        });
      }

      chartInstance.current.setOption(option);
    }

    // 清理函数
    return () => {
      chartInstance.current?.dispose();
    };
  }, [data, originalData, highlightIndices, title]);

  // 窗口大小变化时调整图表大小
  useEffect(() => {
    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Card>
      <div ref={chartRef} style={{ width: '100%', height: '300px' }} />
    </Card>
  );
};

export default DPGraph;