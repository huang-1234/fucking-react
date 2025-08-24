import React from 'react';
import { Typography, Tag } from 'antd';

const { Text } = Typography;

/**
 * 队列项目的属性
 */
export interface QueueItemProps {
  /**
   * 项目的值
   */
  value: React.ReactNode;

  /**
   * 项目的优先级（可选）
   */
  priority?: number;

  /**
   * 项目的位置标签（例如：'Front', 'Back', 'Max', 'Min'等）
   */
  positionLabel?: string;

  /**
   * 位置标签的颜色
   */
  labelColor?: string;

  /**
   * 项目的背景颜色
   */
  backgroundColor?: string;

  /**
   * 项目的边框颜色
   */
  borderColor?: string;

  /**
   * 是否高亮显示
   */
  isHighlighted?: boolean;

  /**
   * 自定义样式
   */
  style?: React.CSSProperties;

  /**
   * 点击事件处理函数
   */
  onClick?: () => void;
}

/**
 * 队列项目组件
 * 用于在可视化中表示队列中的单个元素
 */
const QueueItem: React.FC<QueueItemProps> = ({
  value,
  priority,
  positionLabel,
  labelColor = 'blue',
  backgroundColor = '#e6f7ff',
  borderColor = '#1890ff',
  isHighlighted = false,
  style = {},
  onClick
}) => {
  return (
    <div
      style={{
        width: 60,
        height: 60,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: `2px solid ${isHighlighted ? '#ff4d4f' : borderColor}`,
        margin: '0 4px',
        borderRadius: 4,
        backgroundColor: isHighlighted ? '#fff2f0' : backgroundColor,
        position: 'relative',
        flexShrink: 0,
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
      onClick={onClick}
    >
      {typeof value === 'string' ? <Text strong>{value}</Text> : value}

      {priority !== undefined && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          优先级: {priority}
        </Text>
      )}

      {positionLabel && (
        <div style={{
          position: 'absolute',
          top: -25,
          left: 0,
          right: 0,
          textAlign: 'center'
        }}>
          <Tag color={labelColor}>{positionLabel}</Tag>
        </div>
      )}
    </div>
  );
};

/**
 * 队列项目容器的属性
 */
export interface QueueItemsContainerProps {
  /**
   * 子元素
   */
  children: React.ReactNode;

  /**
   * 自定义样式
   */
  style?: React.CSSProperties;
}

/**
 * 队列项目容器组件
 * 用于包装和排列队列项目
 */
export const QueueItemsContainer: React.FC<QueueItemsContainerProps> = ({
  children,
  style = {}
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 20,
      overflowX: 'auto',
      padding: '10px 0',
      ...style
    }}>
      {children}
    </div>
  );
};

export default React.memo(QueueItem);
