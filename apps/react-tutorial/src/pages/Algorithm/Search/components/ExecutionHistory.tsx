import React from 'react';
import { Timeline, Typography, Tag, Space } from 'antd';
import {
  SearchOutlined,
  NodeIndexOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { renderReactNode } from '@/utils/react';

const { Text } = Typography;

export enum AlgorithmType {
  DFS = 'dfs',
  BFS = 'bfs',
  BACKTRACKING = 'backtracking'
}

export enum OperationType {
  VISIT = 'visit',
  EXPLORE = 'explore',
  BACKTRACK = 'backtrack',
  ENQUEUE = 'enqueue',
  DEQUEUE = 'dequeue',
  SOLUTION_FOUND = 'solution_found',
  SOLUTION_REJECTED = 'solution_rejected',
  START = 'start',
  END = 'end',
  CUSTOM = 'custom'
}

export interface Operation<T = unknown> {
  /**
   * 操作类型
   */
  type: OperationType | string;

  /**
   * 操作涉及的节点或值
   */
  node?: T;

  /**
   * 操作的额外数据
   */
  data?: T;

  /**
   * 操作时间戳
   */
  timestamp: number;

  /**
   * 操作描述
   */
  description?: string;
}

export interface ExecutionHistoryProps<T = unknown> {
  /**
   * 操作历史记录数组
   */
  operations: Operation<T>[];

  /**
   * 要显示的历史记录数量
   */
  limit?: number;

  /**
   * 算法类型
   */
  algorithmType?: AlgorithmType;

  /**
   * 自定义操作类型到显示名称的映射
   */
  operationLabels?: Record<string, string>;
}

const ExecutionHistory = <T extends unknown>({
  operations,
  limit = 10,
  algorithmType = AlgorithmType.DFS,
  operationLabels = {}
}: ExecutionHistoryProps<T>) => {
  // 显示最近的操作
  const recentOperations = operations.slice(-limit).reverse();

  const getOperationIconAndColor = (type: OperationType | string): [React.ReactNode, string] => {
    switch (type) {
      case OperationType.VISIT:
        return [<SearchOutlined />, '#1890ff'];
      case OperationType.EXPLORE:
        return [<NodeIndexOutlined />, '#52c41a'];
      case OperationType.BACKTRACK:
        return [<RollbackOutlined />, '#faad14'];
      case OperationType.ENQUEUE:
        return [<NodeIndexOutlined />, '#722ed1'];
      case OperationType.DEQUEUE:
        return [<NodeIndexOutlined />, '#eb2f96'];
      case OperationType.SOLUTION_FOUND:
        return [<CheckCircleOutlined />, '#52c41a'];
      case OperationType.SOLUTION_REJECTED:
        return [<ClockCircleOutlined />, '#f5222d'];
      case OperationType.START:
        return [<ClockCircleOutlined />, '#1890ff'];
      case OperationType.END:
        return [<CheckCircleOutlined />, '#52c41a'];
      default:
        return [<ClockCircleOutlined />, '#1890ff'];
    }
  };

  const getOperationLabel = (type: OperationType | string): string => {
    if (operationLabels[type]) {
      return operationLabels[type];
    }

    switch (type) {
      case OperationType.VISIT:
        return '访问节点';
      case OperationType.EXPLORE:
        return '探索节点';
      case OperationType.BACKTRACK:
        return '回溯';
      case OperationType.ENQUEUE:
        return '入队';
      case OperationType.DEQUEUE:
        return '出队';
      case OperationType.SOLUTION_FOUND:
        return '找到解';
      case OperationType.SOLUTION_REJECTED:
        return '拒绝解';
      case OperationType.START:
        return '开始执行';
      case OperationType.END:
        return '执行结束';
      default:
        return type;
    }
  };

  return (
    <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0 12px' }}>
      <Timeline mode="left">
        {recentOperations.map((op, index) => {
          const [icon, color] = getOperationIconAndColor(op.type);
          const label = getOperationLabel(op.type);

          return (
            <Timeline.Item
              key={index}
              dot={React.cloneElement(icon as React.ReactElement, { style: { fontSize: '16px' } })}
              color={color}
            >
              <Space direction="vertical" size={0} style={{ width: '100%' }}>
                <Space>
                  <Tag color={color}>{label}</Tag>
                  {op.node !== undefined && (
                    <Text code>{renderReactNode(op.node)}</Text>
                  )}
                </Space>
                {op.description && (
                  <Text type="secondary" style={{ fontSize: '12px' }}>{op.description}</Text>
                )}
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {new Date(op.timestamp).toLocaleTimeString()}
                </Text>
              </Space>
            </Timeline.Item>
          );
        })}
      </Timeline>
    </div>
  );
};

export default ExecutionHistory;
