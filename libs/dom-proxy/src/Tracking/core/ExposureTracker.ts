import type { ITrackerConfig, IExposureEvent, IExposureOptions } from '../types/tracking';

/**
 * 曝光追踪器
 * 使用 Intersection Observer API 监听元素是否进入视口
 * @method init 初始化 Intersection Observer
 * @method handleIntersection 处理元素交叉事件
 * @method handleExposure 处理曝光事件
 * @method addElement 添加需要跟踪曝光的元素
 * @method addElements 批量添加需要跟踪曝光的元素
 * @method removeElement 移除元素跟踪
 * @method isInBlacklist 检查元素是否在黑名单中
 * @method calculateVisibleRatio 计算元素可见比例
 * @method getElementCategory 获取元素分类
 * @method getElementPath 获取元素路径
 * @method getElementContent 获取元素内容
 * @method destroy 销毁清理
 */
export class ExposureTracker {
  /** Intersection Observer 实例 */
  private observer: IntersectionObserver | null = null;

  /** 已观察元素映射表 */
  private observedElements: Map<Element, {
    eventData: Partial<IExposureEvent>;
    options: { once: boolean };
    startTime?: number;
  }> = new Map();

  /** 配置项 */
  private config: ITrackerConfig;

  /** 回调函数 */
  private onExposure: (event: IExposureEvent) => void;

  /**
   * 构造函数
   * @param config 配置项
   * @param onExposure 曝光回调
   */
  constructor(
    config: ITrackerConfig,
    onExposure: (event: IExposureEvent) => void
  ) {
    this.config = config;
    this.onExposure = onExposure;
    this.init();
  }

