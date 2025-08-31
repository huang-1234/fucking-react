import React from 'react';
import { Card, Typography, Divider, Space, Row, Col, Alert } from 'antd';

const { Title, Text, Paragraph } = Typography;

interface SearchVisualizerBaseProps {
  /**
   * 算法类型标题
   */
  title: string;

  /**
   * 算法描述
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
   * 算法状态信息
   */
  statusInfo?: React.ReactNode;

  /**
   * 代码区域内容
   */
  codeContent?: React.ReactNode;

  /**
   * 额外内容区域
   */
  extraContent?: React.ReactNode;

  /**
   * 是否显示代码区域
   */
  showCode?: boolean;

  /**
   * 是否显示额外内容区域
   */
  showExtra?: boolean;
}

const SearchVisualizerBase: React.FC<SearchVisualizerBaseProps> = ({
  title,
  description,
  operationsContent,
  visualizationContent,
  statusInfo,
  codeContent,
  extraContent,
  showCode = true,
  showExtra = false
}) => {
  return (
    <div style={{ padding: '20px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <Title level={3}>{title}</Title>
          {description && (
            <Paragraph style={{ marginBottom: 0 }}>
              {description}
            </Paragraph>
          )}
        </Card>

        <Row gutter={[16, 16]}>
          {/* 操作区域 */}
          <Col xs={24} md={8}>
            <Card title="操作" style={{ height: '100%' }}>
              {operationsContent}
            </Card>
          </Col>

          {/* 可视化区域 */}
          <Col xs={24} md={16}>
            <Card title="可视化" style={{ height: '100%' }}>
              {visualizationContent}
              {statusInfo && (
                <>
                  <Divider />
                  <div style={{ padding: '8px 0' }}>
                    <Text type="secondary">{statusInfo}</Text>
                  </div>
                </>
              )}
            </Card>
          </Col>
        </Row>

        {/* 代码区域 */}
        {showCode && codeContent && (
          <Card title="代码实现">
            {codeContent}
          </Card>
        )}

        {/* 额外内容区域 */}
        {showExtra && extraContent && (
          <Card title="算法详解">
            {extraContent}
          </Card>
        )}
      </Space>
    </div>
  );
};

export default SearchVisualizerBase;
