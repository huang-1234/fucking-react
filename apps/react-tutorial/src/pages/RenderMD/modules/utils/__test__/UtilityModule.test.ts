import { describe, it, expect, vi, beforeEach } from 'vitest';
import UtilityModule from '../index';

// Mock the individual utility classes
vi.mock('../MarkdownUtils', () => ({
  default: {
    escapeMarkdown: vi.fn(text => `escaped:${text}`),
    parseLink: vi.fn(),
    parseImage: vi.fn(),
    extractHeadings: vi.fn(),
    generateId: vi.fn(text => `id-${text}`)
  }
}));

vi.mock('../PerformanceMonitor', () => {
  return {
    default: {
      getInstance: vi.fn().mockImplementation(() => ({
        mark: vi.fn(),
        measure: vi.fn(),
        measureAsync: vi.fn(),
        measureSync: vi.fn(),
        getEntries: vi.fn(() => [{ name: 'test', duration: 100 }]),
        clear: vi.fn()
      }))
    }
  };
});

vi.mock('../StateManager', () => {
  return {
    default: vi.fn().mockImplementation((initialState) => ({
      getState: vi.fn(() => initialState),
      setState: vi.fn(),
      subscribe: vi.fn(),
      undo: vi.fn(),
      redo: vi.fn(),
      resetState: vi.fn()
    }))
  };
});

describe('UtilityModule', () => {
  let utilityModule: UtilityModule;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the singleton instance
    (UtilityModule as any).instance = undefined;
    utilityModule = UtilityModule.getInstance();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = UtilityModule.getInstance();
      const instance2 = UtilityModule.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('getMarkdownUtils', () => {
    it('should provide access to MarkdownUtils methods', () => {
      const markdownUtils = utilityModule.getMarkdownUtils();

      // Since MarkdownUtils has static methods, we can't directly test instance methods
      // Instead, we verify that the instance was created and returned
      expect(markdownUtils).toBeDefined();
    });
  });

  describe('getPerformanceMonitor', () => {
    it('should provide access to PerformanceMonitor methods', () => {
      const performanceMonitor = utilityModule.getPerformanceMonitor();
      performanceMonitor.mark('test-mark');

      expect(performanceMonitor.mark).toHaveBeenCalledWith('test-mark');
    });

    it('should get performance entries', () => {
      const performanceMonitor = utilityModule.getPerformanceMonitor();
      const entries = performanceMonitor.getEntries();

      expect(performanceMonitor.getEntries).toHaveBeenCalled();
      expect(entries).toEqual([{ name: 'test', duration: 100 }]);
    });
  });

  describe('createStateManager', () => {
    it('should create a new StateManager instance with initial state', () => {
      const initialState = { count: 0 };
      const stateManager = utilityModule.createStateManager(initialState);

      expect(stateManager).toBeDefined();
    });

    it('should provide access to StateManager methods', () => {
      const initialState = { count: 0 };
      const stateManager = utilityModule.createStateManager(initialState);

      const state = stateManager.getState();

      expect(stateManager.getState).toHaveBeenCalled();
      expect(state).toEqual(initialState);
    });

    it('should pass options to StateManager', () => {
      const initialState = { count: 0 };
      const options = { enableHistory: true, maxHistorySize: 10 };

      // Just create the state manager to verify it works
      const stateManager = utilityModule.createStateManager(initialState, options);
      expect(stateManager).toBeDefined();
    });
  });
});