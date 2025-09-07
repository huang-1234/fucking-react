import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { SecretScanner } from '../../../src/core/secretScanner';

// 模拟 fs 模块
vi.mock('fs');

describe('SecretScanner', () => {
  let scanner: SecretScanner;

  beforeEach(() => {
    scanner = new SecretScanner();
    vi.resetAllMocks();
  });

  it('应正确识别文件中的敏感信息', async () => {
    // 模拟目录结构
    vi.mocked(readdirSync).mockReturnValueOnce(['config.js', 'secret.env']);
    vi.mocked(statSync).mockImplementation((path: string) => {
      return {
        isDirectory: () => false
      } as any;
    });

    // 模拟文件内容
    vi.mocked(readFileSync).mockImplementation((path: string) => {
      if (path.includes('config.js')) {
        return 'const apiKey = "abcdef1234567890abcdef1234567890abcdef12";';
      } else if (path.includes('secret.env')) {
        return 'JWT_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      }
      return '';
    });

    const result = await scanner.scan('/fake/path');

    expect(result.secretsFound.length).toBe(2);
    expect(result.filesScanned).toBe(2);

    // 检查是否正确识别了 API Key
    const apiKeyMatch = result.secretsFound.find(s => s.matchedPattern === 'apiKey');
    expect(apiKeyMatch).toBeDefined();
    expect(apiKeyMatch?.file).toContain('config.js');

    // 检查是否正确识别了 JWT
    const jwtMatch = result.secretsFound.find(s => s.matchedPattern === 'jwt');
    expect(jwtMatch).toBeDefined();
    expect(jwtMatch?.file).toContain('secret.env');
  });

  it('应正确处理目录递归', async () => {
    // 模拟目录结构
    vi.mocked(readdirSync).mockImplementation((path: string) => {
      if (path === '/fake/path') {
        return ['src', 'config.js'];
      } else if (path === '/fake/path/src') {
        return ['app.js'];
      }
      return [];
    });

    vi.mocked(statSync).mockImplementation((path: string) => {
      return {
        isDirectory: () => path.endsWith('src')
      } as any;
    });

    // 模拟文件内容
    vi.mocked(readFileSync).mockImplementation((path: string) => {
      if (path.includes('config.js')) {
        return 'const apiKey = "abcdef1234567890abcdef1234567890abcdef12";';
      } else if (path.includes('app.js')) {
        return 'const password = "supersecretpassword123";';
      }
      return '';
    });

    const result = await scanner.scan('/fake/path');

    expect(result.secretsFound.length).toBe(2);
    expect(result.filesScanned).toBe(2);
  });

  it('应忽略指定的文件模式', async () => {
    // 模拟目录结构
    vi.mocked(readdirSync).mockReturnValueOnce(['config.js', 'node_modules', 'test.js']);
    vi.mocked(statSync).mockImplementation((path: string) => {
      return {
        isDirectory: () => path.includes('node_modules')
      } as any;
    });

    // 模拟文件内容
    vi.mocked(readFileSync).mockImplementation((path: string) => {
      if (path.includes('config.js')) {
        return 'const apiKey = "abcdef1234567890abcdef1234567890abcdef12";';
      } else if (path.includes('test.js')) {
        return 'const testKey = "abcdef1234567890abcdef1234567890abcdef12";';
      }
      return '';
    });

    // 使用自定义忽略模式
    const result = await scanner.scan('/fake/path', ['test.js']);

    expect(result.secretsFound.length).toBe(1);
    expect(result.secretsFound[0].file).toContain('config.js');
    expect(result.filesScanned).toBe(1);
  });
});
