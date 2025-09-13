import { createRenderer } from '../../../src/utils/create-renderer';
import { dy_view_schema } from '../../../types/schema.mock';

/**
 * 性能监控示例
 */
async function performanceMonitorExample() {
  // 创建容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 创建渲染器（启用性能监控）
  const renderer = await createRenderer({
    enablePerformanceMonitor: true
  });

  // 渲染Schema
  const renderInstance = await renderer.render(dy_view_schema, container);

  // 获取性能监控器
  const performanceMonitor = renderer.getPerformanceMonitor();

  // 进行多次渲染
  for (let i = 0; i < 10; i++) {
    // 修改Schema
    const updatedSchema = {
      ...dy_view_schema,
      __props: {
        ...dy_view_schema.__props,
        __style: {
          ...dy_view_schema.__props?.__style,
          backgroundColor: `hsl(${i * 36}, 100%, 50%)`
        }
      }
    };

    // 更新渲染
    await renderInstance.update(updatedSchema);

    // 等待一段时间
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // 显示性能数据
  if (performanceMonitor) {
    // 获取性能指标
    const metrics = performanceMonitor.getMetrics();
    console.log('Performance metrics:', metrics);

    // 获取慢渲染
    const slowRenders = performanceMonitor.getSlowRenders(100);
    console.log('Slow renders:', slowRenders);

    // 获取平均渲染时间
    const avgTime = performanceMonitor.getAverageRenderTime();
    console.log('Average render time:', avgTime, 'ms');

    // 获取最慢渲染
    const slowest = performanceMonitor.getSlowestRender();
    console.log('Slowest render:', slowest);

    // 生成性能报告
    const report = performanceMonitor.generateReport();
    console.log(report);

    // 可视化性能数据
    const perfSvg = performanceMonitor.visualize();
    const perfDiv = document.createElement('div');
    perfDiv.innerHTML = perfSvg;
    document.body.appendChild(perfDiv);
  }
}

// 在浏览器环境中执行
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    performanceMonitorExample().catch(console.error);
  });
}

export { performanceMonitorExample };
