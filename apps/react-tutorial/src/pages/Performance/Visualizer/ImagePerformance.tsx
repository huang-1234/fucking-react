import React, { useState, useEffect, useRef } from 'react';
import { Card, Tabs, Row, Col, Button, Space, Typography, Divider, Statistic } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { lazyLoad, imageCrop, imageFormat } from '../ImagePerformance/img-performance';
import { SAMPLE_IMAGES } from '../examples/DemoImagePerformance';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;

// 性能数据类型
interface PerformanceData {
  name: string;
  value: number;
  color: string;
}

// 加载时间数据类型
interface LoadTimeData {
  name: string;
  lazy: number;
  eager: number;
}

// 图片大小数据类型
interface SizeData {
  format: string;
  size: number;
  quality: string;
}

// 图片加载性能可视化
const LazyLoadVisualizer: React.FC = () => {
  const [loadTimeData, setLoadTimeData] = useState<LoadTimeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lazyLoadSavings, setLazyLoadSavings] = useState(0);

  useEffect(() => {
    // 模拟测量不同加载策略的性能
    const simulateLoadTimes = async () => {
      setIsLoading(true);

      // 模拟数据
      const data: LoadTimeData[] = [
        { name: '5张图片', lazy: 120, eager: 580 },
        { name: '10张图片', lazy: 145, eager: 1050 },
        { name: '20张图片', lazy: 160, eager: 1850 },
        { name: '50张图片', lazy: 180, eager: 4200 },
        { name: '100张图片', lazy: 210, eager: 8500 },
      ];

      // 计算平均节省百分比
      const totalSavings = data.reduce((acc, item) => {
        const saving = ((item.eager - item.lazy) / item.eager) * 100;
        return acc + saving;
      }, 0);

      setLazyLoadSavings(Math.round(totalSavings / data.length));
      setLoadTimeData(data);
      setIsLoading(false);
    };

    simulateLoadTimes();
  }, []);

  return (
    <Card title="图片懒加载性能分析" loading={isLoading}>
      <Row gutter={24}>
        <Col span={16}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={loadTimeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: '加载时间 (ms)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="lazy" name="懒加载" stroke="#52c41a" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="eager" name="立即加载" stroke="#ff4d4f" />
            </LineChart>
          </ResponsiveContainer>
        </Col>
        <Col span={8}>
          <Statistic
            title="平均加载时间节省"
            value={lazyLoadSavings}
            suffix="%"
            valueStyle={{ color: '#3f8600' }}
          />
          <Divider />
          <Paragraph>
            <Text strong>懒加载优势:</Text>
          </Paragraph>
          <ul>
            <li>减少初始页面加载时间</li>
            <li>节省带宽和数据流量</li>
            <li>提高页面响应速度</li>
            <li>降低服务器负载</li>
          </ul>
        </Col>
      </Row>
    </Card>
  );
};

// 图片裁剪性能可视化
const CropVisualizer: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟测量不同裁剪方法的性能
    const simulatePerformance = async () => {
      setIsLoading(true);

      // 模拟数据
      const data: PerformanceData[] = [
        { name: 'Canvas API', value: 25, color: '#1890ff' },
        { name: 'CSS裁剪', value: 5, color: '#52c41a' },
        { name: 'Cropper.js', value: 45, color: '#fa8c16' },
        { name: 'WebGL裁剪', value: 15, color: '#722ed1' },
      ];

      setPerformanceData(data);
      setIsLoading(false);
    };

    simulatePerformance();
  }, []);

  return (
    <Card title="图片裁剪性能比较" loading={isLoading}>
      <Row gutter={24}>
        <Col span={16}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={performanceData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: '处理时间 (ms)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="处理时间" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col span={8}>
          <Paragraph>
            <Text strong>裁剪方法比较:</Text>
          </Paragraph>
          <ul>
            <li><Text strong>Canvas API:</Text> 原生实现，适用于简单裁剪</li>
            <li><Text strong>CSS裁剪:</Text> 最快但功能有限</li>
            <li><Text strong>Cropper.js:</Text> 功能丰富但性能较低</li>
            <li><Text strong>WebGL裁剪:</Text> 适用于复杂图像处理</li>
          </ul>
          <Divider />
          <Paragraph>
            <Text type="secondary">
              * 数据基于2048x1536像素图片的平均处理时间
            </Text>
          </Paragraph>
        </Col>
      </Row>
    </Card>
  );
};

