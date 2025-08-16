const PROXY_STATE = Symbol('proxyState');

/**
 * @desc 更新父级代理对象
 * @param {ProxyState} parentState 父级代理对象
 * @param {ProxyState} childState 子级代理对象
 */
function updateParent(parentState, childState) {
  if (!parentState.copy) {
    parentState.copy = { ...parentState.base };
  }
  // 更新父级副本中的子对象引用
  for (const key in parentState.copy) {
    if (parentState.copy[key] === childState.base) {
      parentState.copy[key] = childState.copy;
    }
  }
  // 递归更新祖父级
  if (parentState.parent) {
    updateParent(parentState.parent, parentState);
  }
}

export {
  PROXY_STATE,
  updateParent
}