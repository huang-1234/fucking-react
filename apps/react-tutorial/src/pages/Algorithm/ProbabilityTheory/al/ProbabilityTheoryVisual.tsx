
import * as echarts from 'echarts';
import * as d3 from 'd3';

import { ProbabilityTheory } from '@fucking-algorithm/algorithm/ProbabilityTheory/base';
/**
 * @desc 概率论可视化计算模型
 */
export class ModelProbabilityVisual extends ProbabilityTheory {
  constructor() {
    super();
  }

  // ================= 可视化方法 =================
  /**
   * @desc 绘制概率密度函数
   * @param dist 分布类型 ('normal' | 'uniform' | 'binomial')
   * @param params 分布参数
   * @param domId 容器DOM ID
   */
  static plotDistribution(
    dist: string,
    params: any,
    domId: string
  ): void {
    const chart = echarts.init(document.getElementById(domId));
    const data = this.generateDistributionData(dist, params);
    const option: echarts.EChartsOption = {
      title: { text: `${dist}分布概率密度函数` },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'value', name: 'x' },
      yAxis: { type: 'value', name: 'f(x)' },
      series: [{
        type: 'line',
        smooth: true,
        data: data,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64, 158, 255, 0.5)' },
            { offset: 1, color: 'rgba(64, 158, 255, 0.1)' }
          ])
        }
      }]
    };

    chart.setOption(option);
  }

}