import React, { useState, useEffect } from 'react';
import { Card, Tabs, Button, Input, Select, message } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import { loadModule } from '@dom-proxy/universal-module/SelfUniversalModule/base';
import {
  amdModuleExample,
  cjsModuleExample,
  esmModuleExample,
  umdModuleExample,
  iifeModuleExample
} from '@dom-proxy/universal-module/SelfUniversalModule/examples';
import { ModuleType } from '@dom-proxy/universal-module/Global/base';
import { detectModuleType } from '@dom-proxy/universal-module/Global/base';

const { TabPane } = Tabs;
const { Option } = Select;

const DemoModuleLoader: React.FC = () => {
  const [code, setCode] = useState<string>(cjsModuleExample);
  const [moduleType, setModuleType] = useState<ModuleType | null>(null);
  const [moduleId, setModuleId] = useState<string>('example-module');
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // 检测模块类型
  useEffect(() => {
    if (code) {
      setModuleType(detectModuleType(code));
    }
  }, [code]);

  // 加载示例代码
  const loadExample = (example: string) => {
    switch (example) {
      case 'amd':
        setCode(amdModuleExample);
        break;
      case 'cjs':
        setCode(cjsModuleExample);
        break;
      case 'esm':
        setCode(esmModuleExample);
        break;
      case 'umd':
        setCode(umdModuleExample);
        break;
      case 'iife':
        setCode(iifeModuleExample);
        break;
    }
  };

  // 执行模块加载
  const executeModule = async () => {
    if (!code) {
      message.error('请输入模块代码');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const moduleExports = await loadModule(code, moduleId);
      console.log('code', moduleExports);
      setResult(JSON.stringify(moduleExports, null, 2));
      message.success('模块加载成功');
    } catch (error) {
      console.error('模块加载失败:', error);
      setResult(`错误: ${error instanceof Error ? error.message : String(error)}`);
      message.error('模块加载失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Card title="通用模块加载器演示">
        <Tabs defaultActiveKey="editor">
          <TabPane tab="模块编辑器" key="editor">
            <div style={{ marginBottom: '16px' }}>
              <Select
                style={{ width: 200, marginRight: '16px' }}
                placeholder="选择示例代码"
                onChange={loadExample}
              >
                <Option value="amd">AMD 示例</Option>
                <Option value="cjs">CommonJS 示例</Option>
                <Option value="esm">ES Module 示例</Option>
                <Option value="umd">UMD 示例</Option>
                <Option value="iife">IIFE 示例</Option>
              </Select>

              <Input
                placeholder="模块ID (用于缓存)"
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                style={{ width: 200, marginRight: '16px' }}
              />

              <Button
                type="primary"
                onClick={executeModule}
                loading={loading}
                style={{ marginRight: '16px' }}
              >
                执行模块
              </Button>

              {moduleType && (
                <span>
                  检测到模块类型: <strong>{moduleType}</strong>
                </span>
              )}
            </div>

            <MonacoEditor
              height="400px"
              language="javascript"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </TabPane>

          <TabPane tab="执行结果" key="result">
            <MonacoEditor
              height="400px"
              language="json"
              value={result}
              options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />
          </TabPane>

          <TabPane tab="说明" key="instructions">
            <Card title="通用模块加载器">
              <p>
                这个演示展示了一个通用的JavaScript模块加载器，它能够加载多种格式的模块：
              </p>
              <ul>
                <li><strong>AMD</strong> - Asynchronous Module Definition</li>
                <li><strong>CommonJS</strong> - Node.js 模块系统</li>
                <li><strong>ESM</strong> - ECMAScript 模块</li>
                <li><strong>UMD</strong> - Universal Module Definition</li>
                <li><strong>IIFE</strong> - 立即执行函数表达式</li>
              </ul>
              <p>
                加载器会自动检测模块类型，并在沙箱环境中执行模块代码，以确保安全性。
              </p>
              <p>
                <strong>注意</strong>: ESM 模块在浏览器环境中可能无法正常加载，因为它需要有效的 URL 和 CORS 支持。
              </p>
            </Card>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default React.memo(DemoModuleLoader);
