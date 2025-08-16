/**
 * @desc Path write function to set value in nested object based on path string
 * @param {Object} draft 源对象
 * @param {string} path 路径
 * @param {Object} value 值
 * @returns {Object} 修改后的对象
 */
function pathWrite(draft, path, value) {
  const pathArr = Array.isArray(path) ? path : path.split('.');
  let current = draft;
  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i];
    if (!current[key]) {
      current[key] = {};
    }
    current = current[key];
  }
  current[pathArr[pathArr.length - 1]] = value;
  return draft;
}

/**
 * @desc 编写一个函数、实现写时复制、路径写入的惰性更新对象机制
 * @param {Object} obj 源对象
 * @param {string} path 路径
 * @param {Object} value 值
 * @returns {Object} 修改后的对象
 */
function copyWhenWrite(obj, path, value) {
  // <TODO>实现写时复制</TODO>
  return pathWrite(obj, path, value);
}



// 从path-write.js导入函数
const PROXY_STATE = Symbol('proxyState');
/**
 * @desc 更新父级代理对象
 * @param {ProxyState} parentState 父级代理对象
 * @param {ProxyState} childState 子级代理对象
 */
function updateParent(parentState, childState) {
  if (!parentState.copy) {
    parentState.copy = { ...parentState.base };
  }
  // 更新父级副本中的子对象引用
  for (const key in parentState.copy) {
    if (parentState.copy[key] === childState.base) {
      parentState.copy[key] = childState.copy;
    }
  }
  // 递归更新祖父级
  if (parentState.parent) {
    updateParent(parentState.parent, parentState);
  }
}

/**
 * @desc 创建一个代理对象，支持惰性更新
 * @typedef {{
 *   base: ProxyState,
 *   parent: ProxyState | null,
 *   copy: ProxyState | null,
 *   proxy: ProxyState,
 * }} ProxyState
 * @param {Object} base 源对象
 * @param {ProxyState} parent 父级代理对象
 * @returns {ProxyState} 代理对象
 */
function createProxy(base, parent) {
  if (typeof base !== 'object' || base === null || base[PROXY_STATE]) {
    return base; // 直接返回非对象类型
  }
  /** @type {ProxyState} */
  const state = {
    base,
    parent,
    copy: null,
    proxy: null,
  }
  /** @type {ProxyState} */
  const proxy = new Proxy(base, {
    /**
     * @desc 获取代理对象的属性
     * @param {ProxyState} target 目标对象
     * @param {keyof ProxyState} prop 属性名
     * @returns {Object} 属性值
     */
    get(target, prop) {
      if (prop === PROXY_STATE) {
        return state;
      }
      const value = state.copy?.[prop] ?? target[prop];
      return createProxy(value, state);
    },
    /**
     * @desc 设置代理对象的属性
     * @param {ProxyState} target 目标对象
     * @param {keyof ProxyState} prop 属性名
     * @param {ProxyState[keyof ProxyState]} value 属性值
     * @returns {boolean} 是否设置成功
     */
    set(target, prop, value) {
      if (!state.copy) {
        state.copy = Array.isArray(target) ? [...target] : { ...target };
        if (parent) {
          // 通知父级更新应用
          updateParent(parent, state);
        }
      }
      state.copy[prop] = value;
      return true;
    }
  });
  state.proxy = proxy;
  return proxy;
}

/**
 * @desc 主入口函数
 * @param {Object} base 源对象
 * @param {(draft: Object) => void} producer 生产者函数
 * @returns {Object} 修改后的副本或原始对象
 */
function produceFake(base, producer) {
  const rootProxy = createProxy(base, null);
  producer(rootProxy);
  // 返回修改后的副本或原始对象
  return rootProxy[PROXY_STATE]?.copy || base;
}

export {
  pathWrite,
  copyWhenWrite,
  produceFake,
}