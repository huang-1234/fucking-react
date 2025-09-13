import React, { useEffect, useRef, useState } from 'react';
import { createRenderer } from '../utils/create-renderer';
import { DySchema } from '../../types/schema';

interface DyRendererProps {
  schema: DySchema;
  onReady?: (instance: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * React DyRenderer 组件
 * 用于在React应用中集成低代码渲染引擎
 * 优化了与React生命周期的集成
 */
export const DyRenderer: React.FC<DyRendererProps> = ({
  schema,
  onReady,
  className,
  style
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const instanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // 初始化渲染器
  useEffect(() => {
    let isMounted = true;

    async function initRenderer() {
      try {
        // 创建渲染器（启用安全模式）
        const renderer = await createRenderer({
          enablePerformanceMonitor: true,
          safeMode: true // 在React环境中启用安全模式
        });
        rendererRef.current = renderer;
      } catch (err) {
        console.error('Failed to create renderer', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      }
    }

    initRenderer();

    return () => {
      isMounted = false;
    };
  }, []);

  // 渲染Schema
  useEffect(() => {
    let isMounted = true;
    let renderTimeout: NodeJS.Timeout | null = null;

    async function renderSchema() {
      try {
        if (!containerRef.current || !rendererRef.current) return;

        // 如果已经有实例，先清理
        if (instanceRef.current) {
          try {
            // 只移除引用，不执行DOM操作
            instanceRef.current = null;
          } catch (err) {
            console.error('Error during cleanup:', err);
          }
        }

        // 使用setTimeout确保在React完成DOM更新后再渲染
        renderTimeout = setTimeout(async () => {
          try {
            if (!isMounted || !containerRef.current || !rendererRef.current) return;

            // 渲染Schema
            const instance = await rendererRef.current.render(schema, containerRef.current);

            if (isMounted) {
              instanceRef.current = instance;

              // 回调
              setIsLoading(false);
              if (onReady) {
                onReady(instance);
              }
            }
          } catch (err) {
            console.error('Failed to render schema in timeout', err);
            if (isMounted) {
              setError(err instanceof Error ? err : new Error(String(err)));
              setIsLoading(false);
            }
          }
        }, 0);
      } catch (err) {
        console.error('Failed to setup render schema', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }

    setIsLoading(true);
    renderSchema();

    return () => {
      isMounted = false;
      // 清理超时
      if (renderTimeout) {
        clearTimeout(renderTimeout);
      }
    };
  }, [schema, onReady]);

  // 组件卸载时的清理
  useEffect(() => {
    return () => {
      // 安全地清理资源，不执行DOM操作
      try {
        // 如果有实例，先将其置为null，避免后续操作
        if (instanceRef.current) {
          // 不调用destroy方法，因为它会尝试操作DOM
          // 只清理引用
          instanceRef.current = null;
        }

        // 清理渲染器引用
        rendererRef.current = null;
      } catch (err) {
        console.error('Error during React component cleanup:', err);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="dy-renderer-error" style={{ color: 'red', padding: '16px' }}>
        <h3>渲染错误</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`dy-renderer-container ${className || ''}`}
      style={{
        position: 'relative',
        minHeight: '100px',
        ...style
      }}
    >
      {isLoading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.7)'
        }}>
          加载中...
        </div>
      )}
    </div>
  );
};

export default DyRenderer;
