import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Timeline, Button, Space, Tag, Spin, Progress } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;

// 流式SSR代码示例
const streamingSSRCode = `
// 服务端代码 (Node.js + Express)
import express from 'express';
import React, { Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

const app = express();

app.get('/', (req, res) => {
  // 设置响应头
  res.setHeader('Content-Type', 'text/html');

  // 创建HTML流
  const { pipe } = renderToPipeableStream(
    <html>
      <head>
        <title>React 19 流式SSR</title>
      </head>
      <body>
        <div id="root">
          <Suspense fallback={<div>加载中...</div>}>
            <App />
          </Suspense>
        </div>
        <script src="/client.js"></script>
      </body>
    </html>,
    {
      // 当shell内容准备好时触发
      onShellReady() {
        // 开始向客户端发送流
        res.status(200);
        pipe(res);
      },
      // 当所有Suspense边界都已解析时触发
      onAllReady() {
        console.log('所有内容已准备就绪');
      },
      // 处理错误
      onError(error) {
        console.error(error);
        res.status(500).send('服务器错误');
      }
    }
  );
});

app.listen(3000);
`;

// 数据获取组件示例
const dataFetchingCode = `
// 使用Suspense和React 19的数据获取
import { use } from 'react';

// 创建一个资源加载器
function fetchData(url) {
  // 创建一个promise
  const promise = fetch(url)
    .then(response => response.json());

  // 返回一个可以被use钩子使用的对象
  return {
    read() {
      return use(promise);
    }
  };
}

// 产品数据资源
const productResource = fetchData('/api/products');

// 产品组件
function Products() {
  // 使用use钩子读取数据
  // 如果数据尚未就绪，React会自动抛出promise
  // 由最近的Suspense边界捕获
  const products = productResource.read();

  return (
    <ul>
      {products.map(product => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}

// 在App中使用
function App() {
  return (
    <div>
      <h1>我们的产品</h1>
      <Suspense fallback={<div>加载产品中...</div>}>
        <Products />
      </Suspense>
    </div>
  );
}
`;

/**
 * 流式SSR组件
 * 展示React 19中的流式SSR和Suspense集成
 */
const StreamingSSR: React.FC = () => {
  const [streamingProgress, setStreamingProgress] = useState(0);
  const [streamingComplete, setStreamingComplete] = useState(false);
  const [streamingStage, setStreamingStage] = useState(0);

  // 模拟流式渲染过程
  useEffect(() => {
    const interval = setInterval(() => {
      setStreamingProgress(prev => {
        const newProgress = prev + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setStreamingComplete(true);
          return 100;
        }

        // 更新阶段
        if (newProgress >= 75 && streamingStage < 3) {
          setStreamingStage(3);
        } else if (newProgress >= 50 && streamingStage < 2) {
          setStreamingStage(2);
        } else if (newProgress >= 25 && streamingStage < 1) {
          setStreamingStage(1);
        }

        return newProgress;
      });
    }, 300);

    return () => clearInterval(interval);
  }, [streamingStage]);

  // 流式渲染的阶段
  const streamingStages = [
    {
      title: '发送初始HTML (Shell)',
      description: '包含页面结构和占位符',
      dot: streamingStage >= 0 ? <Tag color="green">完成</Tag> : <Spin size="small" />
    },
    {
      title: '发送关键内容',
      description: '首屏内容和重要组件',
      dot: streamingStage >= 1 ? <Tag color="green">完成</Tag> : <Spin size="small" />
    },
    {
      title: '发送次要内容',
      description: '非首屏内容和低优先级组件',
      dot: streamingStage >= 2 ? <Tag color="green">完成</Tag> : <Spin size="small" />
    },
    {
      title: '发送剩余内容',
      description: '延迟加载的组件和数据',
      dot: streamingStage >= 3 ? <Tag color="green">完成</Tag> : <Spin size="small" />
    }
  ];

  return (
    <div className="streaming-ssr">
      <Title level={3}>流式服务端渲染 (Streaming SSR)</Title>

      <Paragraph>
        <Text strong>流式SSR</Text>是React 19中的一项重要改进，允许服务器以流的形式发送HTML，
        使浏览器能够逐步渲染页面，而不必等待所有数据都准备好。这大大提高了用户体验和性能指标。
      </Paragraph>

      <Card
        title="流式渲染模拟"
        bordered={false}
        style={{ marginBottom: '20px' }}
        extra={
          <Button
            type="primary"
            onClick={() => {
              setStreamingProgress(0);
              setStreamingComplete(false);
              setStreamingStage(0);
            }}
            disabled={!streamingComplete}
          >
            重新模拟
          </Button>
        }
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Progress
            percent={streamingProgress}
            status={streamingComplete ? "success" : "active"}
            style={{ marginBottom: '20px' }}
          />

          <Timeline
            items={streamingStages.map((stage, index) => ({
              children: (
                <>
                  <Text strong>{stage.title}</Text>
                  <br />
                  <Text type="secondary">{stage.description}</Text>
                </>
              ),
              dot: stage.dot,
              color: streamingStage >= index ? 'green' : 'blue'
            }))}
          />
        </Space>
      </Card>

      <Divider orientation="left">流式SSR实现</Divider>

      <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
        <Space>
          <Tag color="green">React 19新特性</Tag>
          <Tag color="blue">性能优化</Tag>
          <Tag color="purple">用户体验</Tag>
        </Space>
        <Paragraph>
          React 19的流式SSR使用<Text code>renderToPipeableStream</Text>API，
          结合Suspense边界，允许服务器在数据准备好后立即发送内容，而不是等待所有数据都获取完毕。
        </Paragraph>
      </Space>

      <CodeBlock
        language="jsx"
        code={streamingSSRCode}
        width="100%"
      />

      <Divider orientation="left">数据获取与Suspense</Divider>

      <Paragraph>
        React 19改进了服务器端数据获取机制，通过<Text code>use</Text>钩子和Suspense，
        使数据获取更加直观和高效。
      </Paragraph>

      <CodeBlock
        language="jsx"
        code={dataFetchingCode}
        width="100%"
      />

      <Divider />

      <Card title="流式SSR的优势" bordered={false}>
        <ul>
          <li>
            <Text strong>更快的首次内容绘制 (FCP)</Text> -
            用户可以更快看到页面内容，不必等待所有数据
          </li>
          <li>
            <Text strong>改善的最大内容绘制 (LCP)</Text> -
            关键内容优先发送，提高核心Web指标
          </li>
          <li>
            <Text strong>渐进式加载体验</Text> -
            页面内容逐步显示，提供更好的用户体验
          </li>
          <li>
            <Text strong>减少服务器负载</Text> -
            服务器可以更早释放连接，处理更多请求
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default StreamingSSR;