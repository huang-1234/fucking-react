import React, { useEffect, useRef, useCallback } from 'react';
import { getTracker } from '../core/Tracker';
import type { IExposureEvent, IClickEvent, ITrackingEvent } from '../types/tracking';

/**
 * 曝光跟踪Hook
 * @param eventData 事件数据
 * @param options 配置项
 * @returns 元素引用
 */
export const useExposureTracking = (
  eventData: Partial<IExposureEvent>,
  options: { once?: boolean; threshold?: number } = {}
) => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    try {
      const tracker = getTracker();
      tracker.trackExposure({
        element,
        eventData,
        ...options
      });

      return () => {
        // 组件卸载时移除观察
        if (element) {
          tracker.getExposureTracker().removeElement(element);
        }
      };
    } catch (error) {
      console.error('[useExposureTracking] 错误:', error);
    }
  }, [eventData, options]);

  return elementRef;
};

/**
 * 点击事件跟踪Hook
 * @param eventData 事件数据
 * @param onClick 原始点击回调
 * @returns 处理点击的回调函数
 */
export const useClickTracking = <E extends React.SyntheticEvent = React.MouseEvent>(
  eventData: Partial<IClickEvent>,
  onClick?: (event: E) => void
) => {
  return useCallback((event: E) => {
    try {
      // 跟踪点击事件
      const tracker = getTracker();
      tracker.track({
        eventType: 'click',
        eventAction: 'click',
        ...eventData,
        clickX: (event.nativeEvent as MouseEvent).clientX,
        clickY: (event.nativeEvent as MouseEvent).clientY,
      });

      // 调用原始回调
      if (onClick) {
        onClick(event);
      }
    } catch (error) {
      console.error('[useClickTracking] 错误:', error);
      // 确保原始回调仍然被调用
      if (onClick) {
        onClick(event);
      }
    }
  }, [eventData, onClick]);
};

/**
 * 自定义事件跟踪Hook
 * @param eventType 事件类型
 * @returns 事件跟踪函数
 */
export const useEventTracking = (eventType: string = 'custom') => {
  return useCallback((eventData: Partial<ITrackingEvent>) => {
    try {
      const tracker = getTracker();
      tracker.track({
        eventType,
        ...eventData,
      });
    } catch (error) {
      console.error(`[useEventTracking:${eventType}] 错误:`, error);
    }
  }, [eventType]);
};

/**
 * 页面浏览跟踪Hook
 * @param pageInfo 页面信息
 */
export const usePageViewTracking = (
  pageInfo: {
    pageName: string;
    pageCategory?: string;
    [key: string]: any;
  }
) => {
  useEffect(() => {
    try {
      const tracker = getTracker();
      tracker.track({
        eventType: 'pageview',
        eventCategory: pageInfo.pageCategory || 'page',
        eventAction: 'view',
        eventLabel: pageInfo.pageName,
        pageName: pageInfo.pageName,
        ...pageInfo
      });
    } catch (error) {
      console.error('[usePageViewTracking] 错误:', error);
    }
  }, [pageInfo.pageName]); // 仅在页面名称变化时触发
};

/**
 * 表单提交跟踪Hook
 * @param formId 表单ID
 * @param formName 表单名称
 * @returns 表单提交处理函数
 */
export const useFormSubmitTracking = (
  formId: string,
  formName: string
) => {
  return useCallback((formData: Record<string, any>) => {
    try {
      const tracker = getTracker();
      tracker.track({
        eventType: 'form',
        eventCategory: 'form',
        eventAction: 'submit',
        eventLabel: formName,
        formId,
        formName,
        // 移除敏感字段
        formData: Object.entries(formData).reduce((acc, [key, value]) => {
          // 过滤掉密码、信用卡等敏感字段
          if (!key.match(/password|creditcard|card|cvv|ssn|secret/i)) {
            acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
          }
          return acc;
        }, {} as Record<string, string>)
      });
    } catch (error) {
      console.error('[useFormSubmitTracking] 错误:', error);
    }
  }, [formId, formName]);
};
