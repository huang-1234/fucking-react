const targetMap = new WeakMap();
let activeEffect: Function | null = null;

function isObject<T extends any = any>(obj: T) {
  return obj !== null && typeof obj === 'object';
}

export interface Target {
  [k: string | symbol]: any;
};

function reactive<T extends Target = Target>(target: T) {
  return new Proxy(target, {
    get(target, key, receiver) {
      track(target, key);
      const res = Reflect.get(target, key, receiver);
      return isObject(res) ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const success = Reflect.set(target, key, value, receiver);
      if (success && oldValue !== value) trigger(target, key);
      return success;
    }
  });
}

function track<T extends Target>(target: T, key: string | symbol) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target) || new Map();
  if (!targetMap.has(target)) targetMap.set(target, depsMap);
  let dep = depsMap.get(key) || new Set();
  if (!depsMap.has(key)) depsMap.set(key, dep);
  dep.add(activeEffect);
}

function trigger<T extends Target>(target: T, key: string | symbol) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  depsMap.get(key)?.forEach((effect: () => T | any) => effect());
}

function effect<T extends Target>(fn: () => T | any) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 测试用例
const state = reactive({ count: 0, nested: { foo: 1 } });
effect(() => console.log("Count:", state.count)); // → Count: 0
state.count++; // → Count: 1
state.nested.foo = 2; // 触发嵌套对象更新