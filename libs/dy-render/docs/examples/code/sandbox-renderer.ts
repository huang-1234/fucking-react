import { SandboxRenderer } from '../../../src/core/sandbox-renderer';
import { dy_view_schema } from '../../../types/schema.mock';

/**
 * 沙箱渲染示例
 */
async function sandboxRenderExample() {
  // 创建容器
  const container = document.createElement('div');
  document.body.appendChild(container);

  // 创建沙箱渲染器
  const sandboxRenderer = new SandboxRenderer();

  // 渲染Schema
  const instance = await sandboxRenderer.render(dy_view_schema, container);

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
    await instance.update(updatedSchema);
  }, 5000);

  // 在页面关闭时销毁沙箱
  window.addEventListener('beforeunload', () => {
    sandboxRenderer.destroy();
  });
}

// 在浏览器环境中执行
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    sandboxRenderExample().catch(console.error);
  });
}

export { sandboxRenderExample };
