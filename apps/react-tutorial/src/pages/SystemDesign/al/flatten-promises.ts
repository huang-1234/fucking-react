import { List } from 'immutable';

/**
 * 扁平化并并行解析所有Promise
 *
 * 时间复杂度：O(n) - 其中n是数组中元素的数量
 * 空间复杂度：O(n) - 需要存储扁平化后的数组
 *
 * @param inputArray 可能包含嵌套的Promise或普通值的数组
 * @returns 解析后的结果数组的Promise
 */
export async function flattenAndResolvePromises<T>(
  inputArray: Array<T | Promise<T> | Array<T | Promise<T>>>
): Promise<T[]> {
  // 使用Immutable.js处理数组，确保不修改输入参数
  const immutableArray = List(inputArray);

  // 递归扁平化数组
  const flatten = (arr: any): any[] => {
    return Array.isArray(arr)
      ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), [])
      : [arr];
  };

  // 扁平化数组
  const flatArray = flatten(immutableArray.toJS());

  // 将所有元素转换为Promise
  const promiseArray = flatArray.map(item =>
    item instanceof Promise ? item : Promise.resolve(item)
  );

  // 并行解析所有Promise
  return Promise.all(promiseArray);
}

/**
 * 串行解析Promise数组
 *
 * 时间复杂度：O(n) - 其中n是数组中元素的数量，但每个Promise是串行执行的
 * 空间复杂度：O(n) - 需要存储扁平化后的数组和结果数组
 *
 * @param inputArray 可能包含嵌套的Promise或普通值的数组
 * @returns 串行解析后的结果数组的Promise
 */
export async function serialFlattenAndResolvePromises<T>(
  inputArray: Array<T | Promise<T> | Array<T | Promise<T>>>
): Promise<T[]> {
  // 使用Immutable.js处理数组，确保不修改输入参数
  const immutableArray = List(inputArray);

  // 递归扁平化数组
  const flatten = (arr: any): any[] => {
    return Array.isArray(arr)
      ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), [])
      : [arr];
  };

  // 扁平化数组
  const flatArray = flatten(immutableArray.toJS());

  // 串行解析所有Promise
  const results: T[] = [];

  for (const item of flatArray) {
    const result = await (item instanceof Promise ? item : Promise.resolve(item));
    results.push(result);
  }

  return results;
}

/**
 * 生成Promise扁平化和解析的可视化数据
 *
 * @param inputArray 输入的嵌套数组结构
 * @param resolveTimings 每个Promise解析所需的时间（毫秒）
 * @param parallel 是否并行解析
 * @returns 可视化数据对象
 */
export function visualizeFlattenPromises(
  inputArray: any[],
  resolveTimings: number[],
  parallel: boolean = true
) {
  // 递归扁平化数组
  const flatten = (arr: any): any[] => {
    return Array.isArray(arr)
      ? arr.reduce((acc, val) => acc.concat(Array.isArray(val) ? flatten(val) : val), [])
      : [arr];
  };

  // 扁平化数组
  const flatArray = flatten(inputArray);

  // 为每个元素分配解析时间
  const promiseTimings = flatArray.map((item, index) => ({
    id: index,
    value: item,
    isPromise: item instanceof Promise || Math.random() > 0.5, // 模拟一些是Promise
    resolveTime: resolveTimings[index % resolveTimings.length]
  }));

  // 计算执行时间线
  let currentTime = 0;
  const timeline: Array<{id: number, startTime: number, endTime: number}> = [];

  if (parallel) {
    // 并行执行时间线
    promiseTimings.forEach((item) => {
      if (item.isPromise) {
        timeline.push({
          id: item.id,
          startTime: 0,
          endTime: item.resolveTime
        });
      }
    });
  } else {
    // 串行执行时间线
    promiseTimings.forEach((item) => {
      if (item.isPromise) {
        timeline.push({
          id: item.id,
          startTime: currentTime,
          endTime: currentTime + item.resolveTime
        });
        currentTime += item.resolveTime;
      }
    });
  }

  return {
    original: inputArray,
    flattened: flatArray,
    timeline,
    parallel
  };
}
