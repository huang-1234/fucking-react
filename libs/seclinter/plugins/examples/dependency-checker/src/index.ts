/**
 * SecLinter Dependency Checker Plugin
 * 检查项目依赖中的已知安全漏洞
 */
import {
  PluginInterface,
  PluginMeta,
  Sandbox,
  PluginHelpers,
  ScanResult
} from 'seclinter';
import * as path from 'path';
import * as semver from 'semver';
import axios from 'axios';

/**
 * 插件元数据
 */
export const meta: PluginMeta = {
  name: 'seclinter-plugin-dependency-checker',
  version: '1.0.0',
  description: 'Checks project dependencies for known security vulnerabilities',
  target: 'dependency',
  tags: ['security', 'dependency', 'vulnerability'],
  permissions: ['fs:read', 'net:outbound']
};

/**
 * 漏洞数据库接口
 */
interface VulnerabilityDatabase {
  getVulnerabilities(packageName: string, version: string): Promise<Vulnerability[]>;
}

/**
 * 漏洞信息接口
 */
interface Vulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  affectedVersions: string;
  fixedVersion?: string;
  references: string[];
}

/**
 * 依赖检查器插件
 */
class DependencyCheckerPlugin implements PluginInterface {
  private helpers: PluginHelpers;
  private sandbox: Sandbox;
  private vulnerabilityDb: VulnerabilityDatabase;

  /**
   * 初始化插件
   * @param sandbox 沙箱环境
   * @param helpers 插件助手工具
   */
  async init(sandbox: Sandbox, helpers?: PluginHelpers): Promise<void> {
    this.sandbox = sandbox;
    this.helpers = helpers || {} as PluginHelpers;

    // 初始化漏洞数据库
    this.vulnerabilityDb = new MockVulnerabilityDatabase();

    this.helpers.logger?.info('Dependency Checker plugin initialized');
  }

  /**
   * 执行扫描
   * @param projectPath 项目路径
   * @param options 扫描选项
   * @returns 扫描结果
   */
  async scan(projectPath: string, options?: Record<string, any>): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    try {
      // 读取package.json
      const packageJsonPath = path.join(projectPath, 'package.json');

      // 检查package.json是否存在
      if (!await this.helpers.fs.exists(packageJsonPath)) {
        this.helpers.logger?.warn(`package.json not found at ${packageJsonPath}`);
        return [];
      }

      // 读取package.json内容
      const packageJsonContent = await this.helpers.fs.readFile(packageJsonPath);
      const packageJson = JSON.parse(packageJsonContent);

      // 获取依赖
      const dependencies = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      // 检查每个依赖
      for (const [packageName, versionRange] of Object.entries(dependencies)) {
        // 解析版本范围
        const version = this.parseVersion(versionRange as string);

        // 获取漏洞信息
        const vulnerabilities = await this.vulnerabilityDb.getVulnerabilities(packageName, version);

        // 添加扫描结果
        for (const vuln of vulnerabilities) {
          results.push({
            ruleId: `dependency-vulnerability-${vuln.id}`,
            plugin: meta.name,
            level: vuln.severity,
            file: 'package.json',
            message: `Vulnerable dependency: ${packageName}@${version} - ${vuln.title}`,
            suggestion: vuln.fixedVersion
              ? `Update to version ${vuln.fixedVersion} or later`
              : 'Consider replacing this dependency or implementing additional security controls',
            metadata: {
              packageName,
              version,
              vulnerabilityId: vuln.id,
              description: vuln.description,
              references: vuln.references
            }
          });
        }
      }

      return results;
    } catch (error) {
      this.helpers.logger?.error(`Dependency Checker error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 解析版本范围
   * @param versionRange 版本范围
   * @returns 版本号
   */
  private parseVersion(versionRange: string): string {
    // 处理版本范围，如 ^1.2.3, ~1.2.3, >=1.2.3, etc.
    // 这里简化处理，仅提取数字部分
    const match = versionRange.match(/\d+\.\d+\.\d+/);
    return match ? match[0] : versionRange;
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    // 清理资源
  }
}

/**
 * 模拟漏洞数据库实现
 */
class MockVulnerabilityDatabase implements VulnerabilityDatabase {
  // 模拟漏洞数据
  private vulnerabilities: Record<string, Vulnerability[]> = {
    'axios': [
      {
        id: 'CVE-2023-45857',
        title: 'Server-Side Request Forgery',
        description: 'Axios before 1.6.0 allows SSRF via a URL that contains a DNS record with a long TTL.',
        severity: 'high',
        affectedVersions: '<1.6.0',
        fixedVersion: '1.6.0',
        references: [
          'https://nvd.nist.gov/vuln/detail/CVE-2023-45857',
          'https://github.com/axios/axios/security/advisories/GHSA-wf5p-g6vw-rhxx'
        ]
      }
    ],
    'lodash': [
      {
        id: 'CVE-2021-23337',
        title: 'Prototype Pollution',
        description: 'Lodash versions prior to 4.17.21 are vulnerable to prototype pollution.',
        severity: 'high',
        affectedVersions: '<4.17.21',
        fixedVersion: '4.17.21',
        references: [
          'https://nvd.nist.gov/vuln/detail/CVE-2021-23337',
          'https://github.com/lodash/lodash/pull/5065'
        ]
      }
    ],
    'minimist': [
      {
        id: 'CVE-2021-44906',
        title: 'Prototype Pollution',
        description: 'minimist before 1.2.6 is vulnerable to prototype pollution.',
        severity: 'medium',
        affectedVersions: '<1.2.6',
        fixedVersion: '1.2.6',
        references: [
          'https://nvd.nist.gov/vuln/detail/CVE-2021-44906',
          'https://github.com/minimistjs/minimist/issues/164'
        ]
      }
    ]
  };

  /**
   * 获取漏洞信息
   * @param packageName 包名
   * @param version 版本
   * @returns 漏洞列表
   */
  async getVulnerabilities(packageName: string, version: string): Promise<Vulnerability[]> {
    // 获取包的漏洞列表
    const packageVulns = this.vulnerabilities[packageName] || [];

    // 过滤出受影响的版本
    return packageVulns.filter(vuln => {
      // 检查版本是否受影响
      return semver.satisfies(version, vuln.affectedVersions);
    });
  }
}

export default new DependencyCheckerPlugin();
