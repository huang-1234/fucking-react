/**
 * 沙盒环境工具函数
 * 提供安全的代码执行环境和构建模拟
 */

/**
 * 创建一个安全的沙盒环境
 * @param code 要执行的代码
 * @returns 沙盒对象
 */
export const createSandbox = (code: string) => {
  // 创建一个 Blob 对象
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);

  // 创建一个 Worker 来执行代码
  const worker = new Worker(url);

  // 清理函数
  const cleanup = () => {
    worker.terminate();
    URL.revokeObjectURL(url);
  };

  return {
    worker,
    execute: (data: any) => {
      return new Promise((resolve, reject) => {
        // 设置消息处理器
        worker.onmessage = (e) => {
          resolve(e.data);
        };

        // 设置错误处理器
        worker.onerror = (e) => {
          reject(new Error(`Worker error: ${e.message}`));
        };

        // 发送数据到 Worker
        worker.postMessage(data);
      });
    },
    terminate: cleanup
  };
};

/**
 * 创建一个安全的 iframe 沙盒
 * @param container 容器元素
 * @param srcDoc HTML 内容
 * @returns iframe 元素和通信接口
 */
export const createIframeSandbox = (container: HTMLElement, srcDoc: string) => {
  // 创建 iframe 元素
  const iframe = document.createElement('iframe');
  iframe.sandbox = 'allow-scripts allow-same-origin';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  iframe.style.border = 'none';

  // 设置 HTML 内容
  iframe.srcdoc = srcDoc;

  // 添加到容器
  container.appendChild(iframe);

  // 通信接口
  const sendMessage = (message: any) => {
    iframe.contentWindow?.postMessage(message, '*');
  };

  // 消息监听器
  const messageListeners: Array<(data: any) => void> = [];

  window.addEventListener('message', (event) => {
    if (event.source === iframe.contentWindow) {
      messageListeners.forEach(listener => listener(event.data));
    }
  });

  return {
    iframe,
    sendMessage,
    onMessage: (callback: (data: any) => void) => {
      messageListeners.push(callback);
      return () => {
        const index = messageListeners.indexOf(callback);
        if (index !== -1) {
          messageListeners.splice(index, 1);
        }
      };
    },
    destroy: () => {
      container.removeChild(iframe);
    }
  };
};

/**
 * 模拟 Webpack 构建过程
 * @param config Webpack 配置
 * @returns 构建结果
 */
export const simulateWebpackBuild = async (config: any) => {
  console.log('config', config);
  // 这里是模拟实现，实际应用中可能需要与后端服务通信
  return new Promise((resolve) => {
    // 模拟构建延迟
    setTimeout(() => {
      resolve({
        success: true,
        stats: {
          time: Math.floor(Math.random() * 5000) + 2000, // 模拟构建时间 2-7 秒
          assets: [
            { name: 'main.js', size: 1024 * 1024 * Math.random() * 2 }, // 0-2MB
            { name: 'vendor.js', size: 1024 * 1024 * Math.random() * 3 }, // 0-3MB
          ],
          errors: [],
          warnings: []
        }
      });
    }, 1000);
  });
};

/**
 * 模拟 Vite 构建过程
 * @param config Vite 配置
 * @returns 构建结果
 */
export const simulateViteBuild = async (config: any) => {
  console.log('config', config);
  // 这里是模拟实现，实际应用中可能需要与后端服务通信
  return new Promise((resolve) => {
    // 模拟构建延迟
    setTimeout(() => {
      resolve({
        success: true,
        stats: {
          time: Math.floor(Math.random() * 2000) + 500, // 模拟构建时间 0.5-2.5 秒
          assets: [
            { name: 'index.js', size: 1024 * 1024 * Math.random() * 0.5 }, // 0-0.5MB
            { name: 'vendor.js', size: 1024 * 1024 * Math.random() * 1.5 }, // 0-1.5MB
          ],
          errors: [],
          warnings: []
        }
      });
    }, 300);
  });
};
