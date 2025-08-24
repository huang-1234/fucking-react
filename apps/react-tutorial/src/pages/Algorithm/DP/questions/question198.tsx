import React, { useState } from 'react';
import { Card, Typography, Space, Button, InputNumber, Row, Col, Alert } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import DPVisualizer from '../components/DPVisualizer';
import { robOptimized } from '../al';

const { Title, Paragraph, Text } = Typography;

const HouseRobberQuestion: React.FC = () => {
  const [houses, setHouses] = useState<number[]>([1, 2, 3, 1]);
  const [inputValue, setInputValue] = useState<number | null>(1);

  const addHouse = () => {
    if (inputValue !== null) {
      setHouses([...houses, inputValue]);
      setInputValue(1);
    }
  };

  const removeHouse = (index: number) => {
    setHouses(houses.filter((_, i) => i !== index));
  };

  const resetExample1 = () => {
    setHouses([1, 2, 3, 1]);
  };

  const resetExample2 = () => {
    setHouses([2, 7, 9, 3, 1]);
  };

  const optimizedResult = robOptimized(houses);

  return (
    <div style={{ padding: '16px 0' }}>
      <Card>
        <Title level={2}>198. 打家劫舍</Title>
        <Paragraph>
          你是一个专业的小偷，计划偷窃沿街的房屋。每间房内都藏有一定的现金，影响你偷窃的唯一制约因素就是相邻的房屋装有相互连通的防盗系统，如果两间相邻的房屋在同一晚上被小偷闯入，系统会自动报警。
        </Paragraph>
        <Paragraph>
          给定一个代表每个房屋存放金额的非负整数数组，计算你 不触动警报装置的情况下 ，一夜之内能够偷窃到的最高金额。
        </Paragraph>

        <Title level={4}>示例</Title>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Alert
            message="示例 1"
            description={
              <div>
                <div>输入：[1,2,3,1]</div>
                <div>输出：4</div>
                <div>解释：偷窃 1 号房屋 (金额 = 1) ，然后偷窃 3 号房屋 (金额 = 3)。偷窃到的最高金额 = 1 + 3 = 4 。</div>
              </div>
            }
            type="info"
            showIcon
          />
          <Alert
            message="示例 2"
            description={
              <div>
                <div>输入：[2,7,9,3,1]</div>
                <div>输出：12</div>
                <div>解释：偷窃 1 号房屋 (金额 = 2), 偷窃 3 号房屋 (金额 = 9)，接着偷窃 5 号房屋 (金额 = 1)。偷窃到的最高金额 = 2 + 9 + 1 = 12 。</div>
              </div>
            }
            type="info"
            showIcon
          />
        </Space>

        <Title level={4}>自定义输入</Title>
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Space>
              <Button onClick={resetExample1}>示例 1</Button>
              <Button onClick={resetExample2}>示例 2</Button>
            </Space>
          </Col>
          <Col span={24}>
            <Space align="center">
              <Text>房屋金额:</Text>
              <Space wrap>
                {houses.map((house, index) => (
                  <Card
                    key={index}
                    size="small"
                    style={{ width: 80, textAlign: 'center' }}
                    actions={[
                      <DeleteOutlined key="delete" onClick={() => removeHouse(index)} />
                    ]}
                  >
                    <div>房屋 {index + 1}</div>
                    <div><Text strong>{house}</Text></div>
                  </Card>
                ))}
                <Card size="small" style={{ width: 120 }}>
                  <Space>
                    <InputNumber
                      min={0}
                      max={400}
                      value={inputValue}
                      onChange={setInputValue}
                    />
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={addHouse}
                      disabled={inputValue === null}
                    />
                  </Space>
                </Card>
              </Space>
            </Space>
          </Col>
          <Col span={24}>
            <Alert
              message="最优解"
              description={`使用优化算法计算的最大偷窃金额为: ${optimizedResult}`}
              type="success"
              showIcon
            />
          </Col>
        </Row>
      </Card>

      <DPVisualizer
        title="打家劫舍问题可视化"
        description="通过动态规划解决打家劫舍问题。状态定义: dp[i] 表示偷到第i间房屋时能获得的最大金额。状态转移方程: dp[i] = max(dp[i-1], dp[i-2] + nums[i])。"
        algorithm="houseRobber"
        inputs={[houses]}
        originalData={houses}
      />
    </div>
  );
};

export default HouseRobberQuestion;
