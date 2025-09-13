import React, { useState } from 'react';
import { DyRenderer } from '../../src/react';
import { dy_view_schema } from '../../types/schema.mock';
import { DySchema } from '../../types/schema';

/**
 * @desc React集成示例
 * @returns ReactIntegrationDemo
 */
const ReactIntegrationDemo = () => {
  const [currentSchema, setCurrentSchema] = useState<DySchema>(dy_view_schema);
  const [isLoading, setIsLoading] = useState(false);

  const handleReady = (instance: any) => {
    console.log('DyRenderer ready', instance);
    setIsLoading(false);
  };

  const handleUpdateSchema = () => {
    setIsLoading(true);

    // 生成随机颜色
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);

    setCurrentSchema({
      ...currentSchema,
      __props: {
        ...currentSchema.__props,
        __style: {
          ...currentSchema.__props?.__style,
          backgroundColor: randomColor
        }
      }
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleUpdateSchema}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
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
