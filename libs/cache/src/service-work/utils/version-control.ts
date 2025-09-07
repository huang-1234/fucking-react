/**
 * Service Worker 版本控制工具
 * 用于管理缓存版本和更新
 */

/**
 * 生成缓存版本号
 * @param prefix 缓存名称前缀
 * @param version 版本号
 * @returns 完整缓存名称
 */
export function generateCacheName(prefix: string, version: string): string {
  return `${prefix}-v${version}`;
}

/**
 * 从缓存名称中提取版本号
 * @param cacheName 缓存名称
 * @returns 版本号
 */
export function extractVersionFromCacheName(cacheName: string): string | null {
  const match = cacheName.match(/-v([^-]+)$/);
  return match ? match[1] : null;
}

/**
 * 比较版本号
 * @param version1 版本号1
 * @param version2 版本号2
 * @returns -1: version1 < version2, 0: version1 = version2, 1: version1 > version2
 */
export function compareVersions(version1: string, version2: string): number {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  // 补齐版本号长度
  const maxLength = Math.max(parts1.length, parts2.length);
  while (parts1.length < maxLength) parts1.push(0);
  while (parts2.length < maxLength) parts2.push(0);

  // 逐位比较
  for (let i = 0; i < maxLength; i++) {
    if (parts1[i] > parts2[i]) return 1;
    if (parts1[i] < parts2[i]) return -1;
  }

  return 0;
}

/**
 * 生成缓存白名单
 * @param prefix 缓存名称前缀
 * @param currentVersion 当前版本号
 * @param additionalCaches 额外保留的缓存名称
 * @returns 缓存白名单
 */
export function generateCacheWhitelist(
  prefix: string,
  currentVersion: string,
  additionalCaches: string[] = []
): string[] {
  const currentCacheName = generateCacheName(prefix, currentVersion);
  return [currentCacheName, ...additionalCaches];
}

/**
 * 生成资源修订版本号（用于缓存更新）
 * @param content 资源内容
 * @returns 修订版本号（哈希值）
 */
export function generateRevision(content: string): string {
  // 简单哈希函数
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash).toString(16);
}

/**
 * 生成URL带版本参数
 * @param url 原始URL
 * @param version 版本号
 * @returns 带版本参数的URL
 */
export function addVersionToUrl(url: string, version: string): string {
  const urlObj = new URL(url, self.location.origin);
  urlObj.searchParams.set('v', version);
  return urlObj.toString();
}

/**
 * 从URL中提取版本参数
 * @param url URL
 * @returns 版本号
 */
export function extractVersionFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('v');
  } catch (error) {
    return null;
  }
}
