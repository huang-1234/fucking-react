import React from 'react';
import { Typography, Card } from 'antd';
import MDXLoader from '../../../components/MDXLoader';
import styles from './index.module.less';
import stylesLayout from '@/layouts/container.module.less';
import classNames from 'classnames';
const { Title } = Typography;

/**
 * MDX演示页面
 * 展示如何使用MDX加载和渲染技术文档
 */
const MDXDemoPage: React.FC = () => {
  return (
    <div className={classNames(styles.mdxDemoPage, stylesLayout.contentLayout)}>
      <Card bordered={false} className={styles.mdxCard}>
        <Title level={2} className={styles.pageTitle}>
          MDX技术文档演示
        </Title>

        <MDXLoader path="/src/tech/ReactSkills.mdx" />
      </Card>
    </div>
  );
};

export default MDXDemoPage;