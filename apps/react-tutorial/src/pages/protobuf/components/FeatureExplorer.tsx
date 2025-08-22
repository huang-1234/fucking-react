import React from 'react';
import { Card, Table, Tabs, Typography, Alert, Divider, Tag, Space, Tooltip } from 'antd';
import { InfoCircleOutlined, CheckCircleFilled, CloseCircleFilled } from '@ant-design/icons';
import { getProtoFeatures } from '../lib/protobuf-service';
import styles from '../index.module.less';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;

const FeatureExplorer: React.FC = () => {
  // 版本特性数据
  const editions = [
    {
      name: "proto2",
      year: 2008,
      features: getProtoFeatures('proto2')
    },
    {
      name: "proto3",
      year: 2016,
      features: getProtoFeatures('proto3')
    },
    {
      name: "2023",
      year: 2023,
      features: getProtoFeatures('2023')
    }
  ];

  // 特性详细说明
  const featureDescriptions: Record<string, { title: string, description: string }> = {
    fieldPresence: {
      title: "字段存在性",
      description: "控制字段是否需要显式存在。proto2中字段默认为required或optional，proto3中字段默认为implicit（隐式存在）。"
    },
    repeatedEncoding: {
      title: "重复字段编码",
      description: "控制重复字段的编码方式。PACKED编码更紧凑，将所有值打包到一个键值对中。"
    },
    jsonName: {
      title: "JSON名称支持",
      description: "控制是否支持为字段指定JSON序列化时使用的名称。"
    },
    mapFields: {
      title: "映射字段",
      description: "控制映射字段的实现方式。proto2使用嵌套消息模拟，proto3原生支持map类型。"
    }
  };

  // 语法差异示例
  const syntaxExamples = {
    proto2: `
syntax = "proto2";

message Person {
  required string name = 1;
  optional int32 age = 2;
  optional string email = 3;
  repeated string phone_numbers = 4;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    required string number = 1;
    optional PhoneType type = 2 [default = HOME];
  }
}
    `,
    proto3: `
syntax = "proto3";

message Person {
  string name = 1;
  int32 age = 2;
  string email = 3;
  repeated string phone_numbers = 4;
  map<string, string> metadata = 5;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }
}
    `,
    edition2023: `
syntax = "proto3";
edition = "2023";

message Person {
  string name = 1;
  int32 age = 2;
  string email = 3;
  repeated string phone_numbers = 4 [packed = true];
  map<string, string> metadata = 5;

  enum PhoneType {
    MOBILE = 0;
    HOME = 1;
    WORK = 2;
  }

  message PhoneNumber {
    string number = 1;
    PhoneType type = 2;
  }
}
    `
  };

  // 特性比较表格列定义
  const columns = [
    {
      title: '特性',
      dataIndex: 'feature',
      key: 'feature',
      render: (text: string) => (
        <Tooltip title={featureDescriptions[text]?.description}>
          <Space>
            {featureDescriptions[text]?.title || text}
            <InfoCircleOutlined />
          </Space>
        </Tooltip>
      )
    },
    ...editions.map(edition => ({
      title: `${edition.name} (${edition.year})`,
      dataIndex: edition.name,
      key: edition.name,
      align: 'center' as const,
      render: (value: string) => {
        const isPositive = ['YES', 'NATIVE', 'EXPLICIT', 'PACKED'].includes(value);
        return (
          <Tag color={isPositive ? 'green' : 'blue'}>
            {isPositive ? <CheckCircleFilled /> : null} {value}
          </Tag>
        );
      }
    }))
  ];

  // 特性比较表格数据
  const data = Object.keys(featureDescriptions).map(feature => {
    const row: Record<string, string> = { feature };

    editions.forEach(edition => {
      row[edition.name] = edition.features[feature];
    });

    return row;
  });

  // 渲染语法差异示例
  const renderSyntaxExample = (code: string) => (
    <pre className={styles.codeBlock}>
      <code>{code}</code>
    </pre>
  );

  return (
    <div>
      <Card title="Protobuf 版本特性对比" className={styles.card}>
        <Alert
          message="版本演进"
          description="Protocol Buffers 从 proto2 到 proto3 再到 Edition 2023，不断演进以提供更好的开发体验和性能。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Table
          dataSource={data}
          columns={columns}
          rowKey="feature"
          pagination={false}
          className={styles.featureTable}
        />

        <Divider />

        <Title level={4}>主要区别</Title>
        <Paragraph>
          <ul>
            <li><Text strong>字段存在性:</Text> proto2 使用 required/optional 关键字，proto3 移除了这些关键字，所有字段默认为 optional。</li>
            <li><Text strong>默认值:</Text> proto2 允许自定义默认值，proto3 总是使用类型的零值作为默认值。</li>
            <li><Text strong>未知字段:</Text> proto3 早期版本会丢弃未知字段，后来的版本恢复了保留未知字段的行为。</li>
            <li><Text strong>枚举:</Text> proto3 要求枚举的第一个值必须为0，proto2 没有这个限制。</li>
            <li><Text strong>映射字段:</Text> proto3 原生支持 map 类型，proto2 需要使用嵌套消息模拟。</li>
            <li><Text strong>重复字段编码:</Text> proto3 默认使用更紧凑的 packed 编码，proto2 需要显式指定。</li>
          </ul>
        </Paragraph>

        <Divider />

        <Tabs defaultActiveKey="proto3">
          <TabPane tab="Proto2 语法" key="proto2">
            {renderSyntaxExample(syntaxExamples.proto2)}
          </TabPane>
          <TabPane tab="Proto3 语法" key="proto3">
            {renderSyntaxExample(syntaxExamples.proto3)}
          </TabPane>
          <TabPane tab="Edition 2023 语法" key="edition2023">
            {renderSyntaxExample(syntaxExamples.edition2023)}
          </TabPane>
        </Tabs>

        <Divider />

        <Title level={4}>最佳实践建议</Title>
        <Paragraph>
          <ul>
            <li>对于新项目，建议使用 proto3 或 Edition 2023 语法。</li>
            <li>在混合环境中，注意 proto2 和 proto3 的互操作性问题。</li>
            <li>使用 well-known types 简化常见数据类型的处理。</li>
            <li>对于大型消息，考虑使用 oneof 字段优化内存使用。</li>
            <li>合理使用 reserved 关键字避免字段 ID 冲突。</li>
            <li>为保持向后兼容性，不要更改已有字段的类型或 ID。</li>
          </ul>
        </Paragraph>
      </Card>
    </div>
  );
};

export default FeatureExplorer;
