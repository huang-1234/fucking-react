import React, { useState, useCallback, useRef } from 'react';
import { Card, Row, Col, Typography, Button, Input, Space, message, Divider } from 'antd';
import { PlayCircleOutlined, PlusOutlined, DeleteOutlined, SearchOutlined, ClearOutlined } from '@ant-design/icons';
import { SkipList, SkipListNode } from '@fucking-algorithm/algorithm/SkipList/al/SkipList';
import SkipListVisualizer from './visualizer/SkipListVisualizer';
import SkipListConfigPanel from './components/SkipListConfigPanel';
import SkipListDemo from './components/SkipListDemo';
import stylesLayout from '@/layouts/container.module.less';

const { Title, Paragraph, Text } = Typography;

interface SkipListConfig {
  maxLevel: number;
  probability: number;
  nodeColor: string;
  linkColor: string;
  highlightColor: string;
  animationSpeed: number;
}

const SkipListPage: React.FC = () => {
  // 跳表实例
  const skipListRef = useRef<SkipList<number>>(new SkipList<number>(16, 0.5));

  // 状态管理
  const [config, setConfig] = useState<SkipListConfig>({
    maxLevel: 16,
    probability: 0.5,
    nodeColor: '#1890ff',
    linkColor: '#d9d9d9',
    highlightColor: '#ff4d4f',
    animationSpeed: 1000,
  });

  const [inputValue, setInputValue] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [updatePath, setUpdatePath] = useState<SkipListNode<number>[]>([]);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<number>>(new Set());
  const [operationHistory, setOperationHistory] = useState<string[]>([]);

  // 强制重新渲染
  const [renderKey, setRenderKey] = useState<number>(0);
  const forceUpdate = useCallback(() => {
    setRenderKey(prev => prev + 1);
  }, []);

  // 配置更新处理
  const handleConfigChange = useCallback((newConfig: Partial<SkipListConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));

    // 更新跳表配置
    if (newConfig.maxLevel !== undefined || newConfig.probability !== undefined) {
      skipListRef.current.setConfig({
        maxLevel: newConfig.maxLevel,
        probability: newConfig.probability,
      });
    }
  }, []);

  // 添加操作历史
  const addToHistory = useCallback((operation: string) => {
    setOperationHistory(prev => [operation, ...prev.slice(0, 9)]);
  }, []);

  // 插入操作
  const handleInsert = useCallback(async () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      message.error('请输入有效的数字');
      return;
    }

    setIsAnimating(true);

    try {
      const result = skipListRef.current.insert(value);

      if (result.success) {
        setUpdatePath(result.updatePath);
        addToHistory(`插入 ${value}`);
        message.success(`成功插入 ${value}`);

        // 高亮显示插入路径
        const pathValues = new Set(result.updatePath.map(node => node.value));
        pathValues.add(value);
        setHighlightedNodes(pathValues);

        // 动画延迟后清除高亮
        setTimeout(() => {
          setHighlightedNodes(new Set());
          setUpdatePath([]);
        }, config.animationSpeed);

      } else {
        message.warning(`值 ${value} 已存在`);
      }

      setInputValue((prev: string) => {
        const prevValue = parseInt(prev);
        const addOrSubtract = Math.random() > 0.5 ? true : false
        const finalValue = prevValue + (Math.floor(Math.random() * 10) + 1) * addOrSubtract
        return finalValue.toString()

      });
      forceUpdate();

    } catch (error) {
      message.error('插入操作失败');
      console.error(error);
    } finally {
      setTimeout(() => setIsAnimating(false), config.animationSpeed);
    }
  }, [inputValue, config.animationSpeed, addToHistory, forceUpdate]);

  // 删除操作
  const handleDelete = useCallback(async () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      message.error('请输入有效的数字');
      return;
    }

    setIsAnimating(true);

    try {
      const result = skipListRef.current.delete(value);

      if (result.success) {
        addToHistory(`删除 ${value}`);
        message.success(`成功删除 ${value}`);

        // 高亮显示删除的节点
        setHighlightedNodes(new Set([value]));

        // 动画延迟后清除高亮
        setTimeout(() => {
          setHighlightedNodes(new Set());
        }, config.animationSpeed);

      } else {
        message.warning(`值 ${value} 不存在`);
      }

      setInputValue((prev: string) => {
        const prevValue = parseInt(prev);
        const addOrSubtract = Math.random() > 0.5 ? true : false;
        const random = Math.floor(Math.random()) + 1;
        let finalValue = prevValue;
        if (addOrSubtract) {
          finalValue += random;
        } else {
          finalValue -= random;
        }
        return finalValue.toString()
      });
      forceUpdate();

    } catch (error) {
      message.error('删除操作失败');
      console.error(error);
    } finally {
      setTimeout(() => setIsAnimating(false), config.animationSpeed);
    }
  }, [inputValue, config.animationSpeed, addToHistory, forceUpdate]);

  // 搜索操作
  const handleSearch = useCallback(() => {
    const value = parseInt(searchValue);
    if (isNaN(value)) {
      message.error('请输入有效的数字');
      return;
    }

    const result = skipListRef.current.search(value);

    if (result) {
      message.success(`找到值 ${value}`);
      setHighlightedNodes(new Set([value]));
      addToHistory(`搜索 ${value} - 找到`);
    } else {
      message.info(`未找到值 ${value}`);
      addToHistory(`搜索 ${value} - 未找到`);
    }

    // 清除高亮
    setTimeout(() => {
      setHighlightedNodes(new Set());
    }, config.animationSpeed);

    setSearchValue('');
  }, [searchValue, config.animationSpeed, addToHistory]);

  // 清空跳表
  const handleClear = useCallback(() => {
    skipListRef.current.clear();
    setHighlightedNodes(new Set());
    setUpdatePath([]);
    addToHistory('清空跳表');
    message.success('跳表已清空');
    forceUpdate();
  }, [addToHistory, forceUpdate]);

  // 随机插入数据
  const handleRandomInsert = useCallback(() => {
    const values = Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    values.forEach(value => {
      skipListRef.current.insert(value);
    });
    addToHistory(`随机插入 10 个值: ${values.join(', ')}`);
    message.success('随机插入完成');
    forceUpdate();
  }, [addToHistory, forceUpdate]);

  return (
    <div className={stylesLayout.contentLayout}>
      <Title level={2}>跳表 (Skip List) 可视化</Title>

      <Paragraph>
        跳表是一种基于有序链表的概率型数据结构，通过多级索引实现快速查找、插入和删除操作。
        平均时间复杂度为 O(log n)，空间复杂度为 O(n)。
      </Paragraph>

      {/* 演示组件 */}
      <SkipListDemo />

      <Row gutter={[16, 16]}>
        {/* 左侧：可视化画布 */}
        <Col xs={24} lg={16}>
          <Card title="跳表可视化" style={{ height: '600px' }}>
            <SkipListVisualizer
              key={renderKey}
              skipList={skipListRef.current}
              config={config}
              highlightedNodes={highlightedNodes}
              updatePath={updatePath}
              isAnimating={isAnimating}
            />
          </Card>
        </Col>

        {/* 右侧：控制面板 */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" style={{ width: '100%' }} size="middle">
            {/* 操作控制 */}
            <Card title="操作控制" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  placeholder="输入数字"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onPressEnter={handleInsert}
                  disabled={isAnimating}
                />

                <Space wrap>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleInsert}
                    disabled={isAnimating}
                  >
                    插入
                  </Button>

                  <Button
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    disabled={isAnimating}
                  >
                    删除
                  </Button>
                </Space>

                <Input
                  placeholder="搜索数字"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onPressEnter={handleSearch}
                  disabled={isAnimating}
                />

                <Button
                  icon={<SearchOutlined />}
                  onClick={handleSearch}
                  disabled={isAnimating}
                  block
                >
                  搜索
                </Button>

                <Divider />

                <Space wrap>
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={handleRandomInsert}
                    disabled={isAnimating}
                  >
                    随机插入
                  </Button>

                  <Button
                    icon={<ClearOutlined />}
                    onClick={handleClear}
                    disabled={isAnimating}
                    danger
                  >
                    清空
                  </Button>
                </Space>
              </Space>
            </Card>

            {/* 配置面板 */}
            <SkipListConfigPanel
              config={config}
              onChange={handleConfigChange}
              disabled={isAnimating}
            />

            {/* 统计信息 */}
            <Card title="统计信息" size="small">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>节点数量: {skipListRef.current.getSize()}</Text>
                <Text>当前层级: {skipListRef.current.getCurrentLevel() + 1}</Text>
                <Text>最大层级: {skipListRef.current.getMaxLevel()}</Text>
                <Text>数据: [{skipListRef.current.toArray().join(', ')}]</Text>
              </Space>
            </Card>

            {/* 操作历史 */}
            <Card title="操作历史" size="small">
              <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                {operationHistory.map((operation, index) => (
                  <div key={index} style={{ fontSize: '12px', marginBottom: '4px' }}>
                    {operation}
                  </div>
                ))}
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default React.memo(SkipListPage);