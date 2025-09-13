import React, { useState, useEffect } from 'react';
import { DyRenderer } from '../../src/react';
import { dy_view_schema } from '../../types/schema.mock';
import { DySchema } from '../../types/schema';
import { scaleSize, useScale } from './scale';

/**
 * @desc React集成示例
 * @returns ReactIntegrationDemo
 */
const ReactIntegrationDemo = () => {
  const [currentSchema, setCurrentSchema] = useState<DySchema>(dy_view_schema);
  const [isLoading, setIsLoading] = useState(false);
  const renderInstanceRef = React.useRef<any>(null);

  // 处理组件准备完成
  const handleReady = (instance: any) => {
    console.log('DyRenderer ready', instance);
    renderInstanceRef.current = instance;
    setIsLoading(false);
  };

  // 处理更新Schema
  const handleUpdateSchema = () => {
    setIsLoading(true);

    // 生成随机颜色
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

    // 使用setTimeout确保DOM更新完成
    setTimeout(() => {
      // 创建新的Schema对象
      const newSchema = {
        ...currentSchema,
        __props: {
          ...currentSchema.__props,
          __style: {
            ...currentSchema.__props?.__style,
            backgroundColor: randomColor
          }
        }
      } as DySchema;

      setCurrentSchema(newSchema);
    }, 0);
  };

  // 清理函数
  useEffect(() => {
    return () => {
      // 安全地清理实例
      if (renderInstanceRef.current) {
        try {
          // 避免直接调用destroy，可能导致DOM操作冲突
          renderInstanceRef.current = null;
        } catch (err) {
          console.error('Error cleaning up render instance:', err);
        }
      }
    };
  }, []);
  const styleLayout = useScale(scaleSize.sm);

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleUpdateSchema}
          style={{
            ...styleLayout,
            backgroundColor: '#1677ff',
            color: 'white',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
          disabled={isLoading}
        >
          {isLoading ? '更新中...' : '更新背景颜色'}
        </button>
      </div>

      <div
        style={{
          border: '1px solid #eee',
          borderRadius: '4px',
          padding: '16px',
          position: 'relative',
          minHeight: '200px'
        }}
      >
        <DyRenderer
          schema={currentSchema}
          onReady={handleReady}
          style={{
            borderRadius: '4px',
            minHeight: '168px'
          }}
        />
      </div>

      <div style={{ marginTop: '16px' }}>
        <p><strong>当前背景颜色：</strong> {currentSchema.__props?.__style?.backgroundColor || '#000000'}</p>
      </div>
    </div>
  );
};

export default ReactIntegrationDemo;
