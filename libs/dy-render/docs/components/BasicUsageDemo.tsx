import React, { useEffect, useRef, useState } from 'react';

const BasicUsageDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [isPerformanceVisible, setIsPerformanceVisible] = useState(false);

  useEffect(() => {
    // 模拟加载渲染器
    setTimeout(() => {
      setIsLoaded(true);

      // 模拟更新渲染
      setTimeout(() => {
        setIsUpdated(true);

        // 模拟显示性能数据
        setTimeout(() => {
          setIsPerformanceVisible(true);
        }, 1000);
      }, 2000);
    }, 1000);
  }, []);

  return (
    <div>
      <div
        ref={containerRef}
        style={{
          border: '1px solid #ccc',
          borderRadius: '4px',
          padding: '16px',
          minHeight: '200px',
          position: 'relative',
          backgroundColor: isUpdated ? '#ff0000' : '#000000',
          color: '#ffffff'
        }}
      >
        {!isLoaded ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>加载中...</div>
        ) : (
          <>
            <div
              style={{
                padding: '10px',
                borderTop: '1px solid #000',
                borderBottom: '1px solid #000',
                borderLeft: '1px solid #000',
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
          </>
        )}
      </div>

      {isPerformanceVisible && (
        <div style={{ marginTop: '20px' }}>
          <h4>性能监控</h4>
          <svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
            <text x="200" y="20" textAnchor="middle" fontWeight="bold">Render Performance</text>
            <rect x="50" y="50" width="20" height="100" fill="#4dabf7" />
            <rect x="80" y="80" width="20" height="70" fill="#4dabf7" />
            <rect x="110" y="40" width="20" height="110" fill="#ff6b6b" />
            <rect x="140" y="60" width="20" height="90" fill="#4dabf7" />
            <rect x="170" y="70" width="20" height="80" fill="#4dabf7" />
            <rect x="200" y="30" width="20" height="120" fill="#ff6b6b" />
            <rect x="230" y="50" width="20" height="100" fill="#4dabf7" />
            <rect x="260" y="60" width="20" height="90" fill="#4dabf7" />
            <rect x="290" y="50" width="20" height="100" fill="#4dabf7" />
            <rect x="320" y="70" width="20" height="80" fill="#4dabf7" />
            <line x1="40" y1="150" x2="360" y2="150" stroke="black" />
            <line x1="40" y1="40" x2="40" y2="150" stroke="black" />
            <text x="200" y="190" textAnchor="middle">Render Index</text>
            <text x="10" y="100" textAnchor="middle" transform="rotate(-90, 10, 100)">Duration (ms)</text>
          </svg>
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
