import { produceFakeES6 } from './produce-proxy';
import { produceFakeES5 } from './produce-es5';

/**
 * @desc 自动检测环境并使用适当的实现
 * @param {Object} base 源对象
 * @param {(draft: Object) => void} producer 生产者函数
 * @returns {Object} 修改后的副本或原始对象
 */
function produceAuto(base, producer) {
  // 检查环境是否支持Proxy
  const hasProxy = typeof Proxy !== 'undefined';
  return hasProxy ?
    produceFakeES6(base, producer) :
    produceFakeES5(base, producer);
}

/**
 * @desc 主入口函数，自动选择实现
 * @param {Object} base 源对象
 * @param {(draft: Object) => void} producer 生产者函数
 * @returns {Object} 修改后的副本或原始对象
 */
function produce(base, producer) {
  return produceAuto(base, producer);
}

export {
  produce,
  produceAuto,
  produceFakeES6,
  produceFakeES5
}