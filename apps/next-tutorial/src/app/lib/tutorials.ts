// 教程类型定义
export interface Tutorial {
  slug: string;
  title: string;
  description: string;
  category: string;
  order: number;
  demoCode?: string;
}

// 教程数据
const tutorials: Tutorial[] = [
  {
    slug: 'routing',
    title: '路由系统',
    description: '学习 Next.js 的文件系统路由和 App Router',
    category: 'core',
    order: 1,
    demoCode: `
// 这是一个简单的 Next.js 路由示例
function render() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>Next.js 路由示例</h1>
      <p>文件系统路由让开发变得简单直观</p>
      <ul>
        <li>
          <Link href="/dashboard">仪表盘</Link>
        </li>
        <li>
          <Link href="/profile">个人资料</Link>
        </li>
      </ul>
    </div>
  );
}
    `,
  },
  {
    slug: 'data-fetching',
    title: '数据获取',
    description: '掌握服务器组件和客户端组件的数据获取方式',
    category: 'core',
    order: 2,
    demoCode: `
// 这是一个客户端数据获取示例
function render() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (error) {
        console.error('获取数据失败', error);
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>数据获取示例</h1>
      {loading ? (
        <p>加载中...</p>
      ) : data ? (
        <div>
          <h2>{data.title}</h2>
          <p>完成状态: {data.completed ? '是' : '否'}</p>
        </div>
      ) : (
        <p>加载失败</p>
      )}
    </div>
  );
}
    `,
  },
  {
    slug: 'rendering',
    title: '渲染策略',
    description: '了解 SSR、SSG、ISR 等不同的渲染策略',
    category: 'core',
    order: 3,
    demoCode: `
// 这是一个渲染策略示例
function render() {
  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>Next.js 渲染策略</h1>
      <ul style={{ lineHeight: 1.6 }}>
        <li><strong>SSR (服务端渲染)</strong>: 每次请求时在服务器上渲染页面</li>
        <li><strong>SSG (静态生成)</strong>: 在构建时预渲染页面</li>
        <li><strong>ISR (增量静态再生)</strong>: 在后台定期重新生成静态页面</li>
        <li><strong>客户端渲染</strong>: 在浏览器中渲染页面</li>
      </ul>
      <p>选择正确的渲染策略可以优化性能和用户体验</p>
    </div>
  );
}
    `,
  },
];

// 获取所有教程
export function getAllTutorials(): Tutorial[] {
  return tutorials;
}

// 按分类获取教程
export function getTutorialsByCategory(category: string): Tutorial[] {
  return tutorials.filter(tutorial => tutorial.category === category)
    .sort((a, b) => a.order - b.order);
}

// 通过 slug 获取单个教程
export function getTutorialBySlug(slug: string): Tutorial | undefined {
  return tutorials.find(tutorial => tutorial.slug === slug);
}

// 获取所有教程的 slug
export function getAllTutorialSlugs(): string[] {
  return tutorials.map(tutorial => tutorial.slug);
}
