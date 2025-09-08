import { PerformanceMonitor, PerformanceJankStutter } from 'perfor-monitor';
import { PerformanceData, MessageType } from '../../types';

/**
 * 性能监控消息类型别名
 * 使用全局 MessageType 中的性能相关消息类型
 */
export enum  PerforMessageType {
  START_PERFORMANCE_MONITOR = MessageType.START_PERFORMANCE_MONITOR,
  STOP_PERFORMANCE_MONITOR = MessageType.STOP_PERFORMANCE_MONITOR,
  GET_PERFORMANCE_DATA = MessageType.GET_PERFORMANCE_DATA,
  RESET_PERFORMANCE_MONITOR = MessageType.RESET_PERFORMANCE_MONITOR
}

/**
 * 可视化性能监控类
 * 封装了 PerformanceMonitor 和 PerformanceJankStutter 功能
 * 用于在浏览器扩展中监控页面性能
 */
export class VisPerformanceMonitor {
  private insPerformanceJankStutter: PerformanceJankStutter;
  private insPerformanceMonitor: PerformanceMonitor;
  private monitoringActive: boolean = false;
  private lastPerformanceData: PerformanceData | null = null;

  constructor() {
    this.insPerformanceJankStutter = new PerformanceJankStutter();

    // 创建性能监控实例并配置
    this.insPerformanceMonitor = new PerformanceMonitor({
      appId: 'web-swiss-knife',
      reportUrl: '', // 在浏览器扩展中不需要远程上报，设为空字符串
      debug: false,
      isDev: false,
      warnings: {
        FCP: 1800, // ≤1.8秒（优秀）
        LCP: 2500, // ≤2.5秒（优秀）
        TTI: 5000, // ≤5秒（优秀）
        FID: 100,  // ≤100ms（优秀）
        INP: 200,  // ≤200ms（优秀）
        CLS: 0.1,  // ≤0.1（优秀）
      },
      pageInfo: {
        pageUrl: '',
        pageTitle: '',
        routeId: 'initial'
      }
    });
  }

  /**
   * 处理来自扩展的消息
   * @param type 消息类型
   * @param payload 消息负载
   * @param sender 发送者信息
   * @param sendResponse 回调函数
   */
  async handleMessage(type: MessageType, payload: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    try {
      switch (type) {
        case MessageType.START_PERFORMANCE_MONITOR:
          await this.startMonitoring(sender.url || '', sender.tab?.title || '');
          sendResponse({ status: 'success', message: '性能监控已启动' });
          break;

        case MessageType.STOP_PERFORMANCE_MONITOR:
          await this.stopMonitoring();
          sendResponse({ status: 'success', message: '性能监控已停止' });
          break;

        case MessageType.GET_PERFORMANCE_DATA:
          const data = await this.getPerformanceData();
          sendResponse({ status: 'success', data });
          break;

        case MessageType.RESET_PERFORMANCE_MONITOR:
          await this.resetMonitoring(sender.url || '', sender.tab?.title || '');
          sendResponse({ status: 'success', message: '性能监控已重置' });
          break;

        default:
          sendResponse({ status: 'error', message: '未知的性能监控消息类型' });
          break;
      }
    } catch (error) {
      console.error('性能监控处理消息出错:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      sendResponse({ status: 'error', message: `处理性能监控消息出错: ${errorMessage}` });
    }
  }

  /**
   * 开始监控页面性能
   * @param url 页面URL
   * @param title 页面标题
   */
  private async startMonitoring(url: string, title: string): Promise<void> {
    if (this.monitoringActive) {
      console.log('性能监控已经在运行中');
      return;
    }

    // 更新页面信息
    this.updatePageInfo(url, title);

    // 启动性能监控
    this.insPerformanceMonitor.start();
    this.insPerformanceJankStutter.startMonitoring();
    this.monitoringActive = true;

    console.log(`已开始监控页面性能: ${url}`);
  }

  /**
   * 停止监控页面性能
   */
  private async stopMonitoring(): Promise<void> {
    if (!this.monitoringActive) {
      return;
    }

    // 生成报告
    if (!this.insPerformanceMonitor.isReported) {
      this.insPerformanceMonitor.report();
    }

    // 停止监控
    this.insPerformanceMonitor.dispose();
    this.insPerformanceJankStutter.stopMonitoring();
    this.monitoringActive = false;

    console.log('已停止性能监控');
  }

  /**
   * 重置性能监控
   * @param url 新页面URL
   * @param title 新页面标题
   */
  private async resetMonitoring(url: string, title: string): Promise<void> {
    await this.stopMonitoring();

    // 重新创建监控实例
    this.insPerformanceMonitor = new PerformanceMonitor({
      appId: 'web-swiss-knife',
      reportUrl: '', // 在浏览器扩展中不需要远程上报，设为空字符串
      debug: false,
      isDev: false,
      warnings: {
        FCP: 1800,
        LCP: 2500,
        TTI: 5000,
        FID: 100,
        INP: 200,
        CLS: 0.1,
      },
      pageInfo: {
        pageUrl: url,
        pageTitle: title,
        routeId: 'initial'
      }
    });

    await this.startMonitoring(url, title);
  }

  /**
   * 获取性能数据
   * @returns 性能数据对象
   */
  private async getPerformanceData(): Promise<PerformanceData> {
    // 如果监控未启动，返回最后一次的数据或空数据
    if (!this.monitoringActive) {
      return this.lastPerformanceData || this.createEmptyPerformanceData();
    }

    // 从PerformanceMonitor获取核心指标
    const metrics = this.insPerformanceMonitor['metrics'];

    // 创建性能数据对象
    const performanceData: PerformanceData = {
      url: this.insPerformanceMonitor['config'].pageInfo.pageUrl,
      timestamp: Date.now(),
      fcp: metrics.FCP || 0,
      lcp: metrics.LCP || 0,
      fid: metrics.FID || 0,
      cls: metrics.CLS || 0,
      ttfb: metrics.TTFB || 0
    };

    // 保存最后一次的性能数据
    this.lastPerformanceData = performanceData;

    return performanceData;
  }

  /**
   * 创建空的性能数据对象
   * @returns 空的性能数据对象
   */
  private createEmptyPerformanceData(): PerformanceData {
    return {
      url: '',
      timestamp: Date.now(),
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0,
      ttfb: 0
    };
  }

  /**
   * 更新页面信息
   * @param url 页面URL
   * @param title 页面标题
   */
  private updatePageInfo(url: string, title: string): void {
    if (this.insPerformanceMonitor && this.insPerformanceMonitor['config']) {
      this.insPerformanceMonitor['config'].pageInfo = {
        pageUrl: url,
        pageTitle: title,
        routeId: 'initial'
      };
    }
  }
}