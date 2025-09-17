import React, { useState, useEffect } from 'react';
import MonacoReact from '@/components/CodeBlock/MonacaReact';
import { Button, Space, Divider, Tooltip } from 'antd';
import { PlayCircleOutlined, CopyOutlined, CheckOutlined } from '@ant-design/icons';
import { useClipboard } from '@/ahooks/sdt';
import styles from './LLMMarkdownEditor.module.less';

interface LLMMarkdownEditorProps {
  initialValue?: string;
  onChange?: (value: string) => void;
  onPreview?: (value: string) => void;
  height?: number | string;
  readOnly?: boolean;
  theme?: 'light' | 'dark';
}

/**
 * LLM Markdown编辑器组件
 * 基于Monaco编辑器，提供Markdown编辑功能
 */
const LLMMarkdownEditor: React.FC<LLMMarkdownEditorProps> = ({
  initialValue = '',
  onChange,
  onPreview,
  height = 400,
  readOnly = false,
  theme = 'light'
}) => {
  const [value, setValue] = useState<string>(initialValue);
  const [copied, setCopied] = useState<boolean>(false);
  const { copy } = useClipboard();

  // 更新初始值
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  // 处理编辑器内容变化
  const handleEditorChange = (newValue: string | undefined) => {
    const content = newValue || '';
    setValue(content);
    if (onChange) {
      onChange(content);
    }
  };

  // 处理预览按钮点击
  const handlePreview = () => {
    if (onPreview) {
      onPreview(value);
    }
  };

  // 复制内容到剪贴板
  const handleCopy = async () => {
    try {
      await copy(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  // 插入Markdown模板
  const insertTemplate = (template: string) => {
    const newValue = value + (value.endsWith('\n') ? '' : '\n\n') + template;
    setValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // Markdown模板
  const templates = {
    heading: '## 标题\n',
    link: '[链接文本](https://example.com)\n',
    image: '![图片描述](https://example.com/image.jpg)\n',
    code: '```javascript\n// 代码示例\nconsole.log("Hello World");\n```\n',
    table: '| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n',
    math: '$$\nx = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}\n$$\n',
    mermaid: '```mermaid\ngraph TD\n  A[开始] --> B{判断}\n  B -->|是| C[处理]\n  B -->|否| D[结束]\n  C --> D\n```\n'
  };

  return (
    <div className={styles.llmMarkdownEditor}>
      <div className={styles.toolbar}>
        <Space>
          <Button
            type="primary"
            icon={<PlayCircleOutlined />}
            onClick={handlePreview}
            disabled={!value.trim()}
          >
            预览
          </Button>
          <Tooltip title={copied ? '已复制' : '复制内容'}>
            <Button
              icon={copied ? <CheckOutlined /> : <CopyOutlined />}
              onClick={handleCopy}
              disabled={!value.trim()}
            >
              {copied ? '已复制' : '复制'}
            </Button>
          </Tooltip>
        </Space>

        {!readOnly && (
          <>
            <Divider type="vertical" />
            <Space>
              <Button size="small" onClick={() => insertTemplate(templates.heading)}>标题</Button>
              <Button size="small" onClick={() => insertTemplate(templates.link)}>链接</Button>
              <Button size="small" onClick={() => insertTemplate(templates.image)}>图片</Button>
              <Button size="small" onClick={() => insertTemplate(templates.code)}>代码块</Button>
              <Button size="small" onClick={() => insertTemplate(templates.table)}>表格</Button>
              <Button size="small" onClick={() => insertTemplate(templates.math)}>数学公式</Button>
              <Button size="small" onClick={() => insertTemplate(templates.mermaid)}>Mermaid图表</Button>
            </Space>
          </>
        )}
      </div>

      <div className={styles.editorContainer}>
        <MonacoReact
          code={value}
          language="markdown"
          readOnly={readOnly}
          height={height}
          theme={theme === 'dark' ? 'vs-dark' : 'vs'}
          onChange={handleEditorChange}
          lineNumbers={true}
          minimap={true}
          wordWrap={true}
          resizable={true}
        />
      </div>
    </div>
  );
};

export default React.memo(LLMMarkdownEditor);
