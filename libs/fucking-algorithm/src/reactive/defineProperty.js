
/**
 * @description 观察对象
 * 1. 如果对象不是对象或为空，则返回
 * 2. 遍历对象的属性，定义响应式对象
 * @param {Object} obj 对象
 * @returns {void}
 */
function observe(obj) {
  if (typeof obj !== 'object' || obj === null) return;
  Object.keys(obj).forEach(key => {
    defineReactive(obj, key, obj[key]);
  });
}
/**
 * @description 依赖管理器
 * 1. 存储依赖的 Watcher
 * 2. 收集依赖
 * 3. 触发依赖更新
 * @typedef {Object} TDep
 * @property {Set<Watcher>} subs 存储依赖的 Watcher
 * @property {Function} depend 收集依赖
 */
class Dep {
  static target = null; // 全局当前 Watcher
  /**
   * @param {Object} obj 对象
   * @param {String} key 属性名
   * @param {any} val 属性值
   */
  constructor() {
    /**
     * @type {Set<Watcher>}
     */
    this.subs = new Set(); // 存储依赖的 Watcher
  }
  depend() {
    if (Dep.target) {
      this.subs.add(Dep.target); // 收集当前 Watcher
    }
  }
  notify() {
    this.subs.forEach(watcher => watcher.update()); // 触发所有 Watcher 更新
  }
}
Dep.target = null; // 全局当前 Watcher

/**
 * @template {Object | Array} VM
 * @description 观察者
 * 1. 存储当前 Watcher
 * 2. 收集依赖
 * 3. 触发依赖更新
 * @typedef {Object} TWatcher
 * @property {Object} vm 当前 Watcher
 * @property {String} key 属性名
 * @property {Function} updateFn 更新回调
 */
class Watcher {
  /**
   * @param {VM} vm 当前 Watcher
   * @param {String} key 属性名
   * @param {Function} updateFn 更新回调
   */
  constructor(vm, key, updateFn) {
    /**
     * @type {Object}
     */
    this.vm = vm;
    this.key = key;
    this.updateFn = updateFn;
    Dep.target = this; // 设置当前 Watcher

    // 处理嵌套属性路径，如 'info.name'
    if (this.key.includes('.')) {
      const keys = this.key.split('.');
      let value = this.vm;
      for (const k of keys) {
        value = value[k]; // 逐层访问，触发 getter 收集依赖
      }
    } else {
      this.vm[this.key]; // 触发 getter 收集依赖
    }

    Dep.target = null; // 重置
  }
  update() {
    // 处理嵌套属性路径
    if (this.key.includes('.')) {
      const keys = this.key.split('.');
      let value = this.vm;
      for (let i = 0; i < keys.length - 1; i++) {
        value = value[keys[i]];
      }
      this.updateFn(value[keys[keys.length - 1]]);
    } else {
      this.updateFn(this.vm[this.key]); // 执行更新回调
    }
  }
}

/**
 * @description 定义响应式对象
 * 1. 使用 Object.defineProperty 定义对象的属性
 * 2. 在 get 方法中，收集依赖
 * 3. 在 set 方法中，触发依赖更新
 * @param {Object} obj 对象
 * @param {String} key 属性名
 * @param {any} val 属性值
 * @returns {void}
 */
function defineReactive(obj, key, val) {
  const dep = new Dep();
  // 递归处理嵌套对象
  if (typeof val === 'object' && val !== null) observe(val);

  Object.defineProperty(obj, key, {
    get() {
      if (Dep.target) {
        dep.depend(); // 收集依赖
      }
      return val;
    },
    set(newVal) {
      if (newVal === val) return;
      val = newVal;
      // 新值为对象时递归响应化
      if (typeof newVal === 'object' && newVal !== null) observe(newVal);
      dep.notify(); // 触发更新
    }
  });
}


// 测试
const data = { count: 0, info: { name: 'Vue2' } };
observe(data);
new Watcher(data, 'count', val => console.log(`Count updated: ${val}`));
new Watcher(data, 'info.name', val => console.log(`Info.name updated: ${val}`));
data.count = 1; // 输出: "Count updated: 1"
data.info.name = 'Vue2.7'; // 输出: "Info.name updated: Vue2.7"