/**
 * 依赖漏洞监控与自动修复模块
 * 持续监控依赖漏洞，并与CI/CD集成，提供自动修复建议
 */
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * 依赖漏洞信息接口
 */
export interface DependencyVulnerability {
  /** 包名 */
  packageName: string;
  /** 当前版本 */
  currentVersion: string;
  /** 漏洞标题列表 */
  vulnerabilities: string[];
  /** 漏洞严重程度 */
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 修复版本 */
  fixedVersion?: string;
  /** 是否为直接依赖 */
  isDirect: boolean;
  /** 依赖路径 */
  path?: string[];
}

/**
 * 依赖监控结果接口
 */
export interface DependencyMonitorResult {
  /** 发现的漏洞 */
  vulnerabilities: DependencyVulnerability[];
  /** 扫描的包数量 */
  scannedPackages: number;
  /** 有漏洞的包数量 */
  vulnerablePackages: number;
  /** 自动修复结果 */
  autoFixResults?: {
    /** 尝试修复的包数量 */
    attempted: number;
    /** 成功修复的包数量 */
    fixed: number;
    /** 修复失败的包 */
    failed: string[];
  };
}

/**
 * 依赖监控器配置选项
 */
export interface DependencyMonitorOptions {
  /** 是否包含开发依赖 */
  includeDevDependencies?: boolean;
  /** 是否尝试自动修复 */
  autoFix?: boolean;
  /** 忽略的包名列表 */
  ignorePackages?: string[];
  /** 最低漏洞严重程度（低于此级别的漏洞将被忽略） */
  minSeverity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  /** 是否只检查直接依赖 */
  directDependenciesOnly?: boolean;
}

/**
 * 依赖监控器类
 * 提供依赖漏洞检测和自动修复功能
 */
export class DependencyMonitor {
  private options: DependencyMonitorOptions;

  /**
   * 创建依赖监控器实例
   * @param options 监控器配置选项
   */
  constructor(options?: DependencyMonitorOptions) {
    this.options = {
      includeDevDependencies: true,
      autoFix: false,
      ignorePackages: [],
      minSeverity: 'low',
      directDependenciesOnly: false,
      ...options
    };
  }

  /**
   * 检查项目依赖漏洞
   * @param projectPath 项目路径
   * @returns 监控结果
   */
  async checkForVulnerabilities(projectPath: string): Promise<DependencyMonitorResult> {
    try {
      // 构建npm audit命令
      let cmd = `npm audit --json`;
      if (!this.options.includeDevDependencies) {
        cmd += ' --production';
      }

      // 执行npm audit
      const output = execSync(cmd, {
        cwd: projectPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'] // 捕获标准输出和错误
      });

      // 解析审计结果
      const auditResult = JSON.parse(output);
      const vulnerabilities: DependencyVulnerability[] = [];
      let scannedPackages = 0;
      let vulnerablePackages = 0;

      // 从metadata中获取扫描的包数量
      if (auditResult.metadata && auditResult.metadata.totalDependencies) {
        scannedPackages = auditResult.metadata.totalDependencies;
      }

      // 处理漏洞信息
      if (auditResult.vulnerabilities) {
        for (const [pkgName, vulnInfo] of Object.entries(auditResult.vulnerabilities)) {
          // 跳过被忽略的包
          if (this.options.ignorePackages?.includes(pkgName)) {
            continue;
          }

          const vulnData = vulnInfo as any;

          // 确定是否为直接依赖
          const isDirect = vulnData.isDirect || false;

          // 如果只检查直接依赖且当前包不是直接依赖，则跳过
          if (this.options.directDependenciesOnly && !isDirect) {
            continue;
          }

          // 获取漏洞严重程度
          const severity = vulnData.severity || 'medium';

          // 如果漏洞严重程度低于最低要求，则跳过
          const severityLevels = { critical: 4, high: 3, medium: 2, low: 1, info: 0 };
          const minSeverityLevel = severityLevels[this.options.minSeverity || 'low'];
          if (severityLevels[severity] < minSeverityLevel) {
            continue;
          }

          // 收集漏洞信息
          const vulnerability: DependencyVulnerability = {
            packageName: pkgName,
            currentVersion: vulnData.version || 'unknown',
            vulnerabilities: [],
            severity: severity,
            isDirect: isDirect,
            fixedVersion: vulnData.fixAvailable?.version,
            path: vulnData.path
          };

          // 收集漏洞标题
          if (vulnData.via && Array.isArray(vulnData.via)) {
            vulnerability.vulnerabilities = vulnData.via
              .map((v: any) => v.title || v.url || v.toString())
              .filter((v: string) => v); // 过滤空值
          } else if (typeof vulnData.via === 'string') {
            vulnerability.vulnerabilities = [vulnData.via];
          }

          vulnerabilities.push(vulnerability);
          vulnerablePackages++;
        }
      }

      const result: DependencyMonitorResult = {
        vulnerabilities,
        scannedPackages,
        vulnerablePackages
      };

      // 如果配置了自动修复，尝试修复漏洞
      if (this.options.autoFix && vulnerabilities.length > 0) {
        result.autoFixResults = await this.tryAutoFix(projectPath, vulnerabilities);
      }

      return result;
    } catch (error) {
      throw new Error(`依赖漏洞检查失败: ${(error as Error).message}`);
    }
  }

