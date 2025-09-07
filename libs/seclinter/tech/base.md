基于你的需求，我为你设计了一个使用 **Node.js + TypeScript + Vite + Vitest** 技术栈，实现一个专注于 **Web 安全检测与攻防** 的前端 npm 包的技术方案。该方案旨在提供一套可落地的、便于 `cursor` 等 AI 编码助手理解的完整开发指南。

# 🔒 前端安全扫描工具包：SecLinter 技术方案

## 📦 1. 项目概述与目标

**SecLinter** 是一个面向现代前端开发流程的安全扫描与防护工具包。它旨在集成到开发（Dev）和持续集成/持续部署（CI/CD）流程中，帮助开发者**快速识别**项目中的常见安全漏洞、**提供修复建议**，并通过 **Vitest 测试框架** 确保工具包本身代码的质量和可靠性。

其核心能力将包括：
*   **依赖漏洞扫描**：检查 `package.json` 中直接和间接依赖的已知安全漏洞。
*   **基础安全头检测**：审计 HTTP 响应头（如 CSP, X-Frame-Options, HSTS 等）的配置情况。
*   **敏感信息泄露检测**：扫描项目代码中可能存在的硬编码密钥、令牌、密码等。
*   **简单的安全测试用例生成**（可选）：为常见漏洞（如 XSS）提供基本的测试用例。

## 🛠️ 2. 技术栈与开发环境

| 技术                 | 用途                               | 参考/备注                                                                                                |
| :------------------- | :--------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **Node.js** (≥ 18.0.0) | 运行时环境                         |                                                                                  |
| **TypeScript**       | 开发语言，提供类型安全             |                                                                                                          |
| **Vite**             | 构建工具，用于开发和打包库         | 与 Vitest 无缝集成                                                               |
| **Vitest**           | 单元测试框架                       | 极速启动，与 Vite 配置共享                                          |
| **happy-dom** 或 **jsdom** | 模拟浏览器环境，用于 DOM 相关测试  |                                                                                  |
| **Commander.js**     | 构建命令行界面 (CLI)               |                                                                                                          |
| **Axios**            | 发送 HTTP 请求，用于安全头检测等   |                                                                                                          |

## 📁 3. 项目结构与架构设计

```
seclinter/
├── src/                    # 源代码目录
│   ├── core/              # 核心扫描逻辑
│   │   ├── dependencyScanner.ts  # 依赖漏洞扫描（整合 Retire.js 逻辑或调用其 API）
│   │   ├── headerAuditor.ts      # HTTP 安全头审计
│   │   ├── secretScanner.ts     # 敏感信息扫描
│   │   └── types.ts             # 共享类型定义
│   ├── cli/               # 命令行入口和相关逻辑
│   │   └── index.ts       # CLI 主入口（使用 Commander.js）
│   ├── utils/             # 工具函数
│   └── index.ts           # 主入口，暴露 API
├── tests/                 # Vitest 测试目录
│   ├── unit/              # 单元测试
│   │   ├── core/          # 核心模块测试
│   │   └── utils/         # 工具函数测试
│   └── __mocks__/         # 模拟数据
├── vite.config.ts         # Vite 库模式构建配置
├── vitest.config.ts       # Vitest 测试配置（可继承或合并 vite.config.ts）
├── package.json
└── tsconfig.json
```

## ⚙️ 4. 核心功能模块实现细节

### 4.1 依赖漏洞扫描 (`dependencyScanner.ts`)

此模块参考 `Retire.js` 和 `mcp-web-audit` 的思路，检查项目依赖是否存在已知漏洞。

