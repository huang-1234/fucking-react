import React, { useEffect, type PropsWithChildren } from 'react';
import { initTracker, getTracker } from '../core/Tracker';
import type { ITrackerConfig, IExposureEvent, IClickEvent } from '../types/tracking';
import { useExposureTracking, useClickTracking } from './hooks';

/**
 * 埋点根组件Props
 */
interface TrackingRootProps {
  /** 配置项 */
  config: ITrackerConfig;
  /** 子组件 */
  children: React.ReactNode;
}

/**
 * 埋点根组件
 * 初始化埋点SDK并提供上下文
 */
export const TrackingRoot: React.FC<TrackingRootProps> = ({ config, children }) => {
  useEffect(() => {
    // 初始化埋点SDK
    initTracker(config);

    // 页面卸载前销毁
    return () => {
      try {
        const tracker = getTracker();
        tracker.destroy();
      } catch (error) {
        console.error('[TrackingRoot] 销毁错误:', error);
      }
    };
  }, []);

  return <>{children}</>;
};

/**
 * 曝光跟踪组件Props
 */
interface TrackExposureProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 事件数据 */
  eventData: Partial<IExposureEvent>;
  /** 是否只触发一次 */
  once?: boolean;
  /** 可见阈值 */
  threshold?: number;
  /** 组件标签 */
  as?: React.ElementType;
}

/**
 * 曝光跟踪组件
 * 跟踪元素曝光事件
 */
export const TrackExposure: React.FC<PropsWithChildren<TrackExposureProps>> = ({
  eventData,
  once = true,
  threshold,
  as: Component = 'div',
  children,
  ...props
}) => {
  const ref = useExposureTracking(eventData, { once, threshold });

  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
};

/**
 * 点击跟踪组件Props
 */
interface TrackClickProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 事件数据 */
  eventData: Partial<IClickEvent>;
  /** 组件标签 */
  as?: React.ElementType;
}

/**
 * 点击跟踪组件
 * 跟踪元素点击事件
 */
export const TrackClick: React.FC<PropsWithChildren<TrackClickProps>> = ({
  eventData,
  as: Component = 'div',
  onClick,
  children,
  ...props
}) => {
  const handleClick = useClickTracking(eventData, onClick);

  return (
    <Component onClick={handleClick} {...props}>
      {children}
    </Component>
  );
};

/**
 * 高阶组件：添加曝光跟踪
 * @param Component 目标组件
 * @param eventData 事件数据
 * @param options 配置项
 * @returns 增强后的组件
 */
export function withExposureTracking<P extends object>(
  Component: React.ComponentType<P>,
  eventData: Partial<IExposureEvent>,
  options: { once?: boolean; threshold?: number } = {}
): React.FC<P> {
  return (props: P) => {
    const ref = useExposureTracking(eventData, options);

    return (
      <div ref={ref as React.RefObject<HTMLDivElement>}>
        <Component {...props} />
      </div>
    );
  };
}

/**
 * 高阶组件：添加点击跟踪
 * @param Component 目标组件
 * @param eventData 事件数据
 * @returns 增强后的组件
 */
export function withClickTracking<P extends object>(
  Component: React.ComponentType<P>,
  eventData: Partial<IClickEvent>
): React.FC<P & { onClick?: React.MouseEventHandler }> {
  return ({ onClick, ...props }: P & { onClick?: React.MouseEventHandler }) => {
    const handleClick = useClickTracking(eventData, onClick);

    return <Component {...props as P} onClick={handleClick} />;
  };
};
