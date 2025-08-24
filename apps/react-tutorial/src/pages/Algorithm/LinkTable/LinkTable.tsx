import React, { useState, useEffect } from 'react';
import { Button, Input, message, Card, Divider, Typography, Space, Tooltip } from 'antd';
import './LinkTable.less';
import { type LinkNode, type LinkTableType } from './al';
import { LinkTableClass } from '@fucking-algorithm/algorithm/struct/LinkNode/base.ts';
const LinkTable = LinkTableClass;
const { Title, Text, Paragraph } = Typography;

// 链表可视化组件
const LinkTableVisualization: React.FC = () => {
  // 链表状态
  const [linkTable, setLinkTable] = useState<LinkTableClass>(new LinkTable());
  const [linkTableState, setLinkTableState] = useState<LinkTableType>({
    head: null,
    tail: null,
    length: 0,
    isCircular: false,
    isDoubly: false,
    isSingly: true
  });

  // 操作相关状态
  const [inputValue, setInputValue] = useState<string>('');
  const [inputIndex, setInputIndex] = useState<string>('');
  const [isCircular, setIsCircular] = useState<boolean>(false);
  const [operationLog, setOperationLog] = useState<string[]>([]);
  const [initialValues, setInitialValues] = useState<string>('');

  // 更新链表状态
  const updateLinkTableState = () => {
    setLinkTableState(linkTable.getState());
  };

  // 添加操作日志
  const addLog = (log: string) => {
    setOperationLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`]);
  };

  // 初始化链表
  useEffect(() => {
    updateLinkTableState();
  }, []);

  // 创建新链表
  const createNewList = () => {
    const newLinkTable = new LinkTable(null, null, 0, isCircular);
    setLinkTable(newLinkTable);
    updateLinkTableState();
    addLog('创建了新链表');
  };

  // 从数组初始化
  const initFromArray = () => {
    try {
      console.log(initialValues, 'initialValues');
      const values = initialValues.split(',').map(val => parseInt(val.trim()));
      if (values.some(isNaN)) {
        message.error('请输入有效的数字，用逗号分隔');
        return;
      }

      const newLinkTable = LinkTableClass.fromArray(values, isCircular);
      setLinkTable(newLinkTable);
      updateLinkTableState();
      addLog(`从数组 [${values.join(', ')}] 初始化链表`);
    } catch (error) {
      message.error('初始化失败，请检查输入');
    }
  };

  // 在末尾添加节点
  const handleAppend = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      message.error('请输入有效的数字');
      return;
    }

    linkTable.append(value);
    updateLinkTableState();
    addLog(`在末尾添加节点: ${value}`);
    setInputValue('');
  };

  // 在头部添加节点
  const handlePrepend = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) {
      message.error('请输入有效的数字');
      return;
    }

    linkTable.prepend(value);
    updateLinkTableState();
    addLog(`在头部添加节点: ${value}`);
    setInputValue('');
  };

  // 在指定位置插入节点
  const handleInsert = () => {
    const value = parseInt(inputValue);
    const index = parseInt(inputIndex);

    if (isNaN(value)) {
      message.error('请输入有效的数字');
      return;
    }

    if (isNaN(index) || index < 0) {
      message.error('请输入有效的索引');
      return;
    }

    const result = linkTable.insert(value, index);
    if (result) {
      updateLinkTableState();
      addLog(`在位置 ${index} 插入节点: ${value}`);
      setInputValue('');
      setInputIndex('');
    } else {
      message.error(`无法在位置 ${index} 插入节点`);
    }
  };

  // 删除指定位置的节点
  const handleRemove = () => {
    const index = parseInt(inputIndex);

    if (isNaN(index) || index < 0) {
      message.error('请输入有效的索引');
      return;
    }

    const result = linkTable.remove(index);
    if (result) {
      updateLinkTableState();
      addLog(`删除位置 ${index} 的节点`);
      setInputIndex('');
    } else {
      message.error(`无法删除位置 ${index} 的节点`);
    }
  };

  // 反转链表
  const handleReverse = () => {
    linkTable.reverse();
    updateLinkTableState();
    addLog('反转链表');
  };

  // 判断是否为回文
  const handleIsPalindrome = () => {
    const result = linkTable.isPalindrome();
    addLog(`链表${result ? '是' : '不是'}回文`);
    message.info(`链表${result ? '是' : '不是'}回文`);
  };

  // 判断是否有环
  const handleHasCycle = () => {
    const result = linkTable.hasCycle();
    addLog(`链表${result ? '有' : '没有'}环`);
    message.info(`链表${result ? '有' : '没有'}环`);
  };

  // 清空链表
  const handleClear = () => {
    linkTable.clear();
    updateLinkTableState();
    addLog('清空链表');
  };

  // 切换是否为循环链表
  const handleToggleCircular = () => {
    const newIsCircular = !isCircular;

    // 创建新的链表并保持现有数据
    const values: number[] = [];
    let current = linkTableState.head;
    let count = 0;

    while (current && count < linkTableState.length) {
      values.push(current.val);
      current = current.next;
      count++;

      // 防止循环链表无限循环
      if (count > linkTableState.length) break;
    }

    const newLinkTable = LinkTable.fromArray(values, newIsCircular);
    setLinkTable(newLinkTable);
    setIsCircular(newIsCircular);
    updateLinkTableState();
    addLog(`${newIsCircular ? '启用' : '禁用'}循环链表`);
  };

  // 渲染链表节点
  const renderNodes = () => {
    if (!linkTableState.head) {
      return <div className="null-pointer">null</div>;
    }

    const nodes: JSX.Element[] = [];
    let current: LinkNode | null = linkTableState.head;
    let index = 0;
    const maxNodesToShow = 20; // 防止无限循环

    while (current && index < maxNodesToShow) {
      const isHead = current === linkTableState.head;
      const isTail = current === linkTableState.tail;

      nodes.push(
        <div key={index} className={`node ${linkTableState.isCircular && isTail ? 'circular-node' : ''}`}>
          <div className={`node-box ${isHead ? 'head' : ''} ${isTail ? 'tail' : ''}`}>
            <div className="node-index">{index}</div>
            <div className="node-value">{current.val}</div>
          </div>
          {(current.next || linkTableState.isCircular) && <div className="node-pointer"></div>}
          {linkTableState.isCircular && isTail && <div className="circular-pointer"></div>}
        </div>
      );

      current = current!.next;
      index++;

      // 防止循环链表无限循环
      if (linkTableState.isCircular && current === linkTableState.head) {
        break;
      }
    }

    if (!linkTableState.isCircular) {
      nodes.push(<div key="null" className="null-pointer">null</div>);
    }

    return nodes;
  };

  return (
    <div className="link-table-container">
      <Title level={2}>链表数据结构可视化</Title>

      <Card title="链表配置" style={{ marginBottom: 20 }}>
        <div className="input-group">
          <Text className="input-label">初始值：</Text>
          <Input
            className="input-field"
            placeholder="例如: 1,2,3"
            value={initialValues}
            onChange={e => setInitialValues(e.target.value)}
            style={{ width: 200 }}
          />
          <Space>
            <Button type="primary" onClick={initFromArray}>初始化</Button>
            <Button onClick={createNewList}>创建空链表</Button>
            <Tooltip title={isCircular ? "切换为普通链表" : "切换为循环链表"}>
              <Button
                type={isCircular ? "primary" : "default"}
                onClick={handleToggleCircular}
              >
                {isCircular ? "循环链表" : "普通链表"}
              </Button>
            </Tooltip>
          </Space>
        </div>
      </Card>

      <Card title="链表可视化" style={{ marginBottom: 20 }}>
        <div className="visualization-container">
          <div className="node-container">
            {renderNodes()}
          </div>
        </div>

        <div style={{ marginTop: 10 }}>
          <Text>长度: {linkTableState.length}</Text>
          {linkTableState.head && (
            <>
              <Text style={{ marginLeft: 20 }}>头节点值: {linkTableState.head.val}</Text>
              {linkTableState.tail && (
                <Text style={{ marginLeft: 20 }}>尾节点值: {linkTableState.tail.val}</Text>
              )}
            </>
          )}
        </div>
      </Card>

      <Card title="链表操作" style={{ marginBottom: 20 }}>
        <div className="operations-container">
          <div className="operation-group">
            <div className="group-title">基本操作</div>
            <div className="group-content">
              <div className="input-group">
                <Text className="input-label">节点值：</Text>
                <Input
                  className="input-field"
                  placeholder="数字值"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                />
              </div>

              <div className="input-group">
                <Text className="input-label">位置索引：</Text>
                <Input
                  className="input-field"
                  placeholder="索引值"
                  value={inputIndex}
                  onChange={e => setInputIndex(e.target.value)}
                />
              </div>

              <Space wrap>
                <Button type="primary" onClick={handleAppend}>添加到末尾</Button>
                <Button type="primary" onClick={handlePrepend}>添加到头部</Button>
                <Button onClick={handleInsert}>插入节点</Button>
                <Button danger onClick={handleRemove}>删除节点</Button>
                <Button onClick={handleClear}>清空链表</Button>
              </Space>
            </div>
          </div>

          <Divider />

          <div className="operation-group">
            <div className="group-title">高级操作</div>
            <div className="group-content">
              <Space wrap>
                <Button onClick={handleReverse}>反转链表</Button>
                <Button onClick={handleIsPalindrome}>判断回文</Button>
                <Button onClick={handleHasCycle}>检测环</Button>
              </Space>
            </div>
          </div>
        </div>
      </Card>

      <Card title="操作日志">
        <div className="status-container">
          <div className="status-content">
            {operationLog.length === 0 ? (
              <Text type="secondary">暂无操作记录</Text>
            ) : (
              operationLog.map((log, index) => (
                <div key={index}>{log}</div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Card title="链表知识" style={{ marginTop: 20 }}>
        <div className="algorithm-info">
          <Paragraph>
            <strong>链表</strong>是一种线性数据结构，其中的每个元素都是单独的对象，包含数据和指向下一个节点的引用（链接）。
          </Paragraph>

          <Title level={4}>链表的特点</Title>
          <ul>
            <li>动态数据结构：可以根据需要扩展或收缩</li>
            <li>插入和删除操作高效（O(1)时间复杂度），不需要像数组那样移动元素</li>
            <li>随机访问效率低（O(n)时间复杂度），必须从头节点开始遍历</li>
            <li>不需要预先分配内存</li>
          </ul>

          <Title level={4}>链表的类型</Title>
          <ul>
            <li><strong>单向链表</strong>：每个节点包含数据和指向下一个节点的指针</li>
            <li><strong>双向链表</strong>：每个节点包含数据、指向下一个节点的指针和指向上一个节点的指针</li>
            <li><strong>循环链表</strong>：最后一个节点指向第一个节点，形成一个环</li>
          </ul>

          <Title level={4}>常见链表操作</Title>
          <ul>
            <li><strong>插入</strong>：在链表中添加新节点</li>
            <li><strong>删除</strong>：从链表中移除节点</li>
            <li><strong>查找</strong>：在链表中查找特定值</li>
            <li><strong>遍历</strong>：访问链表中的每个节点</li>
            <li><strong>反转</strong>：将链表的方向反转</li>
          </ul>

          <Title level={4}>常见链表算法</Title>
          <ul>
            <li><strong>检测环</strong>：使用快慢指针确定链表是否有环</li>
            <li><strong>找中点</strong>：使用快慢指针找到链表的中间节点</li>
            <li><strong>判断回文</strong>：确定链表是否是回文（正序和倒序读取值相同）</li>
            <li><strong>合并有序链表</strong>：将两个有序链表合并为一个有序链表</li>
            <li><strong>删除倒数第N个节点</strong>：使用双指针技术删除链表倒数第N个节点</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default LinkTableVisualization;
