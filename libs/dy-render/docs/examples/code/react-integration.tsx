import React, { useEffect, useRef, useState } from 'react';
import { createRenderer } from '../../../src/utils/create-renderer';
import { DySchema } from '../../../types/schema';
import { dy_view_schema } from '../../../types/schema.mock';

interface DyRendererProps {
  schema: DySchema;
  onReady?: (instance: any) => void;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * React DyRenderer 组件
 * 用于在React应用中集成低代码渲染引擎
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

  useEffect(() => {
    let isMounted = true;

    async function initRenderer() {
      try {
        if (!containerRef.current) return;

        // 创建渲染器
        if (!rendererRef.current) {
          rendererRef.current = await createRenderer({
            enablePerformanceMonitor: true
          });
        }

        // 渲染Schema
        const instance = await rendererRef.current.render(schema, containerRef.current);
        instanceRef.current = instance;

        // 回调
        if (isMounted) {
          setIsLoading(false);
          if (onReady) {
            onReady(instance);
          }
        }
      } catch (err) {
        console.error('Failed to render schema', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsLoading(false);
        }
      }
    }

    initRenderer();

    return () => {
      isMounted = false;
      // 销毁渲染实例
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
    };
  }, [schema, onReady]);

  // Schema更新时重新渲染
  useEffect(() => {
    if (!isLoading && instanceRef.current) {
      instanceRef.current.update(schema);
    }
  }, [schema, isLoading]);

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

/**
 * 使用示例
 */
export const DyRendererExample: React.FC = () => {
  const [currentSchema, setCurrentSchema] = useState<DySchema>(dy_view_schema);

  const handleReady = (instance: any) => {
    console.log('DyRenderer ready', instance);
  };

  const handleUpdateSchema = () => {
    setCurrentSchema({
      ...currentSchema,
      __props: {
        ...currentSchema.__props,
        __style: {
          ...currentSchema.__props?.__style,
          backgroundColor: '#' + Math.floor(Math.random() * 16777215).toString(16)
        }
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>DyRenderer React 集成示例</h1>
      <button onClick={handleUpdateSchema} style={{ marginBottom: '16px' }}>
        更新背景颜色
      </button>
      <DyRenderer
        schema={currentSchema}
        onReady={handleReady}
        style={{ border: '1px solid #eee', borderRadius: '4px', padding: '16px' }}
      />
    </div>
  );
};
