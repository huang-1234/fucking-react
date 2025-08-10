import React from 'react';
import { List, Typography, Tag, Space, Card, Button } from 'antd';
import { FireOutlined, RightOutlined, StarOutlined, EyeOutlined, LikeOutlined } from '@ant-design/icons';
import styles from './HotRecommendations.module.less';

const { Title, Text } = Typography;

interface HotRecommendationsProps {
  collapsed: boolean;
  onCollapse: (collapsed: boolean) => void;
}

/**
 * 热门推荐组件
 * 显示热门文章、教程和推荐内容
 */
const HotRecommendations: React.FC<HotRecommendationsProps> = ({ collapsed, onCollapse }) => {
  // 热门文章数据
  const hotArticles = [
    {
      id: 1,
      title: 'React 19新特性详解',
      views: 3520,
      likes: 256,
      tags: ['React', '前端']
    },
    {
      id: 2,
      title: '使用React Hooks优化性能',
      views: 2890,
      likes: 189,
      tags: ['Hooks', '性能优化']
    },
    {
      id: 3,
      title: 'React Server Components入门',
      views: 2150,
      likes: 142,
      tags: ['SSR', '服务端组件']
    }
  ];

  // 推荐教程数据
  const recommendedTutorials = [
    {
      id: 1,
      title: 'React 15到19版本迁移指南',
      rating: 4.9
    },
    {
      id: 2,
      title: '深入理解React并发模式',
      rating: 4.7
    }
  ];

  if (collapsed) {
    return (
      <div
        className={styles.collapsedView}
        onClick={() => onCollapse(false)}
      >
        <FireOutlined className={styles.icon} />
        <div className={styles.text}>热门</div>
      </div>
    );
  }

  return (
    <div className={styles.hotRecommendations}>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          <FireOutlined className={styles.icon} />
          热门推荐
        </Title>
        <Button
          type="text"
          icon={<RightOutlined />}
          className={styles.collapseButton}
          onClick={() => onCollapse(true)}
        />
      </div>

      <Card title="热门文章" size="small" className={styles.card}>
        <List
          itemLayout="vertical"
          dataSource={hotArticles}
          renderItem={item => (
            <List.Item
              key={item.id}
              className={styles.listItem}
              extra={
                <Space>
                  <Text type="secondary"><EyeOutlined /> {item.views}</Text>
                  <Text type="secondary"><LikeOutlined /> {item.likes}</Text>
                </Space>
              }
            >
              <div className={styles.itemTitle}>
                <a href="#">{item.title}</a>
              </div>
              <div className={styles.tags}>
                {item.tags.map(tag => (
                  <Tag key={tag} color="blue">{tag}</Tag>
                ))}
              </div>
            </List.Item>
          )}
        />
      </Card>

      <Card title="推荐教程" size="small" className={styles.card}>
        <List
          itemLayout="horizontal"
          dataSource={recommendedTutorials}
          renderItem={item => (
            <List.Item
              key={item.id}
              className={styles.listItem}
              extra={
                <Space>
                  <StarOutlined style={{ color: '#faad14' }} />
                  <Text>{item.rating}</Text>
                </Space>
              }
            >
              <a href="#">{item.title}</a>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default HotRecommendations;