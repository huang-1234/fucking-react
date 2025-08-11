/**
 * Hooks链表实现主入口文件
 * 导出所有公共API
 */

import * as ReactFiberHooks from './src/ReactFiberHooks';
import * as ReactFiber from './src/ReactFiber';
import * as HooksDebugger from './src/HooksDebugger';

// 版本信息
import { version } from './package.json';

export {
  // Hooks API
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,

  // 渲染API
  renderWithHooks,

  // 批处理API
  batchedUpdates,

  // Fiber API
  createFiber,
  createWorkInProgress,
  createFunctionComponentFiber,

  // 调试工具
  visualizeHooks,
  generateHooksDiagram,
  traceHookCalls,

  // 内部API（仅用于测试和调试）
  _internals,

  // 版本信息
  version
};

// Hooks API
const {
  useState,
  useReducer,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  renderWithHooks,
  batchedUpdates,
  createHook,
  updateWorkInProgressHook,
  checkHookOrder,
  scheduleUpdateOnFiber,
  flushUpdates
} = ReactFiberHooks;

// Fiber API
const {
  createFiber,
  createWorkInProgress,
  createFunctionComponentFiber
} = ReactFiber;

// 调试工具
const {
  visualizeHooks,
  generateHooksDiagram,
  traceHookCalls
} = HooksDebugger;

// 内部API（仅用于测试和调试）
const _internals = {
  createHook,
  updateWorkInProgressHook,
  checkHookOrder,
  scheduleUpdateOnFiber,
  flushUpdates
};