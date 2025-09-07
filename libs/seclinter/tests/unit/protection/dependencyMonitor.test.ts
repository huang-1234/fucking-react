import { describe, it, expect, vi, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { DependencyMonitor } from '../../../src/protection/dependencyMonitor';

// 模拟child_process和fs模块
vi.mock('child_process');
vi.mock('fs');

describe('DependencyMonitor', () => {
  let monitor: DependencyMonitor;

  beforeEach(() => {
    monitor = new DependencyMonitor();
    vi.resetAllMocks();
  });

  describe('checkForVulnerabilities', () => {
    it('应该正确解析npm audit输出', async () => {
      // 模拟npm audit输出
      const mockAuditOutput = JSON.stringify({
        metadata: {
          totalDependencies: 100
        },
        vulnerabilities: {
          'lodash': {
            name: 'lodash',
            version: '4.17.15',
            severity: 'high',
            isDirect: true,
            via: [
              { title: 'Prototype Pollution' }
            ],
            fixAvailable: {
              version: '4.17.21'
            }
          },
          'minimist': {
            name: 'minimist',
            version: '1.2.0',
            severity: 'medium',
            isDirect: false,
            via: [
              { title: 'Prototype Pollution' }
            ],
            fixAvailable: {
              version: '1.2.6'
            }
          }
        }
      });

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockAuditOutput));

      const result = await monitor.checkForVulnerabilities('/fake/path');

      // 验证结果
      expect(result.vulnerabilities).toHaveLength(2);
      expect(result.scannedPackages).toBe(100);
      expect(result.vulnerablePackages).toBe(2);

      // 验证漏洞信息
      const lodashVuln = result.vulnerabilities.find(v => v.packageName === 'lodash');
      expect(lodashVuln).toBeDefined();
      expect(lodashVuln?.severity).toBe('high');
      expect(lodashVuln?.isDirect).toBe(true);
      expect(lodashVuln?.fixedVersion).toBe('4.17.21');
      expect(lodashVuln?.vulnerabilities).toContain('Prototype Pollution');
    });

    it('应该根据配置过滤漏洞', async () => {
      // 创建一个只检查高严重性直接依赖的监控器
      const customMonitor = new DependencyMonitor({
        minSeverity: 'high',
        directDependenciesOnly: true
      });

      // 模拟npm audit输出
      const mockAuditOutput = JSON.stringify({
        metadata: {
          totalDependencies: 100
        },
        vulnerabilities: {
          'lodash': {
            name: 'lodash',
            version: '4.17.15',
            severity: 'high',
            isDirect: true,
            via: [
              { title: 'Prototype Pollution' }
            ]
          },
          'minimist': {
            name: 'minimist',
            version: '1.2.0',
            severity: 'medium',
            isDirect: false,
            via: [
              { title: 'Prototype Pollution' }
            ]
          }
        }
      });

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockAuditOutput));

      const result = await customMonitor.checkForVulnerabilities('/fake/path');

      // 验证结果 - 应该只包含高严重性的直接依赖
      expect(result.vulnerabilities).toHaveLength(1);
      expect(result.vulnerabilities[0].packageName).toBe('lodash');
    });

    it('应该处理npm audit失败的情况', async () => {
      // 模拟npm audit失败
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('Command failed');
      });

      await expect(monitor.checkForVulnerabilities('/fake/path')).rejects.toThrow('依赖漏洞检查失败');
    });
  });

  describe('tryAutoFix', () => {
    it('应该尝试修复直接依赖的漏洞', async () => {
      // 模拟package.json
      const mockPackageJson = JSON.stringify({
        dependencies: {
          'lodash': '^4.17.15'
        },
        devDependencies: {
          'minimist': '^1.2.0'
        }
      });

      vi.mocked(readFileSync).mockReturnValue(mockPackageJson);

      const vulnerabilities = [
        {
          packageName: 'lodash',
          currentVersion: '4.17.15',
          vulnerabilities: ['Prototype Pollution'],
          severity: 'high' as const,
          fixedVersion: '4.17.21',
          isDirect: true
        },
        {
          packageName: 'minimist',
          currentVersion: '1.2.0',
          vulnerabilities: ['Prototype Pollution'],
          severity: 'medium' as const,
          fixedVersion: '1.2.6',
          isDirect: true
        }
      ];

      const result = await monitor.tryAutoFix('/fake/path', vulnerabilities);

      // 验证是否尝试修复
      expect(writeFileSync).toHaveBeenCalled();
      expect(result?.attempted).toBe(2);
      expect(result?.fixed).toBe(2);
      expect(result?.failed).toHaveLength(0);

      // 验证是否正确更新了package.json
      const updatedPackageJson = JSON.parse(vi.mocked(writeFileSync).mock.calls[0][1] as string);
      expect(updatedPackageJson.dependencies.lodash).toBe('^4.17.21');
      expect(updatedPackageJson.devDependencies.minimist).toBe('^1.2.6'); // Object.is equality
    });

    it('应该处理没有修复版本的漏洞', async () => {
      // 模拟package.json
      const mockPackageJson = JSON.stringify({
        dependencies: {
          'vulnerable-pkg': '^1.0.0'
        }
      });

      vi.mocked(readFileSync).mockReturnValue(mockPackageJson);

      const vulnerabilities = [
        {
          packageName: 'vulnerable-pkg',
          currentVersion: '1.0.0',
          vulnerabilities: ['Some Vulnerability'],
          severity: 'high' as const,
          fixedVersion: undefined, // 没有修复版本
          isDirect: true
        }
      ];

      const result = await monitor.tryAutoFix('/fake/path', vulnerabilities);

      // 验证尝试修复失败
      expect(result?.attempted).toBe(1);
      expect(result?.fixed).toBe(0);
      expect(result?.failed?.[0]).toContain('vulnerable-pkg');
    });
  });

  describe('generateUpdateSuggestions', () => {
    it('应该生成依赖更新建议', async () => {
      // 模拟npm outdated输出
      const mockOutdatedOutput = JSON.stringify({
        'lodash': {
          current: '4.17.15',
          wanted: '4.17.21',
          latest: '4.17.21'
        },
        'express': {
          current: '4.17.1',
          wanted: '4.17.3',
          latest: '4.18.2'
        }
      });

      vi.mocked(execSync).mockReturnValue(Buffer.from(mockOutdatedOutput));

      const result = await monitor.generateUpdateSuggestions('/fake/path');

      // 验证结果
      expect(result.suggestions).toHaveLength(2);
      expect(result.suggestions[0]).toContain('lodash');
      expect(result.suggestions[1]).toContain('express');
      expect(result.outdated).toHaveProperty('lodash');
      expect(result.outdated).toHaveProperty('express');
    });

    it('应该处理没有过时依赖的情况', async () => {
      // 模拟npm outdated失败（没有过时依赖时会返回非零退出码）
      vi.mocked(execSync).mockImplementation(() => {
        const error: any = new Error('Command failed');
        error.status = 1;
        throw error;
      });

      const result = await monitor.generateUpdateSuggestions('/fake/path');

      // 验证结果
      expect(result.suggestions).toHaveLength(0);
      expect(result.outdated).toEqual({});
    });
  });

  describe('getInstalledDependencies', () => {
    it('应该返回已安装的依赖列表', async () => {
      // 模拟package.json
      const mockPackageJson = JSON.stringify({
        dependencies: {
          'lodash': '^4.17.21',
          'express': '^4.18.2'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'vitest': '^2.0.0'
        }
      });

      vi.mocked(readFileSync).mockReturnValue(mockPackageJson);

      const result = await monitor.getInstalledDependencies('/fake/path');

      // 验证结果
      expect(result.dependencies).toHaveProperty('lodash');
      expect(result.dependencies).toHaveProperty('express');
      expect(result.devDependencies).toHaveProperty('typescript');
      expect(result.devDependencies).toHaveProperty('vitest');
    });

    it('应该处理package.json不存在的情况', async () => {
      // 模拟readFileSync抛出错误
      vi.mocked(readFileSync).mockImplementation(() => {
        throw new Error('ENOENT: no such file or directory');
      });

      await expect(monitor.getInstalledDependencies('/fake/path')).rejects.toThrow('获取依赖列表失败');
    });
  });
});
