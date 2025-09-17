import React, { useEffect } from 'react';
import { useStreamingText } from '../hooks/useStreamingText';
import { type StreamingTextProps } from '../types';
import styles from './StreamingText.module.less';

/**
 * 流式文本组件
 * 实现打字机效果的文本渲染
 */
const StreamingText: React.FC<StreamingTextProps> = ({
  text,
  speed = 'normal',
  showCursor = true,
  cursorChar = '▋',
  delay = 0,
  onComplete,
  className = '',
  isComplete: forceComplete = false
}) => {
  const {
    visibleText,
    isComplete,
    complete
  } = useStreamingText({
    text,
    speed,
    delay,
    enabled: true,
    onComplete
  });

  // 如果外部强制完成，则立即完成渲染
  useEffect(() => {
    if (forceComplete && !isComplete) {
      complete();
    }
  }, [forceComplete, isComplete, complete]);

  return (
    <span className={`${styles.streamingText} ${className}`}>
      {visibleText}
      {showCursor && !isComplete && (
        <span className={styles.cursor}>
          {cursorChar}
        </span>
      )}
    </span>
  );
};

export default React.memo(StreamingText);
