import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  const features = [
    {
      title: '路由系统',
      description: '学习 Next.js 的文件系统路由和 App Router',
      link: '/concepts/routing',
    },
    {
      title: '数据获取',
      description: '掌握服务器组件和客户端组件的数据获取方式',
      link: '/concepts/data-fetching',
    },
    {
      title: '渲染策略',
      description: '了解 SSR、SSG、ISR 等不同的渲染策略',
      link: '/concepts/rendering',
    },
  ];

  return (
    <div className="space-y-16">
      <section className="text-center py-16 space-y-6">
        <h1 className="text-4xl md:text-6xl font-bold">
          学习 Next.js 开发
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          通过交互式教程和实践示例，掌握 Next.js 框架的核心概念和最佳实践
        </p>
        <div className="flex justify-center gap-4 pt-4">
          <Link
            href="/concepts/routing"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            开始学习
          </Link>
          <Link
            href="/playground"
            className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-6 py-3 rounded-lg font-medium"
          >
            代码沙盒
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{feature.description}</p>
            <Link
              href={feature.link}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              了解更多 →
            </Link>
          </div>
        ))}
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 -mx-4 px-4 py-12 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">为什么选择 Next.js?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Next.js 是一个轻量级的 React 框架，提供了开箱即用的性能优化、路由系统和渲染策略，
            帮助开发者构建高性能、可扩展的 Web 应用。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="font-medium">混合渲染</h3>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="font-medium">自动代码分割</h3>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="font-medium">内置优化</h3>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
              <h3 className="font-medium">开发体验</h3>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
