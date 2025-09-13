import React, { useEffect, useRef, useState } from 'react';
import { createRenderer } from '../../src/utils/create-renderer';
import { dy_view_schema } from '../../types/schema.mock';
import { DyMaterialProps, DySchema } from '../../types/schema';

const BasicUsageDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<any>(null);
  const instanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isPerformanceVisible, setIsPerformanceVisible] = useState(false);
  const [perfSvg, setPerfSvg] = useState<string>('');
  const [currentSchema, setCurrentSchema] = useState<DySchema>(dy_view_schema);

  useEffect(() => {
    let isMounted = true;

    async function initRenderer() {
      try {
        if (!containerRef.current) return;

        // 创建渲染器
        const renderer = await createRenderer({
          enablePerformanceMonitor: true
        });
        rendererRef.current = renderer;

        // 渲染Schema
        const instance = await renderer.render(currentSchema, containerRef.current);
        instanceRef.current = instance;

        if (isMounted) {
          setIsLoaded(true);

          // 获取上下文
          const context = renderer.getContext();

          // 设置数据
          context.setData('user', { name: 'John', age: 30 });

          // 注册事件处理器
          context.registerEventHandler('onTabClick', (tab: string) => {
            console.log('Tab clicked:', tab);
          });

          // 5秒后更新渲染
          setTimeout(async () => {
            if (!isMounted) return;

            // 修改Schema
            const updatedSchema = {
              ...currentSchema,
              __props: {
                ...currentSchema.__props,
                __style: {
                  ...currentSchema.__props?.__style,
                  backgroundColor: '#ff0000'
                }
              }
            } as DySchema<DyMaterialProps>;

            setCurrentSchema(updatedSchema);

            // 更新渲染
            await instance.update(updatedSchema);
            setIsUpdated(true);

            // 显示性能数据
            setTimeout(() => {
              if (!isMounted) return;
              const svg = renderer.visualizePerformance();
              setPerfSvg(svg);
              setIsPerformanceVisible(true);
            }, 1000);
          }, 2000);
        }
      } catch (err) {
        console.error('Failed to render', err);
      }
    }

    initRenderer();

    return () => {
      isMounted = false;
      // 销毁渲染实例，但不清空容器（React会处理DOM清理）
      if (instanceRef.current) {
        try {
          // 只移除实例引用，不执行DOM操作
          instanceRef.current = null;
        } catch (err) {
          console.error('Error during cleanup:', err);
        }
      }
    };
  }, []);

  return (
    <div>
      <div
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '16px',
          minHeight: '200px',
          position: 'relative'
        }}
      >
        <div
          ref={containerRef}
          style={{
            minHeight: '168px'
          }}
        >
          {!isLoaded && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>加载中...</div>
          )}
        </div>
      </div>

      {isPerformanceVisible && (
        <div style={{ marginTop: '20px' }}>
          <h4>性能监控</h4>
          <div dangerouslySetInnerHTML={{ __html: perfSvg }} />
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <p><strong>当前状态：</strong> {!isLoaded ? '加载中' : isUpdated ? '已更新（红色背景）' : '已加载（黑色背景）'}</p>
        {isPerformanceVisible && <p><strong>性能监控：</strong> 已显示</p>}
      </div>
    </div>
  );
};

export default BasicUsageDemo;
