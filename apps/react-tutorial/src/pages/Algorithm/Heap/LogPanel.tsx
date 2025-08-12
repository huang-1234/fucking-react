import React from 'react';
import { type HeapOperation, HeapOperationType } from './base';
import './LogPanel.css';

interface LogPanelProps<T> {
  operations: HeapOperation<T>[];
  onOperationSelect?: (operation: HeapOperation<T>, index: number) => void;
  maxHeight?: number;
}

/**
 * 操作日志面板组件
 */
export function LogPanel<T>({
  operations,
  onOperationSelect,
  maxHeight = 300
}: LogPanelProps<T>) {
  // 获取操作类型对应的图标和颜色
  const getOperationIcon = (type: HeapOperationType): { icon: string; color: string } => {
    switch (type) {
      case HeapOperationType.INSERT:
        return { icon: '➕', color: '#4caf50' };
      case HeapOperationType.EXTRACT:
        return { icon: '⬆️', color: '#f44336' };
      case HeapOperationType.SWAP:
        return { icon: '🔄', color: '#2196f3' };
      case HeapOperationType.HEAPIFY_UP:
        return { icon: '⬆️', color: '#ff9800' };
      case HeapOperationType.HEAPIFY_DOWN:
        return { icon: '⬇️', color: '#9c27b0' };
      case HeapOperationType.BUILD_HEAP:
        return { icon: '🏗️', color: '#795548' };
      default:
        return { icon: '❓', color: '#9e9e9e' };
    }
  };

  // 格式化时间戳
  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };

  return (
    <div className="log-panel" style={{ maxHeight: `${maxHeight}px` }}>
      <h3>操作日志</h3>

      {operations.length === 0 ? (
        <div className="log-empty">暂无操作记录</div>
      ) : (
        <ul className="log-list">
          {operations.map((operation, index) => {
            const { icon, color } = getOperationIcon(operation.type);

            return (
              <li
                key={`${operation.timestamp}-${index}`}
                className="log-item"
                onClick={() => onOperationSelect && onOperationSelect(operation, index)}
                style={{ borderLeftColor: color }}
              >
                <div className="log-icon" style={{ backgroundColor: color }}>
                  {icon}
                </div>
                <div className="log-content">
                  <div className="log-description">{operation.description}</div>
                  <div className="log-meta">
                    <span className="log-type">{operation.type}</span>
                    <span className="log-time">{formatTimestamp(operation.timestamp)}</span>
                  </div>
                  {operation.value !== undefined && (
                    <div className="log-value">值: {String(operation.value)}</div>
                  )}
                  {operation.affectedNodes && operation.affectedNodes.length > 0 && (
                    <div className="log-affected">
                      影响节点: {operation.affectedNodes.map(id => id.replace('node-', '')).join(', ')}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}