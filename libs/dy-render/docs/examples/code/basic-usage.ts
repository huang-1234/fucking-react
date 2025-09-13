import { createRenderer } from '../../../src/utils/create-renderer';
import { dy_view_schema } from '../../../types/schema.mock';

/**
 * 基本用法示例
 */
async function basicUsageExample() {
  // 创建容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 创建渲染器
  const renderer = await createRenderer({
    enablePerformanceMonitor: true
  });

  // 渲染Schema
  const renderInstance = await renderer.render(dy_view_schema, container);

  // 获取上下文
  const context = renderer.getContext();

  // 设置数据
  context.setData('user', { name: 'John', age: 30 });

  // 注册事件处理器
  context.registerEventHandler('onTabClick', (tab: string) => {
    console.log('Tab clicked:', tab);
  });

  // 5秒后更新渲染
  setTimeout(async () => {
    // 修改Schema
    const updatedSchema = {
      ...dy_view_schema,
      __props: {
        ...dy_view_schema.__props,
        __style: {
          ...dy_view_schema.__props?.__style,
          backgroundColor: '#ff0000'
        }
      }
    };

    // 更新渲染
    await renderInstance.update(updatedSchema);

    // 显示性能数据
    const perfSvg = renderer.visualizePerformance();
    const perfDiv = document.createElement('div');
    perfDiv.innerHTML = perfSvg;
    document.body.appendChild(perfDiv);
  }, 5000);
}

// 在浏览器环境中执行
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    basicUsageExample().catch(console.error);
  });
}

export { basicUsageExample };
