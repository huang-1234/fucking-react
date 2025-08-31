import React, { useState } from 'react';
import { Tabs, Button, Space, Tooltip } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useClipboard } from '@/ahooks/sdt/dom';

interface CodeDisplayProps {
  /**
   * TypeScript 代码
   */
  tsCode?: string;

  /**
   * Rust 代码
   */
  rustCode?: string;

  /**
   * 其他语言代码
   */
  otherCode?: {
    language: string;
    code: string;
    label: string;
  }[];

  /**
   * 高亮的行数
   */
  highlightedLines?: number[];

  /**
   * 代码标题
   */
  title?: string;

  /**
   * 是否显示行号
   */
  showLineNumbers?: boolean;

  /**
   * 最大高度
   */
  maxHeight?: number | string;
}

const CodeDisplay: React.FC<CodeDisplayProps> = ({
  tsCode,
  rustCode,
  otherCode = [],
  highlightedLines = [],
  title,
  showLineNumbers = true,
  maxHeight = 500
}) => {
  const [activeTab, setActiveTab] = useState<string>(tsCode ? 'typescript' : rustCode ? 'rust' : otherCode.length > 0 ? otherCode[0].language : '');
  const [copied, setCopied] = useState<boolean>(false);
  const { copy } = useClipboard();

  const handleCopy = () => {
    let codeToCopy = '';

    switch (activeTab) {
      case 'typescript':
        codeToCopy = tsCode || '';
        break;
      case 'rust':
        codeToCopy = rustCode || '';
        break;
      default:
        const codeObj = otherCode.find(c => c.language === activeTab);
        if (codeObj) {
          codeToCopy = codeObj.code;
        }
    }

    copy(codeToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    })
  };

  const getTabItems = () => {
    const items = [];

    if (tsCode) {
      items.push({
        key: 'typescript',
        label: 'TypeScript',
        children: (
          <div style={{ position: 'relative' }}>
            <SyntaxHighlighter
              language="typescript"
              style={vscDarkPlus}
              showLineNumbers={showLineNumbers}
              wrapLines={true}
              lineProps={(lineNumber) => {
                const style = { display: 'block' };
                if (highlightedLines.includes(lineNumber)) {
                  return { style: { ...style, backgroundColor: 'rgba(255, 255, 0, 0.2)' } };
                }
                return { style };
              }}
              customStyle={{
                margin: 0,
                borderRadius: '4px',
                maxHeight
              }}
            >
              {tsCode}
            </SyntaxHighlighter>
          </div>
        )
      });
    }

    if (rustCode) {
      items.push({
        key: 'rust',
        label: 'Rust',
        children: (
          <div style={{ position: 'relative' }}>
            <SyntaxHighlighter
              language="rust"
              style={vscDarkPlus}
              showLineNumbers={showLineNumbers}
              wrapLines={true}
              lineProps={(lineNumber) => {
                const style = { display: 'block' };
                if (highlightedLines.includes(lineNumber)) {
                  return { style: { ...style, backgroundColor: 'rgba(255, 255, 0, 0.2)' } };
                }
                return { style };
              }}
              customStyle={{
                margin: 0,
                borderRadius: '4px',
                maxHeight
              }}
            >
              {rustCode}
            </SyntaxHighlighter>
          </div>
        )
      });
    }

    otherCode.forEach(({ language, code, label }) => {
      items.push({
        key: language,
        label: label || language,
        children: (
          <div style={{ position: 'relative' }}>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus}
              showLineNumbers={showLineNumbers}
              wrapLines={true}
              lineProps={(lineNumber) => {
                const style = { display: 'block' };
                if (highlightedLines.includes(lineNumber)) {
                  return { style: { ...style, backgroundColor: 'rgba(255, 255, 0, 0.2)' } };
                }
                return { style };
              }}
              customStyle={{
                margin: 0,
                borderRadius: '4px',
                maxHeight
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        )
      });
    });

    return items;
  };

  return (
    <div style={{ position: 'relative' }}>
      {title && (
        <div style={{ marginBottom: '12px' }}>
          <h4>{title}</h4>
        </div>
      )}

      <div style={{ position: 'absolute', top: title ? '12px' : '0', right: '0', zIndex: 10 }}>
        <Tooltip title={copied ? '已复制' : '复制代码'}>
          <Button
            type="text"
            icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
            onClick={handleCopy}
          />
        </Tooltip>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={getTabItems()}
        type="card"
        size="small"
      />
    </div>
  );
};

export default React.memo(CodeDisplay);
