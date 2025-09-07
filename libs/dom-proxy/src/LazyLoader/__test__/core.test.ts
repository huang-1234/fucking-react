import { describe, beforeEach, afterEach, it, expect, vi, beforeAll } from 'vitest';
import { LazyLoader } from '../core';

// Mock DOM APIs
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeAll(() => {
  // Mock IntersectionObserver
  mockIntersectionObserver.mockImplementation((callback, options) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
    root: options?.root || null,
    rootMargin: options?.rootMargin || '0px',
    thresholds: Array.isArray(options?.threshold) ? options.threshold : [options?.threshold || 0],
  }));

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  // Mock DOM methods
  Object.defineProperty(document, 'querySelectorAll', {
    writable: true,
    value: vi.fn(() => []),
  });

  // Mock Image constructor
  global.Image = class {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    src = '';

    constructor() {
      setTimeout(() => {
        if (this.onload) this.onload();
      }, 0);
    }
  } as any;

  // Mock fetch
  global.fetch = vi.fn(() =>
    Promise.resolve({
      text: () => Promise.resolve('<div>Mock content</div>'),
    })
  ) as any;
});

describe('LazyLoader', () => {
  let loader: LazyLoader;
  let mockElement: HTMLElement;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock element
    mockElement = {
      dataset: {},
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      getBoundingClientRect: vi.fn(() => ({
        top: 100,
        bottom: 200,
        left: 0,
        right: 100,
      })),
      innerHTML: '',
      appendChild: vi.fn(),
    } as any;

    // Mock querySelectorAll to return our mock element
    vi.mocked(document.querySelectorAll).mockReturnValue([mockElement] as any);
  });

  afterEach(() => {
    if (loader) {
      loader.destroy();
    }
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default options', () => {
      loader = new LazyLoader('.lazy-item');

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          root: null,
          rootMargin: '200px',
          threshold: 0.01,
        })
      );
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        root: document.body,
        rootMargin: '100px',
        threshold: 0.5,
        maxRetry: 5,
      };

      loader = new LazyLoader('.custom-lazy', customOptions);

      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({
          root: document.body,
          rootMargin: '100px',
          threshold: 0.5,
        })
      );
    });

    it('should observe elements on initialization', () => {
      loader = new LazyLoader('.lazy-item');

      expect(document.querySelectorAll).toHaveBeenCalledWith('.lazy-item');
      expect(mockObserve).toHaveBeenCalledWith(mockElement);
      expect(mockElement.dataset.lazyState).toBe('pending');
    });

    it('should skip already loaded elements', () => {
      mockElement.dataset.loaded = 'true';
      loader = new LazyLoader('.lazy-item');

      expect(mockObserve).not.toHaveBeenCalledWith(mockElement);
    });
  });

  describe('IntersectionObserver Handling', () => {
    it('should handle element entering viewport', () => {
      const onEnter = vi.fn();
      loader = new LazyLoader('.lazy-item', { onEnter });

      // Get the callback passed to IntersectionObserver
      const observerCallback = mockIntersectionObserver.mock.calls[0][0];

      // Simulate intersection entry
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      mockElement.dataset.src = 'test-image.jpg';
      observerCallback(entries);

      expect(onEnter).toHaveBeenCalledWith(mockElement, 'enter');
      expect(mockElement.dataset.lastEntered).toBeDefined();
      expect(mockElement.dataset.lazyState).toBe('loading');
    });

    it('should handle element exiting viewport', () => {
      const onExit = vi.fn();
      loader = new LazyLoader('.lazy-item', { onExit });

      mockElement.dataset.lastEntered = Date.now().toString();

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: false,
      }];

      observerCallback(entries);

      expect(onExit).toHaveBeenCalledWith(mockElement, 'exit', expect.any(Number));
    });
  });

  describe('Resource Loading', () => {
    it('should load image successfully', async () => {
      const onLoad = vi.fn();
      loader = new LazyLoader('.lazy-item', { onLoad });

      mockElement.dataset.src = 'test-image.jpg';
      Object.setPrototypeOf(mockElement, HTMLImageElement.prototype);

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      observerCallback(entries);

      // Wait for async operations
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockElement.dataset.lazyState).toBe('loaded');
      expect(mockElement.dataset.loaded).toBe('true');
      expect(onLoad).toHaveBeenCalledWith(mockElement, 'success');
      expect(mockUnobserve).toHaveBeenCalledWith(mockElement);
    });

    it('should load generic resource with fetch', async () => {
      const onLoad = vi.fn();
      loader = new LazyLoader('.lazy-item', { onLoad });

      mockElement.dataset.src = 'test-content.html';

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      observerCallback(entries);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(fetch).toHaveBeenCalledWith('test-content.html');
      expect(mockElement.innerHTML).toBe('<div>Mock content</div>');
      expect(onLoad).toHaveBeenCalledWith(mockElement, 'success');
    });

    it('should handle loading errors', async () => {
      const onError = vi.fn();
      loader = new LazyLoader('.lazy-item', { onError, maxRetry: 0 });

      mockElement.dataset.src = 'invalid-url';

      // Mock fetch to reject
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      observerCallback(entries);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockElement.dataset.lazyState).toBe('error');
      expect(onError).toHaveBeenCalledWith(
        mockElement,
        expect.any(Error),
        'invalid-url'
      );
    });

    it('should retry failed loads', async () => {
      const onError = vi.fn();
      loader = new LazyLoader('.lazy-item', {
        onError,
        maxRetry: 2,
        retryDelay: 10
      });

      mockElement.dataset.src = 'retry-url';

      // Mock fetch to fail first time, succeed second time
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce({
          text: () => Promise.resolve('Success content'),
        } as any);

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      observerCallback(entries);

      // Wait for retry
      await new Promise(resolve => setTimeout(resolve, 50));

      expect(mockElement.dataset.lazyState).toBe('loaded');
    });
  });

  describe('Custom Resource Handlers', () => {
    it('should use custom video handler', async () => {
      const customVideoHandler = vi.fn().mockResolvedValue(undefined);
      loader = new LazyLoader('.lazy-item', {
        resourceHandlers: {
          video: customVideoHandler,
        },
      });

      mockElement.dataset.src = 'test-video.mp4';
      Object.setPrototypeOf(mockElement, HTMLVideoElement.prototype);

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      observerCallback(entries);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(customVideoHandler).toHaveBeenCalledWith(mockElement, 'test-video.mp4');
    });

    it('should use custom component handler', async () => {
      const customComponentHandler = vi.fn().mockResolvedValue(undefined);
      loader = new LazyLoader('.lazy-item', {
        resourceHandlers: {
          component: customComponentHandler,
        },
      });

      mockElement.dataset.src = 'component.js';
      mockElement.dataset.component = 'true';

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      observerCallback(entries);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(customComponentHandler).toHaveBeenCalledWith(mockElement, 'component.js');
    });
  });

  describe('Fallback Mode', () => {
    it('should fallback to scroll detection when IntersectionObserver is not supported', () => {
      // Temporarily remove IntersectionObserver
      const originalIO = window.IntersectionObserver;
      delete (window as any).IntersectionObserver;

      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      loader = new LazyLoader('.lazy-item');

      expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), { passive: true });
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function), { passive: true });

      // Restore IntersectionObserver
      window.IntersectionObserver = originalIO;
      addEventListenerSpy.mockRestore();
    });
  });

  describe('Public Methods', () => {
    beforeEach(() => {
      loader = new LazyLoader('.lazy-item');
    });

    it('should add element to observer', () => {
      const newElement = { dataset: {} } as HTMLElement;

      loader.addElement(newElement);

      expect(mockObserve).toHaveBeenCalledWith(newElement);
    });

    it('should trigger load for specific element', () => {
      mockElement.dataset.src = 'trigger-test.jpg';

      loader.triggerLoad(mockElement);

      expect(mockElement.dataset.lazyState).toBe('loading');
    });

    it('should destroy and cleanup resources', () => {
      loader.destroy();

      expect(mockDisconnect).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing data-src attribute', async () => {
      const onError = vi.fn();
      loader = new LazyLoader('.lazy-item', { onError });

      // Element without data-src
      delete mockElement.dataset.src;

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      observerCallback(entries);

      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockElement.dataset.lazyState).toBe('error');
      expect(onError).toHaveBeenCalledWith(
        mockElement,
        expect.any(Error),
        ''
      );
    });

    it('should handle callback errors gracefully', () => {
      const faultyOnEnter = vi.fn().mockImplementation(() => {
        throw new Error('Callback error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      loader = new LazyLoader('.lazy-item', { onEnter: faultyOnEnter });

      const observerCallback = mockIntersectionObserver.mock.calls[0][0];
      const entries = [{
        target: mockElement,
        isIntersecting: true,
      }];

      expect(() => observerCallback(entries)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith('Error in onEnter callback:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });
});
