/**
 * 环境工具函数
 */

/**
 * 是否为服务端环境
 */
export const isServer = typeof window === 'undefined';

/**
 * 是否为客户端环境
 */
export const isClient = !isServer;

/**
 * 是否为开发环境
 */
export const isDev = process.env.NODE_ENV !== 'production';

/**
 * 是否为生产环境
 */
export const isProd = process.env.NODE_ENV === 'production';

/**
 * 是否为测试环境
 */
export const isTest = process.env.NODE_ENV === 'test';

/**
 * 安全地执行仅客户端代码
 * @param fn 要执行的函数
 */
export const runOnClient = <T>(fn: () => T): T | undefined => {
  if (isClient) {
    return fn();
  }
  return undefined;
};

/**
 * 安全地执行仅服务端代码
 * @param fn 要执行的函数
 */
export const runOnServer = <T>(fn: () => T): T | undefined => {
  if (isServer) {
    return fn();
  }
  return undefined;
};
