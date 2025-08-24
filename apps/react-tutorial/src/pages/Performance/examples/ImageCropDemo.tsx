import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Button, Space, Select, Typography } from 'antd';
import { DownloadOutlined, ReloadOutlined, ScissorOutlined } from '@ant-design/icons';
import { imageCrop } from '../ImagePerformance/img-performance';
import { SAMPLE_IMAGES } from './DemoImagePerformance';

const { Title, Text } = Typography;
const { Option } = Select;

// 裁剪组件
export const ImageCropper: React.FC<{
  src: string;
  onCrop: (dataUrl: string) => void;
}> = ({ src, onCrop }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // 加载图片到Canvas
  useEffect(() => {
    if (!canvasRef.current || !imgRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imgRef.current;
    img.onload = () => {
      // 设置Canvas尺寸与图片相同
      canvas.width = img.width;
      canvas.height = img.height;

      // 绘制图片
      ctx.drawImage(img, 0, 0);
      setImageLoaded(true);
    };

    img.src = src;
  }, [src]);

  // 绘制裁剪区域
  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 重新绘制图片
    if (imgRef.current) {
      ctx.drawImage(imgRef.current, 0, 0);
    }

    // 绘制裁剪区域
    if (cropArea.width > 0 && cropArea.height > 0) {
      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height);

      // 添加半透明遮罩
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';

      // 绘制四个遮罩区域
      ctx.fillRect(0, 0, canvas.width, cropArea.y); // 上
      ctx.fillRect(0, cropArea.y, cropArea.x, cropArea.height); // 左
      ctx.fillRect(cropArea.x + cropArea.width, cropArea.y, canvas.width - cropArea.x - cropArea.width, cropArea.height); // 右
      ctx.fillRect(0, cropArea.y + cropArea.height, canvas.width, canvas.height - cropArea.y - cropArea.height); // 下
    }
  }, [cropArea, imageLoaded]);

  // 鼠标事件处理
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setIsDrawing(true);
    setStartPos({ x, y });
    setCropArea({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setCropArea({
      x: Math.min(startPos.x, x),
      y: Math.min(startPos.y, y),
      width: Math.abs(x - startPos.x),
      height: Math.abs(y - startPos.y),
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  // 执行裁剪
  const performCrop = async () => {
    if (!imgRef.current || cropArea.width === 0 || cropArea.height === 0) return;

    try {
      const dataUrl = await imageCrop.cropWithCanvas(imgRef.current, cropArea);
      onCrop(dataUrl);
    } catch (error) {
      console.error('裁剪失败:', error);
    }
  };

  return (
    <div>
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef}
          style={{ maxWidth: '100%', cursor: isDrawing ? 'crosshair' : 'default' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
        <img
          ref={imgRef}
          src={src}
          alt="Source"
          style={{ display: 'none' }}
        />
      </div>
      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Space>
          <Button
            type="primary"
            icon={<ScissorOutlined />}
            onClick={performCrop}
            disabled={cropArea.width === 0 || cropArea.height === 0}
          >
            裁剪选中区域
          </Button>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => setCropArea({ x: 0, y: 0, width: 0, height: 0 })}
          >
            重置选择
          </Button>
        </Space>
      </div>
    </div>
  );
};

export const ImageCropDemo: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState(SAMPLE_IMAGES[0]);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

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

        <ImageCropper
          src={selectedImage}
          onCrop={setCroppedImage}
        />
      </Col>

      <Col span={12}>
        <Title level={4}>裁剪结果</Title>
        {croppedImage ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <img
                src={croppedImage}
                alt="Cropped"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            </div>
            <Space>
              <Button
                icon={<DownloadOutlined />}
                onClick={() => imageCrop.downloadImage(croppedImage, 'cropped-image.jpg')}
              >
                下载裁剪结果
              </Button>
            </Space>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">在左侧图片上拖动鼠标选择裁剪区域，然后点击"裁剪选中区域"按钮</Text>
          </div>
        )}
      </Col>
    </Row>
  );
};

export default ImageCropDemo;
