import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Space, Typography, Alert, Divider } from 'antd';
import { longestSubarray } from '../al';

const { Title, Text, Paragraph } = Typography;

const LongestSubarray: React.FC = () => {
  const [inputArray, setInputArray] = useState<string>('8,2,4,7,1,5,6,3');
  const [limit, setLimit] = useState<string>('2');
  const [result, setResult] = useState<number | null>(null);
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

      // 解析限制值
      const limitValue = parseInt(limit, 10);
      if (isNaN(limitValue) || limitValue < 0) {
        throw new Error('限制值必须是非负整数');
      }

      // 计算最长子数组
      const maxLength = longestSubarray(array, limitValue);
      setResult(maxLength);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    }
  };

  // 渲染结果
  const renderResult = () => {
    if (result === null) {
      return null;
    }

    // 解析数组用于显示
    const array = inputArray.split(',')
      .map(item => Number(item.trim()))
      .filter(num => !isNaN(num));

    return (
      <>
        <Divider>计算结果</Divider>
        <Paragraph>
          <Text strong>输入数组:</Text> [{inputArray}]
        </Paragraph>
        <Paragraph>
          <Text strong>绝对差限制:</Text> {limit}
        </Paragraph>
        <Paragraph>
          <Text strong>最长子数组长度:</Text> {result}
        </Paragraph>

        <Alert
          message="算法结果"
          description={`在数组 [${inputArray}] 中，满足任意两个元素绝对差不超过 ${limit} 的最长子数组长度为 ${result}。`}
          type="success"
          showIcon
        />
      </>
    );
  };

  return (
    <Card title="绝对差不超过限制的最长子数组" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>问题描述</Title>
            <Alert
              message="绝对差不超过限制的最长子数组 (LeetCode 1438)"
              description={
                <Paragraph>
                  给你一个整数数组 nums 和一个整数 limit，请你返回最长连续子数组的长度，
                  该子数组中的任意两个元素之间的绝对差不超过 limit。
                  如果不存在满足条件的子数组，则返回 0。
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
                placeholder="例如: 8,2,4,7,1,5,6,3"
              />

              <Text>绝对差限制:</Text>
              <Input
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="例如: 2"
                style={{ width: 200 }}
              />

              <Button type="primary" onClick={handleCompute}>
                计算最长子数组
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

            {renderResult()}

            <Divider>算法原理</Divider>
            <Paragraph>
              <Text strong>双单调队列解法:</Text>
            </Paragraph>
            <Paragraph>
              1. 维护两个单调队列:
              <ul>
                <li>单调递减队列: 用于跟踪窗口中的最大值</li>
                <li>单调递增队列: 用于跟踪窗口中的最小值</li>
              </ul>
            </Paragraph>
            <Paragraph>
              2. 使用滑动窗口技术:
              <ul>
                <li>右指针不断向右移动，将元素加入两个单调队列</li>
                <li>当窗口中最大值与最小值的差超过限制时，移动左指针缩小窗口</li>
                <li>移动左指针时，从两个队列中移除超出窗口范围的元素</li>
                <li>记录满足条件的最大窗口长度</li>
              </ul>
            </Paragraph>
            <Paragraph>
              <Text strong>时间复杂度:</Text> O(n)，每个元素最多入队出队各一次
            </Paragraph>
            <Paragraph>
              <Text strong>空间复杂度:</Text> O(n)，两个队列的大小
            </Paragraph>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default React.memo(LongestSubarray);
