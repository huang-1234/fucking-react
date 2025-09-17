import { useState, useEffect, useRef, useCallback } from 'react';

interface UseStreamingTextOptions {
  text: string;
  speed?: 'slow' | 'normal' | 'fast';
  delay?: number;
  enabled?: boolean;
  onComplete?: () => void;
}

interface UseStreamingTextReturn {
  visibleText: string;
  isComplete: boolean;
  progress: number;
  restart: () => void;
  pause: () => void;
  resume: () => void;
  complete: () => void;
}

/**
 * 流式文本渲染Hook
 * 用于实现打字机效果的文本渲染
 */
export function useStreamingText({
  text,
  speed = 'normal',
  delay = 0,
  enabled = true,
  onComplete
}: UseStreamingTextOptions): UseStreamingTextReturn {
  const [visibleText, setVisibleText] = useState<string>('');
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const intervalIdRef = useRef<number | null>(null);
  const currentIndexRef = useRef<number>(0);

  // 根据速度设置不同的打字间隔
  const getTypingInterval = useCallback(() => {
    switch (speed) {
      case 'slow': return 80;
      case 'fast': return 20;
      case 'normal':
      default: return 40;
    }
  }, [speed]);

  // 重新开始渲染
  const restart = useCallback(() => {
    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current);
    }
    currentIndexRef.current = 0;
    setVisibleText('');
    setIsComplete(false);
    setIsPaused(false);
  }, []);

  // 暂停渲染
  const pause = useCallback(() => {
    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setIsPaused(true);
  }, []);

  // 恢复渲染
  const resume = useCallback(() => {
    if (isPaused && !isComplete) {
      setIsPaused(false);
    }
  }, [isPaused, isComplete]);

  // 立即完成渲染
  const complete = useCallback(() => {
    if (intervalIdRef.current) {
      window.clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    setVisibleText(text);
    setIsComplete(true);
    currentIndexRef.current = text.length;
    if (onComplete) {
      onComplete();
    }
  }, [text, onComplete]);

  // 处理文本流式渲染
  useEffect(() => {
    if (!enabled || isPaused || isComplete) return;

    // 如果文本为空，直接标记为完成
    if (!text) {
      setIsComplete(true);
      return;
    }

    // 重置状态
    restart();

    // 添加初始延迟
    const delayTimeout = setTimeout(() => {
      // 设置定时器，逐字显示文本
      intervalIdRef.current = window.setInterval(() => {
        if (currentIndexRef.current < text.length) {
          const nextChar = text[currentIndexRef.current];
          setVisibleText(prev => prev + nextChar);
          currentIndexRef.current++;
        } else {
          // 完成渲染
          if (intervalIdRef.current) {
            window.clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
          }
          setIsComplete(true);
          if (onComplete) {
            onComplete();
          }
        }
      }, getTypingInterval());
    }, delay);

    // 清理函数
    return () => {
      clearTimeout(delayTimeout);
      if (intervalIdRef.current) {
        window.clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [text, enabled, isPaused, delay, getTypingInterval, onComplete, restart]);

  // 文本变化时重置
  useEffect(() => {
    restart();
  }, [text, restart]);

  // 计算进度
  const progress = text ? (visibleText.length / text.length) * 100 : 100;

  return {
    visibleText,
    isComplete,
    progress,
    restart,
    pause,
    resume,
    complete
  };
}
