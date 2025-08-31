import { consoleColor } from "../Tools/console";

// 通过网络请求获取模块代码
export interface FetchModuleCodeOptions {
  url: string;
  moduleId?: string;
  cache?: boolean;
  request?: Request;
}

const moduleCodeCache = new Map<string, string>();

export async function fetchModuleCode(options: FetchModuleCodeOptions, fetchApi: typeof fetch = fetch): Promise<string> {
  try {
    if (options.cache && moduleCodeCache.has(options.url)) {
      return Promise.resolve(moduleCodeCache.get(options.url) || '');
    }
    const response = await fetchApi(options.url, options.request);
    const moduleCode = await response.text();
    if (options.cache) {
      moduleCodeCache.set(options.url, moduleCode);
    }
    return moduleCode;
  } catch (error) {
    consoleColor.logGroup('获取模块代码失败:', () => {
      console.error(error);
    });
    return Promise.reject(error);
  }
};