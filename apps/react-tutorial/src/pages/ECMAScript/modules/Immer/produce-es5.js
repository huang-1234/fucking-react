import { PROXY_STATE, updateParent } from './immerBase';

/**
 * @desc 创建一个代理对象，支持ES5语法
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
function createProxySandbox(base, parent) {
  // 处理非对象类型或已代理对象
  if (typeof base !== 'object' || base === null || base[PROXY_STATE]) {
    return base;
  }

  // 创建状态对象
  const state = {
    base: base,
    parent: parent,
    copy: null,
    proxy: null
  };

  // 创建代理对象
  const proxy = Object.create(Array.isArray(base) ? Array.prototype : Object.prototype);

  // 定义特殊属性以访问状态
  Object.defineProperty(proxy, PROXY_STATE, {
    value: state,
    enumerable: false,
    configurable: false,
    writable: false
  });

  // 为所有现有属性创建访问器
  Object.keys(base).forEach(function(prop) {
    Object.defineProperty(proxy, prop, {
      enumerable: true,
      configurable: true,
      get: function() {
        // 获取属性值
        const value = state.copy ?
          (prop in state.copy ? state.copy[prop] : base[prop]) :
          base[prop];
        return createProxySandbox(value, state);
      },
      set: function(value) {
        // 首次修改时创建副本
        if (!state.copy) {
          state.copy = Array.isArray(base) ? base.slice() : Object.assign({}, base);
          if (parent) {
            updateParent(parent, state);
          }
        }
        state.copy[prop] = value;
        return true;
      }
    });
  });

  // 处理数组方法
  if (Array.isArray(base)) {
    // 代理数组的修改方法
    ['push', 'pop', 'shift', 'unshift', 'splice', 'sort', 'reverse'].forEach(function(method) {
      Object.defineProperty(proxy, method, {
        enumerable: false,
        configurable: true,
        value: function() {
          // 首次修改时创建副本
          if (!state.copy) {
            state.copy = base.slice();
            if (parent) {
              updateParent(parent, state);
            }
          }

          // 调用数组方法
          return Array.prototype[method].apply(state.copy, arguments);
        }
      });
    });

    // 处理length属性
    Object.defineProperty(proxy, 'length', {
      enumerable: false,
      configurable: true,
      get: function() {
        return state.copy ? state.copy.length : base.length;
      },
      set: function(value) {
        if (!state.copy) {
          state.copy = base.slice();
          if (parent) {
            updateParent(parent, state);
          }
        }
        state.copy.length = value;
        return true;
      }
    });
  }

    // 处理动态属性访问和新增属性
  const handler = {
    get: function(target, prop) {
      if (!(prop in target) && typeof base === 'object' && base !== null) {
        // 处理不存在于代理对象上但存在于原始对象上的属性
        const value = state.copy ?
          (prop in state.copy ? state.copy[prop] : base[prop]) :
          base[prop];

        // 动态添加属性访问器
        Object.defineProperty(target, prop, {
          enumerable: true,
          configurable: true,
          get: function() {
            const currentValue = state.copy ?
              (prop in state.copy ? state.copy[prop] : base[prop]) :
              base[prop];
            return createProxySandbox(currentValue, state);
          },
          set: function(newValue) {
            if (!state.copy) {
              state.copy = Array.isArray(base) ? base.slice() : Object.assign({}, base);
              if (parent) {
                updateParent(parent, state);
              }
            }
            state.copy[prop] = newValue;
            return true;
          }
        });
        return target[prop];
      }
      return undefined;
    }
  };

  // 添加一个方法来处理不存在的属性
  proxy.__get__ = function(prop) {
    return handler.get(proxy, prop);
  };

    // 为所有可能的属性添加处理
  if (typeof Proxy !== 'undefined') {
    // 如果环境支持Proxy，使用Proxy来处理动态属性
    const proxyWithDynamicProps = new Proxy(proxy, {
      get: function(target, prop) {
        if (prop in target) {
          return target[prop];
        }
        return handler.get(target, prop);
      },
      set: function(target, prop, value) {
        if (prop in target) {
          target[prop] = value;
        } else {
          if (!state.copy) {
            state.copy = Array.isArray(base) ? base.slice() : Object.assign({}, base);
            if (parent) {
              updateParent(parent, state);
            }
          }
          state.copy[prop] = value;

          // 为新属性添加访问器
          Object.defineProperty(target, prop, {
            enumerable: true,
            configurable: true,
            get: function() {
              const currentValue = state.copy[prop];
              return createProxySandbox(currentValue, state);
            },
            set: function(newValue) {
              state.copy[prop] = newValue;
              return true;
            }
          });
        }
        return true;
      }
    });

    state.proxy = proxyWithDynamicProps;
    return proxyWithDynamicProps;
  }

  state.proxy = proxy;
  return proxy;
}

/**
 * @desc 使用ES5语法的主入口函数
 * @param {Object} base 源对象
 * @param {(draft: Object) => void} producer 生产者函数
 * @returns {Object} 修改后的副本或原始对象
 */
function produceFakeES5(base, producer) {
  const rootProxy = createProxySandbox(base, null);
  producer(rootProxy);

  // 在ES5环境中，我们需要显式访问PROXY_STATE
  const state = rootProxy[PROXY_STATE];
  return state && state.copy ? state.copy : base;
}

export {
  createProxySandbox,
  produceFakeES5,
}