  /**
   * 尝试自动修复漏洞
   * @param projectPath 项目路径
   * @param vulnerabilities 漏洞列表
   * @returns 修复结果
   */
  async tryAutoFix(
    projectPath: string,
    vulnerabilities: DependencyVulnerability[]
  ): Promise<DependencyMonitorResult['autoFixResults']> {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      let attempted = 0, fixed = 0;
      const failed: string[] = [];

      // 仅修复直接依赖
      const directVulnerabilities = vulnerabilities.filter(v => v.isDirect);

      // 如果没有直接依赖的漏洞，返回结果
      if (directVulnerabilities.length === 0) {
        return { attempted, fixed, failed };
      }

      // 检查是否有可用更新
      for (const vuln of directVulnerabilities) {
        // 如果没有修复版本，跳过
        if (!vuln.fixedVersion) {
          failed.push(`${vuln.packageName} (无修复版本)`);
          continue;
        }

        // 尝试更新依赖版本
        try {
          // 更新package.json中的版本
          if (packageJson.dependencies?.[vuln.packageName]) {
            packageJson.dependencies[vuln.packageName] = `^${vuln.fixedVersion}`;
            // 写入更新后的package.json
            writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            fixed++;
          } else if (packageJson.devDependencies?.[vuln.packageName]) {
            packageJson.devDependencies[vuln.packageName] = `^${vuln.fixedVersion}`;
            // 写入更新后的package.json
            writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
            fixed++;
          } else {
            failed.push(`${vuln.packageName} (未找到依赖)`);
          }
        } catch (error) {
          failed.push(`${vuln.packageName} (${(error as Error).message})`);
        }

        attempted++;
      }

      return { attempted, fixed, failed };
    } catch (error) {
      throw new Error(`自动修复尝试失败: ${(error as Error).message}`);
    }
  }

  /**
   * 生成依赖更新建议
   * @param projectPath 项目路径
   * @returns 更新建议
   */
  async generateUpdateSuggestions(projectPath: string): Promise<{
    outdated: Record<string, { current: string; wanted: string; latest: string; }>;
    suggestions: string[];
  }> {
    try {
      // 执行npm outdated命令
      const cmd = `npm outdated --json`;
      const output = execSync(cmd, {
        cwd: projectPath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'] // 捕获标准输出和错误
      });

      // 解析结果
      const outdated = JSON.parse(output || '{}');
      const suggestions: string[] = [];

      // 生成更新建议
      for (const [pkg, info] of Object.entries(outdated)) {
        const pkgInfo = info as { current: string; wanted: string; latest: string; };

        // 如果当前版本与最新版本不同，添加建议
        if (pkgInfo.current !== pkgInfo.latest) {
          suggestions.push(
            `建议将 ${pkg} 从 ${pkgInfo.current} 更新到 ${pkgInfo.latest}`
          );
        }
      }

      return { outdated, suggestions };
    } catch (error) {
      // 如果没有过时的依赖，npm outdated会返回非零退出码
      if ((error as any).status === 1) {
        return { outdated: {}, suggestions: [] };
      }
      throw new Error(`生成更新建议失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取安装的依赖列表
   * @param projectPath 项目路径
   * @returns 依赖列表
   */
  async getInstalledDependencies(projectPath: string): Promise<{
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  }> {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

      return {
        dependencies: packageJson.dependencies || {},
        devDependencies: packageJson.devDependencies || {}
      };
    } catch (error) {
      throw new Error(`获取依赖列表失败: ${(error as Error).message}`);
    }
  }
}
