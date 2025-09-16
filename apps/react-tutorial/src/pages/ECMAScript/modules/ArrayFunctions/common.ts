
// map 实现代码
export const mapCode = `// map 实现
Array.prototype.myMap = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};`;

// filter 实现代码
export const filterCode = `// filter 实现
Array.prototype.myFilter = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};`;

// reduce 实现代码
export const reduceCode = `// reduce 实现
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue !== undefined ? initialValue : this[0];
  let startIndex = initialValue !== undefined ? 0 : 1;

  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(accumulator, this[i], i, this);
  }
  return accumulator;
};`;

// 测试代码
export const testCode = `const arr = [1, 2, 3, 4];

// map 测试
console.log(arr.myMap(x => x * 2)); // [2, 4, 6, 8]

// filter 测试
console.log(arr.myFilter(x => x > 2)); // [3, 4]

// reduce 测试
console.log(arr.myReduce((acc, cur) => acc + cur, 0)); // 10`;

// 完整的可运行代码
export const fullCode = `${mapCode}

${filterCode}

${reduceCode}

${testCode}`;