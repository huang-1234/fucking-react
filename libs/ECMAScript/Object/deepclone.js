

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

// deepClone.js

/**
 * 获取对象的准确类型字符串
 * @param {*} source 源对象
 * @returns {string} 类型字符串，如 'Object', 'Array', 'Date' 等
 */
function getType(source) {
  return Object.prototype.toString.call(source).slice(8, -1);
}

/**
 * @description 深拷贝
 * @param {*} source 源对象
 * @param {WeakMap} memory 记忆对象，用于处理循环引用
 * @returns {*} 深拷贝后的对象
 */
function deepClone(source, memory = new WeakMap()) {
  // 处理循环引用
  if (memory.has(source)) {
    return memory.get(source);
  }

  const type = getType(source);

  // 处理基本类型和函数（函数通常直接共享）
  if (typeof source !== 'object' || source === null) {
    return source;
  }

  // 处理特殊对象类型
  switch (type) {
    case 'Date':
      return new Date(source.getTime());
    case 'RegExp':
      return new RegExp(source.source, source.flags);
    case 'Error':
      return new Error(source.message);
    case 'Map':
      const clonedMap = new Map();
      memory.set(source, clonedMap);
      source.forEach((value, key) => {
        clonedMap.set(deepClone(key, memory), deepClone(value, memory));
      });
      return clonedMap;
    case 'Set':
      const clonedSet = new Set();
      memory.set(source, clonedSet);
      source.forEach((value) => {
        clonedSet.add(deepClone(value, memory));
      });
      return clonedSet;
    case 'Array':
      const clonedArray = [];
      memory.set(source, clonedArray);
      for (let i = 0; i < source.length; i++) {
        clonedArray[i] = deepClone(source[i], memory);
      }
      // 处理稀疏数组
      if (source.length !== clonedArray.length) {
        clonedArray.length = source.length;
      }
      return clonedArray;
    // 注意：WeakMap、WeakSet 由于其特性，通常无法也不建议进行深拷贝。
    // 如果业务场景确实需要，可能需要非常特殊和谨慎的处理，这里返回原引用（浅拷贝）并警告。
    case 'WeakMap':
      console.warn('Deep cloning a WeakMap is not supported. Returning shallow reference.');
      return source;
    case 'WeakSet':
      console.warn('Deep cloning a WeakSet is not supported. Returning shallow reference.');
      return source;
    case 'Promise':
      // Promise 的状态和值是不可变的，通常直接返回原引用或考虑其当前状态？
      // 一种可能：如果Promise是resolved或rejected，则返回一个新的resolved或rejected的Promise，其值为拷贝后的值或原因。
      // 但这很复杂且可能不必要。通常直接返回原引用。
      console.warn('Deep cloning a Promise is complex and often unnecessary. Returning shallow reference.');
      return source;
    default:
      // 处理其他对象（包括普通对象、可能的内置对象如ArrayBuffer等——需要更完整的switch case）和自定义对象
      // 这里以普通对象为例
      if (typeof source === 'object' && source !== null) {
        // 获取源对象的原型以创建正确类型的空对象
        const clonedObject = Object.create(Object.getPrototypeOf(source));
        memory.set(source, clonedObject);

        //  Reflect.ownKeys 可以获取所有自身属性（包括Symbol和不可枚举）
        const keys = Reflect.ownKeys(source);
        for (const key of keys) {
          // 避免拷贝原型链上的属性
          if (source.propertyIsEnumerable(key)) {
            clonedObject[key] = deepClone(source[key], memory);
          }
        }
        return clonedObject;
      }
      // 对于无法识别的类型，保守返回原对象
      console.warn(`Unsupported object type during deep cloning: ${type}. Returning shallow reference.`);
      return source;
  }
}

export default deepClone;