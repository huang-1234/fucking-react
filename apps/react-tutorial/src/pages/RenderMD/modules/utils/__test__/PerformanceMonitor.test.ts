import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PerformanceMonitor from '../PerformanceMonitor';

describe('PerformanceMonitor', () => {
  let performanceMonitor: PerformanceMonitor;

  // Mock performance API
  const originalPerformance = global.performance;
  let mockNow = 1000;
  let mockMarks: Record<string, number> = {};
  let mockMeasures: Array<{name: string, startTime: number, duration: number}> = [];

  beforeEach(() => {
    mockMarks = {};
    mockMeasures = [];
    mockNow = 1000;

    // Mock performance API
    global.performance = {
      now: vi.fn(() => mockNow),
      mark: vi.fn((name: string) => {
        mockMarks[name] = mockNow;
      }),
      measure: vi.fn((name: string, startMark: string, endMark: string) => {
        const startTime = mockMarks[startMark] || 0;
        const endTime = mockMarks[endMark] || mockNow;
        mockMeasures.push({
          name,
          startTime,
          duration: endTime - startTime
        });
      }),
      getEntriesByName: vi.fn((name: string) => {
        return mockMeasures
          .filter(m => m.name === name)
          .map(m => ({
            name: m.name,
            startTime: m.startTime,
            duration: m.duration,
            entryType: 'measure',
            toJSON: () => ({})
          }));
      }),
      clearMarks: vi.fn(),
      clearMeasures: vi.fn(),
    } as unknown as Performance;

    performanceMonitor = new PerformanceMonitor({});
  });

  afterEach(() => {
    global.performance = originalPerformance;
  });

  describe('mark', () => {
    it('should create a performance mark', () => {
      performanceMonitor.mark('test-mark');

      expect(global.performance.mark).toHaveBeenCalledWith('test-mark');
      expect(mockMarks['test-mark']).toBe(1000);
    });

    it('should add metadata to the mark if provided', () => {
      performanceMonitor.mark('test-mark', { data: 'test' });

      expect(global.performance.mark).toHaveBeenCalledWith('test-mark');
      expect(performanceMonitor.getEntriesByName('test-mark')).toEqual({ data: 'test' });
    });
  });

  describe('measure', () => {
    it('should create a performance measure between two marks', () => {
      performanceMonitor.mark('start-mark');
      mockNow = 1500; // Advance time
      performanceMonitor.mark('end-mark');

      performanceMonitor.measure('test-measure', {
        startTime: 1000,
        duration: 500
      });

      expect(global.performance.measure).toHaveBeenCalledWith('test-measure', 'start-mark', 'end-mark');
      expect(mockMeasures[0]).toEqual({
        name: 'test-measure',
        startTime: 1000,
        duration: 500
      });
    });

    it('should add metadata to the measure if provided', () => {
      performanceMonitor.mark('start-mark');
      mockNow = 1500;
      performanceMonitor.mark('end-mark');

      performanceMonitor.measure('test-measure', {
        startTime: 1000,
        duration: 500
      });

      expect(performanceMonitor.getEntriesByName('test-measure')).toEqual({ data: 'test' });
    });

    it('should use now as end mark if not provided', () => {
      performanceMonitor.mark('start-mark');
      mockNow = 1500;

      performanceMonitor.measure('test-measure', {
        startTime: 1000,
        duration: 500
      });

      expect(global.performance.measure).toHaveBeenCalledWith('test-measure', 'start-mark', undefined);
      expect(mockMeasures[0]).toEqual({
        name: 'test-measure',
        startTime: 1000,
        duration: 500
      });
    });
  });

  describe('startTimer and stopTimer', () => {
    it('should measure time between start and stop', () => {
      performanceMonitor.mark('test-timer:start');
      mockNow = 2000; // Advance time by 1000ms
      const duration = performanceMonitor.measure('test-timer', {
        startTime: 1000,
        duration: 1000
      });

      expect(duration).toBe(1000);
      expect(global.performance.mark).toHaveBeenCalledWith('test-timer:start');
      expect(global.performance.mark).toHaveBeenCalledWith('test-timer:end');
      expect(global.performance.measure).toHaveBeenCalledWith('test-timer', 'test-timer:start', 'test-timer:end');
    });

    it('should return 0 if timer was not started', () => {
      const duration = performanceMonitor.measure('nonexistent-timer', {
        startTime: 1000,
        duration: 1000
      });

      expect(duration).toBe(0);
    });
  });

  describe('wrapFunction', () => {
    it('should time function execution', async () => {
      const fn = vi.fn(async () => {
        mockNow += 500; // Simulate function taking 500ms
        return 'result';
      });

      const wrappedFn = performanceMonitor.measureAsync('test-function', fn);
      const result = await wrappedFn;

      expect(result).toBe('result');
      expect(fn).toHaveBeenCalled();

      const metrics = performanceMonitor.getEntries();
      expect(metrics.find(m => m.name === 'test-function')).toBeDefined();
      expect(metrics.find(m => m.name === 'test-function')?.duration).toBe(500);
    });

    it('should handle errors in wrapped function', async () => {
      const error = new Error('Test error');
      const fn = vi.fn(() => {
        mockNow += 300; // Simulate function taking 300ms
        throw error;
      });

      const wrappedFn = performanceMonitor.measureAsync('error-function', fn);

      await expect(wrappedFn).rejects.toThrow(error);
      expect(fn).toHaveBeenCalled();

      const metrics = performanceMonitor.getEntries();
      expect(metrics.find(m => m.name === 'error-function')).toBeDefined();
      expect(metrics.find(m => m.name === 'error-function')?.duration).toBe(300);
    });
  });

  describe('getMetrics', () => {
    it('should return all performance metrics', () => {
      performanceMonitor.mark('mark1');
      mockNow = 1200;
      performanceMonitor.measure('measure1', {
        startTime: 1000,
        duration: 200
      });

      mockNow = 1500;
      performanceMonitor.mark('mark2');
      mockNow = 1800;
      performanceMonitor.measure('measure2',     {
        startTime: 1200,
        duration: 300
      });

      const metrics = performanceMonitor.getEntries();

      expect(metrics).toHaveLength(2);
      expect(metrics[0].name).toBe('measure1');
      expect(metrics[0].duration).toBe(200);
      expect(metrics[1].name).toBe('measure2');
      expect(metrics[1].duration).toBe(300);
    });
  });

  describe('getAverageMetric', () => {
    it('should calculate average duration for a metric', () => {
      // First measure
      performanceMonitor.mark('start');
      mockNow = 1100;
      performanceMonitor.measure('repeated-metric', {
        startTime: 1000,
        duration: 100
      });

      // Second measure
      mockNow = 1200;
      performanceMonitor.mark('start');
      mockNow = 1400;
      performanceMonitor.measure('repeated-metric', {
        startTime: 1200,
        duration: 200
      });

      // Third measure
      mockNow = 1500;
      performanceMonitor.mark('start');
      mockNow = 1800;
      performanceMonitor.measure('repeated-metric', {
        startTime: 1500,
        duration: 300
      });

      const average = performanceMonitor.getStats('repeated-metric').average;

      // Durations: 100, 200, 300 -> Average: 200
      expect(average).toBe(200);
    });

    it('should return 0 if metric does not exist', () => {
      const average = performanceMonitor.getStats('nonexistent').average;

      expect(average).toBe(0);
    });
  });

  describe('reset', () => {
    it('should clear all performance marks and measures', () => {
      performanceMonitor.mark('test-mark');
      performanceMonitor.measure('test-measure',     {
        startTime: 1000,
        duration: 100
      });

      performanceMonitor.clear();

      expect(global.performance.clearMarks).toHaveBeenCalled();
      expect(global.performance.clearMeasures).toHaveBeenCalled();

      // Check internal state is reset
      expect(performanceMonitor.getEntries()).toHaveLength(0);
    });
  });

  describe('generateReport', () => {
    it('should generate a performance report', () => {
      performanceMonitor.mark('mark1');
      mockNow = 1200;
      performanceMonitor.measure('parse', {
        startTime: 1000,
        duration: 100
      });

      mockNow = 1300;
      performanceMonitor.mark('mark2');
      mockNow = 1600;
      performanceMonitor.measure('render', {
        startTime: 1200,
        duration: 100
      });

      const report = performanceMonitor.generateReport();

        expect(report.operationStats).toHaveLength(2);
      expect(report.overallStats.total).toBe(300); // 200 + 100
      expect(report.operationStats.average).toBe(150); // (200 + 100) / 2
      expect(report.operationStats.parsing).toHaveProperty('parsing');
      expect(report.operationStats.rendering).toHaveProperty('rendering');
      expect(report.operationStats.parsing).toHaveLength(1);
      expect(report.operationStats.rendering).toHaveLength(1);
    });
  });
});
