/**
 * 关于页面组件
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <Helmet>
        <title>关于我们 - React 19 SSR 演示</title>
        <meta name="description" content="关于React 19 SSR演示项目的详细介绍" />
      </Helmet>

      <header className="header">
        <div className="container">
          <h1>关于我们</h1>
          <p className="subtitle">了解React 19 SSR演示项目</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <section className="about-section">
            <h2>项目介绍</h2>
            <p>
              React 19 SSR 演示项目是一个基于React 19、Koa和TypeScript实现的高性能服务端渲染应用。
              该项目旨在展示React 19中的最新SSR功能，特别是流式渲染和Suspense的服务端支持。
            </p>
            <p>
              本项目采用了多级缓存策略、集群模式和流式渲染等技术，能够处理高流量场景下的服务端渲染需求。
            </p>
          </section>

          <section className="about-section">
            <h2>技术栈</h2>
            <ul className="tech-list">
              <li>
                <strong>React 19</strong>
                <span>使用最新的React特性，包括流式SSR和服务端Suspense</span>
              </li>
              <li>
                <strong>Koa</strong>
                <span>轻量级高性能Node.js服务器框架</span>
              </li>
              <li>
                <strong>TypeScript</strong>
                <span>提供类型安全的JavaScript超集</span>
              </li>
              <li>
                <strong>Vite</strong>
                <span>现代前端构建工具，提供极速的开发体验</span>
              </li>
            </ul>
          </section>

          <section className="about-section">
            <h2>性能优化</h2>
            <p>
              本项目实现了多种性能优化策略，包括：
            </p>
            <ul>
              <li>流式渲染 - 更快的首屏内容展示</li>
              <li>多级缓存 - 页面级、组件级和数据级缓存</li>
              <li>集群模式 - 充分利用多核CPU处理能力</li>
              <li>代码分割 - 按需加载页面和组件</li>
              <li>静态资源优化 - 压缩和CDN分发</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>团队</h2>
            <p>
              我们是一群热爱React和服务端渲染技术的开发者，致力于探索前端技术的最佳实践。
            </p>
          </section>

          <div className="back-link">
            <Link to="/" className="button">返回首页</Link>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} React 19 SSR 演示</p>
        </div>
      </footer>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header {
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          padding: 60px 0;
          text-align: center;
        }

        .header h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .subtitle {
          font-size: 1.5rem;
          opacity: 0.9;
        }

        .main {
          padding: 60px 0;
        }

        .about-section {
          margin-bottom: 50px;
        }

        .about-section h2 {
          font-size: 1.8rem;
          margin-bottom: 20px;
          color: #1e40af;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }

        .about-section p {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #4b5563;
          margin-bottom: 20px;
        }

        .about-section ul {
          padding-left: 20px;
        }

        .about-section ul li {
          margin-bottom: 10px;
          font-size: 1.1rem;
          color: #4b5563;
        }

        .tech-list {
          list-style: none;
          padding: 0;
        }

        .tech-list li {
          display: flex;
          flex-direction: column;
          background: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .tech-list li strong {
          font-size: 1.2rem;
          color: #0f172a;
          margin-bottom: 5px;
        }

        .tech-list li span {
          color: #64748b;
        }

        .back-link {
          margin-top: 40px;
          text-align: center;
        }

        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #2563eb;
          color: white;
          border-radius: 6px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .button:hover {
          background: #1d4ed8;
        }

        .footer {
          background: #1e293b;
          color: white;
          padding: 30px 0;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default About;