import React from 'react';
import { Card, Typography, Tabs, Alert } from 'antd';
import { CodeOutlined, QuestionCircleOutlined, LineChartOutlined, ShoppingOutlined } from '@ant-design/icons';
import { HouseRobberQuestion } from './questions';
import ExactKnapsackQuestion from './Visualizer/question2548';
import styles from './index.module.less';
import LongestCommonSubstringVisualizer from './questions/question_findLongestCommonSubstring';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

const DynamicProgrammingPage: React.FC = () => {
  return (
    <div className={styles.dpContainer}>
      <div className={styles.header}>
        <Title level={2}>动态规划算法可视化</Title>
        <Paragraph className={styles.description}>
          动态规划是一种通过将复杂问题分解为更简单的子问题来解决问题的方法。本页面提供了常见动态规划问题的可视化解决方案，帮助您理解动态规划的核心概念和状态转移过程。
        </Paragraph>
      </div>

      <Alert
        message="动态规划的核心步骤"
        description={
          <ol>
            <li><strong>确定状态</strong> - 明确定义子问题</li>
            <li><strong>状态转移方程</strong> - 找出子问题之间的关系</li>
            <li><strong>初始状态</strong> - 确定基础情况</li>
            <li><strong>计算顺序</strong> - 通常是自底向上</li>
            <li><strong>返回结果</strong> - 通常是dp数组的最后一个元素或特定位置</li>
          </ol>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Tabs defaultActiveKey="1">
        <TabPane
          tab={<span><QuestionCircleOutlined />经典问题</span>}
          key="1"
        >
          <div className={styles.cardGrid}>
            <Card
              className={styles.algorithmCard}
              hoverable
              cover={
                <div style={{
                  height: 160,
                  background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CodeOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Card.Meta
                title="打家劫舍问题"
                description="不能偷取相邻房屋的情况下，计算能偷取的最大金额。"
                className={styles.cardMeta}
              />
            </Card>

            <Card
              className={styles.algorithmCard}
              hoverable
              cover={
                <div style={{
                  height: 160,
                  background: 'linear-gradient(135deg, #52c41a 0%, #13c2c2 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <LineChartOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Card.Meta
                title="最长递增子序列"
                description="找出数组中最长的递增子序列的长度。"
                className={styles.cardMeta}
              />
            </Card>

            <Card
              className={styles.algorithmCard}
              hoverable
              cover={
                <div style={{
                  height: 160,
                  background: 'linear-gradient(135deg, #fa8c16 0%, #f5222d 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingOutlined style={{ fontSize: 64, color: 'white' }} />
                </div>
              }
            >
              <Card.Meta
                title="0-1背包问题"
                description="在有限容量的背包中，选择物品使总价值最大。"
                className={styles.cardMeta}
              />
            </Card>
          </div>
        </TabPane>

        <TabPane
          tab={<span><CodeOutlined />打家劫舍问题</span>}
          key="2"
        >
          <HouseRobberQuestion />
        </TabPane>

        <TabPane
          tab={<span><ShoppingOutlined />恰好装满背包问题</span>}
          key="3"
        >
          <ExactKnapsackQuestion />
        </TabPane>

        <TabPane tab="最长公共子串" key="lcs">
          <LongestCommonSubstringVisualizer />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default DynamicProgrammingPage;