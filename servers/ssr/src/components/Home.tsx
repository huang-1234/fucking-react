/**
 * 首页组件
 */
import React, { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../shared/store';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  const { pageData, loading } = useAppState();
  const dispatch = useAppDispatch();
  const data = pageData['/'] || {};

  useEffect(() => {
    // 客户端数据获取
    if (!data.title) {
      dispatch({ type: 'SET_LOADING', payload: true });

      fetch('/api/home')
        .then(res => res.json())
        .then(data => {
          dispatch({
            type: 'SET_PAGE_DATA',
            payload: { '/': data }
          });
          dispatch({ type: 'SET_LOADING', payload: false });
        })
        .catch(error => {
          console.error('获取数据失败:', error);
          dispatch({ type: 'SET_ERROR', payload: error });
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    }
  }, [data.title, dispatch]);

  return (
    <div className="home-page">
      <Helmet>
        <title>{data.title || 'React 19 SSR 演示'}</title>
        <meta name="description" content={data.description || 'React 19 SSR 演示首页'} />
      </Helmet>

      <header className="header">
        <div className="container">
          <h1>{data.title || 'React 19 SSR 演示'}</h1>
          <p className="subtitle">{data.subtitle || '使用React 19、Koa和TypeScript实现的高性能SSR应用'}</p>
        </div>
      </header>

      <main className="main">
        <div className="container">
          {loading ? (
            <div className="loading">加载中...</div>
          ) : (
            <>
              <section className="features">
                <h2>主要特性</h2>
                <div className="feature-grid">
                  <div className="feature-item">
                    <h3>React 19 流式SSR</h3>
                    <p>利用React 19的最新流式渲染功能，实现更快的首屏加载和更好的用户体验。</p>
                  </div>
                  <div className="feature-item">
                    <h3>高性能Koa服务器</h3>
                    <p>基于Koa构建的高性能服务器，支持集群模式和多级缓存策略。</p>
                  </div>
                  <div className="feature-item">
                    <h3>TypeScript支持</h3>
                    <p>全栈TypeScript支持，提供类型安全和更好的开发体验。</p>
                  </div>
                  <div className="feature-item">
                    <h3>多级缓存</h3>
                    <p>实现页面级、组件级和数据级缓存，显著提升性能。</p>
                  </div>
                </div>
              </section>

              <section className="cta">
                <h2>开始使用</h2>
                <p>立即体验React 19的强大SSR功能</p>
                <div className="buttons">
                  <Link to="/about" className="button primary">了解更多</Link>
                  <a href="https://github.com" className="button secondary" target="_blank" rel="noopener noreferrer">查看源码</a>
                </div>
              </section>
            </>
          )}
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
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 80px 0;
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

        .features {
          margin-bottom: 60px;
        }

        .features h2 {
          text-align: center;
          margin-bottom: 40px;
          font-size: 2rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 30px;
        }

        .feature-item {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .feature-item h3 {
          margin-top: 0;
          color: #4a5568;
        }

        .cta {
          text-align: center;
          background: #f1f5f9;
          padding: 60px 30px;
          border-radius: 12px;
        }

        .cta h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
        }

        .buttons {
          margin-top: 30px;
          display: flex;
          justify-content: center;
          gap: 20px;
        }

        .button {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 6px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .button.primary {
          background: #4f46e5;
          color: white;
        }

        .button.primary:hover {
          background: #4338ca;
        }

        .button.secondary {
          background: white;
          color: #4f46e5;
          border: 1px solid #4f46e5;
        }

        .button.secondary:hover {
          background: #f9fafb;
        }

        .footer {
          background: #1e293b;
          color: white;
          padding: 30px 0;
          text-align: center;
        }

        .loading {
          text-align: center;
          padding: 40px;
          font-size: 1.5rem;
          color: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default Home;