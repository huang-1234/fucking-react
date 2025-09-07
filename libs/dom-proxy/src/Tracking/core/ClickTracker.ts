import type { ITrackerConfig, IClickEvent, ILongPressEvent } from '../types/tracking';

/**
 * 点击事件追踪器
 * 使用事件代理全局监听点击事件
 * @method init 初始化事件监听
 * @method handleClick 处理点击事件
 * @method handlePressIn 处理按下事件
 * @method handlePressOut 处理释放事件
 * @method handlePressCancel 处理取消事件
 * @method handleBeforeUnload 页面卸载前处理
 * @method getElementCategory 获取元素分类
 * @method getElementLabel 获取元素标签
 * @method getElementPath 获取元素路径
 * @method getElementContent 获取元素内容
 * @method isInBlacklist 检查元素是否在黑名单中
 * @method createEventProxy 创建事件代理
 * @method destroy 销毁清理
 */
export class ClickTracker {
  /** 配置项 */
  private config: ITrackerConfig;

  /** 按下元素映射表 */
  private pressedElements: Map<HTMLElement, {
    startTime: number;
    position: { x: number; y: number };
  }> = new Map();

  /** 点击回调函数 */
  private onClick: (event: IClickEvent) => void;

  /** 长按回调函数 */
  private onLongPress: (event: ILongPressEvent) => void;

  /** 是否已初始化 */
  private initialized = false;

  /**
   * 构造函数
   * @param config 配置项
   * @param onClick 点击回调
   * @param onLongPress 长按回调
   */
  constructor(
    config: ITrackerConfig,
    onClick: (event: IClickEvent) => void,
    onLongPress: (event: ILongPressEvent) => void
  ) {
    this.config = config;
    this.onClick = onClick;
    this.onLongPress = onLongPress;
    this.init();
  }

  /**
   * 初始化事件监听
   */
  private init(): void {
    if (this.initialized) return;

    try {
      // 全局事件监听
      document.addEventListener('click', this.handleClick.bind(this), true);
      document.addEventListener('mousedown', this.handlePressIn.bind(this), true);
      document.addEventListener('mouseup', this.handlePressOut.bind(this), true);
      document.addEventListener('touchstart', this.handlePressIn.bind(this), true);
      document.addEventListener('touchend', this.handlePressOut.bind(this), true);
      document.addEventListener('touchcancel', this.handlePressCancel.bind(this), true);

      // 处理页面离开时清理
      window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));

      this.initialized = true;

