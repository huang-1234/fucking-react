import React from 'react';
import { Card, Divider, Typography } from 'antd';
import markdownContent from '../../tech/markdown-loader-example.md';
import 'highlight.js/styles/github.css'; // 引入代码高亮样式

const { Title } = Typography;

/**
 * Markdown 示例组件
 * 展示使用 Vite/Webpack Markdown loader 转换的内容
 */
const MarkdownExample: React.FC = () => {
  return (
    <Card title="Markdown 转 HTML 示例" style={{ marginBottom: 20 }}>
      <Title level={4}>使用 Markdown Loader 渲染的内容</Title>
      <Divider />
      <div
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: markdownContent }}
      />
    </Card>
  );
};

export default MarkdownExample;
