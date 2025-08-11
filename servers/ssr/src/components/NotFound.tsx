/**
 * 404页面组件
 */
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div className="not-found-page">
      <Helmet>
        <title>页面未找到 - React 19 SSR 演示</title>
        <meta name="description" content="404 - 页面未找到" />
      </Helmet>

      <div className="container">
        <div className="content">
          <h1>404</h1>
          <h2>页面未找到</h2>
          <p>您访问的页面不存在或已被移除。</p>
          <Link to="/" className="button">返回首页</Link>
        </div>
      </div>

      <style jsx>{`
        .not-found-page {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .container {
          max-width: 600px;
          padding: 40px;
          text-align: center;
        }

        .content {
          background: white;
          padding: 60px 40px;
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        h1 {
          font-size: 8rem;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }

        h2 {
          font-size: 2rem;
          margin: 0 0 20px;
          color: #1a202c;
        }

        p {
          font-size: 1.2rem;
          color: #718096;
          margin-bottom: 30px;
        }

        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #4f46e5;
          color: white;
          border-radius: 6px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .button:hover {
          background: #4338ca;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default NotFound;