// types.ts - 核心类型定义
export interface LazyLoaderOptions {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
  onLoad?: (element: HTMLElement, status: 'success' | 'error') => void;
  onError?: (element: HTMLElement, error: Error, url: string) => void;
  onEnter?: (element: HTMLElement, eventType: 'enter') => void; // 元素进入视口
  onExit?: (element: HTMLElement, eventType: 'exit', duration: number) => void; // 元素离开视口
  maxRetry?: number; // 加载失败重试次数
  retryDelay?: number;
  resourceHandlers?: ResourceHandlers; // 自定义资源处理器
}

export interface ResourceHandlers {
  image?: (element: HTMLImageElement, url: string) => Promise<void>;
  component?: (element: HTMLElement, url: string) => Promise<void>;
  video?: (element: HTMLVideoElement, url: string) => Promise<void>;
  default?: (element: HTMLElement, url: string) => Promise<void>;
}

export type LazyState = 'pending' | 'loading' | 'loaded' | 'error' | 'retrying';

// LazyLoader.ts - 核心实现
export class LazyLoader {
  public static DEFAULTS: LazyLoaderOptions = {
    root: null,
    rootMargin: '200px',
    threshold: 0.01,
    onLoad: undefined,
    onError: undefined,
    onEnter: undefined,
    onExit: undefined,
    maxRetry: 2,
    retryDelay: 1000,
    resourceHandlers: {},
  };

  private options: LazyLoaderOptions;
  private selector: string;
  private observer: IntersectionObserver | null = null;
  private elements: Set<HTMLElement> = new Set();
  private retryCount: WeakMap<HTMLElement, number> = new WeakMap();
  private scrollHandler: (() => void) | null = null;

  constructor(selector: string, options: LazyLoaderOptions = {}) {
    this.selector = selector;
    this.options = { ...LazyLoader.DEFAULTS, ...options };
    this.init();
  }

  private init(): void {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver not supported, falling back to scroll event');
      this.initScrollFallback();
      return;
    }

