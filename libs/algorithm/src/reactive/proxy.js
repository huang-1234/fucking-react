const reactiveMap = new WeakMap(); // 缓存代理对象

class Dep {
  constructor() {
    this.effects = new Set();
  }
  depend() {
    if (activeEffect) this.effects.add(activeEffect);
  }
  notify() {
    this.effects.forEach(effect => effect());
  }
}

let activeEffect = null;
function effect(fn) {
  activeEffect = fn;
  fn(); // 立即执行以收集依赖
  activeEffect = null;
}

function reactive(target) {
  // 避免重复代理
  if (reactiveMap.has(target)) return reactiveMap.get(target);

  const deps = new Map(); // 存储每个 key 的 Dep 实例
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      // 依赖收集
      if (!deps.has(key)) deps.set(key, new Dep());
      deps.get(key).depend();

      const value = Reflect.get(target, key, receiver);
      // 嵌套对象递归代理
      if (typeof value === 'object' && value !== null) {
        return reactive(value);
      }
      return value;
    },
    set(target, key, value, receiver) {
      const oldValue = target[key];
      const result = Reflect.set(target, key, value, receiver);
      // 仅当值变化时触发更新
      if (oldValue !== value) {
        deps.get(key)?.notify(); // 触发依赖更新
      }
      return result;
    },
    deleteProperty(target, key) {
      if (Reflect.has(target, key)) {
        deps.get(key)?.notify(); // 删除属性时触发更新
        return Reflect.deleteProperty(target, key);
      }
      return false;
    }
  });

  reactiveMap.set(target, proxy);
  return proxy;
}

// 测试
const state = reactive({ count: 0, info: { name: 'Vue3' } });
effect(() => console.log(`Count: ${state.count}`));
effect(() => console.log(`Info name: ${state.info.name}`));
state.count = 1; // 输出: "Count: 1"
state.info.name = 'Vue3.2'; // 输出: "Info name: Vue3.2"
delete state.info; // 触发更新（若有监听）