import React, { useState } from 'react';

const ReactIntegrationDemo = () => {
  const [backgroundColor, setBackgroundColor] = useState('#000000');
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateColor = () => {
    setIsLoading(true);

    // 模拟加载
    setTimeout(() => {
      // 生成随机颜色
      const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
      setBackgroundColor(randomColor);
      setIsLoading(false);
    }, 500);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <button
          onClick={handleUpdateColor}
          style={{
            padding: '8px 16px',
            backgroundColor: '#1677ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
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
        <div
          style={{
            backgroundColor,
            borderRadius: '4px',
            padding: '16px',
            color: '#ffffff',
            minHeight: '168px',
            position: 'relative'
          }}
        >
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

          {isLoading && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                color: '#333',
                borderRadius: '4px'
              }}
            >
              加载中...
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '16px' }}>
        <p><strong>当前背景颜色：</strong> {backgroundColor}</p>
      </div>
    </div>
  );
};

export default ReactIntegrationDemo;
