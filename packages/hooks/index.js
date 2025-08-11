/**
 * Hooks链表实现主入口文件
 * 导出所有公共API
 */

const ReactFiberHooks = require('./src/ReactFiberHooks');
const ReactFiber = require('./src/ReactFiber');
const HooksDebugger = require('./src/HooksDebugger');

module.exports = {
  // Hooks API
  useState: ReactFiberHooks.useState,
  useReducer: ReactFiberHooks.useReducer,
  useEffect: ReactFiberHooks.useEffect,
  useMemo: ReactFiberHooks.useMemo,
  useCallback: ReactFiberHooks.useCallback,
  useRef: ReactFiberHooks.useRef,

  // 渲染API
  renderWithHooks: ReactFiberHooks.renderWithHooks,

  // 批处理API
  batchedUpdates: ReactFiberHooks.batchedUpdates,

  // Fiber API
  createFiber: ReactFiber.createFiber,
  createWorkInProgress: ReactFiber.createWorkInProgress,
  createFunctionComponentFiber: ReactFiber.createFunctionComponentFiber,

  // 调试工具
  visualizeHooks: HooksDebugger.visualizeHooks,
  generateHooksDiagram: HooksDebugger.generateHooksDiagram,
  traceHookCalls: HooksDebugger.traceHookCalls,

  // 内部API（仅用于测试和调试）
  _internals: {
    ...ReactFiberHooks._internals
  },

  // 版本信息
  version: require('./package.json').version
};