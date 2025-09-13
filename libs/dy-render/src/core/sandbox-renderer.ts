import { DySchema } from '../../types/schema';
import { IRenderInstance } from '../types';

/**
 * 沙箱渲染器
 * 提供隔离的渲染环境，防止恶意代码执行
 */
export class SandboxRenderer {
  private iframe: HTMLIFrameElement;
  private iframeLoaded: boolean = false;
  private renderQueue: Array<() => void> = [];

  /**
   * 构造函数
   */
  constructor() {
    // 创建隐藏的iframe
    this.iframe = document.createElement('iframe');
    this.iframe.style.display = 'none';
    this.iframe.sandbox.add('allow-scripts');
    this.iframe.sandbox.add('allow-same-origin');

    // 监听iframe加载完成
    this.iframe.addEventListener('load', () => {
      this.iframeLoaded = true;
      this.processRenderQueue();
    });

    // 添加到文档
    if (typeof document !== 'undefined') {
      document.body.appendChild(this.iframe);
    }
  }

  /**
   * 渲染Schema
   * @param schema Schema协议
   * @param container 容器元素
   * @returns 渲染实例
   */
  async render(schema: DySchema, container: HTMLElement): Promise<IRenderInstance> {
    return new Promise((resolve) => {
      const renderFn = () => {
        try {
          // 获取iframe文档
          const doc = this.iframe.contentDocument!;

          // 创建样式
          this.injectStyles(doc);

          // 创建渲染容器
          const sandboxContainer = doc.createElement('div');
          doc.body.appendChild(sandboxContainer);

          // 渲染Schema
          const rootElement = this.renderNode(schema, sandboxContainer);

          // 清空容器
          container.innerHTML = '';

          // 克隆节点到主文档
          const clonedNode = document.importNode(rootElement, true);
          container.appendChild(clonedNode);

          // 创建渲染实例
          const instance: IRenderInstance = {
            container,
            update: async (newSchema: DySchema) => {
              await this.render(newSchema, container);
            },
            destroy: () => {
              container.innerHTML = '';
            }
          };

          resolve(instance);
        } catch (error) {
          console.error('Sandbox render error', error);
          container.innerHTML = '<div style="color: red;">Sandbox rendering failed</div>';

          // 返回空实例
          resolve({
            container,
            update: async () => {},
            destroy: () => {}
          });
        }
      };

      // 如果iframe已加载，直接渲染
      if (this.iframeLoaded) {
        renderFn();
      } else {
        // 否则加入队列
        this.renderQueue.push(renderFn);
      }
    });
  }

  /**
   * 处理渲染队列
   */
  private processRenderQueue(): void {
    while (this.renderQueue.length > 0) {
      const renderFn = this.renderQueue.shift();
      if (renderFn) {
        renderFn();
      }
    }
  }

  /**
   * 注入样式
   * @param doc iframe文档
   */
  private injectStyles(doc: Document): void {
    const style = doc.createElement('style');
    style.textContent = `
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      }
    `;
    doc.head.appendChild(style);
  }

  /**
   * 渲染节点
   * @param schema Schema节点
   * @param parent 父容器
   * @returns 渲染后的DOM元素
   */
  private renderNode(schema: DySchema, parent: HTMLElement): HTMLElement {
    const doc = this.iframe.contentDocument!;

    // 创建元素
    const element = doc.createElement('div');

    // 设置ID和类名
    if (schema.__id) {
      element.id = schema.__id;
    }
    if (schema.__name) {
      element.classList.add(schema.__name);
    }

    // 应用样式
    if (schema.__props?.__style) {
      this.applyStyles(element, schema.__props.__style);
    }

    // 应用文本
    if (schema.__props?.__text) {
      element.textContent = schema.__props.__text;
    }

    // 渲染子节点
    if (schema.__children && Array.isArray(schema.__children)) {
      schema.__children.forEach(child => {
        const childElement = this.renderNode(child, element);
        element.appendChild(childElement);
      });
    }

    // 添加到父容器
    parent.appendChild(element);

    return element;
  }

  /**
   * 应用样式
   * @param element DOM元素
   * @param styles 样式对象
   */
  private applyStyles(element: HTMLElement, styles: Record<string, any>): void {
    Object.entries(styles).forEach(([key, value]) => {
      // 转换样式属性名
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      element.style.setProperty(cssKey, String(value));
    });
  }

  /**
   * 销毁沙箱
   */
  destroy(): void {
    try {
      // 安全地移除iframe
      if (this.iframe) {
        // 检查iframe是否仍在文档中
        const isInDocument = document.body.contains(this.iframe);

        if (isInDocument && this.iframe.parentNode) {
          this.iframe.parentNode.removeChild(this.iframe);
        }

        // 清除引用
        this.iframe = null as any;
        this.iframeLoaded = false;
        this.renderQueue = [];
      }
    } catch (error) {
      console.error('Error destroying sandbox:', error);
    }
  }
}
