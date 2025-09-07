/// <reference types="chrome" />

/**
 * 获取存储数据
 * @param key 键名或键名对象
 * @returns 存储的数据
 */
export async function getStorage<T>(key: string | string[] | { [key: string]: any }): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result as T);
    });
  });
}

/**
 * 从 storage 获取存储数据（兼容旧版）
 * @param key 键名
 * @returns 存储的数据
 */
export async function getStorageFromStorage<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key] || null);
    });
  });
}

/**
 * 设置存储数据
 * @param items 键值对对象
 */
export async function setStorage(items: { [key: string]: any }): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, () => {
      resolve();
    });
  });
}

/**
 * 设置存储数据到 storage（兼容旧版）
 * @param key 键名
 * @param value 值
 */
export async function setStorageToStorage<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve();
    });
  });
}

/**
 * 删除存储数据
 * @param keys 要删除的键名或键名数组
 */
export async function removeStorage(keys: string | string[]): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove(keys, () => {
      resolve();
    });
  });
}

/**
 * 清空存储数据
 */
export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(() => {
      resolve();
    });
  });
}

// 导出StorageManager类以保持向后兼容
export class StorageManager {
  /**
   * 获取存储数据
   * @param key 键名
   * @returns 存储的数据
   */
  async get<T = any>(key: string): Promise<T | null> {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (result) => {
        resolve(result[key] || null);
      });
    });
  }

  /**
   * 设置存储数据
   * @param key 键名
   * @param value 值
   */
  async set<T = any>(key: string, value: T): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve();
      });
    });
  }

  /**
   * 删除存储数据
   * @param key 键名
   */
  async remove(key: string): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => {
        resolve();
      });
    });
  }

  /**
   * 清空存储数据
   */
  async clear(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => {
        resolve();
      });
    });
  }

  /**
   * 获取所有存储数据
   * @returns 所有存储数据
   */
  async getAll(): Promise<Record<string, any>> {
    return new Promise((resolve) => {
      chrome.storage.local.get(null, (result) => {
        resolve(result);
      });
    });
  }
}