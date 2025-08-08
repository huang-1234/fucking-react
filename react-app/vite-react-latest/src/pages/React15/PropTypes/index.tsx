import React, { useState } from 'react';
import { Typography, Divider, Card, Space, Button, Alert, Switch, Input } from 'antd';
import { CodeBlock } from '../../../components/CodeBlock';

const { Title, Paragraph, Text } = Typography;

/**
 * React 15 PropTypes 示例组件
 * 演示React 15中的PropTypes用法
 */
const PropTypesDemo: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [propValue, setPropValue] = useState('正确的字符串');
  const [isTypeError, setIsTypeError] = useState(false);

  // 模拟PropTypes警告
  const triggerWarning = () => {
    setIsTypeError(!isTypeError);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  // React 15 中的PropTypes代码示例
  const react15PropTypesCode = `// React 15 中，PropTypes内置在React包中
import React, { Component, PropTypes } from 'react';

class Greeting extends Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  address: PropTypes.shape({
    street: PropTypes.string,
    city: PropTypes.string
  })
};

Greeting.defaultProps = {
  age: 18
};`;

  // React 16+ 中的PropTypes代码示例
  const react16PropTypesCode = `// React 16+ 中，PropTypes被移到单独的包中
import React, { Component } from 'react';
import PropTypes from 'prop-types';

class Greeting extends Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  address: PropTypes.shape({
    street: PropTypes.string,
    city: PropTypes.string
  })
};

Greeting.defaultProps = {
  age: 18
};`;

  return (
    <div className="proptypes-demo">
      <Typography>
        <Title level={2}>React 15: PropTypes</Title>
        <Paragraph>
          在React 15中，PropTypes是内置在React核心包中的类型检查工具，用于在运行时验证组件接收的props类型。
          从React 16开始，PropTypes被移到了单独的<Text code>prop-types</Text>包中。
        </Paragraph>

        <Divider orientation="left">React 15 中的PropTypes</Divider>
        <Card>
          <CodeBlock code={react15PropTypesCode} language="jsx" />
        </Card>

        <Divider orientation="left">React 16+ 中的PropTypes</Divider>
        <Card>
          <CodeBlock code={react16PropTypesCode} language="jsx" />
        </Card>

        <Divider orientation="left">实时演示</Divider>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Card title="模拟PropTypes类型检查">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                输入一个值，然后切换类型来模拟PropTypes的类型检查：
              </Paragraph>

              <Input
                value={propValue}
                onChange={(e) => setPropValue(e.target.value)}
                style={{ width: 300 }}
              />

              <Space>
                <Text>期望类型：</Text>
                <Switch
                  checkedChildren="数字"
                  unCheckedChildren="字符串"
                  checked={isTypeError}
                  onChange={setIsTypeError}
                />
                <Button type="primary" onClick={triggerWarning}>
                  验证类型
                </Button>
              </Space>

              {showWarning && (
                <Alert
                  message="PropTypes 警告"
                  description={`Warning: Failed prop type: Invalid prop \`value\` of type \`${isTypeError ? 'string' : 'number'}\` supplied to \`ExampleComponent\`, expected \`${isTypeError ? 'number' : 'string'}\`.`}
                  type="warning"
                  showIcon
                  style={{ marginTop: 16 }}
                />
              )}
            </Space>
          </Card>
        </Space>

        <Divider orientation="left">PropTypes支持的类型</Divider>
        <Paragraph>
          PropTypes支持多种类型验证：
        </Paragraph>
        <ul>
          <li><Text code>PropTypes.string</Text> - 字符串</li>
          <li><Text code>PropTypes.number</Text> - 数字</li>
          <li><Text code>PropTypes.bool</Text> - 布尔值</li>
          <li><Text code>PropTypes.array</Text> - 数组</li>
          <li><Text code>PropTypes.object</Text> - 对象</li>
          <li><Text code>PropTypes.func</Text> - 函数</li>
          <li><Text code>PropTypes.node</Text> - 可渲染节点</li>
          <li><Text code>PropTypes.element</Text> - React元素</li>
          <li><Text code>PropTypes.instanceOf(Class)</Text> - 类实例</li>
          <li><Text code>PropTypes.oneOf(['News', 'Photos'])</Text> - 枚举值</li>
          <li><Text code>PropTypes.oneOfType([PropTypes.string, PropTypes.number])</Text> - 多类型</li>
          <li><Text code>PropTypes.arrayOf(PropTypes.number)</Text> - 特定类型的数组</li>
          <li><Text code>PropTypes.objectOf(PropTypes.number)</Text> - 特定类型的对象值</li>
          <li><Text code>PropTypes.shape({})</Text> - 特定形状的对象</li>
        </ul>

        <Paragraph>
          在现代React开发中，PropTypes已经逐渐被TypeScript等静态类型检查工具所替代，
          但了解PropTypes仍然对理解React组件的类型系统演变很有帮助。
        </Paragraph>
      </Typography>
    </div>
  );
};

export default PropTypesDemo;