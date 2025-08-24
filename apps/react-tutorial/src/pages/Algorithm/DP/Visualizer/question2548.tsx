import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, InputNumber, Row, Col, Alert, Table, Badge } from 'antd';
import { PlusOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import DPGraph from '../components/DPGraph';
import DecisionLog from '../components/DecisionLog';
import DPControls from '../components/DPControls';
import { knapsackExact, getKnapsackSolution } from '../al';

const { Title, Paragraph, Text } = Typography;

const ExactKnapsackQuestion: React.FC = () => {
  // 物品数据
  const [weights, setWeights] = useState<number[]>([1, 2, 3]);
  const [values, setValues] = useState<number[]>([6, 10, 12]);
  const [capacity, setCapacity] = useState<number>(5);

  // 新物品输入
  const [newWeight, setNewWeight] = useState<number | null>(1);
  const [newValue, setNewValue] = useState<number | null>(1);

  // DP状态
  const [dpSteps, setDpSteps] = useState<any[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [solution, setSolution] = useState<number[]>([]);
  const [maxValue, setMaxValue] = useState<number>(-1);

  // 计算DP步骤
  useEffect(() => {
    const result = knapsackExact(weights, values, capacity);
    setDpSteps(result.steps);
    setMaxValue(result.maxValue);
    setCurrentStep(0);

    // 如果有有效解，计算解决方案
    if (result.maxValue > -1) {
      const sol = getKnapsackSolution(weights, values, capacity, result.steps[result.steps.length - 1].dp);
      setSolution(sol);
    } else {
      setSolution([]);
    }
  }, [weights, values, capacity]);

  // 播放控制
  useEffect(() => {
    if (!isPlaying || currentStep >= dpSteps.length - 1) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= dpSteps.length) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, 1000 / playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, dpSteps.length, playbackSpeed]);

  // 添加物品
  const addItem = () => {
    if (newWeight !== null && newValue !== null && newWeight > 0) {
      setWeights([...weights, newWeight]);
      setValues([...values, newValue]);
      setNewWeight(1);
      setNewValue(1);
    }
  };

  // 移除物品
  const removeItem = (index: number) => {
    setWeights(weights.filter((_, i) => i !== index));
    setValues(values.filter((_, i) => i !== index));
  };

  // 重置示例
  const resetExample1 = () => {
    setWeights([1, 2, 3]);
    setValues([6, 10, 12]);
    setCapacity(5);
  };

  const resetExample2 = () => {
    setWeights([2]);
    setValues([1]);
    setCapacity(3);
  };

  // 表格列定义
  const columns = [
    {
      title: '物品索引',
      dataIndex: 'index',
      key: 'index',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: '重量',
      dataIndex: 'weight',
      key: 'weight',
    },
    {
      title: '价值',
      dataIndex: 'value',
      key: 'value',
    },
    {
      title: '是否选择',
      dataIndex: 'selected',
      key: 'selected',
      render: (selected: boolean) => selected ?
        <Badge status="success" text={<Text type="success">已选择 <CheckCircleOutlined /></Text>} /> :
        <Badge status="default" text={<Text type="secondary">未选择</Text>} />
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          size="small"
          onClick={() => removeItem(record.key)}
        >
          移除
        </Button>
      )
    }
  ];

  // 准备表格数据
  const tableData = weights.map((weight, index) => ({
    key: index,
    index: index,
    weight: weight,
    value: values[index],
    selected: solution.includes(index)
  }));

  // 计算当前DP状态的可视化数据
  const currentDpState = dpSteps[currentStep] || { dp: [], decision: '', highlightIndices: [] };

  // 处理DP数组显示（替换负无穷为更友好的显示）
  const displayDp = currentDpState.dp?.map((value: number) =>
    value === Number.MIN_SAFE_INTEGER ? -Infinity : value
  );

  return (
    <div style={{ padding: '16px 0' }}>
      <Card>
        <Title level={2}>2548. 填满背包的最大价格（0-1背包问题）</Title>
        <Paragraph>
          给定一组物品，每个物品有重量 <Text code>weight[i]</Text> 和价值 <Text code>value[i]</Text>，
          以及一个容量为 <Text code>capacity</Text> 的背包。每个物品<Text strong>只能选或不选</Text>（不可重复使用），
          求在<Text strong>恰好装满背包</Text>的前提下，能获得的最大总价值。若无法恰好装满，返回 <Text code>-1</Text>。
        </Paragraph>

        <Title level={4}>示例</Title>
        <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
          <Alert
            message="示例 1"
            description={
              <div>
                <div>输入：weights = [1, 2, 3], values = [6, 10, 12], capacity = 5</div>
                <div>输出：22</div>
                <div>解释：选物品1（重量=2, 价值=10）和物品2（重量=3, 价值=12），总重量=5，总价值=22</div>
              </div>
            }
            type="info"
            showIcon
          />
          <Alert
            message="示例 2"
            description={
              <div>
                <div>输入：weights = [2], values = [1], capacity = 3</div>
                <div>输出：-1</div>
                <div>解释：无法用重2的物品装满容量3的背包。</div>
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
              <Space>
                <Text>背包容量:</Text>
                <InputNumber
                  min={0}
                  max={100}
                  value={capacity}
                  onChange={(value) => setCapacity(value || 0)}
                />
              </Space>
            </Space>
          </Col>

          <Col span={24}>
            <Card title="物品列表" size="small">
              <Table
                columns={columns}
                dataSource={tableData}
                pagination={false}
                size="small"
                footer={() => (
                  <Row gutter={8}>
                    <Col>
                      <Space>
                        <Text>重量:</Text>
                        <InputNumber
                          min={1}
                          max={100}
                          value={newWeight}
                          onChange={setNewWeight}
                        />
                      </Space>
                    </Col>
                    <Col>
                      <Space>
                        <Text>价值:</Text>
                        <InputNumber
                          min={1}
                          max={1000}
                          value={newValue}
                          onChange={setNewValue}
                        />
                      </Space>
                    </Col>
                    <Col>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={addItem}
                        disabled={newWeight === null || newValue === null}
                      >
                        添加物品
                      </Button>
                    </Col>
                  </Row>
                )}
              />
            </Card>
          </Col>

          <Col span={24}>
            <Alert
              message="计算结果"
              description={
                <div>
                  {maxValue > -1 ? (
                    <>
                      <div>最大价值：<Text strong>{maxValue}</Text></div>
                      <div>
                        选择的物品：
                        {solution.length > 0 ? (
                          <ul style={{ marginBottom: 0 }}>
                            {solution.map(index => (
                              <li key={index}>
                                物品{index}（重量={weights[index]}, 价值={values[index]}）
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <Text>无</Text>
                        )}
                      </div>
                    </>
                  ) : (
                    <div>无法恰好装满背包，返回 <Text strong>-1</Text></div>
                  )}
                </div>
              }
              type={maxValue > -1 ? "success" : "error"}
              showIcon
            />
          </Col>
        </Row>
      </Card>

      <div style={{ marginTop: 24 }}>
        <Card title="动态规划过程可视化">
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={16}>
              <DPGraph
                data={displayDp}
                highlightIndices={currentDpState.highlightIndices}
                title="DP数组（容量j恰好装满时的最大价值）"
              />

              <Alert
                message={`当前决策: ${currentDpState.decision || '初始化'}`}
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </Col>

            <Col xs={24} lg={8}>
              <DPControls
                currentStep={currentStep}
                totalSteps={dpSteps.length}
                isPlaying={isPlaying}
                playbackSpeed={playbackSpeed}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onReset={() => setCurrentStep(0)}
                onNext={() => currentStep < dpSteps.length - 1 && setCurrentStep(prev => prev + 1)}
                onPrev={() => currentStep > 0 && setCurrentStep(prev => prev - 1)}
                onStepChange={setCurrentStep}
                onSpeedChange={setPlaybackSpeed}
              />
            </Col>

            <Col span={24}>
              <DecisionLog
                steps={dpSteps}
                currentStep={currentStep}
                maxSteps={10}
              />
            </Col>
          </Row>
        </Card>
      </div>

      <div style={{ marginTop: 24 }}>
        <Card title="算法解析">
          <Title level={4}>0-1背包问题（恰好装满）的关键点</Title>
          <Paragraph>
            <ol>
              <li>
                <Text strong>状态定义：</Text>
                <Text code>dp[j]</Text> 表示容量为 j 的背包恰好装满时的最大价值。
              </li>
              <li>
                <Text strong>初始化：</Text>
                <ul>
                  <li><Text code>dp[0] = 0</Text>（容量0时价值为0，表示空背包已装满）</li>
                  <li><Text code>dp[j] = -∞</Text>（j {">"} 0，表示未装满，无效状态）</li>
                </ul>
              </li>
              <li>
                <Text strong>状态转移方程：</Text>
                <Text code>dp[j] = max(dp[j], dp[j - weights[i]] + values[i])</Text>，
                仅当 <Text code>dp[j - weights[i]]</Text> 不是 <Text code>-∞</Text> 时有效。
              </li>
              <li>
                <Text strong>遍历顺序：</Text>
                对于每个物品，从大到小遍历背包容量，确保每个物品只选一次。
              </li>
              <li>
                <Text strong>结果判断：</Text>
                若 <Text code>dp[capacity]</Text> 为有效值，返回该值；否则返回 -1。
              </li>
            </ol>
          </Paragraph>

          <Title level={4}>与普通0-1背包问题的区别</Title>
          <Paragraph>
            <ul>
              <li>
                <Text strong>普通0-1背包：</Text>
                允许背包不装满，初始化所有 <Text code>dp[j] = 0</Text>。
              </li>
              <li>
                <Text strong>恰好装满背包：</Text>
                要求背包必须恰好装满，初始化 <Text code>dp[0] = 0</Text>，其他为 <Text code>-∞</Text>。
              </li>
            </ul>
          </Paragraph>
        </Card>
      </div>
    </div>
  );
};

export default ExactKnapsackQuestion;