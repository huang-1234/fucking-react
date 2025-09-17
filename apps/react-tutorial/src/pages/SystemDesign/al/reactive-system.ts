import { Map, Set } from 'immutable';

/**
 * 依赖收集系统
 *
 * 时间复杂度：
 * - 依赖收集：O(1)
 * - 触发更新：O(n)，其中n是依赖于特定属性的effect数量
 *
 * 空间复杂度：O(m * n)，其中m是对象数量，n是每个对象的属性数量
 */

// 当前正在执行的effect
let activeEffect: (() => void) | null = null;

// 存储依赖关系的全局Map
// targetMap: WeakMap<Target, Map<Key, Set<Effect>>>
const targetMap = new WeakMap<object, Map<string | symbol, Set<() => void>>>();

/**
 * 跟踪依赖
 * @param target 目标对象
 * @param key 属性键
 */
export function track(target: object, key: string | symbol): void {
  if (!activeEffect) return;

  // 获取目标对象的依赖Map
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = Map<string | symbol, Set<() => void>>();
    targetMap.set(target, depsMap);
  }

  // 获取特定属性的依赖集合
  let dep = depsMap.get(key);
  if (!dep) {
    // 使用Immutable.js的Set
    dep = Set<() => void>();
    depsMap = depsMap.set(key, dep);
  }

  // 添加当前effect到依赖集合
  if (!dep.has(activeEffect)) {
    dep = dep.add(activeEffect);
    depsMap = depsMap.set(key, dep);
  }
}

/**
 * 触发更新
 * @param target 目标对象
 * @param key 属性键
 */
export function trigger(target: object, key: string | symbol): void {
  // 获取目标对象的依赖Map
  const depsMap = targetMap.get(target);
  if (!depsMap) return;

  // 获取特定属性的依赖集合
  const dep = depsMap.get(key);
  if (dep && dep.size > 0) {
    // 执行所有依赖的effect
    dep.forEach(effect => {
      // 如果effect正在执行中，避免无限循环
      if (effect !== activeEffect) {
        effect();
      }
    });
  }
}

/**
 * 创建响应式对象
 * @param target 目标对象
 * @returns 响应式代理对象
 */
export function reactive<T extends object>(target: T): T {
  return new Proxy(target, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);

      // 收集依赖
      track(target, key);

      // 如果属性值是对象，递归创建响应式对象
      if (result && typeof result === 'object') {
        return reactive(result);
      }

      return result;
    },

    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);

      // 触发更新
      trigger(target, key);

      return result;
    },

    deleteProperty(target, key) {
      const result = Reflect.deleteProperty(target, key);

      // 触发更新
      trigger(target, key);

      return result;
    }
  });
}

/**
 * 创建effect
 * @param fn effect函数
 */
export function effect(fn: () => void): () => void {
  // 包装effect函数
  const wrappedEffect = () => {
    activeEffect = wrappedEffect;
    fn();
    activeEffect = null;
  };

  // 立即执行一次，收集依赖
  wrappedEffect();

  // 返回effect函数，可用于手动触发或清理
  return wrappedEffect;
}

/**
 * 计算属性
 * @param getter 计算属性的getter函数
 * @returns 计算属性对象
 */
export function computed<T>(getter: () => T): { value: T } {
  // 缓存值
  let value: T;
  // 标记是否需要重新计算
  let dirty = true;

  // 创建effect
  effect(() => {
    dirty = true;
  });

  return {
    get value() {
      if (dirty) {
        value = getter();
        dirty = false;
      }
      return value;
    }
  };
}

/**
 * 生成依赖收集系统的可视化数据
 * @param state 响应式状态对象
 * @param effects 效果函数列表
 * @param operations 操作序列
 * @returns 可视化数据对象
 */
export function visualizeReactiveSystem(
  state: Record<string, any>,
  effects: Array<{ name: string, fn: () => void }>,
  operations: Array<{ type: 'get' | 'set', key: string, value?: any }>
) {
  // 创建响应式状态
  const reactiveState = reactive(state);

  // 记录依赖关系
  const dependencies: Record<string, string[]> = {};

  // 记录effect执行历史
  const effectHistory: Array<{ time: number, effect: string }> = [];

  // 记录状态变化历史
  const stateHistory: Array<{ time: number, key: string, value: any }> = [];

  // 当前时间（模拟）
  let currentTime = 0;

  // 创建effects
  effects.forEach(({ name, fn }) => {
    // 重写effect函数，记录执行历史
    const wrappedFn = () => {
      effectHistory.push({ time: currentTime, effect: name });
      fn();
    };

    // 注册effect
    effect(wrappedFn);

    // 记录依赖关系
    dependencies[name] = Object.keys(state);
  });

  // 执行操作序列
  operations.forEach(({ type, key, value }) => {
    currentTime += 1;

    if (type === 'get') {
      // 获取属性值
      const result = reactiveState[key];
      stateHistory.push({ time: currentTime, key, value: result });
    } else if (type === 'set') {
      // 设置属性值
      reactiveState[key] = value;
      stateHistory.push({ time: currentTime, key, value });
    }
  });

  return {
    initialState: state,
    effects: effects.map(e => e.name),
    dependencies,
    effectHistory,
    stateHistory,
    finalState: { ...reactiveState }
  };
}
