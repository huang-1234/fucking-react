const originObj = {
  'a.a1.a2': 11112,
  'a.a1.a3': 11113,
  'a.a1.a4': 11114,
  'a.b.b1': 11115,
  'a.b.b2': 11116,
  'a.c.c1': 11117,
  'a.c.c2': 11118,
}
/**
 * @desc Path write function to set value in nested object based on path string
 * @example
 * const obj = {};
 * pathWrite(obj, 'a.b.c', 42);
 * console.log(obj); // { a: { b: { c: 42 } } }
 * @param {*} draft
 * @param {string} path
 * @param {*} value
 * @returns
 */
function pathWrite(draft, path, value) {
  const pathArr = Array.isArray(path) ? path : path.split('.');
  let current = draft;
  for (let i = 0;i < pathArr.length - 1;i++) {
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
 */
function copyWhenWrite(obj, path, value) {
  // <TODO>实现写时复制</TODO>
  return pathWrite(obj, path, value);
}

/**
 * @desc 递归修改对象
 * @description 使用惰性更新的方式，模拟 Immer 的 produce 函数
 * @example
 * const obj2 = {
        a: {
          a1: {
            a11: 11112,
            a12: 11113,
            a13: 11114,
          },
        },
        b: {
          b1: 11115,
          b2: 11116,
        },
        c: {
          c1: 11117,
          c2: 11118,
        },
      };
      const finish = produceFake(obj2, (draft) => {
        draft.a.a1.a3 = 100010;
        draft.b.b1 = 100011;
        draft.c.c1 = 100012;
      });
      console.log(finish);
  * @description 该函数模拟了 Immer 的 produce 函数，接受一个草稿对象和一个生产者函数，生产者函数可以修改草稿对象。
 * @param {Object} draft
 * @param {(draft: Object) => void} producer
 * @returns
 */
const PROXY_STATE = Symbol('proxyState');
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
 * @param {*} base 源对象
 * @param {*} parent 父级代理对象
 * @returns
 */
function createProxy(base, parent) {
  if (typeof base !== 'object' || base === null || base[PROXY_STATE]) {
    return base; // 直接返回非对象类型
  }
  const state = {
    base,
    parent,
    copy: null,
    proxy: null,
  }
  const proxy = new Proxy(base, {
    get(target, prop) {
      if (prop === PROXY_STATE) {
        return state;
      }
      const value = state.copy?.[prop] ?? target[prop];
      return createProxy(value, state);
    },
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
// 主入口函数
function produceFake(base, producer) {
  const rootProxy = createProxy(base, null);
  producer(rootProxy);
  // 返回修改后的副本或原始对象
  return rootProxy[PROXY_STATE]?.copy || base;
}

function testProduceFake() {
  const obj = {
    a: {
      a1: 1,
      a2: {
        a21: 2,
        a22: {
          a221: 3,
          a222: 4
        }
      }
    },
    b: { b1: 3 }
  };

  const result = produceFake(obj, draft => {
    draft.a.a1 = 100;  // 修改嵌套属性
    draft.b.b2 = 200;   // 新增属性
  });

  console.log(result.a === obj.a);     // false (a被复制)
  console.log(result.a.a2 === obj.a.a2); // true (未修改的子属性保持引用)
  console.log(result.b === obj.b);     // false (b被复制)
  console.log(result.b.b1 === obj.b.b1); // true (未修改属性保持引用)
}

(function testPathWrite(innerKey) {
  const isNode = typeof process !== 'undefined' && process.versions && process.versions.node;
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  let key = 1;
  if (isNode) {
    console.log('Running in Node.js environment');
    key = process.argv[2] ? parseInt(process.argv[2], 10) : innerKey;
  } else if (isBrowser) {
    console.log('Running in Browser environment');
    key = 1;
  }
  console.log(`Test case: ${key}`);
  switch (key) {
    case 1:
      const obj = {
        a: {
          a1: {
            a2: 11112,
            a3: 11113,
            a4: 11114,
          },
        },
        b: {
          b1: 11115,
          b2: 11116,
        },
        c: {
          c1: 11117,
          c2: 11118,
        },
      };
      pathWrite(obj, 'a.a1.a2', 11112);
      pathWrite(obj, 'a.b.b1', 11115);
      pathWrite(obj, 'a.c.c1', 11117);
      console.log(obj);
      break;
    case 2:
      const obj2 = {
        a: {
          a1: {
            a11: 11112,
            a12: 11113,
            a13: 11114,
          },
        },
        b: {
          b1: 11115,
          b2: 11116,
        },
        c: {
          c1: 11117,
          c2: 11118,
        },
      };
      const finish = produceFake(obj2, (draft) => {
        draft.a.a1.a3 = 100010;
        draft.b.b1 = 100011;
        draft.c.c1 = 100012;
      });
      console.log(finish);
      break;
    case 3:
      testProduceFake();
      break;
  }
})(3);
