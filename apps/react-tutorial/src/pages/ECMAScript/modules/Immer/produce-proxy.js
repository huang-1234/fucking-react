import { updateParent } from './immerBase';

const PROXY_STATE = Symbol('proxyState');

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
function createProxyES6(base, parent) {
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
      return createProxyES6(value, state);
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
function produceFakeES6(base, producer) {
  const rootProxy = createProxyES6(base, null);
  producer(rootProxy);
  // 返回修改后的副本或原始对象
  return rootProxy[PROXY_STATE]?.copy || base;
}

export {
  createProxyES6,
  updateParent,
  produceFakeES6
}