  /**
   * 初始化 Intersection Observer
   */
  private init(): void {
    try {
      // 初始化 Intersection Observer
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        {
          threshold: this.config.exposureThreshold || 0.5, // 元素可见比例阈值
          rootMargin: '0px',
        }
      );

      if (this.config.debug) {
        console.log('[ExposureTracker] 初始化成功');
      }
    } catch (error) {
      console.error('[ExposureTracker] 初始化失败:', error);
    }
  }

  /**
   * 处理元素交叉事件
   * @param entries 交叉条目
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry) => {
      const element = entry.target as HTMLElement;
      const data = this.observedElements.get(element);

      if (!data) return;

      // 元素进入视口
      if (entry.isIntersecting) {
        // 记录曝光开始时间
        if (!data.startTime) {
          data.startTime = Date.now();
        }
        this.handleExposure(element, entry, data);
      } else if (data.startTime) {
        // 元素离开视口，重置开始时间
        data.startTime = undefined;
      }
    });
  }

  /**
   * 处理曝光事件
   * @param element 目标元素
   * @param entry 交叉条目
   * @param data 元素数据
   */
  private handleExposure(
    element: HTMLElement,
    entry: IntersectionObserverEntry,
    data: { eventData: Partial<IExposureEvent>; options: { once: boolean }; startTime?: number }
  ): void {
    // 计算曝光时长和可见比例
    const exposureEvent: IExposureEvent = {
      ...data.eventData,
      eventType: 'exposure',
      eventAction: data.eventData.eventAction || 'view',
      eventCategory: data.eventData.eventCategory || this.getElementCategory(element),
      timestamp: Date.now(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      elementPath: this.getElementPath(element),
      elementType: element.tagName.toLowerCase(),
      elementContent: this.getElementContent(element),
      exposureDuration: data.startTime ? Date.now() - data.startTime : 0,
      visibleRatio: this.calculateVisibleRatio(entry),
    } as IExposureEvent;

    // 发送曝光事件
    this.onExposure(exposureEvent);

    // 如果是一次性曝光，则移除观察
    if (data.options.once) {
      this.removeElement(element);
    }
  }

  /**
   * 添加需要跟踪曝光的元素
   * @param options 曝光配置
   */
  public addElement(options: IExposureOptions): void {
    if (!this.observer) {
      console.error('[ExposureTracker] Observer未初始化');
      return;
    }

    // 获取目标元素
    const element = typeof options.element === 'string'
      ? document.querySelector(options.element) as HTMLElement
      : options.element;

    if (!element) {
      console.error('[ExposureTracker] 未找到目标元素:', options.element);
      return;
    }

    // 检查元素是否在黑名单中
    if (this.isInBlacklist(element)) {
      if (this.config.debug) {
        console.log('[ExposureTracker] 元素在黑名单中，忽略:', element);
      }
      return;
    }

    // 默认配置
    const defaultOptions = {
      once: true,
      threshold: this.config.exposureThreshold || 0.5
    };

    // 合并配置
    const mergedOptions = {
      ...defaultOptions,
      ...options
    };

    // 存储元素数据
    this.observedElements.set(element, {
      eventData: options.eventData,
      options: {
        once: mergedOptions.once !== false
      }
    });

    // 开始观察元素
    this.observer.observe(element);

    if (this.config.debug) {
      console.log('[ExposureTracker] 添加曝光元素:', element, options);
    }
  }

  /**
   * 批量添加需要跟踪曝光的元素
   * @param selector CSS选择器
   * @param eventData 事件数据
   * @param options 配置项
   */
  public addElements(
    selector: string,
    eventData: Partial<IExposureEvent>,
    options: { once?: boolean } = {}
  ): void {
    const elements = document.querySelectorAll(selector);

    if (elements.length === 0 && this.config.debug) {
      console.warn('[ExposureTracker] 未找到匹配元素:', selector);
    }

    elements.forEach((element) => {
      this.addElement({
        element: element as HTMLElement,
        eventData,
        ...options
      });
    });
  }

  /**
   * 移除元素跟踪
   * @param element 目标元素
   */
  public removeElement(element: HTMLElement): void {
    if (!this.observer) return;

    this.observer.unobserve(element);
    this.observedElements.delete(element);

    if (this.config.debug) {
      console.log('[ExposureTracker] 移除曝光元素:', element);
    }
  }

  /**
   * 检查元素是否在黑名单中
   * @param element 目标元素
   * @returns 是否在黑名单中
   */
  private isInBlacklist(element: HTMLElement): boolean {
    if (!this.config.blackList || this.config.blackList.length === 0) return false;

    return this.config.blackList.some(selector => {
      try {
        return element.matches(selector);
      } catch (e) {
        console.error('[ExposureTracker] 无效的选择器:', selector, e);
        return false;
      }
    });
  }

  /**
   * 计算元素可见比例
   * @param entry 交叉条目
   * @returns 可见比例
   */
  private calculateVisibleRatio(entry: IntersectionObserverEntry): number {
    return Math.round(entry.intersectionRatio * 100) / 100;
  }

  /**
   * 获取元素分类
   * @param element 目标元素
   * @returns 元素分类
   */
  private getElementCategory(element: HTMLElement): string {
    // 根据元素特征判断分类
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      return element.tagName.toLowerCase();
    }

    if (element.id && element.id.includes('banner')) return 'banner';
    if (element.classList.contains('ant-btn')) return 'button';
    if (element.classList.contains('ant-card')) return 'card';
    if (element.classList.contains('ant-modal')) return 'modal';

    // 使用data属性
    const category = element.getAttribute('data-tracking-category');
    if (category) return category;

    return element.tagName.toLowerCase();
  }

  /**
   * 获取元素路径
   * @param element 目标元素
   * @returns 元素路径
   */
  private getElementPath(element: HTMLElement): string {
    const path: string[] = [];
    let current: Element | null = element;
    let maxDepth = 5; // 限制路径深度

    while (current && current !== document.body && maxDepth > 0) {
      let selector = current.tagName.toLowerCase();

      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break; // ID是唯一的，可以直接结束
      } else if (current.className && typeof current.className === 'string') {
        const classes = current.className.trim().split(/\s+/);
        if (classes.length > 0) {
          selector += `.${classes[0]}`;
        }
      }

      path.unshift(selector);
      current = current.parentElement;
      maxDepth--;
    }

    return path.join(' > ');
  }

  /**
   * 获取元素内容
   * @param element 目标元素
   * @returns 元素内容
   */
  private getElementContent(element: HTMLElement): string {
    // 优先使用data属性
    const content = element.getAttribute('data-tracking-content');
    if (content) return content;

    // 然后使用文本内容
    if (element.textContent) {
      const text = element.textContent.trim();
      return text.length > 100 ? text.substring(0, 97) + '...' : text;
    }

    // 最后使用alt或title属性
    return element.getAttribute('alt') ||
           element.getAttribute('title') ||
           element.getAttribute('value') ||
           '';
  }

  /**
   * 销毁清理
   */
  public destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    this.observedElements.clear();

    if (this.config.debug) {
      console.log('[ExposureTracker] 已销毁');
    }
  }
}
