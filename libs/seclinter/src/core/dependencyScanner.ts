import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { Vulnerability, DependencyScanResult } from './types';

export class DependencyScanner {
  async scan(projectPath: string): Promise<DependencyScanResult> {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // 调用 npm audit 获取漏洞信息
      const auditOutput = execSync('npm audit --json', {
        cwd: projectPath,
        encoding: 'utf-8'
      });

      const auditData = JSON.parse(auditOutput);
      const vulnerabilities: Vulnerability[] = [];

      // 解析 npm audit 输出，提取漏洞信息
      if (auditData.vulnerabilities) {
        for (const [pkgName, vulns] of Object.entries(auditData.vulnerabilities)) {
          if (Array.isArray(vulns)) {
            for (const vuln of vulns) {
              vulnerabilities.push({
                package: pkgName,
                version: deps[pkgName] || 'unknown',
                severity: vuln.severity,
                info: vuln.via?.[0]?.title || 'Unknown vulnerability',
                fix: vuln.fix?.version ? `Update to ${vuln.fix.version}` : 'No fix available'
              });
            }
          } else if (typeof vulns === 'object' && vulns !== null) {
            // 处理单个漏洞对象
            const vuln = vulns as any;
            vulnerabilities.push({
              package: pkgName,
              version: deps[pkgName] || 'unknown',
              severity: vuln.severity || 'medium',
              info: vuln.via?.[0]?.title || 'Unknown vulnerability',
              fix: vuln.fixAvailable ? `Update to ${vuln.fixAvailable}` : 'No fix available'
            });
          }
        }
      }

      return {
        vulnerabilities,
        scannedDependencies: Object.keys(deps).length
      };
    } catch (error) {
      if ((error as Error).message.includes('package.json')) {
        throw new Error(`无法读取 package.json: ${(error as Error).message}`);
      } else {
        throw new Error(`依赖扫描失败: ${(error as Error).message}`);
      }
    }
  }
}
