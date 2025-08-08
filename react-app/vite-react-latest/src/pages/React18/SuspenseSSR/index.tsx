import React, { useState } from 'react';
import { Typography, Divider, Card, Space, Button, Alert, Tabs, Skeleton } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

/**
 * React 18 Suspense SSR 示例组件
 * 演示React 18中的Suspense服务器端渲染改进
 */
const SuspenseSSRDemo: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  // 模拟加载内容
  const handleLoadContent = () => {
    setIsLoading(true);
    setTimeout(() => {
      setShowContent(true);
      setIsLoading(false);
    }, 1500);
  };

  // 重置演示
  const handleReset = () => {
    setIsLoading(false);
    setShowContent(false);
  };

  // React 17 SSR代码示例
  const react17SSRCode = `// React 17中的SSR
import ReactDOMServer from 'react-dom/server';
import App from './App';

// 服务器端
function handleRequest(req, res) {
  // 生成整个应用的HTML
  const html = ReactDOMServer.renderToString(<App />);

  // 发送完整HTML给客户端
  res.send(\`
    <!DOCTYPE html>
    <html>
      <head><title>My App</title></head>
      <body>
        <div id="root">\${html}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  \`);
}

// 客户端
import ReactDOM from 'react-dom';
import App from './App';

// 水合整个应用
ReactDOM.hydrate(<App />, document.getElementById('root'));

// 问题: 必须等待所有数据加载完成才能发送HTML
// 如果某个组件数据获取很慢，整个页面都会被阻塞`;

  // React 18 SSR代码示例
  const react18SSRCode = `// React 18中的SSR与Suspense
import { renderToPipeableStream } from 'react-dom/server';
import App from './App';

// 服务器端
function handleRequest(req, res) {
  // 创建可流式传输的渲染
  const { pipe } = renderToPipeableStream(
    <App />,
    {
      bootstrapScripts: ['/bundle.js'],
      onShellReady() {
        // 当Shell准备好后立即开始流式传输
        res.setHeader('content-type', 'text/html');
        pipe(res);
      }
    }
  );
}

// 客户端
import { hydrateRoot } from 'react-dom/client';
import App from './App';

// 选择性水合
hydrateRoot(document.getElementById('root'), <App />);

// 应用中的Suspense组件
function MyComponent() {
  return (
    <Suspense fallback={<Spinner />}>
      <Comments />
    </Suspense>
  );
}`;

  // 选择性注水代码示例
  const selectiveHydrationCode = `// React 18选择性注水示例
import { Suspense, lazy } from 'react';

// 懒加载组件
const Comments = lazy(() => import('./Comments'));
const RelatedPosts = lazy(() => import('./RelatedPosts'));

function BlogPost() {
  return (
    <article>
      <h1>文章标题</h1>
      <section>文章内容...</section>

      {/* 重要但不紧急的内容 */}
      <Suspense fallback={<p>加载评论...</p>}>
        <Comments />
      </Suspense>

      {/* 次要内容 */}
      <Suspense fallback={<p>加载相关文章...</p>}>
        <RelatedPosts />
      </Suspense>
    </article>
  );
}

// 服务器会先发送带有占位符的HTML
// 然后在组件准备好时流式传输实际内容
// 客户端会根据用户交互优先注水`;

  return (
    <div className="suspense-ssr-demo">
      <Typography>
        <Title level={2}>React 18: Suspense SSR</Title>
        <Paragraph>
          React 18对服务器端渲染(SSR)进行了重大改进，引入了基于Suspense的流式SSR和选择性注水。
          这些改进解决了传统SSR的一些关键限制，提供了更好的用户体验。
        </Paragraph>

        <Alert
          message="服务器端功能"
          description="这些功能主要在服务器端实现，本演示通过模拟展示其工作原理。在实际应用中，这些功能需要在Node.js服务器环境中使用。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider orientation="left">SSR改进演示</Divider>

        <Tabs defaultActiveKey="1">
          <TabPane tab="传统SSR (React 17)" key="1">
            <Card title="传统SSR模拟">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Alert
                  message="传统SSR的限制"
                  description="在React 17及之前的版本中，服务器必须等待所有数据加载完成才能发送HTML。如果某个组件的数据获取很慢，整个页面都会被阻塞。"
                  type="warning"
                  showIcon
                />

                <div style={{ border: '1px dashed #ccc', padding: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text>页面内容:</Text>
                  </div>

                  {!isLoading && !showContent ? (
                    <Button type="primary" onClick={handleLoadContent}>
                      加载页面
                    </Button>
                  ) : isLoading ? (
                    <div>
                      <Text>等待所有组件数据加载完成...</Text>
                      <Skeleton active paragraph={{ rows: 4 }} />
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={4}>文章标题</Title>
                        <Paragraph>这是文章的主要内容...</Paragraph>
                      </div>

                      <Card title="评论" size="small" style={{ marginBottom: 16 }}>
                        <Paragraph>评论1: 很棒的文章!</Paragraph>
                        <Paragraph>评论2: 学到了很多，谢谢分享。</Paragraph>
                      </Card>

                      <Card title="相关文章" size="small">
                        <Paragraph>- 相关文章1</Paragraph>
                        <Paragraph>- 相关文章2</Paragraph>
                      </Card>

                      <Button onClick={handleReset} style={{ marginTop: 16 }}>
                        重置演示
                      </Button>
                    </div>
                  )}
                </div>

                <CodeBlock code={react17SSRCode} />
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="流式SSR (React 18)" key="2">
            <Card title="流式SSR模拟">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Alert
                  message="React 18的流式SSR"
                  description="React 18允许服务器立即发送页面的'骨架'，然后在内容准备好时流式传输剩余部分。用户可以更快地看到页面，并与可见部分交互。"
                  type="success"
                  showIcon
                />

                <div style={{ border: '1px dashed #ccc', padding: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text>页面内容:</Text>
                  </div>

                  {!isLoading && !showContent ? (
                    <Button type="primary" onClick={handleLoadContent}>
                      加载页面
                    </Button>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={4}>文章标题</Title>
                        <Paragraph>这是文章的主要内容...</Paragraph>
                      </div>

                      <Card title="评论" size="small" style={{ marginBottom: 16 }}>
                        {isLoading ? (
                          <Skeleton active paragraph={{ rows: 2 }} />
                        ) : (
                          <>
                            <Paragraph>评论1: 很棒的文章!</Paragraph>
                            <Paragraph>评论2: 学到了很多，谢谢分享。</Paragraph>
                          </>
                        )}
                      </Card>

                      <Card title="相关文章" size="small">
                        {isLoading ? (
                          <Skeleton active paragraph={{ rows: 2 }} />
                        ) : (
                          <>
                            <Paragraph>- 相关文章1</Paragraph>
                            <Paragraph>- 相关文章2</Paragraph>
                          </>
                        )}
                      </Card>

                      <Button onClick={handleReset} style={{ marginTop: 16 }}>
                        重置演示
                      </Button>
                    </div>
                  )}
                </div>

                <CodeBlock code={react18SSRCode} />
              </Space>
            </Card>
          </TabPane>

          <TabPane tab="选择性注水" key="3">
            <Card title="选择性注水模拟">
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Alert
                  message="选择性注水"
                  description="React 18可以根据用户交互优先注水（激活）不同部分的内容。例如，如果用户点击评论区，React会优先注水评论组件，即使其他部分尚未注水。"
                  type="success"
                  showIcon
                />

                <div style={{ border: '1px dashed #ccc', padding: 16 }}>
                  <div style={{ marginBottom: 16 }}>
                    <Text>用户交互模拟:</Text>
                  </div>

                  {!showContent ? (
                    <Button type="primary" onClick={handleLoadContent}>
                      加载页面
                    </Button>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 16 }}>
                        <Title level={4}>文章标题</Title>
                        <Paragraph>这是文章的主要内容...</Paragraph>
                      </div>

                      <div style={{ display: 'flex', gap: 16 }}>
                        <Card
                          title={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>评论</span>
                              <Button size="small">点击交互</Button>
                            </div>
                          }
                          size="small"
                          style={{ flex: 1 }}
                        >
                          <div style={{ position: 'relative' }}>
                            <Paragraph>评论1: 很棒的文章!</Paragraph>
                            <Paragraph>评论2: 学到了很多，谢谢分享。</Paragraph>

                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              background: 'rgba(0, 0, 0, 0.03)',
                              zIndex: 1
                            }}>
                              <Text type="secondary">已优先注水 (可交互)</Text>
                            </div>
                          </div>
                        </Card>

                        <Card
                          title="相关文章"
                          size="small"
                          style={{ flex: 1 }}
                        >
                          <div style={{ position: 'relative' }}>
                            <Paragraph>- 相关文章1</Paragraph>
                            <Paragraph>- 相关文章2</Paragraph>

                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              background: 'rgba(0, 0, 0, 0.1)',
                              zIndex: 1
                            }}>
                              <Text type="secondary">尚未注水 (不可交互)</Text>
                            </div>
                          </div>
                        </Card>
                      </div>

                      <Button onClick={handleReset} style={{ marginTop: 16 }}>
                        重置演示
                      </Button>
                    </div>
                  )}
                </div>

                <CodeBlock code={selectiveHydrationCode} />
              </Space>
            </Card>
          </TabPane>
        </Tabs>

        <Divider orientation="left">React 18 SSR的优势</Divider>
        <Paragraph>
          React 18的SSR改进带来以下优势：
        </Paragraph>
        <ul>
          <li><Text strong>更快的首次内容绘制(FCP)</Text> - 用户可以更快看到页面内容</li>
          <li><Text strong>更好的用户体验</Text> - 用户可以在整个页面加载完成前与已加载部分交互</li>
          <li><Text strong>更高的性能</Text> - 通过选择性注水减少了JavaScript执行时间</li>
          <li><Text strong>更好的SEO</Text> - 搜索引擎可以更快地抓取页面内容</li>
          <li><Text strong>更低的服务器负载</Text> - 服务器可以更快地响应请求</li>
        </ul>

        <Paragraph>
          这些改进使React应用可以提供类似于传统多页面应用的快速初始加载体验，
          同时保留单页面应用的丰富交互性。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default SuspenseSSRDemo;