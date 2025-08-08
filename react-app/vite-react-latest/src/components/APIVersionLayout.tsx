import React from 'react';
import { Card, Typography, Badge, Divider } from 'antd';
import { Outlet } from 'react-router-dom';

const { Title, Text } = Typography;

interface APIVersionLayoutProps {
  version: string;
  title?: string;
  description?: string;
}

/**
 * APIVersionLayout 组件
 * 为各个React版本的API示例提供统一的布局容器
 */
const APIVersionLayout: React.FC<APIVersionLayoutProps> = ({
  version,
  title = `React ${version}`,
  description = `此环境展示了React ${version}的API特性，基于React 19实现。`
}) => {
  // 根据版本设置不同的徽章颜色
  const getBadgeColor = () => {
    switch (version) {
      case '15': return '#1890ff'; // 蓝色
      case '16': return '#52c41a'; // 绿色
      case '17': return '#fa8c16'; // 橙色
      case '18': return '#722ed1'; // 紫色
      case '19': return '#eb2f96'; // 粉色
      default: return '#1890ff';
    }
  };

  return (
    <Card
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={4} style={{ margin: 0 }}>{title}</Title>
          <Badge
            count={`React ${version}`}
            style={{
              backgroundColor: getBadgeColor(),
              marginLeft: 10,
              fontSize: '12px'
            }}
          />
        </div>
      }
      bordered={true}
      style={{ width: '100%' }}
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          {description}
        </Text>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* 渲染子路由内容 */}
      <div className="api-content">
        <Outlet />
      </div>
    </Card>
  );
};

export default APIVersionLayout;