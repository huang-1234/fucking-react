import React, { useEffect, useRef } from 'react'
import * as echarts from 'echarts';
import { option } from './echartsOption';

function ShanghaicompositeIndex() {
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);
      myChart.setOption(option);
    }
  }, [chartRef]);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1>ShanghaicompositeIndex</h1>
      <div ref={chartRef} style={{ width: '100%', minHeight: '90vh' }}></div>
    </div>
  )
}

export default React.memo(ShanghaicompositeIndex)