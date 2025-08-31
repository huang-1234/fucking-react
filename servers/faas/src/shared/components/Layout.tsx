/**
 * 布局组件
 * 提供页面通用布局
 */
import React from 'react';
import { Link } from 'react-router-dom';
import Head from './Head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title, description }) => {
  return (
    <>
      <Head title={title} description={description} />
      <div className="layout">
        <header className="header">
          <div className="container">
            <div className="logo">
              <Link to="/">React 19 SSR</Link>
            </div>
            <nav className="nav">
              <ul>
                <li>
                  <Link to="/">首页</Link>
                </li>
                <li>
                  <Link to="/about">关于</Link>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        <main className="main">{children}</main>

        <footer className="footer">
          <div className="container">
            <p>&copy; {new Date().getFullYear()} React 19 SSR 演示</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        .layout {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .header {
          background: #1e293b;
          color: white;
          padding: 1rem 0;
        }

        .header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo a {
          color: white;
          font-size: 1.5rem;
          font-weight: bold;
          text-decoration: none;
        }

        .nav ul {
          display: flex;
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .nav li {
          margin-left: 1.5rem;
        }

        .nav a {
          color: white;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.3s;
        }

        .nav a:hover {
          color: #94a3b8;
        }

        .main {
          flex: 1;
        }

        .footer {
          background: #1e293b;
          color: white;
          padding: 1.5rem 0;
          text-align: center;
        }
      `}</style>
    </>
  );
};

export default Layout;
