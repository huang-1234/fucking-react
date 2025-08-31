import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Typography, Spin } from 'antd';
import { lazyLoad } from '../ImagePerformance/img-performance';
import { SAMPLE_IMAGES } from './DemoImagePerformance';

const { Title, Paragraph, Text } = Typography;

// 懒加载图片组件
export const LazyImage: React.FC<{
  src: string;
  alt?: string;
  placeholderColor?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}> = ({ src, alt = '', placeholderColor = '#f0f0f0', width = '100%', height = 'auto', style = {} }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!imgRef.current) return;

    const cleanup = lazyLoad.observeWithIO(
      imgRef.current,
      () => setIsInView(true),
      { threshold: 0.01, rootMargin: '100px' }
    );

    return cleanup;
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width,
        height,
        backgroundColor: placeholderColor,
        overflow: 'hidden',
        ...style,
      }}
    >
      {!isLoaded && (
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
            backgroundColor: placeholderColor,
          }}
        >
          <Spin />
        </div>
      )}
      <img
        ref={imgRef}
        src={isInView ? src : ''}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
        onLoad={() => setIsLoaded(true)}
      />
    </div>
  );
};

export const LazyLoadDemo: React.FC = () => {
  return (
    <>
      <Paragraph>
        滚动查看下方图片，它们会在进入视口时才加载，从而减少初始加载时间和带宽消耗。
      </Paragraph>

      <div style={{ height: '600px', overflow: 'auto', border: '1px solid #f0f0f0', padding: '16px' }}>
        {SAMPLE_IMAGES.map((src, index) => (
          <div key={index} style={{ marginBottom: 24 }}>
            <Row gutter={16}>
              <Col span={8}>
                <LazyImage
                  src={src}
                  alt={`Lazy Image ${index + 1}`}
                  height={200}
                />
              </Col>
              <Col span={16}>
                <Title level={4}>图片 #{index + 1}</Title>
                <Paragraph>
                  这张图片使用了IntersectionObserver API实现懒加载。它只有在滚动到视口附近时才会开始加载，
                  从而减少页面初始加载时间和带宽消耗。
                </Paragraph>
                <Text type="secondary">图片URL: {src}</Text>
              </Col>
            </Row>
          </div>
        ))}
      </div>
    </>
  );
};

export default LazyLoadDemo;
