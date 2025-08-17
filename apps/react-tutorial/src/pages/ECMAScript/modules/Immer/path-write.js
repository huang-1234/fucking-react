/**
 * @desc Path write function to set value in nested object based on path string
 * @param {Object} draft 源对象
 * @param {string|string[]} path 路径
 * @param {any} value 值
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
 * @param {string|string[]} path 路径
 * @param {any} value 值
 * @returns {Object} 修改后的对象
 */
function copyWhenWrite(obj, path, value) {
  // 实现写时复制
  const pathArr = Array.isArray(path) ? path : path.split('.');
  const result = { ...obj };
  let current = result;
  let previous = obj;

  for (let i = 0; i < pathArr.length - 1; i++) {
    const key = pathArr[i];
    if (!previous[key]) {
      current[key] = {};
    } else {
      current[key] = { ...previous[key] };
    }
    current = current[key];
    previous = previous[key] || {};
  }

  current[pathArr[pathArr.length - 1]] = value;
  return result;
}

export {
  pathWrite,
  copyWhenWrite
}
