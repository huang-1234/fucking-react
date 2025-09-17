import React from 'react';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import dynamic from 'next/dynamic';

// 动态导入聊天组件，避免SSR时的Socket.io相关错误
const ChatComponent = dynamic(() => import('./react-chat-component'), {
  ssr: false,
});

interface ChatPageProps {
  apiServerUrl: string;
}

const ChatPage: React.FC<ChatPageProps> = ({ apiServerUrl }) => {
  return (
    <div className="container">
      <Head>
        <title>AI聊天助手</title>
        <meta name="description" content="基于大语言模型的聊天助手" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>AI聊天助手</h1>
        <p>与AI助手实时对话，获取即时回复。</p>

        <div className="chat-wrapper">
          <ChatComponent serverUrl={apiServerUrl} />
        </div>
      </main>

      <footer>
        <p>基于NestJS和Next.js构建的大模型应用</p>
      </footer>

      <style jsx>{`
        .container {
          min-height: 100vh;
          padding: 0 0.5rem;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }

        main {
          padding: 5rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          width: 100%;
          max-width: 800px;
        }

        footer {
          width: 100%;
          height: 100px;
          border-top: 1px solid #eaeaea;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        h1 {
          margin: 0;
          line-height: 1.15;
          font-size: 4rem;
          text-align: center;
        }

        .chat-wrapper {
          width: 100%;
          margin-top: 2rem;
        }
      `}</style>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  // 从环境变量或配置中获取API服务器URL
  const apiServerUrl = process.env.API_SERVER_URL || 'http://localhost:3000';

  return {
    props: {
      apiServerUrl,
    },
  };
};

export default ChatPage;
