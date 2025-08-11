import React, { useState, useEffect } from 'react';
import { Card, Typography, Divider, Alert, Steps, Space, Tag } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;

// 选择性水合代码示例
const selectiveHydrationCode = `
// 使用选择性水合
import { lazy, Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';

// 懒加载组件
const Comments = lazy(() => import('./Comments'));
const RelatedPosts = lazy(() => import('./RelatedPosts'));

function App() {
  return (
    <div>
      <h1>文章标题</h1>
      <p>文章内容...</p>

      {/* 重要的交互区域会优先水合 */}
      <Suspense fallback={<p>加载评论...</p>}>
        <Comments />
      </Suspense>

      {/* 次要区域延迟水合 */}
      <Suspense fallback={<p>加载相关文章...</p>}>
        <RelatedPosts />
      </Suspense>
    </div>
  );
}

// React 19会智能地确定水合优先级
hydrateRoot(document.getElementById('root'), <App />);
`;

// 水合错误处理代码
const hydrationErrorCode = `
// 处理水合错误
import { hydrateRoot } from 'react-dom/client';

// React 19改进了水合错误处理
try {
  hydrateRoot(document.getElementById('root'), <App />);
} catch (error) {
  // 在开发环境中，React会提供详细的水合错误信息
  console.error('水合错误:', error);

  // 生产环境中，可以选择客户端重新渲染
  if (process.env.NODE_ENV === 'production') {
    console.warn('尝试客户端渲染作为备选方案');
    const root = createRoot(document.getElementById('root'));
    root.render(<App />);
  }
}
`;

/**
 * @desc 服务端渲染数据注入与客户端水合
 * 展示React 19中的选择性水合和水合优化
 */
const Hydration: React.FC = () => {
  const [hydrationComplete, setHydrationComplete] = useState(false);

  // 模拟水合完成
  useEffect(() => {
    const timer = setTimeout(() => {
      setHydrationComplete(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // 水合步骤
  const hydrationSteps = [
    {
      title: '服务端渲染',
      description: '在服务器上生成HTML',
      status: 'finish'
    },
    {
      title: '客户端接收HTML',
      description: '浏览器接收并显示静态HTML',
      status: 'finish'
    },
    {
      title: 'JavaScript加载',
      description: '加载React和应用代码',
      status: 'finish'
    },
    {
      title: '水合过程',
      description: 'React接管已有DOM并添加事件监听器',
      status: hydrationComplete ? 'finish' : 'process'
    },
    {
      title: '完全交互',
      description: '页面完全可交互',
      status: hydrationComplete ? 'finish' : 'wait'
    }
  ];

  return (
    <div className="ssr-hydration">
      <Title level={3}>客户端水合 (Hydration)</Title>

      <Paragraph>
        <Text strong>水合(Hydration)</Text>是指React在浏览器中"接管"服务端预渲染的HTML，
        并将其转变为完全可交互的应用程序的过程。React 19引入了选择性水合和并发水合等改进。
      </Paragraph>

      <Alert
        message="React 19水合改进"
        description="React 19中的水合过程更加智能，可以根据用户交互优先水合重要区域，并且可以在不阻塞主线程的情况下进行水合。"
        type="info"
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Card title="水合过程" bordered={false} style={{ marginBottom: '20px' }}>
        <Steps
          direction="vertical"
          size="small"
          current={hydrationComplete ? 4 : 3}
          items={hydrationSteps.map(step => ({
            title: step.title,
            description: step.description,
            status: step.status as "wait" | "process" | "finish" | "error" | undefined
          }))}
        />
      </Card>

      <Divider orientation="left">选择性水合</Divider>

      <Space direction="vertical" style={{ width: '100%', marginBottom: '20px' }}>
        <Space>
          <Tag color="green">React 19新特性</Tag>
          <Tag color="blue">性能优化</Tag>
        </Space>
        <Paragraph>
          选择性水合允许React根据用户交互优先水合页面的特定部分，
          而不是一次性水合整个页面。这大大提高了页面的交互响应速度。
        </Paragraph>
      </Space>

      <CodeBlock
        language="jsx"
        code={selectiveHydrationCode}
        width="100%"
      />

      <Divider orientation="left">水合错误处理</Divider>

      <Paragraph>
        React 19改进了水合错误的处理方式，提供了更清晰的错误信息和恢复策略。
      </Paragraph>

      <CodeBlock
        language="jsx"
        code={hydrationErrorCode}
        width="100%"
      />

      <Divider />

      <Alert
        message={hydrationComplete ? "水合完成" : "水合进行中..."}
        description={hydrationComplete ? "页面现在完全可交互" : "React正在接管服务端渲染的HTML并添加事件处理"}
        type={hydrationComplete ? "success" : "warning"}
        showIcon
      />
    </div>
  );
};

export default Hydration;