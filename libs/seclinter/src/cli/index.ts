#!/usr/bin/env node
import { Command } from 'commander';
import { DependencyScanner } from '../core/dependencyScanner';
import { HeaderAuditor } from '../core/headerAuditor';
import { SecretScanner } from '../core/secretScanner';
import { SecurityHeadersManager } from '../protection/securityHeadersManager';
import { DependencyMonitor } from '../protection/dependencyMonitor';
import { FileUploadValidator } from '../protection/fileUploadValidator';
import { formatOutput, saveToFile, sortBySeverity, generateHtmlReport } from '../utils';
import path from 'path';
import fs from 'fs';

const program = new Command();

program
  .name('seclinter')
  .description('前端安全扫描工具')
  .version('0.0.1');

program
  .command('scan-deps')
  .description('扫描项目依赖的已知漏洞')
  .argument('<project-path>', '项目路径')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .action(async (projectPath, options) => {
    const scanner = new DependencyScanner();
    try {
      console.log(`正在扫描项目依赖: ${projectPath}`);
      const result = await scanner.scan(projectPath);

      // 按严重程度排序
      result.vulnerabilities.sort(sortBySeverity);

      // 输出结果
      if (options.output) {
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('依赖漏洞扫描报告', result);
          saveToFile(htmlContent, options.output, 'text');
        } else {
          saveToFile(result, options.output, options.format);
        }
        console.log(`扫描结果已保存到: ${options.output}`);
      } else {
        console.log(formatOutput(result, options.format));
      }

      // 如果发现漏洞，退出码为1
      if (result.vulnerabilities.length > 0) {
        console.log(`\n发现 ${result.vulnerabilities.length} 个漏洞!`);
        process.exit(1);
      }
    } catch (error) {
      console.error('扫描失败:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('audit-headers')
  .description('审计目标 URL 的 HTTP 安全头')
  .argument('<url>', '目标URL')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .action(async (url, options) => {
    const auditor = new HeaderAuditor();
    try {
      console.log(`正在审计 URL 安全头: ${url}`);
      const result = await auditor.audit(url);

      // 输出结果
      if (options.output) {
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('HTTP 安全头审计报告', result);
          saveToFile(htmlContent, options.output, 'text');
        } else {
          saveToFile(result, options.output, options.format);
        }
        console.log(`审计结果已保存到: ${options.output}`);
      } else {
        console.log(formatOutput(result, options.format));
      }

      // 如果缺少安全头，退出码为1
      if (result.missingHeaders.length > 0) {
        console.log(`\n缺少 ${result.missingHeaders.length} 个安全头!`);
        process.exit(1);
      }
    } catch (error) {
      console.error('审计失败:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('scan-secrets')
  .description('扫描项目中的敏感信息泄露')
  .argument('<project-path>', '项目路径')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .option('--ignore <patterns...>', '忽略的文件模式 (glob)')
  .action(async (projectPath, options) => {
    const scanner = new SecretScanner();
    try {
      console.log(`正在扫描敏感信息: ${projectPath}`);
      const result = await scanner.scan(projectPath, options.ignore);

      // 输出结果
      if (options.output) {
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('敏感信息扫描报告', result);
          saveToFile(htmlContent, options.output, 'text');
        } else {
          saveToFile(result, options.output, options.format);
        }
        console.log(`扫描结果已保存到: ${options.output}`);
      } else {
        console.log(formatOutput(result, options.format));
      }

      // 如果发现敏感信息，退出码为1
      if (result.secretsFound.length > 0) {
        console.log(`\n发现 ${result.secretsFound.length} 个敏感信息泄露!`);
        process.exit(1);
      }
    } catch (error) {
      console.error('扫描失败:', (error as Error).message);
      process.exit(1);
    }
  });

program
  .command('full-scan')
  .description('执行完整的安全扫描')
  .argument('<project-path>', '项目路径')
  .option('-u, --url <url>', '要审计的URL (如果有)')
  .option('-o, --output <directory>', '输出结果目录')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .option('--ignore <patterns...>', '忽略的文件模式 (glob)')
  .option('--check-vulnerabilities', '检查依赖漏洞并提供修复建议')
  .option('--generate-security-headers', '生成安全头建议')
  .action(async (projectPath, options) => {
    console.log('开始执行完整安全扫描...');

    const results: Record<string, any> = {};
    let hasIssues = false;

    // 创建输出目录
    let outputDir = options.output;
    if (outputDir) {
      const { ensureDir } = await import('../utils');
      ensureDir(outputDir);
    }

    // 设置扫描选项
    const scanOptions = {
      url: options.url,
      ignorePatterns: options.ignore,
      verbose: true,
      checkDependencyVulnerabilities: options.checkVulnerabilities,
      generateSecurityHeaders: options.generateSecurityHeaders
    };

    // 扫描依赖
    try {
      const depScanner = new DependencyScanner();
      console.log('\n正在扫描项目依赖...');
      const depResult = await depScanner.scan(projectPath);
      results.dependencies = depResult;

      if (depResult.vulnerabilities.length > 0) {
        console.log(`发现 ${depResult.vulnerabilities.length} 个依赖漏洞!`);
        hasIssues = true;
      }

      // 保存结果
      if (outputDir) {
        const outputPath = path.join(outputDir, 'dependency-scan.' + options.format);
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('依赖漏洞扫描报告', depResult);
          saveToFile(htmlContent, outputPath, 'text');
        } else {
          saveToFile(depResult, outputPath, options.format);
        }
      }
    } catch (error) {
      console.error('依赖扫描失败:', (error as Error).message);
    }

    // 扫描敏感信息
    try {
      const secretScanner = new SecretScanner();
      console.log('\n正在扫描敏感信息...');
      const secretResult = await secretScanner.scan(projectPath, options.ignore);
      results.secrets = secretResult;

      if (secretResult.secretsFound.length > 0) {
        console.log(`发现 ${secretResult.secretsFound.length} 个敏感信息泄露!`);
        hasIssues = true;
      }

      // 保存结果
      if (outputDir) {
        const outputPath = path.join(outputDir, 'secret-scan.' + options.format);
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('敏感信息扫描报告', secretResult);
          saveToFile(htmlContent, outputPath, 'text');
        } else {
          saveToFile(secretResult, outputPath, options.format);
        }
      }
    } catch (error) {
      console.error('敏感信息扫描失败:', (error as Error).message);
    }

    // 审计安全头
    if (options.url) {
      try {
        const headerAuditor = new HeaderAuditor();
        console.log(`\n正在审计 URL 安全头: ${options.url}`);
        const headerResult = await headerAuditor.audit(options.url);
        results.headers = headerResult;

        if (headerResult.missingHeaders.length > 0) {
          console.log(`缺少 ${headerResult.missingHeaders.length} 个安全头!`);
          hasIssues = true;
        }

        // 保存结果
        if (outputDir) {
          const outputPath = path.join(outputDir, 'header-audit.' + options.format);
          if (options.format === 'html') {
            const htmlContent = generateHtmlReport('HTTP 安全头审计报告', headerResult);
            saveToFile(htmlContent, outputPath, 'text');
          } else {
            saveToFile(headerResult, outputPath, options.format);
          }
        }
      } catch (error) {
        console.error('安全头审计失败:', (error as Error).message);
      }
    }

    // 保存完整报告
    if (outputDir) {
      const outputPath = path.join(outputDir, 'full-scan.' + options.format);
      if (options.format === 'html') {
        const htmlContent = generateHtmlReport('完整安全扫描报告', results);
        saveToFile(htmlContent, outputPath, 'text');
      } else {
        saveToFile(results, outputPath, options.format);
      }
      console.log(`\n完整扫描报告已保存到: ${outputPath}`);
    }

    console.log('\n安全扫描完成!');

    // 如果发现任何问题，退出码为1
    if (hasIssues) {
      process.exit(1);
    }
  });

// 新增命令：生成CSP策略
program
  .command('generate-csp')
  .description('生成内容安全策略(CSP)')
  .argument('<url>', '目标URL')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .option('--allow-inline-scripts', '允许内联脚本')
  .option('--allow-inline-styles', '允许内联样式')
  .option('--allow-eval', '允许eval()')
  .option('--allow-frames', '允许框架')
  .option('--trusted-domains <domains...>', '可信域名列表')
  .action(async (url, options) => {
    const securityHeadersManager = new SecurityHeadersManager();
    try {
      console.log(`正在为 ${url} 生成CSP策略...`);
      const cspPolicy = await securityHeadersManager.generateCspPolicy(url, {
        allowInlineScripts: options.allowInlineScripts,
        allowInlineStyles: options.allowInlineStyles,
        allowEval: options.allowEval,
        allowFrames: options.allowFrames,
        trustedDomains: options.trustedDomains
      });

      const result = {
        url,
        cspPolicy,
        options: {
          allowInlineScripts: options.allowInlineScripts,
          allowInlineStyles: options.allowInlineStyles,
          allowEval: options.allowEval,
          allowFrames: options.allowFrames,
          trustedDomains: options.trustedDomains
        }
      };

      // 输出结果
      if (options.output) {
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('内容安全策略(CSP)生成报告', result);
          saveToFile(htmlContent, options.output, 'text');
        } else {
          saveToFile(result, options.output, options.format);
        }
        console.log(`CSP策略已保存到: ${options.output}`);
      } else {
        console.log(formatOutput(result, options.format));
      }
    } catch (error) {
      console.error('CSP策略生成失败:', (error as Error).message);
      process.exit(1);
    }
  });

// 新增命令：检查依赖漏洞并提供修复建议
program
  .command('monitor-deps')
  .description('监控依赖漏洞并提供修复建议')
  .argument('<project-path>', '项目路径')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .option('--auto-fix', '尝试自动修复漏洞')
  .option('--min-severity <level>', '最低漏洞严重程度 (critical, high, medium, low, info)', 'medium')
  .option('--direct-only', '只检查直接依赖')
  .action(async (projectPath, options) => {
    const monitor = new DependencyMonitor({
      autoFix: options.autoFix,
      minSeverity: options.minSeverity,
      directDependenciesOnly: options.directOnly
    });

    try {
      console.log(`正在监控项目依赖漏洞: ${projectPath}`);
      const result = await monitor.checkForVulnerabilities(projectPath);

      // 输出结果
      if (options.output) {
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('依赖漏洞监控报告', result);
          saveToFile(htmlContent, options.output, 'text');
        } else {
          saveToFile(result, options.output, options.format);
        }
        console.log(`监控结果已保存到: ${options.output}`);
      } else {
        console.log(formatOutput(result, options.format));
      }

      // 如果发现漏洞，退出码为1
      if (result.vulnerabilities.length > 0) {
        console.log(`\n发现 ${result.vulnerabilities.length} 个漏洞!`);
        if (options.autoFix && result.autoFixResults) {
          console.log(`尝试修复: ${result.autoFixResults.attempted} 个包`);
          console.log(`成功修复: ${result.autoFixResults.fixed} 个包`);
          console.log(`修复失败: ${result.autoFixResults.failed.length} 个包`);
        }
        process.exit(1);
      }
    } catch (error) {
      console.error('监控失败:', (error as Error).message);
      process.exit(1);
    }
  });

// 新增命令：验证文件上传安全
program
  .command('validate-file')
  .description('验证文件上传安全')
  .argument('<file-path>', '文件路径')
  .option('--original-name <name>', '原始文件名')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .option('--allowed-types <types...>', '允许的MIME类型')
  .option('--allowed-extensions <exts...>', '允许的文件扩展名')
  .option('--max-size <size>', '最大文件大小(字节)')
  .action(async (filePath, options) => {
    // 如果未提供原始文件名，使用文件路径的基础名称
    const originalName = options.originalName || path.basename(filePath);

    const validator = new FileUploadValidator({
      allowedMimeTypes: options.allowedTypes,
      allowedExtensions: options.allowedExtensions,
      maxFileSize: options.maxSize ? parseInt(options.maxSize) : undefined
    });

    try {
      console.log(`正在验证文件: ${filePath}`);
      const result = await validator.validateFile(filePath, originalName);

      // 输出结果
      if (options.output) {
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('文件上传验证报告', result);
          saveToFile(htmlContent, options.output, 'text');
        } else {
          saveToFile(result, options.output, options.format);
        }
        console.log(`验证结果已保存到: ${options.output}`);
      } else {
        console.log(formatOutput(result, options.format));
      }

      // 如果验证失败，退出码为1
      if (!result.isValid) {
        console.log(`\n文件验证失败: ${result.errors.join(', ')}`);
        process.exit(1);
      }
    } catch (error) {
      console.error('验证失败:', (error as Error).message);
      process.exit(1);
    }
  });

