import React from 'react';
import { AntdTracker } from './AntdTracker';

/**
 * 包装Antd组件库
 * @param antd Antd组件库
 * @returns 增强后的Antd组件库
 */
export const wrapAntdComponents = (antd: any): any => {
  if (!antd) {
    console.error('[wrapAntdComponents] 无效的 antd 组件库');
    return antd;
  }

  const wrappedAntd = { ...antd };

  // 包装常用组件
  if (antd.Button) {
    wrappedAntd.Button = AntdTracker.wrapButton(antd.Button);
  }

  if (antd.Modal) {
    wrappedAntd.Modal = AntdTracker.wrapModal(antd.Modal);
  }

  if (antd.Tabs) {
    wrappedAntd.Tabs = AntdTracker.wrapTabs(antd.Tabs);
  }

  if (antd.Form) {
    wrappedAntd.Form = AntdTracker.wrapForm(antd.Form);
  }

  if (antd.Select) {
    wrappedAntd.Select = AntdTracker.wrapSelect(antd.Select);
  }

  return wrappedAntd;
};

/**
 * 创建埋点增强的Antd组件
 * @param Component Antd组件
 * @param componentType 组件类型
 * @returns 增强后的组件
 */
export const createTrackedAntdComponent = (Component: any, componentType: string): any => {
  switch (componentType.toLowerCase()) {
    case 'button':
      return AntdTracker.wrapButton(Component);
    case 'modal':
      return AntdTracker.wrapModal(Component);
    case 'tabs':
      return AntdTracker.wrapTabs(Component);
    case 'form':
      return AntdTracker.wrapForm(Component);
    case 'select':
      return AntdTracker.wrapSelect(Component);
    default:
      console.warn(`[createTrackedAntdComponent] 不支持的组件类型: ${componentType}`);
      return Component;
  }
};
