import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, List, Tag, Space } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;

// 示例代码
const basicSSRCode = `
// 服务端代码 (Node.js + Express)
import express from 'express';
import React from 'react';
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
        <title>React 19 SSR</title>
      </head>
      <body>
        <div id="root">
          <App />
        </div>
        <script src="/client.js"></script>
      </body>
    </html>,
    {
      // 当shell内容准备好时触发
      onShellReady() {
        // 开始向客户端发送流
        pipe(res);
      },
      // 处理错误
      onError(error) {
        console.error(error);
        res.status(500).send('服务器错误');
      }
    }
  );
});

app.listen(3000, () => {
  console.log('服务器运行在 http://localhost:3000');
});
`;

// 客户端水合代码
const clientHydrationCode = `
// 客户端代码
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

// 水合已有的服务端渲染内容
hydrateRoot(
  document.getElementById('root'),
  <App />
);
`;

/**
 * 基础SSR组件
 * 展示React 19中的基础SSR概念和代码示例
 */
const SSRBasic: React.FC = () => {
  const [isClient, setIsClient] = useState(false);

  // 检测是否在客户端环境
  useEffect(() => {
    setIsClient(true);
  }, []);

  // SSR优势列表
  const ssrBenefits = [
    {
      title: '更快的首屏加载',
      description: '用户无需等待JavaScript加载和执行即可看到页面内容',
      tag: '性能'
    },
    {
      title: '更好的SEO',
      description: '搜索引擎可以直接抓取完整的HTML内容',
      tag: '可发现性'
    },
    {
      title: '改善的用户体验',
      description: '用户可以立即看到内容，减少白屏时间',
      tag: '用户体验'
    },
    {
      title: '更好的性能指标',
      description: '改善FCP、LCP等关键性能指标',
      tag: '性能'
    }
  ];

  return (
    <div className="ssr-basic">
      <Title level={3}>基础服务端渲染 (SSR)</Title>

      <Paragraph>
        <Text strong>服务端渲染(SSR)</Text>是一种在服务器上生成HTML的技术，而不是在客户端浏览器中通过JavaScript生成。
        React 19进一步优化了SSR流程，提供了更好的开发体验和性能表现。
      </Paragraph>

      <Divider orientation="left">SSR的优势</Divider>

      <List
        itemLayout="horizontal"
        dataSource={ssrBenefits}
        renderItem={item => (
          <List.Item>
            <List.Item.Meta
              title={
                <Space>
                  <span>{item.title}</span>
                  <Tag color="blue">{item.tag}</Tag>
                </Space>
              }
              description={item.description}
            />
          </List.Item>
        )}
      />

      <Divider orientation="left">服务端代码示例</Divider>

      <CodeBlock
        language="jsx"
        code={basicSSRCode}
        width="100%"
      />

      <Divider orientation="left">客户端水合代码</Divider>

      <CodeBlock
        language="jsx"
        code={clientHydrationCode}
        width="100%"
      />

      <Divider />

      <Card size="small" title="环境检测" bordered={false}>
        <Text>当前运行环境: {isClient ? '客户端' : '服务端'}</Text>
      </Card>
    </div>
  );
};

export default SSRBasic;