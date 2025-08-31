import React, { useState } from 'react';
import { Card, Typography, Collapse, Button } from 'antd';
import { CodeOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import './CodeDisplay.less';

const { Title } = Typography;
const { Panel } = Collapse;

interface CodeDisplayProps {
  title?: string;
  code: string;
  language?: string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  title = '核心算法代码',
  code,
  language = 'typescript'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Card
      className="code-display-card"
      title={
        <div className="code-display-header">
          <CodeOutlined /> {title}
          <Button
            type="text"
            icon={isExpanded ? <UpOutlined /> : <DownOutlined />}
            onClick={toggleExpand}
            className="expand-button"
          >
            {isExpanded ? '收起' : '展开'}
          </Button>
        </div>
      }
      bordered={true}
    >
      <div className={`code-container ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <SyntaxHighlighter
          language={language}
          style={docco}
          showLineNumbers={true}
          wrapLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </Card>
  );
};

export default CodeDisplay;
