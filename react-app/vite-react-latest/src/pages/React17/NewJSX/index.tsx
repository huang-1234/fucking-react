import React from 'react';
import { Typography, Divider, Card, Alert, Tabs } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

/**
 * React 17 New JSX Transform 示例组件
 * 演示React 17引入的新JSX转换
 */
const NewJSXDemo: React.FC = () => {
  // React 17之前的JSX代码示例
  const oldJSXCode = `// React 17之前的JSX转换
import React from 'react';  // 必须导入React

function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>Welcome to React</p>
    </div>
  );
}

// 转换后的代码:
import React from 'react';

function App() {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', null, 'Hello World'),
    React.createElement('p', null, 'Welcome to React')
  );
}`;

  // React 17的新JSX代码示例
  const newJSXCode = `// React 17的新JSX转换
// 不再需要导入React
function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <p>Welcome to React</p>
    </div>
  );
}

// 转换后的代码:
// 自动导入特定的函数
import { jsx as _jsx } from 'react/jsx-runtime';
import { jsxs as _jsxs } from 'react/jsx-runtime';

function App() {
  return _jsxs(
    'div',
    {
      children: [
        _jsx('h1', { children: 'Hello World' }),
        _jsx('p', { children: 'Welcome to React' })
      ]
    }
  );
}`;

  // 自动导入示例
  const autoImportCode = `// 文件1: Button.js
// 不需要导入React
function Button() {
  return <button>Click me</button>;
}

// 文件2: App.js
// 只有当你需要使用React特定API时才需要导入React
import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <h1>Count: {count}</h1>
      <Button onClick={() => setCount(count + 1)} />
    </div>
  );
}`;

  return (
    <div className="new-jsx-demo">
      <Typography>
        <Title level={2}>React 17: 新的JSX转换</Title>
        <Paragraph>
          React 17引入了新的JSX转换机制，这是与Babel和其他编译器合作开发的。
          新的JSX转换不再要求在使用JSX的文件中显式导入React。
        </Paragraph>

        <Alert
          message="重要变化"
          description="在React 17之前，JSX会被转换为React.createElement(...)调用，因此使用JSX的文件必须导入React。新的JSX转换不再使用React.createElement，而是自动从新的入口点导入特殊函数并调用它们。"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Divider orientation="left">JSX转换对比</Divider>

        <Tabs defaultActiveKey="1">
          <TabPane tab="旧JSX转换" key="1">
            <Card title="React 17之前的JSX转换">
              <CodeBlock code={oldJSXCode} />

              <Alert
                message="必须导入React"
                description="即使代码中没有直接使用React，也必须导入它，因为JSX会被转换为React.createElement调用。"
                type="warning"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="新JSX转换" key="2">
            <Card title="React 17的新JSX转换">
              <CodeBlock code={newJSXCode} />

              <Alert
                message="无需导入React"
                description="新的转换会自动从'react/jsx-runtime'导入需要的函数，不再需要显式导入React。"
                type="success"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Card>
          </TabPane>

          <TabPane tab="实际应用" key="3">
            <Card title="实际开发中的应用">
              <CodeBlock code={autoImportCode} />

              <Alert
                message="更简洁的导入"
                description="在实际开发中，只有当你需要使用React的特定API（如Hooks、组件类等）时才需要导入React。纯JSX组件不再需要导入语句。"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Card>
          </TabPane>
        </Tabs>

        <Divider orientation="left">新JSX转换的优势</Divider>
        <Paragraph>
          新的JSX转换带来了以下优势：
        </Paragraph>
        <ul>
          <li><Text strong>减少样板代码</Text> - 不再需要在每个文件中导入React</li>
          <li><Text strong>包体积略微减小</Text> - 由于转换方式的改变，最终的打包体积会略微减小</li>
          <li><Text strong>为未来的优化铺平道路</Text> - 新的转换方式为未来的编译器优化提供了更多可能性</li>
          <li><Text strong>更好的开发体验</Text> - 特别是对于新手开发者，减少了困惑</li>
        </ul>

        <Divider orientation="left">如何迁移</Divider>
        <Paragraph>
          对于使用Create React App、Next.js、Gatsby等流行工具的项目，React 17会自动使用新的JSX转换。
          对于自定义配置的项目，需要更新Babel配置：
        </Paragraph>

        <Card title="Babel配置">
          <CodeBlock
            code={`// 旧转换的Babel配置
{
  "presets": ["@babel/preset-react"]
}

// 新转换的Babel配置
{
  "presets": [
    ["@babel/preset-react", {
      "runtime": "automatic"
    }]
  ]
}`}
          />
        </Card>

        <Paragraph style={{ marginTop: 16 }}>
          新的JSX转换是React 17中最明显的面向开发者的变化，它简化了代码并为未来的优化铺平了道路。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default NewJSXDemo;