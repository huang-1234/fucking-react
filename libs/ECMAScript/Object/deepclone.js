

function checkType(source) {
  return Object.prototype.toString.call(source).slice(8, -1);
}
const basicType = ['Number', 'String', 'Boolean', 'Null', 'Undefined', 'Symbol', 'Function'];
const originType = ['RegExp', 'Date', 'Error', 'Promise', 'Map', 'Set', 'WeakMap', 'WeakSet'];
/**
 * @description 深拷贝
 * @param {Object} source 源对象
 * @param {WeakMap} memory 记忆对象
 * @returns {Object} 深拷贝后的对象
 */
function deepClone(source, memory = new WeakMap()) {
  if (memory.has(source)) {
    return memory.get(source);
  }
  if (basicType.includes(checkType(source))) {
    return source;
  }
  if (originType.includes(checkType(source))) {
    switch (checkType(source)) {
      case 'RegExp':
        return new RegExp(source.source, source.flags);
      case 'Date':
        return new Date(source);
      case 'Error':
        return new Error(source.message);
      case 'Promise':
        return new Promise((resolve, reject) => { resolve(source.value); });
      case 'Map':
        return new Map(source);
      case 'Set':
        return new Set(source);
      case 'WeakMap':
        return new WeakMap(source);
      case 'WeakSet':
        return new WeakSet(source);
      case 'Symbol':
        return Symbol(source);
      default:
        try {
          return new source.constructor(source);
        } catch (error) {
          console.error(error);
          return new Object(source);
        }
    }
  }
  const target = basicType.includes(checkType(source)) ? source : {};
  memory.set(source, target);

  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = deepClone(source[key], memory);
    }
  }
  return target;
}


const obj = {
  a: 1,
  b: {
    b1: 2,
    b2: new Date(`2025-08-06`),
    b3: /abc/g,
    b4: new Map([['a', 1], ['b', 2]]),
    b5: new Set([1, 2, 3]),
    b6: new Error('error'),
    b7: new Function('return 1'),
    b8: new RegExp('abc', 'g'),
    b9: new Promise((resolve, reject) => { resolve(1); }),
    b10: Symbol('symbol'),
    b11: new Proxy({ a: 1 }, { get: (target, key) => { return target[key]; } }),
    // b11: new Proxy({ a: 1 }, { get: (target, key) => { return target[key]; } }),
    // b12: new WeakMap({}, { a: 1 }),
    // b13: new WeakSet([new Date(2025, 8, 6)]),
    // b14: new Map({ a: 1 }, { b: 2 }),
    // b15: new Set({ a: 1 }, { b: 2 }),
    // b16: new Error('error'),
    // b17: new Function('return 1'),
    // b18: new RegExp('abc'),
    // b19: new Promise((resolve, reject) => { resolve(1); }),
  },
  d: [3, { e: 4 }]
};

console.log(deepClone(obj));