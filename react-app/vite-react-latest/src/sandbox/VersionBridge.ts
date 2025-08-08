/**
 * VersionBridge.ts
 * 版本通信控制器，用于不同React版本沙盒之间的通信
 */

// 模拟React 15生命周期方法
export const simulateComponentDidMount = (payload: any) => {
  console.log('模拟执行 componentDidMount:', payload);
  // 这里可以添加具体的模拟实现逻辑
};

// 模拟React 15生命周期方法
export const simulateComponentWillUnmount = (payload: any) => {
  console.log('模拟执行 componentWillUnmount:', payload);
  // 这里可以添加具体的模拟实现逻辑
};

// 监听来自沙盒的消息
export const initVersionBridge = () => {
  window.addEventListener('message', (event) => {
    if (!event.data || typeof event.data !== 'object') return;

    switch (event.data.type) {
      case 'REACT15_METHOD':
        if (event.data.method === 'componentDidMount') {
          simulateComponentDidMount(event.data.payload);
        } else if (event.data.method === 'componentWillUnmount') {
          simulateComponentWillUnmount(event.data.payload);
        }
        break;
      case 'REACT16_METHOD':
        // 处理React 16特有的方法
        console.log('处理React 16方法:', event.data);
        break;
      case 'REACT17_METHOD':
        // 处理React 17特有的方法
        console.log('处理React 17方法:', event.data);
        break;
      case 'REACT18_METHOD':
        // 处理React 18特有的方法
        console.log('处理React 18方法:', event.data);
        break;
      default:
        console.log('未知消息类型:', event.data);
    }
  });
};

// 向沙盒发送指令
export const sendCommandToSandbox = (command: { type: string; method?: string; payload?: any }) => {
  const iframe = document.getElementById('version-sandbox') as HTMLIFrameElement;
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(command, '*');
  } else {
    console.error('沙盒iframe未找到或未加载');
  }
};

export default {
  initVersionBridge,
  sendCommandToSandbox,
  simulateComponentDidMount,
  simulateComponentWillUnmount
};