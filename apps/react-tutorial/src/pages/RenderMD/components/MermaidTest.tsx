import React from 'react';
import { Card, Typography } from 'antd';
import MermaidDiagram from './MermaidDiagram';

const { Title } = Typography;

const MermaidTest: React.FC = () => {
  const simpleFlowchart = `
    graph TD
      A[开始] --> B{条件判断}
      B -->|是| C[处理1]
      B -->|否| D[处理2]
      C --> E[结束]
      D --> E
  `;

  const sequenceDiagram = `
    sequenceDiagram
      participant 用户
      participant 系统
      participant 数据库

      用户->>系统: 发送请求
      系统->>数据库: 查询数据
      数据库-->>系统: 返回结果
      系统-->>用户: 显示结果
  `;

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>Mermaid 图表测试</Title>

      <Card title="流程图" style={{ marginBottom: '20px' }}>
        <MermaidDiagram chart={simpleFlowchart} theme="default" />
      </Card>

      <Card title="时序图">
        <MermaidDiagram chart={sequenceDiagram} theme="default" />
      </Card>
    </div>
  );
};

export default MermaidTest;
