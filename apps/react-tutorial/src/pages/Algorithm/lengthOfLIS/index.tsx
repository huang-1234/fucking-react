import React, { useEffect, useState } from 'react';
import { Card, Tabs, Input, Button, Space, Typography, Alert, Divider, Select } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StepForwardOutlined, StepBackwardOutlined, ReloadOutlined } from '@ant-design/icons';
import LISVisualizerDP from './LISVisualizerDP';
import LISVisualizerTails from './LISVisualizerTails';
import './styles.less';

const { TabPane } = Tabs;
const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

// const DEFAULT_ARRAY = [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10];
// 使用 Select 组件选择需要测试case
const CASES = [
  {
    label: '综合测试序列​',
    value: '1',
    array: [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10],
  },
  /**
   * 测试类型​​

​​输入序列​​

​​预期LIS长度​​

​​验证目标​​

全递减序列

[9,8,7,6,5]

1

头部递减处理

全等序列

[3,3,3,3]

1

平台区稳定性

单元素序列

[5]

1

初始化逻辑

长连续递增

[1,3,5,7,9,11]

6

完全递增优化

负数递增

[-5,-3,0,2]

4

负数比较逻辑


   */
  {
    label: '头部递减处理',
    value: '2',
    array: [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10],
  },

  {
    label: '平台区稳定性',
    value: '3',
    array: [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10],
  },

  {
    label: '单元素序列',
    value: '4',
    array: [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10],
  },

  {
    label: '初始化逻辑',
    value: '5',
    array: [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10],
  },

  {
    label: '长连续递增',
    value: '6',
    array: [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10],
  },

  {
    label: '完全递增优化',
    value: '7',
    array: [10, 9, 2, 5, 5, 5, 3, 7, 4, 8, -1, -3, 1, 2, 3, 4, 5, 101, 18, 19, 10],
  },

];
const DEFAULT_ARRAY = CASES[0].array;


const VisualLengthOfLIS: React.FC = () => {
  const [inputArray, setInputArray] = useState<string>(DEFAULT_ARRAY.join(', '));
  const [array, setArray] = useState<number[]>(DEFAULT_ARRAY);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [activeCase, setActiveCase] = useState<string>(CASES[0].value);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputArray(e.target.value);
  };

  const handleVisualize = () => {
    try {
      const parsedArray = inputArray
        .split(',')
        .map(item => Number(item.trim()))
        .filter(num => !isNaN(num));

      if (parsedArray.length === 0) {
        throw new Error('请输入有效的数组');
      }

      setArray(parsedArray);
    } catch (error) {
      console.error('输入解析错误:', error);
    }
  };

  useEffect(() => {
    setArray(CASES.find(item => item.value === activeCase)?.array || DEFAULT_ARRAY);
  }, [activeCase]);

  const handleReset = () => {
    setInputArray(DEFAULT_ARRAY.join(', '));
    setArray(DEFAULT_ARRAY);
  };

  return (
    <div className="lis-container">
      <Title level={2}>最长递增子序列可视化</Title>

      <Card title="输入数据" className="lis-input-card">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Paragraph>
            请输入一个数字数组，用逗号分隔（例如：10, 9, 2, 5, 3, 7, 101, 18）
          </Paragraph>
          <TextArea
            rows={2}
            value={inputArray}
            onChange={handleInputChange}
            placeholder="输入数组，用逗号分隔"
          />
          {/* 使用 Select 组件选择需要测试case */}
          <Select
            options={CASES}
            value={activeCase}
            onChange={setActiveCase}
            style={{ width: '100%' }}
          />
          <Space>
            <Button type="primary" onClick={handleVisualize}>
              可视化
            </Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>
              重置
            </Button>
          </Space>
        </Space>
      </Card>

      <Divider />

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="动态规划方法 O(n²)" key="1">
          <Alert
            message="动态规划方法"
            description="使用动态规划方法求解最长递增子序列，时间复杂度 O(n²)，空间复杂度 O(n)"
            type="info"
            showIcon
          />
          <LISVisualizerDP array={array} />
        </TabPane>
        <TabPane tab="二分查找方法 O(nlogn)" key="2">
          <Alert
            message="二分查找方法"
            description="使用贪心 + 二分查找方法求解最长递增子序列，时间复杂度 O(nlogn)，空间复杂度 O(n)"
            type="info"
            showIcon
          />
          <LISVisualizerTails array={array} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(VisualLengthOfLIS);
