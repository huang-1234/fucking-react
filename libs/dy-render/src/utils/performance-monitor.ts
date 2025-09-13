import { IRenderMetric } from '../types';

/**
 * 渲染性能监控器
 * 负责跟踪和记录渲染性能指标
 */
export class RenderPerformanceMonitor {
  private metrics: IRenderMetric[] = [];
  private maxMetricsCount = 100; // 最大记录数量

  /**
   * 跟踪渲染开始
   * @param schemaId Schema ID
   */
  trackRenderStart(schemaId: string): void {
    if (typeof performance === 'undefined') return;

    performance.mark(`${schemaId}-start`);
  }

  /**
   * 跟踪渲染结束
   * @param schemaId Schema ID
   */
  trackRenderEnd(schemaId: string): void {
    if (typeof performance === 'undefined') return;

    performance.mark(`${schemaId}-end`);

    try {
      // 创建性能测量
      performance.measure(schemaId, `${schemaId}-start`, `${schemaId}-end`);

      // 获取测量结果
      const measures = performance.getEntriesByName(schemaId, 'measure');

      if (measures.length > 0) {
        const measure = measures[0];

        // 记录指标
        this.metrics.push({
          schemaId,
          duration: measure.duration,
          timestamp: Date.now()
        });

        // 限制指标数量
        if (this.metrics.length > this.maxMetricsCount) {
          this.metrics.shift();
        }

        // 清理标记和测量
        performance.clearMarks(`${schemaId}-start`);
        performance.clearMarks(`${schemaId}-end`);
        performance.clearMeasures(schemaId);
      }
    } catch (error) {
      console.error('Failed to measure render performance', error);
    }
  }

  /**
   * 获取所有渲染指标
   * @returns 渲染指标数组
   */
  getMetrics(): IRenderMetric[] {
    return [...this.metrics];
  }

  /**
   * 获取慢渲染指标
   * @param threshold 阈值（毫秒）
   * @returns 慢渲染指标数组
   */
  getSlowRenders(threshold = 100): IRenderMetric[] {
    return this.metrics.filter(m => m.duration > threshold);
  }

  /**
   * 获取平均渲染时间
   * @returns 平均渲染时间（毫秒）
   */
  getAverageRenderTime(): number {
    if (this.metrics.length === 0) return 0;

    const sum = this.metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / this.metrics.length;
  }

  /**
   * 获取最慢渲染
   * @returns 最慢渲染指标
   */
  getSlowestRender(): IRenderMetric | null {
    if (this.metrics.length === 0) return null;

    return this.metrics.reduce((slowest, current) => {
      return current.duration > slowest.duration ? current : slowest;
    }, this.metrics[0]);
  }

  /**
   * 清空指标
   */
  clearMetrics(): void {
    this.metrics = [];
  }

  /**
   * 生成性能报告
   * @returns 性能报告
   */
  generateReport(): string {
    const avgTime = this.getAverageRenderTime().toFixed(2);
    const slowest = this.getSlowestRender();
    const slowRenders = this.getSlowRenders();

    return `
渲染性能报告:
- 总渲染次数: ${this.metrics.length}
- 平均渲染时间: ${avgTime}ms
- 最慢渲染: ${slowest ? `${slowest.schemaId} (${slowest.duration.toFixed(2)}ms)` : 'N/A'}
- 慢渲染次数: ${slowRenders.length} (>100ms)
    `;
  }

  /**
   * 生成性能可视化数据
   * @returns SVG字符串
   */
  visualize(): string {
    if (this.metrics.length === 0) {
      return '<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg"><text x="10" y="50" fill="gray">No performance data available</text></svg>';
    }

    // 图表尺寸
    const width = 400;
    const height = 200;
    const padding = 40;

    // 数据范围
    const maxDuration = Math.max(...this.metrics.map(m => m.duration));
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // 生成柱状图数据
    const barWidth = Math.max(2, chartWidth / this.metrics.length - 2);
    const bars = this.metrics.map((metric, index) => {
      const x = padding + index * (chartWidth / this.metrics.length);
      const barHeight = (metric.duration / maxDuration) * chartHeight;
      const y = height - padding - barHeight;

      return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${metric.duration > 100 ? '#ff6b6b' : '#4dabf7'}" />`;
    }).join('');

    // 坐标轴
    const xAxis = `<line x1="${padding}" y1="${height - padding}" x2="${width - padding}" y2="${height - padding}" stroke="black" />`;
    const yAxis = `<line x1="${padding}" y1="${padding}" x2="${padding}" y2="${height - padding}" stroke="black" />`;

    // 标签
    const xLabel = `<text x="${width / 2}" y="${height - 10}" text-anchor="middle">Render Index</text>`;
    const yLabel = `<text x="10" y="${height / 2}" text-anchor="middle" transform="rotate(-90, 10, ${height / 2})">Duration (ms)</text>`;

    // 标题
    const title = `<text x="${width / 2}" y="20" text-anchor="middle" font-weight="bold">Render Performance</text>`;

    // 组合SVG
    return `
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  ${title}
  ${bars}
  ${xAxis}
  ${yAxis}
  ${xLabel}
  ${yLabel}
</svg>
    `;
  }
}
