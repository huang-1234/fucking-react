import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { DataProcessor, createWorkerScript, visualizeWorkerProcessing } from '../al/data-processor';

// 模拟Worker类
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor(public url: string) {}

  postMessage(data: any): void {
    // 模拟Worker处理数据并返回结果
    setTimeout(() => {
      if (this.onmessage) {
        const result = this.processData(data);
        this.onmessage(new MessageEvent('message', { data: result }));
      }
    }, 0);
  }

  terminate(): void {
    // 模拟终止Worker
  }

  private processData(data: any): any {
    const { operation, options } = data;
    let result;

    switch (operation) {
      case 'filter':
        result = data.data.filter((item: any) => item > 5);
        break;
      case 'map':
        result = data.data.map((item: any) => item * 2);
        break;
      case 'reduce':
        result = data.data.reduce((acc: any, item: any) => acc + item, 0);
        break;
      case 'sort':
        result = [...data.data].sort((a: any, b: any) => a - b);
        break;
      case 'aggregate':
        result = {
          count: data.data.length,
          sum: data.data.reduce((sum: number, item: number) => sum + item, 0)
        };
        break;
      default:
        throw new Error('不支持的操作类型');
    }

    return {
      type: 'result',
      result,
      chunkIndex: data.chunkIndex
    };
  }
}

// 模拟全局Worker类
vi.stubGlobal('Worker', MockWorker);

describe('Web Worker数据处理器测试', () => {
  let dataProcessor: DataProcessor;

  beforeEach(() => {
    dataProcessor = new DataProcessor('worker.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该能处理过滤操作', async () => {
    const data = [1, 5, 10, 15, 20];
    const operation = 'filter';
    const options = { condition: 'item > 5' };

    const result = await dataProcessor.processData(data, operation, options);

    expect(result).toEqual([10, 15, 20]);
  });

  it('应该能处理映射操作', async () => {
    const data = [1, 2, 3, 4, 5];
    const operation = 'map';
    const options = { transform: 'item * 2' };

    const result = await dataProcessor.processData(data, operation, options);

    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  it('应该能处理归约操作', async () => {
    const data = [1, 2, 3, 4, 5];
    const operation = 'reduce';
    const options = { reducer: 'acc + item', initialValue: 0 };

    const result = await dataProcessor.processData(data, operation, options);

    expect(result).toBe(15);
  });

  it('应该能处理排序操作', async () => {
    const data = [5, 3, 1, 4, 2];
    const operation = 'sort';
    const options = { comparator: 'a - b' };

    const result = await dataProcessor.processData(data, operation, options);

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('应该能处理聚合操作', async () => {
    const data = [1, 2, 3, 4, 5];
    const operation = 'aggregate';
    const options = { count: true, sum: true, field: null };

    const result = await dataProcessor.processData(data, operation, options);

    expect(result).toEqual({
      count: 5,
      sum: 15
    });
  });

  it('应该拒绝同时处理多个任务', async () => {
    const data = [1, 2, 3, 4, 5];

    // 开始第一个任务但不等待它完成
    const promise1 = dataProcessor.processData(data, 'map', { transform: 'item * 2' });

    // 尝试开始第二个任务
    const promise2 = dataProcessor.processData(data, 'filter', { condition: 'item > 3' });

    // 第二个任务应该被拒绝
    await expect(promise2).rejects.toThrow('已有处理任务正在进行');

    // 第一个任务应该正常完成
    await expect(promise1).resolves.toEqual([2, 4, 6, 8, 10]);
  });

  it('应该能取消正在进行的任务', async () => {
    // 创建一个永不解析的Worker
    vi.stubGlobal('Worker', class {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;
      postMessage(): void {}
      terminate(): void {}
    });

    const data = [1, 2, 3, 4, 5];

    // 开始任务
    const promise = dataProcessor.processData(data, 'map', { transform: 'item * 2' });

    // 取消任务
    dataProcessor.cancel();

    // 验证可以开始新任务
    vi.stubGlobal('Worker', MockWorker);
    const newPromise = dataProcessor.processData(data, 'filter', { condition: 'item > 3' });

    await expect(newPromise).resolves.toEqual([4, 5]);
  });

  it('应该能分片处理大型数据集', async () => {
    const data = Array.from({ length: 100 }, (_, i) => i + 1);
    const chunkSize = 20;

    const results = await dataProcessor.processDataInChunks(data, 'map', { transform: 'item * 2' }, chunkSize);

    // 验证结果数量
    expect(results.length).toBe(Math.ceil(data.length / chunkSize));

    // 验证每个分片的结果
    expect(results[0]).toEqual(data.slice(0, 20).map(item => item * 2));
    expect(results[1]).toEqual(data.slice(20, 40).map(item => item * 2));
  });
});

describe('Worker脚本生成测试', () => {
  it('应该生成有效的Worker脚本', () => {
    const script = createWorkerScript();

    // 验证脚本包含必要的部分
    expect(script).toContain('self.onmessage');
    expect(script).toContain('filter');
    expect(script).toContain('map');
    expect(script).toContain('reduce');
    expect(script).toContain('sort');
    expect(script).toContain('aggregate');
    expect(script).toContain('self.postMessage');
  });
});

describe('Web Worker处理可视化测试', () => {
  it('应该正确生成可视化数据', () => {
    const dataSize = 100000;
    const chunkSize = 20000;
    const processingTime = 500;

    const result = visualizeWorkerProcessing(dataSize, chunkSize, processingTime);

    // 验证基本结构
    expect(result).toHaveProperty('dataSize', dataSize);
    expect(result).toHaveProperty('chunkSize', chunkSize);
    expect(result).toHaveProperty('chunkCount', 5);
    expect(result).toHaveProperty('timeline');
    expect(result).toHaveProperty('totalTime');
    expect(result).toHaveProperty('mainThreadTime');
    expect(result).toHaveProperty('speedup');

    // 验证时间线
    expect(result.timeline.length).toBe(5);

    // 验证处理项目数
    expect(result.timeline.reduce((sum, item) => sum + item.itemsProcessed, 0)).toBe(dataSize);

    // 验证加速比
    expect(result.speedup).toBeGreaterThan(1);
    expect(result.mainThreadTime).toBeGreaterThan(result.totalTime);
  });
});
