import React, { useState } from 'react';
import { Row, Col, Button, Space, Select, Typography, Slider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { imageCrop } from '../ImagePerformance/img-performance';
import { SAMPLE_IMAGES } from './DemoImagePerformance';

const { Title, Text } = Typography;
const { Option } = Select;

// 图片压缩组件
export const ImageCompressor: React.FC<{
  src: string;
  onCompress: (dataUrl: string, info: { size: string, quality: number }) => void;
}> = ({ src, onCompress }) => {
  const [quality, setQuality] = useState(0.7);
  const [compressing, setCompressing] = useState(false);

  const handleCompress = async () => {
    setCompressing(true);
    try {
      const dataUrl = await imageCrop.compress(src, quality);

      // 计算压缩后的大小
      const blob = imageCrop.dataUrlToBlob(dataUrl);
      const sizeInKB = (blob.size / 1024).toFixed(2);

      onCompress(dataUrl, { size: `${sizeInKB} KB`, quality });
    } catch (error) {
      console.error('压缩失败:', error);
    } finally {
      setCompressing(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <img
          src={src}
          alt="Source"
          style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain' }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Text>压缩质量: {quality.toFixed(2)}</Text>
        <Slider
          min={0.1}
          max={1}
          step={0.01}
          value={quality}
          onChange={setQuality}
        />
      </div>
      <Button
        type="primary"
        onClick={handleCompress}
        loading={compressing}
      >
        压缩图片
      </Button>
    </div>
  );
};

export const ImageCompressDemo: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES[0]);
  const [compressedImage, setCompressedImage] = useState<{ dataUrl: string, info: { size: string, quality: number } } | null>(null);

  return (
    <Row gutter={24}>
      <Col span={12}>
        <div style={{ marginBottom: 16 }}>
          <Text>选择图片:</Text>
          <Select
            value={selectedImage}
            onChange={setSelectedImage}
            style={{ width: '100%', marginTop: 8 }}
          >
            {SAMPLE_IMAGES.map((src, index) => (
              <Option key={index} value={src}>图片 #{index + 1}</Option>
            ))}
          </Select>
        </div>

        <ImageCompressor
          src={selectedImage}
          onCompress={(dataUrl, info) => setCompressedImage({ dataUrl, info })}
        />
      </Col>

      <Col span={12}>
        <Title level={4}>压缩结果</Title>
        {compressedImage ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <img
                src={compressedImage.dataUrl}
                alt="Compressed"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text>压缩质量: {compressedImage.info.quality.toFixed(2)}</Text>
              <br />
              <Text>压缩后大小: {compressedImage.info.size}</Text>
            </div>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => imageCrop.downloadImage(compressedImage.dataUrl, 'compressed-image.jpg')}
            >
              下载压缩结果
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">调整左侧的压缩质量滑块，然后点击"压缩图片"按钮</Text>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default ImageCompressDemo;