      if (this.config.debug) {
        console.log('[ClickTracker] 初始化成功');
      }
    } catch (error) {
      console.error('[ClickTracker] 初始化失败:', error);
    }
  }

  /**
   * 处理点击事件
   * @param event 鼠标事件
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // 检查是否启用自动点击追踪
    if (this.config.autoTrackClicks === false) return;

    // 检查元素是否在黑名单中
    if (this.isInBlacklist(target)) return;

    // 采样控制
    if (Math.random() > (this.config.samplingRate || 1)) return;

    const clickEvent: IClickEvent = {
      eventType: 'click',
      eventCategory: this.getElementCategory(target),
      eventAction: 'click',
      eventLabel: this.getElementLabel(target),
      timestamp: Date.now(),
      pageUrl: window.location.href,
      pageTitle: document.title,
      referrer: document.referrer,
      elementPath: this.getElementPath(target),
      elementType: target.tagName.toLowerCase(),
      elementContent: this.getElementContent(target),
      clickX: event.clientX,
      clickY: event.clientY,
    };

    // 发送点击事件
    this.onClick(clickEvent);

    if (this.config.debug) {
      console.log('[ClickTracker] 点击事件:', clickEvent);
    }
  }

  /**
   * 处理按下事件（onPressIn）
   * @param event 鼠标/触摸事件
   */
  private handlePressIn(event: MouseEvent | TouchEvent): void {
    const target = event.target as HTMLElement;

    // 检查是否启用自动点击追踪
    if (this.config.autoTrackClicks === false) return;

    // 检查元素是否在黑名单中
    if (this.isInBlacklist(target)) return;

    // 获取点击位置
    let position = { x: 0, y: 0 };

    if (event instanceof MouseEvent) {
      position = { x: event.clientX, y: event.clientY };
    } else if (event instanceof TouchEvent && event.touches.length > 0) {
      position = { x: event.touches[0].clientX, y: event.touches[0].clientY };
    }

    // 记录按下时间和位置
    this.pressedElements.set(target, {
      startTime: Date.now(),
      position
    });
  }

  /**
   * 处理释放事件（onPressOut）
   * @param event 鼠标/触摸事件
   */
  private handlePressOut(event: MouseEvent | TouchEvent): void {
    const target = event.target as HTMLElement;
    const pressData = this.pressedElements.get(target);

    if (!pressData) return;

    const pressDuration = Date.now() - pressData.startTime;
    const longPressThreshold = this.config.longPressThreshold || 500;

    // 获取释放位置
    let position = { x: 0, y: 0 };

    if (event instanceof MouseEvent) {
      position = { x: event.clientX, y: event.clientY };
    } else if (event instanceof TouchEvent && event.changedTouches.length > 0) {
      position = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
    }

    // 判断是否为长按
    if (pressDuration >= longPressThreshold) {
      const longPressEvent: ILongPressEvent = {
        eventType: 'longpress',
        eventCategory: this.getElementCategory(target),
        eventAction: 'longpress',
        eventLabel: this.getElementLabel(target),
        timestamp: Date.now(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        referrer: document.referrer,
        elementPath: this.getElementPath(target),
        elementType: target.tagName.toLowerCase(),
        elementContent: this.getElementContent(target),
        clickX: position.x,
        clickY: position.y,
        pressDuration,
      };

      // 发送长按事件
      this.onLongPress(longPressEvent);

      if (this.config.debug) {
        console.log('[ClickTracker] 长按事件:', longPressEvent);
      }
    }

    // 清理数据
    this.pressedElements.delete(target);
  }

  /**
   * 处理取消事件（触摸取消）
   * @param event 触摸事件
   */
  private handlePressCancel(event: TouchEvent): void {
    const target = event.target as HTMLElement;
    this.pressedElements.delete(target);
  }

  /**
   * 页面卸载前处理
   */
  private handleBeforeUnload(): void {
    // 清理所有数据
    this.pressedElements.clear();
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

    if (element.id && element.id.includes('btn')) return 'button';
    if (element.classList.contains('ant-btn')) return 'button';
    if (element.classList.contains('ant-checkbox')) return 'checkbox';
    if (element.classList.contains('ant-radio')) return 'radio';

    // 使用data属性
    const category = element.getAttribute('data-tracking-category');
    if (category) return category;

    return element.tagName.toLowerCase();
  }

  /**
   * 获取元素标签
   * @param element 目标元素
   * @returns 元素标签
   */
  private getElementLabel(element: HTMLElement): string {
    // 优先使用data属性
    const label = element.getAttribute('data-tracking-label');
    if (label) return label;

    // 然后使用aria标签
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;

    // 最后使用文本内容
    const text = element.textContent?.trim();
    if (text) return text.substring(0, 50);

    return '';
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
        console.error('[ClickTracker] 无效的选择器:', selector, e);
        return false;
      }
    });
  }

  /**
   * 创建事件代理
   * @param target 目标对象
   * @param eventName 事件名称
   * @param customData 自定义数据
   * @returns 代理处理函数
   */
  public createEventProxy<T extends Function>(
    target: T,
    eventName: string,
    customData: Record<string, unknown> = {}
  ): T {
    const self = this;

    // 创建代理函数
    const proxyHandler = function(this: any, ...args: any[]) {
      // 获取事件对象（如果有）
      const event = args[0] instanceof Event ? args[0] : undefined;

      // 构建点击事件数据
      const clickEvent: IClickEvent = {
        eventType: 'click',
        eventCategory: customData.category as string || 'custom',
        eventAction: eventName,
        eventLabel: customData.label as string || '',
        timestamp: Date.now(),
        pageUrl: window.location.href,
        pageTitle: document.title,
        ...customData
      };

      // 如果有事件对象，添加点击位置
      if (event && 'clientX' in event && 'clientY' in event) {
        clickEvent.clickX = (event as MouseEvent).clientX;
        clickEvent.clickY = (event as MouseEvent).clientY;
      }

      // 发送点击事件
      self.onClick(clickEvent);

      if (self.config.debug) {
        console.log(`[ClickTracker] 代理事件 ${eventName}:`, clickEvent);
      }

      // 调用原始函数
      return target.apply(this, args);
    };

    return proxyHandler as unknown as T;
  }

  /**
   * 销毁清理
   */
  public destroy(): void {
    if (!this.initialized) return;

    document.removeEventListener('click', this.handleClick.bind(this), true);
    document.removeEventListener('mousedown', this.handlePressIn.bind(this), true);
    document.removeEventListener('mouseup', this.handlePressOut.bind(this), true);
    document.removeEventListener('touchstart', this.handlePressIn.bind(this), true);
    document.removeEventListener('touchend', this.handlePressOut.bind(this), true);
    document.removeEventListener('touchcancel', this.handlePressCancel.bind(this), true);

    window.removeEventListener('beforeunload', this.handleBeforeUnload.bind(this));

    this.pressedElements.clear();
    this.initialized = false;

    if (this.config.debug) {
      console.log('[ClickTracker] 已销毁');
    }
  }
}