```typescript
// src/core/dependencyScanner.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export interface Vulnerability {
  package: string;
  version: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  info: string;
  fix: string;
}

export interface DependencyScanResult {
  vulnerabilities: Vulnerability[];
  scannedDependencies: number;
}

export class DependencyScanner {
  async scan(projectPath: string): Promise<DependencyScanResult> {
    const packageJsonPath = join(projectPath, 'package.json');
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

    // 实现思路：
    // 1. 获取当前项目的依赖列表 (deps)
    // 2. 调用 npm audit --json 或查询漏洞数据库（如 Node Security Platform API）
    // 3. 解析返回的 JSON 结果，过滤出与当前依赖相关的漏洞
    // 4. 格式化并返回 Vulnerability[] 和扫描统计信息

    // 此处为简化示例逻辑
    const mockVulns: Vulnerability[] = [];
    // ... 实际扫描逻辑 ...

    return {
      vulnerabilities: mockVulns,
      scannedDependencies: Object.keys(deps).length
    };
  }
}
```
**测试要点 (`tests/unit/core/dependencyScanner.test.ts`):**
*   模拟 `package.json` 文件读取。
*   模拟 `execSync` 调用或 HTTP 请求，返回预定义的漏洞数据。
*   断言返回的 `Vulnerability` 数组格式正确，且包含预期的漏洞信息。

### 4.2 HTTP 安全头审计 (`headerAuditor.ts`)

此模块用于检测目标 URL 的 HTTP 响应头安全性。

```typescript
// src/core/headerAuditor.ts
import axios from 'axios';

export interface HeaderAuditResult {
  url: string;
  headers: Record<string, string>;
  missingHeaders: string[];
  recommendations: string[];
}

export class HeaderAuditor {
  async audit(url: string): Promise<HeaderAuditResult> {
    try {
      const response = await axios.get(url);
      const headers = response.headers;
      const missing: string[] = [];
      const recommendations: string[] = [];

      // 检查关键安全头
      const criticalHeaders = [
        'strict-transport-security',
        'x-frame-options',
        'x-content-type-options',
        'content-security-policy',
        'referrer-policy'
      ];

      criticalHeaders.forEach(header => {
        if (!headers[header]) {
          missing.push(header);
          // 可根据缺失的头推送具体的建议
          recommendations.push(`建议配置 ${header} 头以增强安全性。`);
        }
      });

      return {
        url,
        headers,
        missingHeaders: missing,
        recommendations
      };
    } catch (error) {
      throw new Error(`审计 URL ${url} 失败: ${error.message}`);
    }
  }
}
```
**测试要点 (`tests/unit/core/headerAuditor.test.ts`):**
*   使用 `vi.mocked(axios.get).mockResolvedValueOnce()` 模拟 Axios 响应。
*   模拟返回包含/不包含安全头的响应对象。
*   断言 `missingHeaders` 和 `recommendations` 数组符合预期。

### 4.3 敏感信息扫描 (`secretScanner.ts`)

此模块使用正则表达式扫描项目目录，查找可能泄露的敏感信息。

```typescript
// src/core/secretScanner.ts
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

export interface SecretMatch {
  file: string;
  line: number;
  matchedPattern: string;
  preview: string;
}

export interface SecretScanResult {
  secretsFound: SecretMatch[];
  filesScanned: number;
}

export class SecretScanner {
  private patterns = {
    apiKey: /\b(?:api[_-]?key|secret)[\s:=]['"]?([a-z0-9]{32,})['"]?/gi,
    jwt: /\beyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*\b/gi,
    // 可添加更多模式，如 AWS AKID, GitHub token 等
  };

  async scan(projectPath: string): Promise<SecretScanResult> {
    const secrets: SecretMatch[] = [];
    let filesScanned = 0;

    // 递归遍历目录的函数
    const walkDir = (dir: string) => {
      const items = readdirSync(dir);
      for (const item of items) {
        const fullPath = join(dir, item);
        if (statSync(fullPath).isDirectory()) {
          walkDir(fullPath);
        } else {
          // 检查文件扩展名，只扫描 .js, .ts, .json, .env 等文本文件
          if (this.isScannableFile(fullPath)) {
            filesScanned++;
            const content = readFileSync(fullPath, 'utf8');
            this.checkFileContent(content, fullPath, secrets);
          }
        }
      }
    };

    walkDir(projectPath);
    return { secretsFound: secrets, filesScanned };
  }

  private isScannableFile(filePath: string): boolean {
    const scannableExts = ['.js', '.ts', '.json', '.env', '.txt', '.yaml', '.yml', '.html'];
    return scannableExts.some(ext => filePath.endsWith(ext));
  }

  private checkFileContent(content: string, filePath: string, secrets: SecretMatch[]) {
    for (const [key, pattern] of Object.entries(this.patterns)) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lines = content.substring(0, match.index).split('\n');
        const lineNumber = lines.length;
        secrets.push({
          file: filePath,
          line: lineNumber,
          matchedPattern: key,
          preview: match[0].substring(0, 50) + '...', // 预览片段
        });
      }
    }
  }
}
```
**测试要点 (`tests/unit/core/secretScanner.test.ts`):**
*   创建临时测试目录和文件，包含模拟的敏感信息。
*   运行扫描器并断言能正确检测到模拟的敏感信息。
*   检查返回的 `SecretMatch` 对象包含正确的文件路径和行号。

