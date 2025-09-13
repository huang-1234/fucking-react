import React, { useState, useEffect, useRef } from 'react';
import { SandboxRenderer } from '../../src/core/sandbox-renderer';
import { dy_view_schema } from '../../types/schema.mock';
import { DyMaterialProps, DySchema } from '../../types/schema';

const SandboxDemo = () => {
  const sandboxContainerRef = useRef<HTMLDivElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [currentSchema, setCurrentSchema] = useState<DySchema>(dy_view_schema);
  const sandboxRendererRef = useRef<SandboxRenderer | null>(null);
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initSandbox() {
      try {
        if (!sandboxContainerRef.current || !mainContainerRef.current) return;

        // 创建沙箱渲染器
        const sandboxRenderer = new SandboxRenderer();
        sandboxRendererRef.current = sandboxRenderer;

        // 标记iframe已加载
        setIframeLoaded(true);

        // 使用setTimeout确保React完成DOM更新后再渲染
        setTimeout(async () => {
          try {
            if (!isMounted || !sandboxContainerRef.current) return;

            // 渲染Schema到沙箱
            const sandboxInstance = await sandboxRenderer.render(currentSchema, sandboxContainerRef.current);

            if (isMounted) {
              instanceRef.current = sandboxInstance;
            }
          } catch (err) {
            console.error('Failed to render in sandbox:', err);
          }
        }, 0);

        if (isMounted) {
          setIsLoaded(true);

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

            // 使用setTimeout确保React完成DOM更新后再更新渲染
            setTimeout(async () => {
              try {
                if (!isMounted || !instanceRef.current) return;

                // 更新渲染
                await instanceRef.current.update(updatedSchema);
              } catch (err) {
                console.error('Failed to update sandbox render:', err);
              }
            }, 0);
            setIsUpdated(true);
          }, 2000);
        }
      } catch (err) {
        console.error('Sandbox render error', err);
      }
    }

    initSandbox();

    return () => {
      isMounted = false;

      // 安全地销毁沙箱
      try {
        // 使用改进的销毁方法
        if (sandboxRendererRef.current) {
          sandboxRendererRef.current.destroy();
        }

        // 清理引用
        sandboxRendererRef.current = null;
        instanceRef.current = null;
      } catch (err) {
        console.error('Error during sandbox cleanup:', err);
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
          position: 'relative'
        }}
      >
        <div
          style={{
            border: '2px dashed #999',
            borderRadius: '4px',
            padding: '16px',
            backgroundColor: '#f5f5f5',
            marginBottom: '16px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                borderRadius: '4px',
                color: '#1677ff'
              }}
            >
              沙箱环境 (iframe)
            </span>
          </div>

          <div
            ref={sandboxContainerRef}
            style={{
              minHeight: '150px',
              position: 'relative'
            }}
          >
            {!iframeLoaded && (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                iframe 加载中...
              </div>
            )}
            {iframeLoaded && !isLoaded && (
              <div style={{
                textAlign: 'center',
                padding: '50px 0',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: '#000000',
                color: '#ffffff',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                渲染中...
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            border: '2px dashed #999',
            borderRadius: '4px',
            padding: '16px',
            backgroundColor: '#f5f5f5'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '4px 8px',
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                borderRadius: '4px',
                color: '#52c41a'
              }}
            >
              主文档
            </span>
          </div>

          <div
            ref={mainContainerRef}
            style={{
              backgroundColor: isUpdated ? '#ff0000' : '#000000',
              borderRadius: '4px',
              padding: '16px',
              color: '#ffffff',
              minHeight: '150px',
              opacity: isLoaded ? 1 : 0.3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {!isLoaded ? (
              <div style={{ textAlign: 'center' }}>等待沙箱渲染...</div>
            ) : (
              <div style={{ width: '100%' }}>
                <div
                  style={{
                    padding: '10px',
                    borderTop: '1px solid #fff',
                    borderBottom: '1px solid #fff',
                    borderLeft: '1px solid #fff',
                    marginBottom: '10px'
                  }}
                >
                  Header
                </div>
                <div
                  style={{
                    padding: '10px'
                  }}
                >
                  <div
                    style={{
                      padding: '10px'
                    }}
                  >
                    <div style={{ marginBottom: '5px' }}>List Item 1</div>
                    <div style={{ marginBottom: '5px' }}>List Item 2</div>
                    <div style={{ marginBottom: '5px' }}>List Item 3</div>
                    <div style={{ marginBottom: '5px' }}>List Item 4</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <p><strong>沙箱状态：</strong> {!iframeLoaded ? 'iframe 加载中' : !isLoaded ? '渲染中' : isUpdated ? '已更新（红色背景）' : '已加载（黑色背景）'}</p>
        <p><strong>主文档状态：</strong> {!isLoaded ? '等待沙箱渲染' : isUpdated ? '已更新（红色背景）' : '已加载（黑色背景）'}</p>
      </div>
    </div>
  );
};

export default SandboxDemo;
