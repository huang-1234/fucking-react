export const commonCodeDebounce = `function debounce(func, delay) {
  let timeoutId = null;

  const debouncedFn = function(...args) {
    clearTimeout(timeoutId); // 清除之前的定时器
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };

  debouncedFn.cancel = function() { // 添加取消方法
    clearTimeout(timeoutId);
  };

  return debouncedFn;
}`;

export const commonCodeFlattenPromises = `async function flattenAndResolvePromises(inputArray) {
  // 首先扁平化数组
  const flatArray = inputArray.flat(Infinity);

  // 然后映射每个元素：如果是Promise，则直接使用；否则，用Promise.resolve包裹
  const promiseArray = flatArray.map(item =>
    item instanceof Promise ? item : Promise.resolve(item)
  );

  // 最后用Promise.all并行解析
  return Promise.all(promiseArray);
}`;

export const commonCodeStreamProcessing = `async function processStreamingResponse(stream) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 解码并处理数据块
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;

      // 更新UI
      updateUI(result);
    }
  } finally {
    reader.releaseLock();
  }
}`;

export const commonCodeWorkerProcessing = `// 主线程
const worker = new Worker('data-processor.js');
worker.postMessage(largeDataArray);
worker.onmessage = function(event) {
  const processedResult = event.data;
  updateUI(processedResult);
};

// data-processor.js (Web Worker脚本)
self.onmessage = function(event) {
  const data = event.data;
  // 执行过滤、统计等耗时操作
  const result = data.filter(...).map(...); // 耗时的计算
  self.postMessage(result);
};`

export const commonCodeReactiveSystem = `// 当前正在执行的effect
let activeEffect = null;

// 存储依赖关系的全局Map
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) dep.forEach(effect => effect());
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}`