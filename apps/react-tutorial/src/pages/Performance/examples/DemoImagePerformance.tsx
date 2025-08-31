import React, { useState } from 'react';
import { Card, Tabs, Typography } from 'antd';
import { LazyLoadDemo } from './LazyLoadDemo';
import { ImageCropDemo } from './ImageCropDemo';
import { ImageCompressDemo } from './ImageCompressDemo';
import { FormatConvertDemo } from './FormatConvertDemo';

const { TabPane } = Tabs;
const { Title, Paragraph } = Typography;

// 示例图片列表
export const SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?q=80&w=1000',
  'https://images.unsplash.com/photo-1682687221038-8cc5c0b9e28e?q=80&w=1000',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?q=80&w=1000',
  'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?q=80&w=1000',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
  'https://images.unsplash.com/photo-1519046904884-53103b34b206?q=80&w=1000',
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=1000',
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000',
];

export const DemoImagePerformance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('lazy-load');

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>图片性能优化演示</Title>
      <Paragraph>
        本演示展示了多种图片性能优化技术，包括懒加载、裁剪、压缩和格式转换。
      </Paragraph>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="图片懒加载" key="lazy-load">
          <Card title="懒加载演示">
            <LazyLoadDemo />
          </Card>
        </TabPane>

        <TabPane tab="图片裁剪" key="crop">
          <Card title="图片裁剪演示">
            <ImageCropDemo />
          </Card>
        </TabPane>

        <TabPane tab="图片压缩" key="compress">
          <Card title="图片压缩演示">
            <ImageCompressDemo />
          </Card>
        </TabPane>

        <TabPane tab="格式转换" key="format">
          <Card title="图片格式转换演示">
            <FormatConvertDemo />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(DemoImagePerformance);