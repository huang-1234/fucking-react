import React, { useState, useRef, useCallback, useEffect, type ReactNode, type CSSProperties } from 'react';
import './styles.less';

export type ResizeDirection = 'top' | 'right' | 'bottom' | 'left' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

export interface ResizeWindowProps {
  children: ReactNode;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  width?: number | string;
  height?: number | string;
  style?: CSSProperties;
  className?: string;
  directions?: ResizeDirection[];
  onResize?: (width: number, height: number) => void;
  resizable?: boolean;
}

/**
 * 可调整大小的窗口组件
 * 支持多方向拖拽调整大小，类似VSCode的窗口调整功能
 */
export const ResizeWindow: React.FC<ResizeWindowProps> = ({
  children,
  minWidth = 200,
  minHeight = 100,
  maxWidth = Infinity,
  maxHeight = Infinity,
  width = '100%',
  height = '100%',
  style = {},
  className = '',
  directions = ['right', 'bottom', 'bottomRight'],
  onResize,
  resizable = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [activeDirection, setActiveDirection] = useState<ResizeDirection | null>(null);
  const [dimensions, setDimensions] = useState({
    width: typeof width === 'number' ? width : 800,
    height: typeof height === 'number' ? height : 300
  });

  // 确保在挂载时获取实际宽度
  const initialWidthRef = useRef<number | null>(null);

    // 处理拖拽开始
  const handleResizeStart = useCallback((e: React.MouseEvent, direction: ResizeDirection) => {
    if (!resizable) return;
    e.preventDefault();
    setIsResizing(true);
    setActiveDirection(direction);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = containerRef.current?.offsetWidth || 0;
    const startHeight = containerRef.current?.offsetHeight || 0;

    // console.log('Resize start:', { direction, startWidth, startHeight });

    // 处理鼠标移动
    const handleMouseMove = (e: MouseEvent) => {
      let newWidth = startWidth;
      let newHeight = startHeight;

      // 根据拖拽方向计算新尺寸
      if (
        direction === 'right' ||
        direction === 'topRight' ||
        direction === 'bottomRight'
      ) {
        const deltaX = e.clientX - startX;
        newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX));
      }

      if (
        direction === 'bottom' ||
        direction === 'bottomLeft' ||
        direction === 'bottomRight'
      ) {
        const deltaY = e.clientY - startY;
        newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
      }

      if (
        direction === 'left' ||
        direction === 'topLeft' ||
        direction === 'bottomLeft'
      ) {
        const deltaX = startX - e.clientX;
        newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth - deltaX));
      }

      if (
        direction === 'top' ||
        direction === 'topLeft' ||
        direction === 'topRight'
      ) {
        const deltaY = startY - e.clientY;
        newHeight = Math.max(minHeight, Math.min(maxHeight, startHeight + deltaY));
      }

      // 更新尺寸
      const updatedDimensions = {
        width: newWidth,
        height: newHeight
      };

      setDimensions(updatedDimensions);

      // 调用回调
      if (onResize) {
        onResize(newWidth, newHeight);
      }

      // 移除调试日志
      // console.log('Dimensions updated:', updatedDimensions);
    };

    // 处理鼠标松开
    const handleMouseUp = () => {
      setIsResizing(false);
      setActiveDirection(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'default';
    };

    // 先移除可能存在的旧事件监听器，避免重复添加
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    // 添加新的事件监听器
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // 设置适当的光标
    switch(direction) {
      case 'top':
      case 'bottom':
        document.body.style.cursor = 'ns-resize';
        break;
      case 'left':
      case 'right':
        document.body.style.cursor = 'ew-resize';
        break;
      case 'topLeft':
      case 'bottomRight':
        document.body.style.cursor = 'nwse-resize';
        break;
      case 'topRight':
      case 'bottomLeft':
        document.body.style.cursor = 'nesw-resize';
        break;
      default:
        document.body.style.cursor = 'default';
    }
  }, [maxHeight, maxWidth, minHeight, minWidth, onResize, resizable]);

    // 初始化尺寸和监听窗口调整
  useEffect(() => {
    // 只在组件挂载时更新一次初始尺寸
    if (containerRef.current) {
      const actualWidth = containerRef.current.offsetWidth;
      const actualHeight = containerRef.current.offsetHeight;

      // 保存初始实际宽度，用于后续计算
      initialWidthRef.current = actualWidth;

      const newDimensions = {
        width: typeof width === 'number' ? width : actualWidth,
        height: typeof height === 'number' ? height : actualHeight
      };
      console.log('ResizeWindow initial dimensions:', newDimensions, 'Actual:', actualWidth, actualHeight);
      setDimensions(newDimensions);
    }
  }, []); // 空依赖数组，只在挂载时执行

  // 监听props中的width和height变化
  useEffect(() => {
    // 只有当props中的width或height发生变化时才更新
    const newWidth = typeof width === 'number' ? width : dimensions.width;
    const newHeight = typeof height === 'number' ? height : dimensions.height;

    // 只有当值真正变化时才更新状态
    if (newWidth !== dimensions.width || newHeight !== dimensions.height) {
      const newDimensions = { width: newWidth, height: newHeight };
      // console.log('Props dimensions changed:', newDimensions);
      setDimensions(newDimensions);
    }
  }, [width, height]);

  // 监听窗口调整
  useEffect(() => {
    const handleWindowResize = () => {
      if (containerRef.current && typeof width !== 'number') {
        // 只在宽度不是固定数值时才根据窗口调整更新
        const currentWidth = containerRef.current.offsetWidth;

        // 如果宽度发生变化，更新状态
        if (Math.abs(currentWidth - (typeof dimensions.width === 'number' ? dimensions.width : currentWidth)) > 5) {
          setDimensions(prev => ({
            ...prev,
            width: currentWidth
          }));
        }
      }
    };

    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [dimensions.width, width]);

  // 当尺寸变化时调用onResize回调
  useEffect(() => {
    // 添加防抖，避免频繁触发回调导致组件抖动
    const debounceTimer = setTimeout(() => {
      if (onResize && containerRef.current) {
        const width = typeof dimensions.width === 'number'
          ? dimensions.width
          : containerRef.current.offsetWidth;
        onResize(width, dimensions.height);
      }
    }, 10); // 10ms的防抖延迟

    return () => clearTimeout(debounceTimer);
  }, [dimensions, onResize]);

     // 移除不必要的日志

  // 渲染调整手柄
  const renderHandles = () => {
    if (!resizable) return null;

    return directions.map(direction => (
      <div
        key={direction}
        className={`resize-handle resize-handle-${direction} ${isResizing && activeDirection === direction ? 'active' : ''}`}
        onMouseDown={(e) => handleResizeStart(e, direction)}
      />
    ));
  };

  // 调试用，输出当前尺寸
  console.log('ResizeWindow dimensions:', dimensions)

  return (
    <div
      ref={containerRef}
      className={`resize-window ${className} ${isResizing ? 'resizing' : ''}`}
      style={{
        ...style,
        width: dimensions.width,
        height: dimensions.height,
        // position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // 容器本身保持hidden，但内容可以溢出
        boxSizing: 'border-box' // 确保边框不会增加总宽度
      }}
    >
      <div className="resize-content" style={{
        flex: 1,
        minHeight: 0,
        // position: 'relative',
        overflow: 'hidden',
        // width: '100%', // 确保内容宽度撑满容器
        boxSizing: 'border-box' // 确保边框不会增加总宽度
      }}>
        {children}
      </div>
      {renderHandles()}
    </div>
  );
};



// 导出ResizeWindow组件为默认导出
export default ResizeWindow;