### 4.4 CLI 入口 (`cli/index.ts`)

使用 `Commander.js` 构建命令行界面。

```typescript
// src/cli/index.ts
#!/usr/bin/env node
import { Command } from 'commander';
import { DependencyScanner } from '../core/dependencyScanner';
import { HeaderAuditor } from '../core/headerAuditor';
import { SecretScanner } from '../core/secretScanner';
// ... 其他导入 ...

const program = new Command();

program
  .name('seclinter')
  .description('一个前端安全扫描工具')
  .version('0.0.1');

program
  .command('scan-deps <project-path>')
  .description('扫描项目依赖的已知漏洞')
  .action(async (projectPath) => {
    const scanner = new DependencyScanner();
    try {
      const result = await scanner.scan(projectPath);
      console.log(JSON.stringify(result, null, 2));
      // 可根据 result.vulnerabilities.length 决定进程退出码
      if (result.vulnerabilities.length > 0) process.exit(1);
    } catch (error) {
      console.error('扫描失败:', error.message);
      process.exit(1);
    }
  });

program
  .command('audit-headers <url>')
  .description('审计目标 URL 的 HTTP 安全头')
  .action(async (url) => {
    const auditor = new HeaderAuditor();
    // ... 类似实现 ...
  });

program
  .command('scan-secrets <project-path>')
  .description('扫描项目中的敏感信息泄露')
  .action(async (projectPath) => {
    const scanner = new SecretScanner();
    // ... 类似实现 ...
  });

// 可以添加一个默认命令，运行所有扫描
program
  .command('full-scan <project-path>')
  .description('执行完整的安全扫描')
  .action(async (projectPath) => {
    // 依次调用上述扫描器并汇总结果
  });

program.parse();
```
在 `package.json` 中指定 bin 字段：
```json
{
  "bin": {
    "seclinter": "./dist/cli/index.js"
  }
}
```

## ✅ 5. 测试策略与 Vitest 配置

**Vitest 是保证工具可靠性的关键**。

