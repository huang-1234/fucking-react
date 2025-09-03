import React, { useState } from 'react';
import { Card, Input, Button, Spin, Alert, Tabs, Space } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import { fetchModuleCode } from '@dom-proxy/universal-module/SelfUniversalModule/fetch-js';
import { detectModuleType, ModuleType } from '@dom-proxy/universal-module/Global/base';
import { safeLoadModule } from '@dom-proxy/universal-module/Systemjs';

const { TabPane } = Tabs;

// 默认示例URL
const EXAMPLE_URLS = [
  {
    name: 'Lodash (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js',
  },
  {
    name: 'React (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.production.min.js',
  },
  {
    name: 'jQuery (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/jquery@3.6.0/dist/jquery.min.js',
  },
  {
    name: 'Moment.js (UMD)',
    url: 'https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js',
  },
  {
    name: 'ES模块示例',
    url: 'https://cdn.jsdelivr.net/npm/date-fns@2.29.3/esm/index.js',
  },
];

export const DemoJSFetch: React.FC = () => {
  const [url, setUrl] = useState<string>(EXAMPLE_URLS[0].url);
  const [loading, setLoading] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [moduleType, setModuleType] = useState<ModuleType | null>(null);
  const [moduleExports, setModuleExports] = useState<any>(null);
  const [moduleId, setModuleId] = useState<string>('demo-module');
  const [activeTab, setActiveTab] = useState<string>('code');

  // 获取远程JS代码
  const fetchCode = async () => {
    setLoading(true);
    setError(null);
    setCode('');
    setModuleType(null);
    setModuleExports(null);

    try {
      // 使用fetch-js.ts中的函数获取远程代码
      const fetchedCode = await fetchModuleCode({
        url,
        moduleId,
        cache: true,
      });

      setCode(fetchedCode || '');

      // 检测模块类型
      const type = detectModuleType(fetchedCode);
      setModuleType(type);

      // 尝试加载模块
      try {
        const exports = await safeLoadModule(fetchedCode, moduleId);
        setModuleExports(exports);
      } catch (loadError) {
        console.error('模块加载失败:', loadError);
        setError(`模块加载失败: ${loadError instanceof Error ? loadError.message : String(loadError)}`);
      }
    } catch (fetchError) {
      console.error('获取代码失败:', fetchError);
      setError(`获取代码失败: ${fetchError instanceof Error ? fetchError.message : String(fetchError)}`);
    } finally {
      setLoading(false);
    }
  };

  // 格式化模块导出对象为JSON字符串
  const formatExports = (exports: any): string => {
    try {
      return JSON.stringify(exports, (key, value) => {
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }
        return value;
      }, 2);
    } catch (e) {
      return `无法序列化导出对象: ${e instanceof Error ? e.message : String(e)}`;
    }
  };

  // 渲染模块类型标签
  const renderModuleTypeTag = () => {
    if (!moduleType) return null;

    const typeColors: Record<ModuleType, string> = {
      [ModuleType.AMD]: '#1890ff',
      [ModuleType.CJS]: '#52c41a',
      [ModuleType.ESM]: '#722ed1',
      [ModuleType.UMD]: '#fa8c16',
      [ModuleType.IIFE]: '#f5222d',
    };

    return (
      <div style={{
        display: 'inline-block',
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: typeColors[moduleType],
        color: 'white',
        fontWeight: 'bold',
        marginLeft: '8px',
      }}>
        {moduleType}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="JS模块获取与加载演示" extra={renderModuleTypeTag()}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div style={{ marginBottom: '16px' }}>
            <Space>
              <Input
                placeholder="输入JS模块URL"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '500px' }}
              />
              <Input
                placeholder="模块ID"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                style={{ width: '200px' }}
              />
              <Button type="primary" onClick={fetchCode} loading={loading}>
                获取并加载
              </Button>
            </Space>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Space wrap>
              {EXAMPLE_URLS.map((example) => (
                <Button
                  key={example.url}
                  onClick={() => setUrl(example.url)}
                  type={url === example.url ? 'primary' : 'default'}
                >
                  {example.name}
                </Button>
              ))}
            </Space>
          </div>

          {error && (
            <Alert
              message="错误"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Spin spinning={loading}>
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="模块代码" key="code">
                <MonacoEditor
                  height="400px"
                  language="javascript"
                  value={code}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    wordWrap: 'on',
                  }}
                />
              </TabPane>
              <TabPane tab="模块导出" key="exports">
                <MonacoEditor
                  height="400px"
                  language="json"
                  value={moduleExports ? formatExports(moduleExports) : '// 加载模块后将显示导出内容'}
                  options={{
                    readOnly: true,
                    minimap: { enabled: false },
                  }}
                />
              </TabPane>
            </Tabs>
          </Spin>
        </Space>
      </Card>
    </div>
  );
};

export default React.memo(DemoJSFetch);