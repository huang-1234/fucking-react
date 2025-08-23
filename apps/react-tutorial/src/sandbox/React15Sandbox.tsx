import React, { useEffect, useRef } from 'react';
import { Card, Typography, Badge } from 'antd';
import { sendCommandToSandbox } from './VersionBridge';

const { Title, Text } = Typography;

interface React15SandboxProps {
  children?: React.ReactNode;
  title?: string;
}

/**
 * React15Sandbox 组件
 * 提供一个沙盒环境，模拟React 15的行为
 */
const React15Sandbox: React.FC<React15SandboxProps> = ({ children, title = 'React 15 沙盒环境' }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 初始化沙盒环境
  useEffect(() => {
    const sandboxContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>React 15 Sandbox</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .react15-watermark {
              position: fixed;
              bottom: 10px;
              right: 10px;
              background: rgba(0,0,0,0.1);
              padding: 5px 10px;
              border-radius: 4px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div id="sandbox-root"></div>
          <div class="react15-watermark">React 15 环境</div>
          <script>
            // 模拟React 15的生命周期方法
            window.addEventListener('message', function(event) {
              if (!event.data) return;

              console.log('沙盒收到消息:', event.data);

              // 处理来自父窗口的消息
              if (event.data.type === 'REACT15_INIT') {
                // 初始化沙盒
                console.log('初始化React 15沙盒');
              }
            });

            // 通知父窗口沙盒已加载完成
            window.parent.postMessage({ type: 'SANDBOX_READY', version: 'react15' }, '*');
          </script>
        </body>
      </html>
    `;

    // 当iframe加载完成后初始化沙盒
    const handleIframeLoad = () => {
      if (iframeRef.current) {
        sendCommandToSandbox({ type: 'REACT15_INIT' });
      }
    };

    // 如果iframe已经存在，添加加载事件监听器
    if (iframeRef.current) {
      iframeRef.current.addEventListener('load', handleIframeLoad);

      // 写入沙盒内容
      const iframeDocument = iframeRef.current.contentDocument;
      if (iframeDocument) {
        iframeDocument.open();
        iframeDocument.write(sandboxContent);
        iframeDocument.close();
      }
    }

    // 清理函数
    return () => {
      if (iframeRef.current) {
        iframeRef.current.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
          <Badge
            count="React 15"
            style={{
              backgroundColor: '#1890ff',
              marginLeft: 10,
              fontSize: '12px'
            }}
          />
        </div>
      }
      bordered={true}
      style={{ width: '100%' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          此环境模拟了React 15的行为，通过沙盒隔离实现。
        </Text>
      </div>

      {React.createElement('iframe', {
        key: 'sandbox-iframe',
        ref: iframeRef,
        id: 'version-sandbox',
        title: 'React 15 Sandbox',
        sandbox: 'allow-scripts allow-same-origin',
        style: {
          width: '100%',
          height: '400px',
          border: '1px solid #f0f0f0',
          borderRadius: '4px',
        }
      })}

      {children ? (
        <div style={{ marginTop: 16 }}>
          {children}
        </div>
      ) : null}
    </Card>
  );
};

export default React15Sandbox;