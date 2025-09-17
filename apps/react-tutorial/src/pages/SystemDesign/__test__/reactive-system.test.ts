import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  reactive,
  effect,
  computed,
  track,
  trigger,
  visualizeReactiveSystem
} from '../al/reactive-system';

describe('响应式系统测试', () => {
  beforeEach(() => {
    // 清除所有模拟函数的调用记录
    vi.clearAllMocks();
  });

  it('应该能创建响应式对象', () => {
    const original = { count: 0, message: 'Hello' };
    const observed = reactive(original);

    // 验证响应式对象保留原始属性
    expect(observed.count).toBe(0);
    expect(observed.message).toBe('Hello');

    // 验证修改响应式对象会反映在原始对象上
    observed.count = 1;
    expect(original.count).toBe(1);
  });

  it('应该能跟踪依赖并触发更新', () => {
    const observed = reactive({ count: 0 });
    const fn = vi.fn();

    // 创建effect
    effect(() => {
      fn(observed.count);
    });

    // 初始化时应该调用一次
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(0);

    // 修改属性应该触发effect再次执行
    observed.count = 1;
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('应该能处理嵌套对象', () => {
    const observed = reactive({
      nested: {
        count: 0
      }
    });
    const fn = vi.fn();

    // 创建effect
    effect(() => {
      fn(observed.nested.count);
    });

    // 修改嵌套属性应该触发effect
    observed.nested.count = 1;
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(1);
  });

  it('应该能处理数组', () => {
    const observed = reactive([1, 2, 3]);
    const fn = vi.fn();

    // 创建effect
    effect(() => {
      fn(observed.length, observed[0]);
    });

    // 修改数组元素应该触发effect
    observed[0] = 10;
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(3, 10);

    // 添加元素应该触发effect
    observed.push(4);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledWith(4, 10);
  });

  it('应该避免无限循环', () => {
    const observed = reactive({ count: 0 });
    const fn = vi.fn();

    // 创建一个会修改自己依赖的effect
    effect(() => {
      fn(observed.count);
      observed.count++; // 这会触发effect，但不应该导致无限循环
    });

    // 应该只执行一次（初始化）
    expect(fn).toHaveBeenCalledTimes(1);
    expect(observed.count).toBe(1);
  });

  it('应该支持计算属性', () => {
    const observed = reactive({ count: 1, multiplier: 2 });
    const fn = vi.fn();

    // 创建计算属性
    const doubled = computed(() => observed.count * observed.multiplier);

    // 创建依赖于计算属性的effect
    effect(() => {
      fn(doubled.value);
    });

    // 初始值
    expect(doubled.value).toBe(2);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(2);

    // 修改依赖应该更新计算属性
    observed.count = 2;
    expect(doubled.value).toBe(4);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(4);

    // 修改乘数也应该更新计算属性
    observed.multiplier = 3;
    expect(doubled.value).toBe(6);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(fn).toHaveBeenCalledWith(6);
  });

  it('应该支持手动跟踪和触发', () => {
    const target = { count: 0 };
    const fn = vi.fn();

    // 创建effect
    effect(() => {
      fn(target.count);
      // 手动跟踪依赖
      track(target, 'count');
    });

    // 初始化时调用一次
    expect(fn).toHaveBeenCalledTimes(1);

    // 手动触发更新
    target.count = 1; // 这不会自动触发effect
    trigger(target, 'count');

    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(0); // 注意这里是0，因为我们没有使用响应式对象
  });

  it('应该支持删除属性', () => {
    const observed = reactive({ count: 0, message: 'Hello' } as Record<string, any>);
    const fn = vi.fn();

    // 创建effect
    effect(() => {
      fn('message' in observed ? observed.message : 'deleted');
    });

    // 初始化时调用一次
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('Hello');

    // 删除属性应该触发effect
    delete observed.message;
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith('deleted');
  });
});

describe('响应式系统可视化测试', () => {
  it('应该正确生成可视化数据', () => {
    const state = { count: 0, message: 'Hello' };
    const effects = [
      { name: 'logCount', fn: () => console.log('Count changed') },
      { name: 'updateUI', fn: () => console.log('Update UI') }
    ];
    const operations = [
      { type: 'get' as const, key: 'count' },
      { type: 'set' as const, key: 'count', value: 1 },
      { type: 'set' as const, key: 'message', value: 'World' }
    ];

    const result = visualizeReactiveSystem(state, effects, operations);

    // 验证基本结构
    expect(result).toHaveProperty('initialState');
    expect(result).toHaveProperty('effects');
    expect(result).toHaveProperty('dependencies');
    expect(result).toHaveProperty('effectHistory');
    expect(result).toHaveProperty('stateHistory');
    expect(result).toHaveProperty('finalState');

    // 验证初始状态和最终状态
    expect(result.initialState).toEqual({ count: 0, message: 'Hello' });
    expect(result.finalState).toEqual({ count: 1, message: 'World' });

    // 验证effects
    expect(result.effects).toEqual(['logCount', 'updateUI']);

    // 验证状态历史
    expect(result.stateHistory).toHaveLength(3);
    expect(result.stateHistory[0]).toEqual({ time: 1, key: 'count', value: 0 });
    expect(result.stateHistory[1]).toEqual({ time: 2, key: 'count', value: 1 });
    expect(result.stateHistory[2]).toEqual({ time: 3, key: 'message', value: 'World' });

    // 验证effect历史（由于修改count会触发effect）
    expect(result.effectHistory.length).toBeGreaterThan(0);
  });
});
