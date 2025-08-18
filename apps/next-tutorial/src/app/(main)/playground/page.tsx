'use client';

import { useState } from 'react';
import LiveDemo from '@/app/components/LiveDemo';

const DEFAULT_CODE = `// 欢迎使用 Next.js 代码沙盒
// 你可以在这里尝试 React 和 Next.js 的功能

function render() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>Next.js 代码沙盒</h1>
      <p>当前计数: {count}</p>
      <button
        onClick={() => setCount(count + 1)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginRight: '0.5rem'
        }}
      >
        增加
      </button>
      <button
        onClick={() => setCount(0)}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#e4e4e4',
          color: '#333',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        重置
      </button>
    </div>
  );
}`;

const TEMPLATES = [
  {
    name: '计数器',
    code: DEFAULT_CODE,
  },
  {
    name: '待办事项',
    code: `// 一个简单的待办事项应用

function render() {
  const [todos, setTodos] = React.useState([
    { id: 1, text: '学习 Next.js', completed: false },
    { id: 2, text: '构建项目', completed: false }
  ]);
  const [input, setInput] = React.useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>待办事项</h1>

      <div style={{ display: 'flex', marginBottom: '1rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="添加新任务..."
          style={{
            padding: '0.5rem',
            flex: 1,
            borderRadius: '4px 0 0 4px',
            border: '1px solid #ccc',
            borderRight: 'none'
          }}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button
          onClick={addTodo}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '0 4px 4px 0',
            cursor: 'pointer'
          }}
        >
          添加
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            onClick={() => toggleTodo(todo.id)}
            style={{
              padding: '0.75rem',
              borderBottom: '1px solid #eee',
              cursor: 'pointer',
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#999' : 'inherit'
            }}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  );
}`,
  },
  {
    name: '数据获取',
    code: `// 从 API 获取数据示例

function render() {
  const [posts, setPosts] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=5');
        if (!response.ok) {
          throw new Error('网络响应不正常');
        }
        const data = await response.json();
        setPosts(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
        <h1>加载中...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
        <h1>出错了</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', fontFamily: 'system-ui' }}>
      <h1>文章列表</h1>
      <div>
        {posts.map(post => (
          <div
            key={post.id}
            style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            <h2 style={{ marginTop: 0 }}>{post.title}</h2>
            <p>{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
  },
];

export default function PlaygroundPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);

  return (
    <div className="max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Next.js 代码沙盒</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          在这里你可以尝试 React 和 Next.js 的功能，实时查看效果。
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="font-medium">选择模板：</span>
          {TEMPLATES.map((template) => (
            <button
              key={template.name}
              onClick={() => setSelectedTemplate(template)}
              className={`px-3 py-1 rounded text-sm ${
                selectedTemplate.name === template.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {template.name}
            </button>
          ))}
        </div>
      </header>

      <LiveDemo code={selectedTemplate.code} />

      <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">提示</h2>
        <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
          <li>编辑左侧代码，右侧会实时显示结果</li>
          <li>必须包含一个名为 <code>render</code> 的函数作为入口点</li>
          <li>可以使用 React 的 <code>useState</code> 和 <code>useEffect</code> 等 Hooks</li>
          <li>支持基本的 Next.js 组件，如 <code>Link</code> 和 <code>Image</code></li>
        </ul>
      </div>
    </div>
  );
}