### 5.1 配置文件 (`vitest.config.ts`)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config'; // 导入 Vite 配置

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true, // 启用全局的 describe, it, expect 等
      environment: 'node', // 大部分测试在 Node 环境下运行
      // 为需要 DOM 环境的测试单独设置环境
      environmentMatchGlobs: [
        ['**/*.test.browser.{ts,js}', 'happy-dom'] // 指定某些测试使用 happy-dom
      ],
      coverage: {
        provider: 'v8', // 使用 V8 的性能分析器
        reporter: ['text', 'json', 'html'], // 多种格式的报告
        include: ['src/**/*.{ts,js}'],
        exclude: ['src/**/*.d.ts', 'tests/**', '**/index.ts'],
      },
      include: ['tests/unit/**/*.{test,spec}.{ts,js}'], // 测试文件匹配模式
    }
  })
);
```

### 5.2 测试示例：依赖扫描器

```typescript
// tests/unit/core/dependencyScanner.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
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
          fix: { isSemVerMajor: true, version: '4.17.21' }
        }]
      }
    });
    vi.mocked(execSync).mockReturnValue(Buffer.from(mockAuditOutput));

    const result = await scanner.scan('/fake/path');

    expect(result.vulnerabilities).toHaveLength(1);
    expect(result.vulnerabilities[0].package).toBe('lodash');
    expect(result.vulnerabilities[0].severity).toBe('high');
    expect(execSync).toHaveBeenCalledWith('npm audit --json', { cwd: '/fake/path', encoding: 'utf-8' });
  });

  it('应在没有漏洞时返回空数组', async () => {
    // ... 模拟无漏洞的输出 ...
  });
});
```

## 📦 6. 构建与发布

### 6.1 Vite 库模式配置 (`vite.config.ts`)

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';
import typescript from '@rollup/plugin-typescript';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SecLinter',
      fileName: (format) => `seclinter.${format}.js`
    },
    rollupOptions: {
      // 确保外部化处理那些你不想打包进库的依赖
      external: ['commander', 'axios', 'fs', 'path', 'child_process'],
      output: {
        // 提供全局变量以便在 UMD 构建模式下使用
        globals: {
          commander: 'commander',
          axios: 'axios',
          fs: 'fs',
          path: 'path',
          child_process: 'child_process'
        }
      }
    }
  },
  plugins: [
    typescript({
      declaration: true,
      outDir: 'dist',
      exclude: ['tests/**']
    })
  ]
});
```

### 6.2 Package.json 脚本

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "prepublishOnly": "npm run build && npm run test:coverage"
  }
}
```

## 🚀 7. 使用与集成示例

### 7.1 作为 CLI 工具使用

```bash
# 全局安装后使用
npm install -g seclinter
seclinter scan-deps ./my-project
seclinter audit-headers https://example.com
seclinter scan-secrets ./my-project

# 或在项目中使用 npx
npx seclinter full-scan ./my-project
```

### 7.2 作为 API 集成到其他 Node.js 项目

```typescript
import { DependencyScanner, HeaderAuditor } from 'seclinter';

const scanner = new DependencyScanner();
const result = await scanner.scan('./my-project');
console.log(result.vulnerabilities);
```

### 7.3 集成到 CI/CD (GitHub Actions 示例)

```yaml
name: Security Scan
on: [push, pull_request]
jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g seclinter # 或使用 npx
      - name: Run Security Linter
        run: |
          seclinter full-scan . --output security-report.json
        continue-on-error: true # 即使发现漏洞也不立即失败，先生成报告
      - name: Upload Security Report
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: security-report.json
      # 可以添加步骤来解析报告并根据严重程度决定是否失败
      - name: Fail on Critical Vulnerabilities
        run: |
          if grep -q '"severity": "critical"' security-report.json; then
            echo "发现严重漏洞，构建失败！"
            exit 1
          fi
```

## 💡 8. 扩展思路

1.  **插件系统**：允许社区扩展新的扫描规则。
2.  **更多检测规则**：
    *   **CSP 分析器**：评估 Content-Security-Policy 头的有效性。
    *   **XSS 模式检测**：简单的静态代码分析，查找常见的 XSS 代码模式。
    *   **过期/废弃包检测**。
3.  **与编辑器集成**：开发 VSCode 等编辑器的扩展，提供实时安全反馈。
4.  **更丰富的报告格式**：支持 SARIF、HTML 等格式，便于与 GitHub Advanced Security 等平台集成。
5.  **配置化**：允许用户通过配置文件 `.seclinterrc` 忽略特定文件或规则。

这个方案提供了一个坚实的起点。你可以使用 `cursor` 等工具，依据这个蓝图逐步实现各个模块。记得**先专注于一个核心功能**（如依赖扫描），完成其开发、测试和打包流程，然后再逐步扩展其他功能。