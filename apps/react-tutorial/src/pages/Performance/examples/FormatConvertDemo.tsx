import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Space, Select, Typography, Slider } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { imageCrop, imageFormat } from '../ImagePerformance/img-performance';
import { SAMPLE_IMAGES } from './DemoImagePerformance';

const { Title, Text } = Typography;
const { Option } = Select;

// 格式转换组件
export const FormatConverter: React.FC<{
  src: string;
  onConvert: (dataUrl: string, format: string) => void;
}> = ({ src, onConvert }) => {
  const [format, setFormat] = useState('webp');
  const [quality, setQuality] = useState(0.8);
  const [converting, setConverting] = useState(false);
  const [supportedFormats, setSupportedFormats] = useState<{ webp: boolean, avif: boolean, jpeg2000: boolean } | null>(null);

  useEffect(() => {
    // 检测浏览器支持的格式
    const formats = imageFormat.detectSupportedFormats();
    setSupportedFormats(formats);
  }, []);

  const handleConvert = async () => {
    setConverting(true);
    try {
      let dataUrl;

      if (format === 'webp') {
        dataUrl = await imageFormat.convertToWebP(src, quality);
      } else {
        // 对于其他格式，使用Canvas API
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });

        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('无法获取Canvas 2D上下文');

        ctx.drawImage(img, 0, 0);

        dataUrl = canvas.toDataURL(`image/${format}`, quality);
      }

      onConvert(dataUrl, format.toUpperCase());
    } catch (error) {
      console.error('转换失败:', error);
    } finally {
      setConverting(false);
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
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text>目标格式:</Text>
            <Select
              value={format}
              onChange={setFormat}
              style={{ width: 120, marginLeft: 8 }}
            >
              <Option value="webp" disabled={supportedFormats && !supportedFormats.webp}>WebP {supportedFormats && !supportedFormats.webp && '(不支持)'}</Option>
              <Option value="jpeg">JPEG</Option>
              <Option value="png">PNG</Option>
              <Option value="avif" disabled={supportedFormats && !supportedFormats.avif}>AVIF {supportedFormats && !supportedFormats.avif && '(不支持)'}</Option>
            </Select>
          </div>
          <div>
            <Text>质量: {quality.toFixed(2)}</Text>
            <Slider
              min={0.1}
              max={1}
              step={0.01}
              value={quality}
              onChange={setQuality}
            />
          </div>
        </Space>
      </div>
      <Button
        type="primary"
        onClick={handleConvert}
        loading={converting}
      >
        转换格式
      </Button>
    </div>
  );
};

export const FormatConvertDemo: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES[0]);
  const [convertedImage, setConvertedImage] = useState<{ dataUrl: string, format: string } | null>(null);

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

        <FormatConverter
          src={selectedImage}
          onConvert={(dataUrl, format) => setConvertedImage({ dataUrl, format })}
        />
      </Col>

      <Col span={12}>
        <Title level={4}>转换结果</Title>
        {convertedImage ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <img
                src={convertedImage.dataUrl}
                alt="Converted"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text>转换格式: {convertedImage.format}</Text>
            </div>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => imageCrop.downloadImage(convertedImage.dataUrl, `converted-image.${convertedImage.format.toLowerCase()}`)}
            >
              下载转换结果
            </Button>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">在左侧选择目标格式和质量，然后点击"转换格式"按钮</Text>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default FormatConvertDemo;