    try {
      this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
        root: this.options.root,
        rootMargin: this.options.rootMargin,
        threshold: this.options.threshold,
      });
      this.observeElements();
    } catch (error) {
      console.error('Failed to initialize IntersectionObserver:', error);
      this.initScrollFallback();
    }
  }

  private observeElements(): void {
    const targets: NodeListOf<HTMLElement> = document.querySelectorAll(this.selector);
    targets.forEach((element: HTMLElement) => {
      if (element.dataset.loaded === 'true') return;
      this.observer?.observe(element);
      this.elements.add(element);
      element.dataset.lazyState = 'pending';
    });
  }

  private handleIntersect(entries: IntersectionObserverEntry[]): void {
    entries.forEach((entry: IntersectionObserverEntry) => {
      const target = entry.target as HTMLElement;
      if (entry.isIntersecting) {
        this.handleEnterViewport(target);
        if (target.dataset.lazyState === 'pending') {
          this.loadResource(target);
        }
      } else {
        this.handleExitViewport(target);
      }
    });
  }

  private handleEnterViewport(element: HTMLElement): void {
    element.dataset.lastEntered = Date.now().toString();
    try {
      this.options.onEnter?.(element, 'enter');
    } catch (error) {
      console.error('Error in onEnter callback:', error);
    }
  }

  private handleExitViewport(element: HTMLElement): void {
    const enterTime = parseInt(element.dataset.lastEntered || '0', 10);
    if (enterTime > 0) {
      const duration = Date.now() - enterTime;
      try {
        this.options.onExit?.(element, 'exit', duration);
      } catch (error) {
        console.error('Error in onExit callback:', error);
      }
    }
  }

  private async loadResource(element: HTMLElement): Promise<void> {
    const resourceUrl = element.dataset.src;
    if (!resourceUrl) {
      this.handleLoadError(element, new Error('No data-src attribute found'), '');
      return;
    }

    try {
      element.dataset.lazyState = 'loading';
      if (element instanceof HTMLImageElement) {
        await this.loadImage(element, resourceUrl);
      } else if (element.dataset.component) {
        await this.loadComponent(element, resourceUrl);
      } else if (element instanceof HTMLVideoElement) {
        await this.loadVideo(element, resourceUrl);
      } else {
        await this.loadGenericResource(element, resourceUrl);
      }
      element.dataset.lazyState = 'loaded';
      element.dataset.loaded = 'true';
      this.options.onLoad?.(element, 'success');
      this.observer?.unobserve(element);
      this.elements.delete(element);
    } catch (error) {
      await this.handleLoadError(element, error as Error, resourceUrl);
    }
  }

  private loadImage(element: HTMLImageElement, url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        element.src = url;
        element.classList.add('lazy-loaded');
        resolve();
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  private async loadComponent(element: HTMLElement, url: string): Promise<void> {
    if (this.options.resourceHandlers?.component) {
      return this.options.resourceHandlers.component(element, url);
    }
    // 默认组件加载逻辑：动态导入JS模块
    try {
      const module = await import(/* webpackIgnore: true */ url);
      if (module.default) {
        element.innerHTML = '';
        if (typeof module.default === 'string') {
          element.innerHTML = module.default;
        } else if (module.default instanceof HTMLElement) {
          element.appendChild(module.default);
        }
      }
    } catch (error) {
      throw new Error(`Failed to load component from ${url}: ${error}`);
    }
  }

  private loadVideo(element: HTMLVideoElement, url: string): Promise<void> {
    if (this.options.resourceHandlers?.video) {
      return this.options.resourceHandlers.video(element, url);
    }
    return new Promise((resolve, reject) => {
      element.src = url;
      element.load();
      element.onloadeddata = () => resolve();
      element.onerror = reject;
    });
  }

  private loadGenericResource(element: HTMLElement, url: string): Promise<void> {
    if (this.options.resourceHandlers?.default) {
      return this.options.resourceHandlers.default(element, url);
    }
    // 默认使用fetch获取内容并插入
    return fetch(url)
      .then((response) => response.text())
      .then((html) => {
        element.innerHTML = html;
      });
  }

  private async handleLoadError(element: HTMLElement, error: Error, url: string): Promise<void> {
    element.dataset.lazyState = 'error';
    console.error(`Failed to load resource: ${url}`, error);
    const currentRetry = this.retryCount.get(element) || 0;
    if (currentRetry < (this.options.maxRetry ?? 2)) {
      this.retryCount.set(element, currentRetry + 1);
      setTimeout(() => {
        if (this.elements.has(element)) {
          element.dataset.lazyState = 'retrying';
          this.loadResource(element);
        }
      }, this.options.retryDelay);
    } else {
      this.options.onError?.(element, error, url);
      if (element instanceof HTMLImageElement) {
        element.alt = '加载失败';
        element.classList.add('lazy-error');
      }
    }
  }

  private initScrollFallback(): void {
    let ticking = false;
    this.scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.checkElementsInViewport();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    window.addEventListener('resize', this.scrollHandler, { passive: true });
    this.checkElementsInViewport();
  }

  private checkElementsInViewport(): void {
    this.elements.forEach((element) => {
      if (this.isInViewport(element)) {
        this.loadResource(element);
      }
    });
  }

  private isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    const buffer = 200; // 预加载缓冲
    return (
      rect.top <= (window.innerHeight || document.documentElement.clientHeight) + buffer &&
      rect.bottom >= 0 &&
      rect.left <= (window.innerWidth || document.documentElement.clientWidth) &&
      rect.right >= 0
    );
  }

  public addElement(element: HTMLElement): void {
    if (this.observer) {
      this.observer.observe(element);
    } else if (this.scrollHandler) {
      this.elements.add(element);
    }
  }

  public triggerLoad(element: HTMLElement): void {
    if (this.elements.has(element)) {
      this.loadResource(element);
    }
  }

  public destroy(): void {
    this.observer?.disconnect();
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
      window.removeEventListener('resize', this.scrollHandler);
    }
    this.elements.clear();
  }
}