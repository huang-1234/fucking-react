import React, { useState, useCallback } from 'react';
// 注意：需要先安装 react-rnd 库
// npm install react-rnd 或 yarn add react-rnd
import { Rnd } from 'react-rnd';
import './styles.less';

export interface ReactRndProps {
  children: React.ReactNode;
  defaultPosition?: { x: number; y: number };
  defaultSize?: { width: number | string; height: number | string };
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  lockAspectRatio?: boolean;
  enableResizing?: boolean;
  enableDragging?: boolean;
  dragHandleClassName?: string;
  bounds?: string;
  style?: React.CSSProperties;
  className?: string;
  resizeHandleStyles?: {
    top?: React.CSSProperties;
    right?: React.CSSProperties;
    bottom?: React.CSSProperties;
    left?: React.CSSProperties;
    topRight?: React.CSSProperties;
    bottomRight?: React.CSSProperties;
    bottomLeft?: React.CSSProperties;
    topLeft?: React.CSSProperties;
  };
  resizeHandleClasses?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    topRight?: string;
    bottomRight?: string;
    bottomLeft?: string;
    topLeft?: string;
  };
  onDragStart?: (e: any, d: any) => void;
  onDrag?: (e: any, d: any) => void;
  onDragStop?: (e: any, d: any) => void;
  onResizeStart?: (e: any, dir: any, ref: any) => void;
  onResize?: (e: any, dir: any, ref: any, delta: any, position: any) => void;
  onResizeStop?: (e: any, dir: any, ref: any, delta: any, position: any) => void;
  scale?: number;
}

/**
 * 可调整大小和可拖动的React组件
 * 基于react-rnd库实现
 * @see https://github.com/bokuweb/react-rnd
 */
const ReactRndComponent: React.FC<ReactRndProps> = ({
  children,
  defaultPosition = { x: 0, y: 0 },
  defaultSize = { width: '100%', height: 300 },
  minWidth = 200,
  minHeight = 100,
  maxWidth = 3000,
  maxHeight = 3000,
  lockAspectRatio = false,
  enableResizing = true,
  enableDragging = true,
  dragHandleClassName,
  bounds = 'parent',
  style = {},
  className = '',
  resizeHandleStyles,
  resizeHandleClasses,
  onDragStart,
  onDrag,
  onDragStop,
  onResizeStart,
  onResize,
  onResizeStop,
  scale = 1,
}) => {
  // 跟踪组件的尺寸和位置
  const [size, setSize] = useState(defaultSize);
  const [position, setPosition] = useState(defaultPosition);

  // 处理尺寸变化
  const handleResize = useCallback((
    e: React.SyntheticEvent,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    setSize({
      width: ref.style.width,
      height: ref.style.height,
    });
    setPosition(position);

    if (onResize) {
      onResize(e, direction, ref, delta, position);
    }
  }, [onResize]);

  // 处理拖拽停止
  const handleDragStop = useCallback((
    e: React.DragEvent<HTMLElement>,
    d: { x: number; y: number; lastX: number; lastY: number; deltaX: number; deltaY: number }
  ) => {
    setPosition({ x: d.x, y: d.y });

    if (onDragStop) {
      onDragStop(e, d);
    }
  }, [onDragStop]);

  // 处理调整大小停止
  const handleResizeStop = useCallback((
    e: React.SyntheticEvent,
    direction: string,
    ref: HTMLElement,
    delta: { width: number; height: number },
    position: { x: number; y: number }
  ) => {
    setSize({
      width: ref.style.width,
      height: ref.style.height,
    });
    setPosition(position);

    if (onResizeStop) {
      onResizeStop(e, direction, ref, delta, position);
    }
  }, [onResizeStop]);

  // 默认的调整大小控制配置
  const defaultResizing = {
    top: enableResizing,
    right: enableResizing,
    bottom: enableResizing,
    left: enableResizing,
    topRight: enableResizing,
    bottomRight: enableResizing,
    bottomLeft: enableResizing,
    topLeft: enableResizing,
  };

  return (
    <Rnd
      default={{
        ...defaultPosition,
        ...defaultSize,
      }}
      size={size}
      position={position}
      minWidth={minWidth}
      minHeight={minHeight}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      lockAspectRatio={lockAspectRatio}
      enableResizing={defaultResizing}
      disableDragging={!enableDragging}
      dragHandleClassName={dragHandleClassName}
      bounds={bounds}
      onDragStart={onDragStart}
      onDrag={onDrag}
      onDragStop={handleDragStop}
      onResizeStart={onResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      resizeHandleStyles={resizeHandleStyles}
      resizeHandleClasses={resizeHandleClasses}
      className={`react-rnd-component ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      scale={scale}
    >
      {children}
    </Rnd>
  );
};

export default ReactRndComponent;