// 图片格式性能可视化
const FormatVisualizer: React.FC = () => {
  const [sizeData, setSizeData] = useState<SizeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 模拟不同格式的图片大小
    const simulateFormatSizes = async () => {
      setIsLoading(true);

      // 模拟数据
      const data: SizeData[] = [
        { format: 'JPEG', size: 100, quality: '90%' },
        { format: 'PNG', size: 250, quality: '无损' },
        { format: 'WebP', size: 65, quality: '90%' },
        { format: 'AVIF', size: 45, quality: '90%' },
        { format: 'JPEG 2000', size: 80, quality: '90%' },
      ];

      setSizeData(data);
      setIsLoading(false);
    };

    simulateFormatSizes();
  }, []);

  return (
    <Card title="图片格式大小比较" loading={isLoading}>
      <Row gutter={24}>
        <Col span={16}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={sizeData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: '相对大小 (%)', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="format" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="size" name="相对大小" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
        <Col span={8}>
          <Paragraph>
            <Text strong>格式特点比较:</Text>
          </Paragraph>
          <ul>
            <li><Text strong>JPEG:</Text> 适合照片，有损压缩</li>
            <li><Text strong>PNG:</Text> 支持透明度，无损压缩</li>
            <li><Text strong>WebP:</Text> 同时支持有损和无损，体积小</li>
            <li><Text strong>AVIF:</Text> 最新格式，高压缩率</li>
            <li><Text strong>JPEG 2000:</Text> 高质量但兼容性较差</li>
          </ul>
          <Divider />
          <Paragraph>
            <Text type="secondary">
              * 数据基于相同图片内容的相对大小比较，以JPEG为基准(100%)
            </Text>
          </Paragraph>
        </Col>
      </Row>
    </Card>
  );
};

// 主可视化组件
const ImagePerformanceVisualizer: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Title level={2}>图片性能优化可视化</Title>
      <Paragraph>
        本页面展示了不同图片优化技术的性能数据和比较结果。
      </Paragraph>

      <Tabs defaultActiveKey="lazy-load">
        <TabPane tab="懒加载性能" key="lazy-load">
          <LazyLoadVisualizer />
        </TabPane>

        <TabPane tab="裁剪性能" key="crop">
          <CropVisualizer />
        </TabPane>

        <TabPane tab="格式性能" key="format">
          <FormatVisualizer />
        </TabPane>
      </Tabs>

      <Divider />

      <Title level={3}>最佳实践建议</Title>
      <Row gutter={24}>
        <Col span={8}>
          <Card title="懒加载最佳实践">
            <ul>
              <li>使用IntersectionObserver API</li>
              <li>设置合理的rootMargin（如20%）</li>
              <li>使用SVG或低质量图片作为占位符</li>
              <li>为图片设置width和height属性</li>
              <li>考虑使用原生loading="lazy"属性</li>
            </ul>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="裁剪最佳实践">
            <ul>
              <li>小图片使用CSS裁剪</li>
              <li>中等图片使用Canvas API</li>
              <li>复杂交互使用专业库</li>
              <li>大图片分块处理</li>
              <li>使用Web Worker处理大图片</li>
            </ul>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="格式选择最佳实践">
            <ul>
              <li>优先使用WebP（检测支持）</li>
              <li>照片类使用JPEG（质量75-85%）</li>
              <li>需要透明度使用PNG</li>
              <li>使用picture元素提供多格式</li>
              <li>考虑使用响应式图片srcset属性</li>
            </ul>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ImagePerformanceVisualizer;