// 新增命令：扫描文件上传漏洞
program
  .command('scan-uploads')
  .description('扫描项目中的文件上传漏洞')
  .argument('<project-path>', '项目路径')
  .option('-o, --output <file>', '输出结果到文件')
  .option('-f, --format <format>', '输出格式 (json, text, html)', 'json')
  .option('--config <file>', '配置文件路径')
  .action(async (projectPath, options) => {
    try {
      console.log(`正在扫描文件上传漏洞: ${projectPath}`);

      // 加载配置文件（如果有）
      let config: any = {};
      if (options.config) {
        try {
          const configContent = fs.readFileSync(options.config, 'utf-8');
          config = JSON.parse(configContent);
        } catch (error) {
          console.error(`配置文件加载失败: ${(error as Error).message}`);
          process.exit(1);
        }
      }

      // 这里实现文件上传漏洞扫描逻辑
      // 由于这需要静态代码分析，我们可以提供一个简单的实现
      // 搜索常见的文件上传处理代码，并检查是否有安全验证

      const result = {
        message: '文件上传漏洞扫描功能需要进一步实现',
        projectPath,
        config
      };

      // 输出结果
      if (options.output) {
        if (options.format === 'html') {
          const htmlContent = generateHtmlReport('文件上传漏洞扫描报告', result);
          saveToFile(htmlContent, options.output, 'text');
        } else {
          saveToFile(result, options.output, options.format);
        }
        console.log(`扫描结果已保存到: ${options.output}`);
      } else {
        console.log(formatOutput(result, options.format));
      }
    } catch (error) {
      console.error('扫描失败:', (error as Error).message);
      process.exit(1);
    }
  });

program.parse();
