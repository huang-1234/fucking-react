import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import WeChatPackets from './modules/WeChatPackets';
import ProbabilityTheoryVisual from './modules/ProbabilityTheoryVisual';
import PageContainer from '@/layouts/PageContainer';

const { Title, Paragraph } = Typography;
const { TabPane } = Tabs;

function ProbabilityTheoryPage() {
  const [activeTab, setActiveTab] = useState('1');

  const handleTabChange = (key: string) => {
    setActiveTab(key);
  };

  return (
    <>
      <Title level={2}>概率论与统计</Title>
      <Paragraph>
        概率论是研究随机现象数量规律的数学分支，本模块展示了概率论中的重要概念和应用。
      </Paragraph>

      <Tabs activeKey={activeTab} onChange={handleTabChange}>
        <TabPane tab="概率分布可视化" key="1">
          <ProbabilityTheoryVisual />
        </TabPane>
        <TabPane tab="微信红包算法" key="2">
          <WeChatPackets />
        </TabPane>
      </Tabs>
    </>
  );
}

export default React.memo(ProbabilityTheoryPage);