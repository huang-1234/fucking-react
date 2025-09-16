
// 浅拷贝实现代码
export const shallowCloneCode = `// 浅拷贝实现
function shallowClone(source) {
  if (source === null || typeof source !== 'object') return source;
  const target = Array.isArray(source) ? [] : {};
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}`;

// 深拷贝实现代码
export const deepCloneCode = `// 深拷贝实现
function deepClone(source, map = new WeakMap()) {
  if (source === null || typeof source !== 'object') return source;
  if (map.has(source)) return map.get(source);

  const target = Array.isArray(source) ? [] : {};
  map.set(source, target);

  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = deepClone(source[key], map);
    }
  }
  return target;
}`;

// 测试代码
export const testCode = `// 测试对象
const obj = {
  a: 1,
  b: { c: 2 },
  d: [3, { e: 4 }]
};

// 循环引用
obj.circle = obj;

const shallow = shallowClone(obj);
const deep = deepClone(obj);

console.log('浅拷贝测试:', shallow.b === obj.b); // true
console.log('深拷贝测试:', deep.b === obj.b);     // false
console.log('循环引用测试:', deep.circle === deep); // true`;

// 完整的可运行代码
export const fullCode = `${shallowCloneCode}

${deepCloneCode}

${testCode}

// 运行测试
function runTest() {
  const obj = {
    a: 1,
    b: { c: 2 },
    d: [3, { e: 4 }]
  };

  // 循环引用
  obj.circle = obj;

  const shallow = shallowClone(obj);
  const deep = deepClone(obj);

  const results = {
    shallowTest: shallow.b === obj.b,
    deepTest: deep.b === obj.b,
    circleTest: deep.circle === deep,
    shallowObj: shallow,
    deepObj: deep
  };

  return results;
}`;