/**
 * 图片性能优化SDK
 * 提供图片懒加载和裁切功能
 */

// 防抖函数
export const debounce = <F extends (...args: any[]) => any>(
  func: F,
  wait: number
): ((...args: Parameters<F>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<F>) {
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => func(...args), wait);
  };
};

// 图片懒加载相关功能
export const lazyLoad = {
  /**
   * 使用Intersection Observer API实现懒加载
   * @param element 要观察的DOM元素
   * @param callback 元素进入视口时的回调函数
   * @param options IntersectionObserver选项
   * @returns 清理函数
   */
  observeWithIO: (
    element: HTMLElement,
    callback: (entry: IntersectionObserverEntry) => void,
    options: IntersectionObserverInit = { threshold: 0.01, rootMargin: '20%' }
  ): (() => void) => {
    if (!('IntersectionObserver' in window)) {
      console.warn('IntersectionObserver API不可用，降级为滚动监听');
      return lazyLoad.observeWithScroll(element, () => callback({
        target: element,
        isIntersecting: true,
      } as unknown as IntersectionObserverEntry));
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry);
          observer.unobserve(entry.target);
        }
      });
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  },

  /**
   * 使用滚动事件实现懒加载（兼容性方案）
   * @param element 要观察的DOM元素
   * @param callback 元素进入视口时的回调函数
   * @returns 清理函数
   */
  observeWithScroll: (
    element: HTMLElement,
    callback: (entry: { target: HTMLElement, isIntersecting: boolean }) => void
  ): (() => void) => {
    const checkVisibility = debounce(() => {
      const rect = element.getBoundingClientRect();
      const viewHeight = window.innerHeight;
      const isVisible = rect.top < viewHeight && rect.bottom > 0;

      if (isVisible) {
        callback({ target: element, isIntersecting: true });
        window.removeEventListener('scroll', checkVisibility);
        window.removeEventListener('resize', checkVisibility);
      }
    }, 200);

    window.addEventListener('scroll', checkVisibility);
    window.addEventListener('resize', checkVisibility);

    // 初始检查一次
    checkVisibility();

    return () => {
      window.removeEventListener('scroll', checkVisibility);
      window.removeEventListener('resize', checkVisibility);
    };
  },

  /**
   * 预加载图片
   * @param urls 要预加载的图片URL数组
   * @returns Promise，解析为已加载的图片URL数组
   */
  preloadImages: (urls: string[]): Promise<string[]> => {
    const promises = urls.map(url => {
      return new Promise<string>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
        img.src = url;
      });
    });

    return Promise.all(promises);
  }
};

// 图片裁切相关功能
export const imageCrop = {
  /**
   * 使用Canvas API裁剪图片
   * @param imageElement 图片元素或图片URL
   * @param cropOptions 裁剪选项
   * @returns Promise，解析为裁剪后的图片DataURL
   */
  cropWithCanvas: async (
    imageElement: HTMLImageElement | string,
    cropOptions: { x: number, y: number, width: number, height: number }
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        let img: HTMLImageElement;

        if (typeof imageElement === 'string') {
          img = new Image();
          img.crossOrigin = 'anonymous';

          await new Promise((resolveImg, rejectImg) => {
            img.onload = resolveImg;
            img.onerror = rejectImg;
            img.src = imageElement;
          });
        } else {
          img = imageElement;
        }

        const { x, y, width, height } = cropOptions;

        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // 绘制裁剪区域
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('无法获取Canvas 2D上下文');
        }

        ctx.drawImage(img, x, y, width, height, 0, 0, width, height);

        // 转换为DataURL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * 调整图片大小
   * @param imageElement 图片元素或图片URL
   * @param dimensions 目标尺寸
   * @returns Promise，解析为调整大小后的图片DataURL
   */
  resize: async (
    imageElement: HTMLImageElement | string,
    dimensions: { width: number, height: number }
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        let img: HTMLImageElement;

        if (typeof imageElement === 'string') {
          img = new Image();
          img.crossOrigin = 'anonymous';

          await new Promise((resolveImg, rejectImg) => {
            img.onload = resolveImg;
            img.onerror = rejectImg;
            img.src = imageElement;
          });
        } else {
          img = imageElement;
        }

        const { width, height } = dimensions;

        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        // 绘制调整大小后的图片
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('无法获取Canvas 2D上下文');
        }

        ctx.drawImage(img, 0, 0, width, height);

        // 转换为DataURL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * 压缩图片
   * @param imageElement 图片元素或图片URL
   * @param quality 压缩质量（0-1）
   * @returns Promise，解析为压缩后的图片DataURL
   */
  compress: async (
    imageElement: HTMLImageElement | string,
    quality: number = 0.7
  ): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        let img: HTMLImageElement;

        if (typeof imageElement === 'string') {
          img = new Image();
          img.crossOrigin = 'anonymous';

          await new Promise((resolveImg, rejectImg) => {
            img.onload = resolveImg;
            img.onerror = rejectImg;
            img.src = imageElement;
          });
        } else {
          img = imageElement;
        }

        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制图片
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('无法获取Canvas 2D上下文');
        }

        ctx.drawImage(img, 0, 0);

        // 转换为DataURL，使用指定质量
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * 将DataURL转换为Blob对象
   * @param dataUrl 图片DataURL
   * @returns Blob对象
   */
  dataUrlToBlob: (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  },

  /**
   * 下载图片
   * @param dataUrl 图片DataURL
   * @param fileName 文件名
   */
  downloadImage: (dataUrl: string, fileName: string = 'cropped-image.jpg'): void => {
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataUrl;
    link.click();
  }
};

// 图片格式转换功能
export const imageFormat = {
  /**
   * 将图片转换为WebP格式
   * @param imageElement 图片元素或图片URL
   * @param quality WebP质量（0-1）
   * @returns Promise，解析为WebP格式的图片DataURL
   */
  convertToWebP: async (imageElement: HTMLImageElement | string, quality: number = 0.8): Promise<string> => {
    return new Promise(async (resolve, reject) => {
      try {
        let img: HTMLImageElement;

        if (typeof imageElement === 'string') {
          img = new Image();
          img.crossOrigin = 'anonymous';

          await new Promise((resolveImg, rejectImg) => {
            img.onload = resolveImg;
            img.onerror = rejectImg;
            img.src = imageElement;
          });
        } else {
          img = imageElement;
        }

        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        // 绘制图片
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('无法获取Canvas 2D上下文');
        }

        ctx.drawImage(img, 0, 0);

        // 检查浏览器是否支持WebP
        const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

        if (isWebPSupported) {
          // 转换为WebP格式
          const webpDataUrl = canvas.toDataURL('image/webp', quality);
          resolve(webpDataUrl);
        } else {
          // 降级为JPEG格式
          console.warn('浏览器不支持WebP格式，降级为JPEG');
          const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(jpegDataUrl);
        }
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * 检测浏览器是否支持特定图片格式
   * @returns 支持的图片格式对象
   */
  detectSupportedFormats: (): { webp: boolean, avif: boolean, jpeg2000: boolean } => {
    const canvas = document.createElement('canvas');

    return {
      webp: canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0,
      avif: canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0,
      jpeg2000: canvas.toDataURL('image/jp2').indexOf('data:image/jp2') === 0,
    };
  }
};

// 导出所有功能
export default {
  lazyLoad,
  imageCrop,
  imageFormat
};