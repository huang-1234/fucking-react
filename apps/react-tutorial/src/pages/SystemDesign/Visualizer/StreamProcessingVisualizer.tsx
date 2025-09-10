import React, { useMemo, useState, useEffect } from 'react';
import { type StreamProcessingVisualizerProps } from './types';
import { visualizeStreamProcessing } from '../al/streaming-processor';

/**
 * 流处理可视化组件 - 打字机效果
 */
const StreamProcessingVisualizer: React.FC<StreamProcessingVisualizerProps> = ({
  chunks,
  chunkDelayMs,
  pauseAt,
  resumeAt,
  width = 1200,
  height = 900,
  className,
  style
}) => {
  // 生成可视化数据
  const visualData = useMemo(() => {
    return visualizeStreamProcessing(chunks, chunkDelayMs, pauseAt, resumeAt);
  }, [chunks, chunkDelayMs, pauseAt, resumeAt]);

  // 打字机效果状态
  const [currentStep, setCurrentStep] = useState(0);
  const [typingText, setTypingText] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(1); // 打字速度倍率

  // 打字机效果
  useEffect(() => {
    if (!isAnimating || currentStep >= visualData.timeline.length) {
      return;
    }

    // 当前步骤的数据
    const currentItem = visualData.timeline[currentStep];

    // 检查是否是暂停或恢复事件
    if (currentItem.event === 'pause') {
      setIsPaused(true);
    } else if (currentItem.event === 'resume') {
      setIsPaused(false);
    }

    // 设置当前文本
    setTypingText(currentItem.accumulated);

    // 计算下一步的延迟
    const nextDelay = currentStep < visualData.timeline.length - 1 ?
      (visualData.timeline[currentStep + 1].time - currentItem.time) :
      chunkDelayMs;

    // 设置定时器进入下一步
    const timer = setTimeout(() => {
      setCurrentStep(prev => prev + 1);
    }, (isPaused ? nextDelay * 2 : nextDelay) / typingSpeed); // 根据速度和暂停状态调整延迟

    return () => clearTimeout(timer);
  }, [currentStep, visualData.timeline, chunkDelayMs, isPaused, isAnimating, typingSpeed]);

  // 开始动画
  const startAnimation = () => {
    setCurrentStep(0);
    setTypingText('');
    setIsPaused(false);
    setIsAnimating(true);
  };

  // 重置动画
  const resetAnimation = () => {
    setCurrentStep(0);
    setTypingText('');
    setIsPaused(false);
    setIsAnimating(false);
  };

  // 调整速度
  const changeSpeed = (multiplier: number) => {
    setTypingSpeed(multiplier);
  };

  // 计算进度百分比
  const progressPercentage = currentStep / visualData.timeline.length * 100;

  return (
    <div className={className} style={{ ...style, width, height, overflow: 'auto' }}>
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>流式数据处理 - 打字机效果</h2>

        {/* 控制面板 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <button
            style={{
              padding: '8px 16px',
              backgroundColor: isAnimating ? '#ccc' : '#4ecdc4',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isAnimating ? 'default' : 'pointer',
              fontWeight: 'bold'
            }}
            onClick={isAnimating ? undefined : startAnimation}
            disabled={isAnimating}
          >
            开始
          </button>

          <button
            style={{
              padding: '8px 16px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={resetAnimation}
          >
            重置
          </button>

          <div style={{ marginLeft: '20px', display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>速度:</span>
            {[0.5, 1, 2, 5].map(speed => (
              <button
                key={speed}
                style={{
                  padding: '5px 10px',
                  backgroundColor: typingSpeed === speed ? '#3498db' : '#ddd',
                  color: typingSpeed === speed ? 'white' : 'black',
                  border: 'none',
                  borderRadius: '4px',
                  margin: '0 5px',
                  cursor: 'pointer'
                }}
                onClick={() => changeSpeed(speed)}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* 进度条 */}
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#ddd',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '20px'
        }}>
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: isPaused ? '#ff6b6b' : '#4ecdc4',
              transition: 'width 0.3s ease'
            }}
          />
        </div>

        {/* 状态信息 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
          color: '#666'
        }}>
          <div>
            <span style={{ fontWeight: 'bold' }}>数据块数:</span> {visualData.chunks.length}
            <span style={{ margin: '0 15px' }}>|</span>
            <span style={{ fontWeight: 'bold' }}>块延迟:</span> {chunkDelayMs}ms
          </div>
          <div>
            {pauseAt !== undefined && (
              <span style={{ marginRight: '15px' }}>
                <span style={{ fontWeight: 'bold', color: '#ff6b6b' }}>暂停于块:</span> {pauseAt + 1}
              </span>
            )}
            {resumeAt !== undefined && (
              <span>
                <span style={{ fontWeight: 'bold', color: '#1abc9c' }}>恢复于块:</span> {resumeAt + 1}
              </span>
            )}
          </div>
          {isAnimating && (
            <div>
              <span style={{ fontWeight: 'bold' }}>当前块:</span> {currentStep + 1} / {visualData.timeline.length}
              {isPaused && (
                <span style={{
                  marginLeft: '10px',
                  color: '#ff6b6b',
                  fontWeight: 'bold',
                  animation: 'blink 1s infinite'
                }}>
                  已暂停
                </span>
              )}
            </div>
          )}
        </div>

        {/* 打字机效果区域 */}
        <div style={{
          padding: '20px',
          backgroundColor: '#2c3e50',
          color: '#ecf0f1',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '16px',
          lineHeight: '1.6',
          height: '500px',
          overflow: 'auto',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          boxShadow: 'inset 0 0 10px rgba(0,0,0,0.3)'
        }}>
          {isAnimating ? (
            <div className="typing-text">
              {typingText}
              <span
                style={{
                  borderRight: '2px solid #ecf0f1',
                  animation: 'blink-caret 0.75s step-end infinite'
                }}
              >
                &nbsp;
              </span>
              <style>
                {`
                  @keyframes blink-caret {
                    from, to { border-color: transparent }
                    50% { border-color: #ecf0f1 }
                  }
                  @keyframes blink {
                    from, to { opacity: 1 }
                    50% { opacity: 0.5 }
                  }
                `}
              </style>
            </div>
          ) : (
            visualData.timeline[visualData.timeline.length - 1]?.accumulated || '点击"开始"按钮启动打字机效果'
          )}
        </div>

        {/* 当前块信息 */}
        {isAnimating && currentStep < visualData.timeline.length && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>当前块信息</h3>
            <div style={{ display: 'flex', gap: '20px' }}>
              <div>
                <span style={{ fontWeight: 'bold' }}>内容:</span> "{visualData.timeline[currentStep].chunk}"
              </div>
              <div>
                <span style={{ fontWeight: 'bold' }}>时间点:</span> {visualData.timeline[currentStep].time}ms
              </div>
              {visualData.timeline[currentStep].event && (
                <div style={{
                  color: visualData.timeline[currentStep].event === 'pause' ? '#ff6b6b' : '#1abc9c',
                  fontWeight: 'bold'
                }}>
                  事件: {visualData.timeline[currentStep].event === 'pause' ? '暂停' : '恢复'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamProcessingVisualizer;