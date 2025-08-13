import React, { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Space, Radio, InputNumber, Divider, Row, Col, message, Tooltip } from 'antd';
import { MaxHeap } from './lib';
import { HeapVisualizer } from './HeapVisualizer';
import { LogPanel } from './LogPanel';
import type { HeapOperation } from './base';
import './index.css';

/**
 * 堆可视化页面
 */
const HeapPage: React.FC = () => {
  // 堆实例
  const [heap] = useState(() => new MaxHeap<number>());
  // 堆根节点
  const [root, setRoot] = useState(heap.getRoot());
  // 操作日志
  const [operations, setOperations] = useState<HeapOperation<number>[]>([]);
  // 高亮节点
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);
  // 输入值
  const [inputValue, setInputValue] = useState<number | null>(null);
  // 数组输入
  const [arrayInput, setArrayInput] = useState<string>('');
  // 动画速度
  const [animationSpeed, setAnimationSpeed] = useState<number>(500);

  // 初始化堆和回调
  useEffect(() => {
    // 设置可视化回调
    heap.setCallbacks({
      onHeapUpdated: (newRoot) => {
        setRoot(newRoot);
        setHighlightedNodes([]);
      },
      onNodesSwapped: (node1Id, node2Id) => {
        setHighlightedNodes([node1Id, node2Id]);

        // 清除高亮
        setTimeout(() => {
          setHighlightedNodes([]);
        }, animationSpeed);
      },
      onOperationLogged: (operation) => {
        setOperations(prev => [...prev, operation]);
      }
    });

    // 初始化示例堆
    const initialData = [50, 30, 70, 20, 40, 60, 80];
    heap.buildHeap(initialData);
    setRoot(heap.getRoot());
    setOperations(heap.getOperations());
  }, []);

  // 插入节点
  const handleInsert = useCallback(() => {
    if (inputValue === null) {
      message.error('请输入有效数字');
      return;
    }

    heap.insert(inputValue);
    setRoot(heap.getRoot());
    setOperations(heap.getOperations());
    setInputValue(null);
  }, [inputValue, heap]);

  // 删除堆顶
  const handleExtract = useCallback(() => {
    const extracted = heap.extract();
    if (extracted !== null) {
      message.success(`已移除堆顶元素: ${extracted}`);
    } else {
      message.warning('堆为空');
    }

    setRoot(heap.getRoot());
    setOperations(heap.getOperations());
  }, [heap]);

  // 从数组构建堆
  const handleBuildHeap = useCallback(() => {
    try {
      // 解析输入数组
      const array = arrayInput
        .split(',')
        .map(item => {
          const num = Number(item.trim());
          if (isNaN(num)) {
            throw new Error(`无效的数字: ${item}`);
          }
          return num;
        });

      if (array.length === 0) {
        message.error('请输入有效的数组');
        return;
      }

      // 清除现有操作日志
      heap.clearOperations();

      // 构建堆
      heap.buildHeap(array);
      setRoot(heap.getRoot());
      setOperations(heap.getOperations());
      message.success(`已从 ${array.length} 个元素构建堆`);
    } catch (error) {
      message.error((error as Error).message);
    }
  }, [arrayInput, heap]);

  // 清空堆
  const handleClear = useCallback(() => {
    heap.clearOperations();
    heap.buildHeap([]);
    setRoot(null);
    setOperations([]);
    message.success('已清空堆');
  }, [heap]);

  // 选择操作日志
  const handleOperationSelect = useCallback((operation: HeapOperation<number>) => {
    if (operation.affectedNodes) {
      setHighlightedNodes(operation.affectedNodes);

      // 清除高亮
      setTimeout(() => {
        setHighlightedNodes([]);
      }, animationSpeed * 2);
    }
  }, [animationSpeed]);

  return (
    <div className="heap-page">
      <Card title="堆结构可视化系统" bordered={false}>
        <Row gutter={[16, 16]}>
          <Col span={24} md={16}>
            <Card title="可视化区域" className="visualization-card">
              <HeapVisualizer
                root={root}
                width={800}
                height={500}
                nodeRadius={30}
                animationDuration={animationSpeed}
                highlightedNodes={highlightedNodes}
              />
            </Card>
          </Col>

          <Col span={24} md={8}>
            <Card title="操作控制" className="control-card">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div className="control-group">
                  <h4>插入节点</h4>
                  <Space>
                    <InputNumber
                      placeholder="输入数字"
                      value={inputValue}
                      onChange={value => setInputValue(value)}
                      onPressEnter={handleInsert}
                    />
                    <Button type="primary" onClick={handleInsert}>插入</Button>
                  </Space>
                </div>

                <Divider />

                <div className="control-group">
                  <h4>批量构建堆</h4>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Input
                      placeholder="输入数组，如: 10, 20, 30"
                      value={arrayInput}
                      onChange={e => setArrayInput(e.target.value)}
                      onPressEnter={handleBuildHeap}
                    />
                    <Button type="primary" onClick={handleBuildHeap} block>构建堆</Button>
                  </Space>
                </div>

                <Divider />

                <div className="control-group">
                  <h4>堆操作</h4>
                  <Space>
                    <Tooltip title="移除并返回堆顶元素">
                      <Button onClick={handleExtract}>删除堆顶</Button>
                    </Tooltip>
                    <Tooltip title="清空堆和操作日志">
                      <Button danger onClick={handleClear}>清空</Button>
                    </Tooltip>
                  </Space>
                </div>

                <Divider />

                <div className="control-group">
                  <h4>动画速度</h4>
                  <Radio.Group
                    value={animationSpeed}
                    onChange={e => setAnimationSpeed(e.target.value)}
                  >
                    <Radio.Button value={200}>快</Radio.Button>
                    <Radio.Button value={500}>中</Radio.Button>
                    <Radio.Button value={1000}>慢</Radio.Button>
                  </Radio.Group>
                </div>
              </Space>
            </Card>

            <div style={{ marginTop: '16px' }}>
              <LogPanel
                operations={operations}
                onOperationSelect={handleOperationSelect}
                maxHeight={300}
              />
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default HeapPage;
