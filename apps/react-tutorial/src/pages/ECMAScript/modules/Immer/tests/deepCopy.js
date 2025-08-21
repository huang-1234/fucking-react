function deepCopy(obj) {
  const stack = [{ source: obj, target: {} }];
  const map = new Map(); // 循环引用处理
  while (stack.length) {
    const { source, target } = stack.pop();
    for (const key in source) {
      if (typeof source[key] === 'object' && source[key] !== null) {
        if (map.has(source[key])) {
          target[key] = map.get(source[key]);
        } else {
          target[key] = Array.isArray(source[key]) ? [] : {};
          map.set(source[key], target[key]);
          stack.push({ source: source[key], target: target[key] }); // 递归
        }
      } else target[key] = source[key];
    }
  }
  return map.get(obj);
}

function testDeepCopy() {
  const obj = {
    a: 1,
    b: {
      c: 2,
    },
  };
  const copy = deepCopy(obj);
  console.log(copy);
}

testDeepCopy();