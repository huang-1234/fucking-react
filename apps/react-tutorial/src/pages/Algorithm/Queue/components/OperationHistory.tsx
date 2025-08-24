import React from 'react';
import { List, Tag } from 'antd';
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  SwapOutlined
} from '@ant-design/icons';

/**
 * 队列操作类型
 */
export enum QueueOperationType {
  ENQUEUE = 'enqueue',
  DEQUEUE = 'dequeue',
  PEEK = 'peek',
  CLEAR = 'clear',
  ADD_FRONT = 'addFront',
  ADD_BACK = 'addBack',
  REMOVE_FRONT = 'removeFront',
  REMOVE_BACK = 'removeBack',
  UPDATE_PRIORITY = 'updatePriority'
}

/**
 * 队列操作记录
 */
export interface QueueOperation<T = any> {
  /**
   * 操作类型
   */
  type: QueueOperationType | string;

  /**
   * 操作涉及的值（可选）
   */
  value?: T;

  /**
   * 优先级（可选，用于优先队列）
   */
  priority?: number;

  /**
   * 操作时间戳
   */
  timestamp: number;
}

/**
 * 操作历史组件的属性
 */
export interface OperationHistoryProps<T = any> {
  /**
   * 操作历史记录数组
   */
  operations: QueueOperation<T>[];

  /**
   * 要显示的历史记录数量
   */
  limit?: number;

  /**
   * 自定义操作类型到显示名称的映射
   */
  operationLabels?: Record<string, string>;
}

/**
 * 操作历史组件
 * 用于显示队列操作的历史记录
 */
const OperationHistory = <T extends any>({
  operations,
  limit = 10,
  operationLabels = {}
}: OperationHistoryProps<T>) => {
  // 获取操作类型对应的图标和颜色
  const getOperationIconAndColor = (type: QueueOperationType | string): [React.ReactNode, string] => {
    switch (type) {
      case QueueOperationType.ENQUEUE:
        return [<PlusOutlined />, 'green'];
      case QueueOperationType.DEQUEUE:
        return [<MinusOutlined />, 'red'];
      case QueueOperationType.PEEK:
        return [<ArrowRightOutlined />, 'blue'];
      case QueueOperationType.CLEAR:
        return [<DeleteOutlined />, 'red'];
      case QueueOperationType.ADD_FRONT:
        return [<ArrowLeftOutlined />, 'blue'];
      case QueueOperationType.ADD_BACK:
        return [<ArrowRightOutlined />, 'green'];
      case QueueOperationType.REMOVE_FRONT:
        return [<MinusOutlined />, 'orange'];
      case QueueOperationType.REMOVE_BACK:
        return [<MinusOutlined />, 'gold'];
      case QueueOperationType.UPDATE_PRIORITY:
        return [<SwapOutlined />, 'purple'];
      default:
        return [<SwapOutlined />, 'cyan'];
    }
  };

  // 获取操作类型的显示名称
  const getOperationLabel = (type: QueueOperationType | string): string => {
    return operationLabels[type] || type;
  };

  // 如果没有操作历史，显示提示信息
  if (operations.length === 0) {
    return (
      <List
        size="small"
        bordered
        dataSource={[{ type: 'empty', timestamp: Date.now() }]}
        renderItem={() => (
          <List.Item>
            <span>无操作历史</span>
          </List.Item>
        )}
      />
    );
  }

  return (
    <List
      size="small"
      bordered
      dataSource={[...operations].reverse().slice(0, limit)}
      renderItem={(op) => {
        const [icon, color] = getOperationIconAndColor(op.type);

        return (
          <List.Item>
            <Tag color={color} icon={icon as any}>
              {getOperationLabel(op.type)}
            </Tag>

            {op.value !== undefined && (
              <span style={{ marginLeft: 8 }}>
                值: {op?.value?.toString?.() ?? ''}
              </span>
            )}

            {op.priority !== undefined && (
              <span style={{ marginLeft: 8 }}>
                优先级: {op.priority}
              </span>
            )}

            <span style={{ marginLeft: 8, color: '#999' }}>
              {new Date(op.timestamp).toLocaleTimeString()}
            </span>
          </List.Item>
        );
      }}
    />
  );
};

export default React.memo(OperationHistory);
