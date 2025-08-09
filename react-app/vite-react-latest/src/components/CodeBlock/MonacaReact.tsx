import React, { useState, useEffect, useRef } from 'react';
import Editor, { type Monaco, type OnMount } from '@monaco-editor/react';
import { Spin, Select, Switch, Button } from 'antd';
import { CopyOutlined, CheckOutlined } from '@ant-design/icons';
import styles from './MonacaReact.module.less';

const { Option } = Select;

// 支持的语言列表
const LANGUAGES = [
  'javascript',
  'typescript',
  'html',
  'css',
  'json',
  'markdown',
  'jsx',
  'tsx'
];

// 支持的主题列表
const THEMES = [
  'vs', // 浅色
  'vs-dark', // 深色
  'hc-black' // 高对比度
];

interface MonacoReactProps {
  code?: string;
  language?: string;
  readOnly?: boolean;
  height?: string | number;
  width?: string | number;
  theme?: string;
  onChange?: (value: string | undefined) => void;
  lineNumbers?: boolean;
  minimap?: boolean;
  wordWrap?: boolean;
}

/**
 * Monaco编辑器React组件
 * 提供代码编辑和高亮功能
 */
const MonacoReact: React.FC<MonacoReactProps> = ({
  code = '',
  language = 'javascript',
  readOnly = false,
  height = '300px',
  width = '100%',
  theme = 'vs-dark',
  onChange,
  lineNumbers = true,
  minimap = true,
  wordWrap = false
}) => {
  const [editorValue, setEditorValue] = useState<string>(code);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language);
  const [selectedTheme, setSelectedTheme] = useState<string>(theme);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const editorRef = useRef<any>(null);

  // 当外部代码变化时更新编辑器内容
  useEffect(() => {
    setEditorValue(code);
  }, [code]);

  // 处理编辑器内容变化
  const handleEditorChange = (value: string | undefined) => {
    setEditorValue(value || '');
    if (onChange) {
      onChange(value);
    }
  };

  // 处理编辑器加载完成
  const handleEditorDidMount: OnMount = (editor, _monaco) => {
    editorRef.current = editor;
    setIsLoading(false);

    // 配置编辑器
    editor.updateOptions({
      readOnly,
      lineNumbers: lineNumbers ? 'on' : 'off',
      minimap: { enabled: minimap },
      wordWrap: wordWrap ? 'on' : 'off',
      scrollBeyondLastLine: false,
      automaticLayout: true
    });
  };

  // 处理语言变化
  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
  };

  // 处理主题变化
  const handleThemeChange = (value: string) => {
    setSelectedTheme(value);
  };

  // 复制代码到剪贴板
  const copyToClipboard = () => {
    if (editorValue) {
      navigator.clipboard.writeText(editorValue).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // 格式化代码
  const formatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className={styles.monacoReactWrapper} style={{ width, display: 'flex', flexDirection: 'column' }}>
      {/* 工具栏 */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            style={{ width: 120 }}
            disabled={readOnly}
          >
            {LANGUAGES.map(lang => (
              <Option key={lang} value={lang}>{lang}</Option>
            ))}
          </Select>
          <Select
            value={selectedTheme}
            onChange={handleThemeChange}
            style={{ width: 120 }}
          >
            {THEMES.map(t => (
              <Option key={t} value={t}>{t}</Option>
            ))}
          </Select>
        </div>
        <div className={styles.toolbarRight}>
          {!readOnly && (
            <Button size="small" onClick={formatCode}>格式化</Button>
          )}
          <Button
            size="small"
            icon={copied ? <CheckOutlined /> : <CopyOutlined />}
            onClick={copyToClipboard}
            type={copied ? "primary" : "default"}
          >
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className={styles.editorContainer} style={{ height }}>
        {isLoading && (
          <div className={styles.loadingOverlay}>
            <Spin tip="加载编辑器..." />
          </div>
        )}
        <Editor
          height="100%"
          width="100%"
          language={selectedLanguage}
          value={editorValue}
          theme={selectedTheme}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            readOnly,
            scrollBeyondLastLine: false,
            fontSize: 14,
            tabSize: 2,
            automaticLayout: true
          }}
        />
      </div>

      {/* 底部配置选项 */}
      {!readOnly && (
        <div className={styles.footer}>
          <div className={styles.footerOption}>
            <span className={styles.optionLabel}>行号:</span>
            <Switch
              size="small"
              checked={lineNumbers}
              onChange={(checked) => {
                if (editorRef.current) {
                  editorRef.current.updateOptions({ lineNumbers: checked ? 'on' : 'off' });
                }
              }}
            />
          </div>
          <div className={styles.footerOption}>
            <span className={styles.optionLabel}>小地图:</span>
            <Switch
              size="small"
              checked={minimap}
              onChange={(checked) => {
                if (editorRef.current) {
                  editorRef.current.updateOptions({ minimap: { enabled: checked } });
                }
              }}
            />
          </div>
          <div className={styles.footerOption}>
            <span className={styles.optionLabel}>自动换行:</span>
            <Switch
              size="small"
              checked={wordWrap}
              onChange={(checked) => {
                if (editorRef.current) {
                  editorRef.current.updateOptions({ wordWrap: checked ? 'on' : 'off' });
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MonacoReact;