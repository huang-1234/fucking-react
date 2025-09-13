import React, { useState, useEffect } from 'react';

const SandboxDemo = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    // 模拟iframe加载
    setTimeout(() => {
      setIframeLoaded(true);

      // 模拟渲染完成
      setTimeout(() => {
        setIsLoaded(true);

        // 模拟更新渲染
        setTimeout(() => {
          setIsUpdated(true);
        }, 2000);
      }, 1000);
    }, 1000);
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

          {!iframeLoaded ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              iframe 加载中...
            </div>
          ) : (
            <div
              style={{
                backgroundColor: isUpdated ? '#ff0000' : '#000000',
                borderRadius: '4px',
                padding: '16px',
                color: '#ffffff',
                minHeight: '150px'
              }}
            >
              {!isLoaded ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>渲染中...</div>
              ) : (
                <>
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
                </>
              )}
            </div>
          )}
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
            style={{
              backgroundColor: isUpdated ? '#ff0000' : '#000000',
              borderRadius: '4px',
              padding: '16px',
              color: '#ffffff',
              minHeight: '150px',
              opacity: isLoaded ? 1 : 0.3
            }}
          >
            {!isLoaded ? (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>等待沙箱渲染...</div>
            ) : (
              <>
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
              </>
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
