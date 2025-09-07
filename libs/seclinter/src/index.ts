// 导出所有核心模块
export { DependencyScanner } from './core/dependencyScanner';
export { HeaderAuditor } from './core/headerAuditor';
export { SecretScanner } from './core/secretScanner';

// 导出安全防护模块
export {
  csrfProtectionMiddleware,
  xssProtectionMiddleware,
  rateLimitingMiddleware,
  contentSecurityPolicyMiddleware,
  securityMiddlewareBundle
} from './protection/securityMiddleware';

export { FileUploadValidator } from './protection/fileUploadValidator';
export { SecurityHeadersManager } from './protection/securityHeadersManager';
export { DependencyMonitor } from './protection/dependencyMonitor';

// 导出类型定义
export * from './core/types';
export * from './protection/securityMiddleware';
export * from './protection/fileUploadValidator';
export * from './protection/securityHeadersManager';
export * from './protection/dependencyMonitor';

// 导出工具函数
export * from './utils';

// 版本信息
export const VERSION = '0.0.1';

/**
 * 执行完整扫描
 * @param projectPath 项目路径
 * @param options 扫描选项
 */
export async function fullScan(projectPath: string, options?: {
  url?: string;
  ignorePatterns?: string[];
  verbose?: boolean;
  checkDependencyVulnerabilities?: boolean;
  generateSecurityHeaders?: boolean;
}) {
  const results: Record<string, any> = {};

  // 依赖扫描
  const { DependencyScanner } = await import('./core/dependencyScanner');
  const depScanner = new DependencyScanner();
  if (options?.verbose) console.log('正在扫描项目依赖...');
  try {
    results.dependencies = await depScanner.scan(projectPath);
  } catch (error) {
    results.dependencies = { error: (error as Error).message };
  }

  // 敏感信息扫描
  const { SecretScanner } = await import('./core/secretScanner');
  const secretScanner = new SecretScanner();
  if (options?.verbose) console.log('正在扫描敏感信息...');
  try {
    results.secrets = await secretScanner.scan(projectPath, options?.ignorePatterns);
  } catch (error) {
    results.secrets = { error: (error as Error).message };
  }

  // URL安全头审计
  if (options?.url) {
    const { HeaderAuditor } = await import('./core/headerAuditor');
    const headerAuditor = new HeaderAuditor();
    if (options?.verbose) console.log(`正在审计URL安全头: ${options.url}`);
    try {
      results.headers = await headerAuditor.audit(options.url);
    } catch (error) {
      results.headers = { error: (error as Error).message };
    }

    // 生成安全头建议
    if (options?.generateSecurityHeaders) {
      const { SecurityHeadersManager } = await import('./protection/securityHeadersManager');
      const securityHeadersManager = new SecurityHeadersManager();
      if (options?.verbose) console.log(`正在生成安全头建议: ${options.url}`);
      try {
        results.securityHeadersAudit = await securityHeadersManager.auditSiteHeaders(options.url);
      } catch (error) {
        results.securityHeadersAudit = { error: (error as Error).message };
      }
    }
  }

  // 依赖漏洞监控
  if (options?.checkDependencyVulnerabilities) {
    const { DependencyMonitor } = await import('./protection/dependencyMonitor');
    const dependencyMonitor = new DependencyMonitor();
    if (options?.verbose) console.log('正在检查依赖漏洞...');
    try {
      results.dependencyVulnerabilities = await dependencyMonitor.checkForVulnerabilities(projectPath);
    } catch (error) {
      results.dependencyVulnerabilities = { error: (error as Error).message };
    }
  }

  return results;
}
