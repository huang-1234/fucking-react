/**
 * 同构样式加载器
 * 支持服务端和客户端的样式注入
 */
import React, { useEffect } from 'react';
import { isServer } from './env';

// 样式集合类型
export type StylesType = {
  [key: string]: string;
};

// 服务端收集的样式表
const stylesCollector: Set<StylesType> = new Set();

/**
 * 获取收集到的所有样式
 */
export const getCollectedStyles = (): string => {
  let css = '';
  stylesCollector.forEach(styles => {
    Object.values(styles).forEach(style => {
      css += style;
    });
  });
  return css;
};

/**
 * 清空收集到的样式
 */
export const clearCollectedStyles = (): void => {
  stylesCollector.clear();
};

/**
 * 高阶组件：为组件注入CSS样式
 * 在服务端收集样式，在客户端注入样式
 */
export default function withStyles<P extends object>(styles: StylesType) {
  return function withStylesHOC(WrappedComponent: React.ComponentType<P>): React.FC<P> {
    const WithStyles: React.FC<P> = (props) => {
      // 在服务端收集样式
      if (isServer) {
        stylesCollector.add(styles);
      } else {
        // 在客户端注入样式
        useEffect(() => {
          // 检查样式是否已存在
          const insertStyles = () => {
            Object.entries(styles).forEach(([className, cssText]) => {
              const styleId = `isomorphic-style-${className}`;
              if (!document.getElementById(styleId)) {
                const style = document.createElement('style');
                style.id = styleId;
                style.textContent = cssText;
                document.head.appendChild(style);
              }
            });
          };

          insertStyles();

          // 清理函数
          return () => {
            // 在组件卸载时，可以选择是否移除样式
            // 通常不需要移除，因为样式可能被其他组件共享
          };
        }, []);
      }

      return <WrappedComponent {...props} />;
    };

    // 设置显示名称
    WithStyles.displayName = `WithStyles(${
      WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

    return WithStyles;
  };
}
