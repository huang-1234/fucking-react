import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Space, Typography, Alert, Table, Tag, Divider } from 'antd';
import { slidingWindowMaximum } from '../al';

const { Title, Text, Paragraph } = Typography;

const SlidingWindowMaximum: React.FC = () => {
  const [inputArray, setInputArray] = useState<string>('1,3,-1,-3,5,3,6,7');
  const [windowSize, setWindowSize] = useState<string>('3');
  const [result, setResult] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleCompute = () => {
    try {
      setError(null);

      // 解析输入数组
      const array = inputArray.split(',')
        .map(item => Number(item.trim()))
        .filter(num => !isNaN(num));

      if (array.length === 0) {
        throw new Error('请输入有效的数组');
      }

      // 解析窗口大小
      const k = parseInt(windowSize, 10);
      if (isNaN(k) || k <= 0 || k > array.length) {
        throw new Error(`窗口大小必须在1到${array.length}之间`);
      }

      // 计算滑动窗口最大值
      const maxValues = slidingWindowMaximum(array, k);
      setResult(maxValues);
    } catch (err: any) {
      setError(err.message);
      setResult([]);
    }
  };

  // 渲染结果表格
  const renderResultTable = () => {
    if (result.length === 0) {
      return null;
    }

    // 解析数组用于显示
    const array = inputArray.split(',')
      .map(item => Number(item.trim()))
      .filter(num => !isNaN(num));

    const k = parseInt(windowSize, 10);

    const dataSource = result.map((max, index) => ({
      key: index,
      windowIndex: index + 1,
      windowStart: index,
      windowEnd: index + k - 1,
      window: array.slice(index, index + k).join(', '),
      maxValue: max
    }));

    const columns = [
      {
        title: '窗口序号',
        dataIndex: 'windowIndex',
        key: 'windowIndex',
      },
      {
        title: '窗口范围',
        dataIndex: 'windowRange',
        key: 'windowRange',
        render: (_: any, record: any) => `[${record.windowStart}, ${record.windowEnd}]`
      },
      {
        title: '窗口元素',
        dataIndex: 'window',
        key: 'window',
      },
      {
        title: '窗口最大值',
        dataIndex: 'maxValue',
        key: 'maxValue',
        render: (value: number) => <Tag color="red">{value}</Tag>
      }
    ];

    return (
      <>
        <Divider>计算结果</Divider>
        <Paragraph>
          <Text strong>输入数组:</Text> [{inputArray}]
        </Paragraph>
        <Paragraph>
          <Text strong>窗口大小:</Text> {windowSize}
        </Paragraph>
        <Paragraph>
          <Text strong>滑动窗口最大值:</Text> [{result.join(', ')}]
        </Paragraph>
        <Table
          dataSource={dataSource}
          columns={columns}
          size="small"
          pagination={false}
        />
      </>
    );
  };

  return (
    <Card title="滑动窗口最大值" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>问题描述</Title>
            <Alert
              message="滑动窗口最大值 (LeetCode 239)"
              description={
                <Paragraph>
                  给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。
                  你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。
                  返回滑动窗口中的最大值。
                </Paragraph>
              }
              type="info"
              showIcon
            />

            <Divider>算法输入</Divider>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text>数组（用逗号分隔）:</Text>
              <Input
                value={inputArray}
                onChange={(e) => setInputArray(e.target.value)}
                placeholder="例如: 1,3,-1,-3,5,3,6,7"
              />

              <Text>窗口大小:</Text>
              <Input
                value={windowSize}
                onChange={(e) => setWindowSize(e.target.value)}
                placeholder="例如: 3"
                style={{ width: 200 }}
              />

              <Button type="primary" onClick={handleCompute}>
                计算滑动窗口最大值
              </Button>

              {error && (
                <Alert
                  message="错误"
                  description={error}
                  type="error"
                  showIcon
                />
              )}
            </Space>

            {renderResultTable()}

            <Divider>算法原理</Divider>
            <Paragraph>
              <Text strong>单调队列解法:</Text>
            </Paragraph>
            <Paragraph>
              1. 维护一个单调递减的双端队列，队列中存储元素的索引
            </Paragraph>
            <Paragraph>
              2. 遍历数组，对于每个元素:
              <ul>
                <li>从队尾移除所有小于当前元素的索引（保持单调递减性质）</li>
                <li>将当前元素的索引加入队尾</li>
                <li>从队首移除所有超出窗口范围的索引</li>
                <li>当窗口形成后（i &gt;= k-1），队首元素即为当前窗口的最大值</li>
              </ul>
            </Paragraph>
            <Paragraph>
              <Text strong>时间复杂度:</Text> O(n)，每个元素最多入队出队各一次
            </Paragraph>
            <Paragraph>
              <Text strong>空间复杂度:</Text> O(k)，队列大小不超过窗口大小k
            </Paragraph>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default React.memo(SlidingWindowMaximum);
