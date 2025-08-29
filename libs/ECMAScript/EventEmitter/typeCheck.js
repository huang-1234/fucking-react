/**
 * @desc 获取类型
 * @param {unknown} value
 * @returns
 */
function getType(value) {
  return Object.prototype.toString.call(value).slice(8, -1);
}
// 复杂的
/**
 * Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | ArrayBuffer | DataView | SharedArrayBuffer | Promise | Error | Arguments | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | Float64Array | ArrayBuffer | DataView | SharedArrayBuffer | Promise | Error | Arguments | Int8Array | Uint8Array | Uint8ClampedArray | Int16Array |
 */
//

/**
 * @type ObjectType
 * Array | Object | Function | Date | RegExp | Set | Map | WeakSet | WeakMap | Promise | Error | Arguments
 */
/**
 * @desc 创建一个检查函数;
 * @param {ObjectType} type - 检查的类型
 */
function checkType(type) {
  return function (value) {
    return getType(value) === type;
  };
}

export function isFunction(value) {
  return getType(value) === 'Function';
}