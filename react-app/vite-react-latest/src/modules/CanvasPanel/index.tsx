import React, { useRef, useEffect } from 'react';
import './canvas-panel.less';

export interface CanvasPanelProps {
  width?: number;
  height?: number;
  elements?: Array<{
    id: string;
    type: string;
    x: number;
    y: number;
    [key: string]: any;
  }>;
  onElementClick?: (elementId: string) => void;
}

const CanvasPanel: React.FC<CanvasPanelProps> = ({
  width = 800,
  height = 600,
  elements = [],
  onElementClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 渲染画布元素
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, width, height);

    // 绘制元素
    elements.forEach((element) => {
      ctx.save();

      // 根据元素类型绘制不同的形状
      switch (element.type) {
        case 'rect':
          ctx.fillStyle = element.style?.fill || '#000';
          ctx.strokeStyle = element.style?.stroke || '#000';
          ctx.lineWidth = element.style?.strokeWidth || 1;

          if (element.style?.fill) {
            ctx.fillRect(element.x, element.y, element.width || 100, element.height || 100);
          }

          if (element.style?.stroke) {
            ctx.strokeRect(element.x, element.y, element.width || 100, element.height || 100);
          }
          break;

        case 'circle':
          ctx.fillStyle = element.style?.fill || '#000';
          ctx.strokeStyle = element.style?.stroke || '#000';
          ctx.lineWidth = element.style?.strokeWidth || 1;

          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius || 50, 0, Math.PI * 2);

          if (element.style?.fill) {
            ctx.fill();
          }

          if (element.style?.stroke) {
            ctx.stroke();
          }
          break;

        case 'text':
          ctx.fillStyle = element.style?.fill || '#000';
          ctx.font = `${element.style?.fontSize || 16}px ${element.style?.fontFamily || 'Arial'}`;
          ctx.fillText(element.content || '', element.x, element.y);
          break;

        default:
          break;
      }

      ctx.restore();
    });
  }, [elements, width, height]);

  // 处理点击事件
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onElementClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 检查是否点击了某个元素（简单的碰撞检测）
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];

      let isHit = false;

      switch (element.type) {
        case 'rect':
          isHit = x >= element.x &&
                  x <= element.x + (element.width || 100) &&
                  y >= element.y &&
                  y <= element.y + (element.height || 100);
          break;

        case 'circle':
          const dx = x - element.x;
          const dy = y - element.y;
          isHit = Math.sqrt(dx * dx + dy * dy) <= (element.radius || 50);
          break;

        case 'text':
          // 简单文本点击检测（不够精确）
          const fontSize = element.style?.fontSize || 16;
          const textWidth = (element.content || '').length * fontSize * 0.6;
          isHit = x >= element.x &&
                  x <= element.x + textWidth &&
                  y >= element.y - fontSize &&
                  y <= element.y;
          break;

        default:
          break;
      }

      if (isHit) {
        onElementClick(element.id);
        break;
      }
    }
  };

  return (
    <div className="canvas-panel-container">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        className="canvas-panel"
      />
    </div>
  );
};

export default React.memo(CanvasPanel);