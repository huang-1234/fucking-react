import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { DependencyScanner } from '../../../src/core/dependencyScanner';

// 模拟 fs 和 child_process 模块
vi.mock('fs');
vi.mock('child_process');

describe('DependencyScanner', () => {
  let scanner: DependencyScanner;

  beforeEach(() => {
    scanner = new DependencyScanner();
    vi.resetAllMocks();
  });

  it('应正确解析 package.json 并识别漏洞', async () => {
    // 模拟 package.json 内容
    const mockPackageJson = {
      dependencies: { 'lodash': '^4.17.15' },
      devDependencies: { 'typescript': '^4.9.0' }
    };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockPackageJson));

    // 模拟 execSync 输出（npm audit --json 的模拟结果）
    const mockAuditOutput = JSON.stringify({
      vulnerabilities: {
        'lodash': [{
          name: 'lodash',
          severity: 'high',
          via: [{ title: 'Prototype Pollution' }],
          fix: { version: '4.17.21' }
        }]
      }
    });
    vi.mocked(execSync).mockReturnValue(Buffer.from(mockAuditOutput));

    const result = await scanner.scan('/fake/path');

    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.vulnerabilities[0].package).toBe('lodash');
    expect(result.vulnerabilities[0].severity).toBe('high');
    expect(result.vulnerabilities[0].info).toBe('Prototype Pollution');
    expect(result.scannedDependencies).toBe(2);
  });

  it('应在没有漏洞时返回空数组', async () => {
    // 模拟 package.json 内容
    const mockPackageJson = {
      dependencies: { 'safe-package': '1.0.0' },
      devDependencies: {}
    };
    vi.mocked(readFileSync).mockReturnValue(JSON.stringify(mockPackageJson));

    // 模拟无漏洞的输出
    const mockAuditOutput = JSON.stringify({
      vulnerabilities: {}
    });
    vi.mocked(execSync).mockReturnValue(Buffer.from(mockAuditOutput));

    const result = await scanner.scan('/fake/path');

    expect(result.vulnerabilities).toHaveLength(0);
    expect(result.scannedDependencies).toBe(1);
  });

  it('应处理 package.json 不存在的情况', async () => {
    // 模拟 readFileSync 抛出错误
    vi.mocked(readFileSync).mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory, open \'package.json\'');
    });

    await expect(scanner.scan('/fake/path')).rejects.toThrow('无法读取 package.json');
  });
});
