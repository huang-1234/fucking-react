// useTransition代码示例
const useTransitionCode = `// React 18中的useTransition Hook
import { useState, useTransition } from 'react';

function SearchResults() {
  const [isPending, startTransition] = useTransition();
  const [filterText, setFilterText] = useState('');
  const [results, setResults] = useState([]);

  function handleChange(e) {
    // 立即更新输入值，保持UI响应
    const value = e.target.value;
    setFilterText(value);

    // 将耗时的状态更新标记为过渡
    startTransition(() => {
      // 这个更新被视为非紧急，可以被中断
      setResults(filterItems(value));
    });
  }

  return (
    <>
      <input value={filterText} onChange={handleChange} />

      {/* 显示加载状态 */}
      {isPending && <Spinner />}

      {/* 显示结果 */}
      <List items={results} />
    </>
  );
}`;

// useDeferredValue代码示例
const useDeferredValueCode = `
// React 18中的useDeferredValue Hook
import { useState, useDeferredValue } from 'react';

function SearchResults() {
  const [filterText, setFilterText] = useState('');
  // 创建一个延迟版本的值
  const deferredText = useDeferredValue(filterText);
  const isStale = deferredText !== filterText;

  function handleChange(e) {
    // 立即更新输入值
    setFilterText(e.target.value);
    // deferredText会在空闲时自动更新
  }

  return (
    <>
      <input value={filterText} onChange={handleChange} />

      {/* 使用延迟值渲染列表 */}
      <div style={{ opacity: isStale ? 0.8 : 1 }}>
        <List items={filterItems(deferredText)} />
      </div>
    </>
  );
}`;

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

// 选择性水合代码示例
const selectiveHydrationCode = `// React 18选择性注水示例
import { Suspense } from 'react';
import { hydrateRoot } from 'react-dom/client';

function App() {
  return (
    <Layout>
      <NavBar />

      {/* 优先级较高的内容 */}
      <Suspense fallback={<HeaderSkeleton />}>
        <Header />
      </Suspense>

      {/* 优先级较低的内容 */}
      <Suspense fallback={<ContentSkeleton />}>
        <Content />
      </Suspense>

      {/* 最低优先级内容 */}
      <Suspense fallback={<CommentsSkeleton />}>
        <Comments />
      </Suspense>
    </Layout>
  );
}

// 客户端水合
hydrateRoot(document.getElementById('root'), <App />);

// React 18会:
// 1. 立即水合NavBar和Layout（非Suspense包裹的内容）
// 2. 然后水合用户交互的部分（例如用户点击了Comments）
// 3. 最后水合剩余部分`;

export {
  useTransitionCode,
  useDeferredValueCode,
  react17SSRCode,
  react18SSRCode,
  selectiveHydrationCode
}
