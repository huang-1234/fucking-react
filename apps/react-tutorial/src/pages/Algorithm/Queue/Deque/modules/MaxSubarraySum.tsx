import React, { useState } from 'react';
import { Card, Row, Col, Button, Input, Space, Typography, Alert, Divider } from 'antd';
import { maxSubarraySumWithLengthConstraint } from '../al';

const { Title, Text, Paragraph } = Typography;

const MaxSubarraySum: React.FC = () => {
  const [inputArray, setInputArray] = useState<string>('2,-1,3,5,-2,4,-3,1');
  const [maxLength, setMaxLength] = useState<string>('3');
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

      // 解析最大长度
      const k = parseInt(maxLength, 10);
      if (isNaN(k) || k <= 0 || k > array.length) {
        throw new Error(`最大长度必须在1到${array.length}之间`);
      }

      // 计算最大子数组和
      const maxSum = maxSubarraySumWithLengthConstraint(array, k);
      setResult(maxSum);
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

    return (
      <>
        <Divider>计算结果</Divider>
        <Paragraph>
          <Text strong>输入数组:</Text> [{inputArray}]
        </Paragraph>
        <Paragraph>
          <Text strong>最大长度约束:</Text> {maxLength}
        </Paragraph>
        <Paragraph>
          <Text strong>最大子数组和:</Text> {result}
        </Paragraph>

        <Alert
          message="算法结果"
          description={`在数组 [${inputArray}] 中，长度不超过 ${maxLength} 的子数组的最大和为 ${result}。`}
          type="success"
          showIcon
        />
      </>
    );
  };

  return (
    <Card title="长度受限的最大子数组和" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>问题描述</Title>
            <Alert
              message="长度受限的最大子数组和"
              description={
                <Paragraph>
                  给你一个整数数组 nums 和一个整数 k，找出 nums 中长度不超过 k 的连续子数组的最大和。
                  这是一个经典的动态规划问题，可以使用单调队列优化。
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
                placeholder="例如: 2,-1,3,5,-2,4,-3,1"
              />

              <Text>最大长度约束:</Text>
              <Input
                value={maxLength}
                onChange={(e) => setMaxLength(e.target.value)}
                placeholder="例如: 3"
                style={{ width: 200 }}
              />

              <Button type="primary" onClick={handleCompute}>
                计算最大子数组和
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
              <Text strong>单调队列优化的动态规划:</Text>
            </Paragraph>
            <Paragraph>
              1. 计算前缀和数组 prefixSum，其中 prefixSum[i] 表示前 i 个元素的和
            </Paragraph>
            <Paragraph>
              2. 使用单调递增队列维护窗口内的最小前缀和:
              <ul>
                <li>对于每个位置 i，计算以 i 结尾的最大子数组和: prefixSum[i] - 队列中的最小前缀和</li>
                <li>移除队列中超出窗口范围的元素（超过 i-k 的索引）</li>
                <li>将当前前缀和加入队列，保持队列单调递增</li>
              </ul>
            </Paragraph>
            <Paragraph>
              3. 记录所有可能的子数组和中的最大值
            </Paragraph>
            <Paragraph>
              <Text strong>时间复杂度:</Text> O(n)，每个元素最多入队出队各一次
            </Paragraph>
            <Paragraph>
              <Text strong>空间复杂度:</Text> O(n)，前缀和数组和队列的大小
            </Paragraph>
            <Paragraph>
              <Text strong>优化说明:</Text> 传统的动态规划解法需要 O(nk) 的时间复杂度，使用单调队列可以将其优化至 O(n)
            </Paragraph>
          </Space>
        </Col>
      </Row>
    </Card>
  );
};

export default React.memo(MaxSubarraySum);
