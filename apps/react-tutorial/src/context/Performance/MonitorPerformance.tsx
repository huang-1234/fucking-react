import React, { useEffect, useRef } from 'react';
import { PerformanceMonitor, PerformanceJankStutter } from 'perfor-monitor';

export function useMonitorPerformance() {
  const refPerformanceMonitor = useRef<PerformanceMonitor | null>(null)
  useEffect(() => {
    // 初始化性能监控
    refPerformanceMonitor.current = new PerformanceMonitor({
      appId: 'react-tutorial',
      reportUrl: '/api/performance',
      debug: true,
      isDev: process.env.NODE_ENV !== 'production',
      warnings: {
        LCP: 1500,
        FID: 100,
        INP: 0.1,
        CLS: 0.1,
        FCP: 1000,
        TTI: 2000,
      },
    });

    refPerformanceMonitor.current.start();

    // 初始化卡顿监控
    const jankMonitor = new PerformanceJankStutter();
    jankMonitor.startMonitoring();

    // 组件卸载时清理
    return () => {
      refPerformanceMonitor.current?.dispose();
      jankMonitor.stopMonitoring();
    };
  }, []);

  return {
    performanceMonitor: refPerformanceMonitor.current as PerformanceMonitor
  }
}

export default useMonitorPerformance;