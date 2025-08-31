import React from 'react';
import { Card, Row, Col, Space, Divider, Typography, Alert } from 'antd';

const { Title, Text, Paragraph } = Typography;

/**
 * 队列可视化基础组件的属性
 */
export interface QueueVisualizerBaseProps {
  /**
   * 队列类型标题
   */
  title: string;

  /**
   * 队列描述
   */
  description?: React.ReactNode;

  /**
   * 操作区域内容
   */
  operationsContent: React.ReactNode;

  /**
   * 可视化区域内容
   */
  visualizationContent: React.ReactNode;

  /**
   * 队列状态信息
   */
  statusInfo?: React.ReactNode;

  /**
   * 历史记录区域内容
   */
  historyContent?: React.ReactNode;

  /**
   * 额外内容区域
   */
  extraContent?: React.ReactNode;

  /**
   * 是否显示历史记录区域
   */
  showHistory?: boolean;

  /**
   * 是否显示额外内容区域
   */
  showExtra?: boolean;
}

/**
 * 队列可视化基础组件
 * 提供统一的布局和样式，可被各种队列可视化组件继承使用
 */
const QueueVisualizerBase: React.FC<QueueVisualizerBaseProps> = ({
  title,
  description,
  operationsContent,
  visualizationContent,
  statusInfo,
  historyContent,
  extraContent,
  showHistory = true,
  showExtra = false
}) => {
  return (
    <Card title={title} style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        {description && (
          <Col span={24}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Title level={5}>描述</Title>
              {typeof description === 'string' ? (
                <Paragraph>{description}</Paragraph>
              ) : (
                description
              )}
            </Space>
          </Col>
        )}

        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>队列操作</Title>
            {operationsContent}

            {statusInfo && (
              <Alert
                message={statusInfo}
                type="info"
                showIcon
              />
            )}
          </Space>
        </Col>

        <Col span={24}>
          <Divider>队列可视化</Divider>
          {visualizationContent}
        </Col>

        {showHistory && historyContent && (
          <Col span={24}>
            <Divider>操作历史</Divider>
            {historyContent}
          </Col>
        )}

        {showExtra && extraContent && (
          <Col span={24}>
            <Divider>额外信息</Divider>
            {extraContent}
          </Col>
        )}
      </Row>
    </Card>
  );
};

export default React.memo(QueueVisualizerBase);
