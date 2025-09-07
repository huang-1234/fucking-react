# SecLinter - 前端Web安全检测工具包

SecLinter 是一个面向现代前端开发流程的安全扫描与防护工具包。它旨在集成到开发（Dev）和持续集成/持续部署（CI/CD）流程中，帮助开发者**快速识别**项目中的常见安全漏洞、**提供修复建议**，并通过 **Vitest 测试框架** 确保工具包本身代码的质量和可靠性。

## 功能特点

- **依赖漏洞扫描**：检查 `package.json` 中直接和间接依赖的已知安全漏洞。
- **基础安全头检测**：审计 HTTP 响应头（如 CSP, X-Frame-Options, HSTS 等）的配置情况。
- **敏感信息泄露检测**：扫描项目代码中可能存在的硬编码密钥、令牌、密码等。

## 安装

```bash
# 全局安装
npm install -g seclinter

# 或作为项目依赖安装
npm install --save-dev seclinter
```

## 使用方法

### 命令行使用

```bash
# 扫描项目依赖漏洞
seclinter scan-deps ./my-project

# 审计网站安全头
seclinter audit-headers https://example.com

# 扫描敏感信息泄露
seclinter scan-secrets ./my-project

# 执行完整扫描
seclinter full-scan ./my-project --url https://example.com
```

### 选项

所有命令都支持以下选项：

- `-o, --output <file>`: 将结果保存到指定文件
- `-f, --format <format>`: 输出格式，可选 json, text, html (默认: json)

`scan-secrets` 和 `full-scan` 命令还支持：

- `--ignore <patterns...>`: 忽略的文件模式 (glob)

### 作为库使用

```javascript
import { DependencyScanner, HeaderAuditor, SecretScanner } from 'seclinter';

// 扫描项目依赖
const depScanner = new DependencyScanner();
const depResult = await depScanner.scan('./my-project');
console.log(depResult.vulnerabilities);

// 审计安全头
const headerAuditor = new HeaderAuditor();
const headerResult = await headerAuditor.audit('https://example.com');
console.log(headerResult.missingHeaders);

// 扫描敏感信息
const secretScanner = new SecretScanner();
const secretResult = await secretScanner.scan('./my-project');
console.log(secretResult.secretsFound);
```

## 集成到 CI/CD

### GitHub Actions 示例

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
      - run: npm install -g seclinter
      - name: Run Security Linter
        run: |
          seclinter full-scan . --output security-report.json
        continue-on-error: true
      - name: Upload Security Report
        uses: actions/upload-artifact@v4
        with:
          name: security-report
          path: security-report.json
      - name: Fail on Critical Vulnerabilities
        run: |
          if grep -q '"severity": "critical"' security-report.json; then
            echo "发现严重漏洞，构建失败！"
            exit 1
          fi
```

## 开发

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 构建
npm run build
```

## 许可证

ISC
