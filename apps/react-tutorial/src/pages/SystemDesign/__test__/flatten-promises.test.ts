import { describe, it, expect } from 'vitest';
import {
  flattenAndResolvePromises,
  serialFlattenAndResolvePromises,
  visualizeFlattenPromises
} from '../al/flatten-promises';

describe('Promise扁平化并行解析测试', () => {
  it('应该扁平化并解析包含普通值的数组', async () => {
    const input = [1, 2, [3, 4], [[5]]] as any[];
    const result = await flattenAndResolvePromises<number>(input);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('应该扁平化并解析包含Promise的数组', async () => {
    const input = [
      Promise.resolve(1),
      2,
      [Promise.resolve(3), 4],
      [[Promise.resolve(5)]]
    ] as any[];
    const result = await flattenAndResolvePromises(input);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('应该正确处理Promise的拒绝', async () => {
    const error = new Error('测试错误');
    const input = [
      Promise.resolve(1),
      Promise.reject(error),
      [Promise.resolve(3)]
    ];

    await expect(flattenAndResolvePromises(input)).rejects.toThrow(error);
  });

  it('应该并行解析所有Promise', async () => {
    // 创建带延迟的Promise
    const createDelayedPromise = (value: number, delay: number) => {
      return new Promise<number>(resolve => {
        setTimeout(() => resolve(value), delay);
      });
    };

    // 记录开始时间
    const start = Date.now();

    // 创建三个延迟的Promise，分别延迟100ms, 200ms, 300ms
    const input = [
      createDelayedPromise(1, 100),
      createDelayedPromise(2, 200),
      createDelayedPromise(3, 300)
    ];

    // 并行解析
    const result = await flattenAndResolvePromises(input);

    // 记录结束时间
    const end = Date.now();
    const duration = end - start;

    // 验证结果
    expect(result).toEqual([1, 2, 3]);

    // 验证总时间接近最长的Promise的延迟时间（300ms）
    // 允许有一些误差，但应该远小于串行执行的总时间（600ms）
    expect(duration).toBeLessThan(600);
    // 考虑到测试环境的不确定性，设置一个宽松的下限
    expect(duration).toBeGreaterThanOrEqual(250);
  });
});

describe('Promise扁平化串行解析测试', () => {
  it('应该扁平化并串行解析包含普通值的数组', async () => {
    const input = [1, 2, [3, 4], [[5]]] as any[];
    const result = await serialFlattenAndResolvePromises<number>(input);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('应该扁平化并串行解析包含Promise的数组', async () => {
    const input = [
      Promise.resolve(1),
      2,
      [Promise.resolve(3), 4],
      [[Promise.resolve(5)]]
    ] as any[];
    const result = await serialFlattenAndResolvePromises(input);
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('应该正确处理Promise的拒绝', async () => {
    const error = new Error('测试错误');
    const input = [
      Promise.resolve(1),
      Promise.reject(error),
      [Promise.resolve(3)]
    ];

    await expect(serialFlattenAndResolvePromises(input)).rejects.toThrow(error);
  });

  it('应该串行解析所有Promise', async () => {
    // 创建带延迟和副作用的Promise
    const executionOrder: number[] = [];

    const createDelayedPromise = (value: number, delay: number) => {
      return new Promise<number>(resolve => {
        setTimeout(() => {
          executionOrder.push(value);
          resolve(value);
        }, delay);
      });
    };

    // 创建三个延迟的Promise
    const input = [
      createDelayedPromise(1, 100),
      createDelayedPromise(2, 50),
      createDelayedPromise(3, 10)
    ];

    // 串行解析
    const result = await serialFlattenAndResolvePromises(input);

    // 验证结果
    expect(result).toEqual([1, 2, 3]);

    // 验证执行顺序与输入顺序一致，而不是与延迟时间有关
    expect(executionOrder).toEqual([1, 2, 3]);
  });
});

describe('Promise扁平化可视化测试', () => {
  it('应该正确生成并行模式的可视化数据', () => {
    const inputArray = [1, [2, 3], [[4]]];
    const resolveTimings = [100, 200, 300];

    const result = visualizeFlattenPromises(inputArray, resolveTimings, true);

    // 验证基本结构
    expect(result).toHaveProperty('original');
    expect(result).toHaveProperty('flattened');
    expect(result).toHaveProperty('timeline');
    expect(result).toHaveProperty('parallel', true);

    // 验证扁平化结果
    expect(result.flattened).toEqual([1, 2, 3, 4]);

    // 验证时间线
    // 注意：由于isPromise有随机性，我们只验证时间线的结构而不是具体内容
    result.timeline.forEach(item => {
      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('startTime');
      expect(item).toHaveProperty('endTime');

      // 并行模式下所有startTime应该为0
      expect(item.startTime).toBe(0);
    });
  });

  it('应该正确生成串行模式的可视化数据', () => {
    const inputArray = [1, [2, 3], [[4]]];
    const resolveTimings = [100, 200, 300];

    const result = visualizeFlattenPromises(inputArray, resolveTimings, false);

    // 验证并行标志
    expect(result.parallel).toBe(false);

    // 验证时间线
    let previousEndTime = 0;
    result.timeline.forEach(item => {
      // 串行模式下，当前项的开始时间应该等于前一项的结束时间
      expect(item.startTime).toBe(previousEndTime);
      previousEndTime = item.endTime;
    });
  });
});
