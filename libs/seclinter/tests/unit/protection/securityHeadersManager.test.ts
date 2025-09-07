import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { SecurityHeadersManager } from '../../../src/protection/securityHeadersManager';

// 模拟axios
vi.mock('axios');

describe('SecurityHeadersManager', () => {
  let manager: SecurityHeadersManager;

  beforeEach(() => {
    manager = new SecurityHeadersManager();
    vi.resetAllMocks();
  });

  describe('setHeaders', () => {
    it('应该设置默认安全头', () => {
      const mockRes = {
        setHeader: vi.fn()
      };

      manager.setHeaders(mockRes as any);

      // 验证是否设置了所有默认安全头
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Security-Policy', expect.any(String));
      expect(mockRes.setHeader).toHaveBeenCalledWith('Strict-Transport-Security', expect.any(String));
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Content-Type-Options', 'nosniff');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'SAMEORIGIN');
      expect(mockRes.setHeader).toHaveBeenCalledWith('Referrer-Policy', expect.any(String));
      expect(mockRes.setHeader).toHaveBeenCalledWith('Permissions-Policy', expect.any(String));
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-XSS-Protection', expect.any(String));
      expect(mockRes.setHeader).toHaveBeenCalledWith('Cache-Control', expect.any(String));
    });

    it('应该使用自定义安全头配置', () => {
      const mockRes = {
        setHeader: vi.fn()
      };

      const customConfig = {
        csp: "default-src 'self' example.com",
        xFrameOptions: 'DENY'
      };

      manager.setHeaders(mockRes as any, customConfig);

      // 验证是否使用了自定义配置
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Security-Policy', customConfig.csp);
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Frame-Options', 'DENY');
    });

    it('应该设置自定义头', () => {
      const mockRes = {
        setHeader: vi.fn()
      };

      const customConfig = {
        customHeaders: {
          'Feature-Policy': 'camera none',
          'X-Custom-Header': 'CustomValue'
        }
      };

      manager.setHeaders(mockRes as any, customConfig);

      // 验证是否设置了自定义头
      expect(mockRes.setHeader).toHaveBeenCalledWith('Feature-Policy', 'camera none');
      expect(mockRes.setHeader).toHaveBeenCalledWith('X-Custom-Header', 'CustomValue');
    });
  });

  describe('auditSiteHeaders', () => {
    it('应该正确审计网站安全头', async () => {
      // 模拟axios响应
      vi.mocked(axios.get).mockResolvedValueOnce({
        headers: {
          'content-security-policy': "default-src 'self'",
          'x-content-type-options': 'nosniff'
          // 缺少其他安全头
        }
      });

      const result = await manager.auditSiteHeaders('https://example.com');

      // 验证审计结果
      expect(result.url).toBe('https://example.com');
      expect(result.presentHeaders).toHaveProperty('content-security-policy');
      expect(result.presentHeaders).toHaveProperty('x-content-type-options');
      expect(result.missingHeaders).toContain('strict-transport-security');
      expect(result.missingHeaders).toContain('x-frame-options');
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.securityScore).toBeLessThan(100);
      expect(result.suggestedConfig).toBeDefined();
    });

    it('应该处理所有安全头都存在的情况', async () => {
      // 模拟所有安全头都存在的响应
      vi.mocked(axios.get).mockResolvedValueOnce({
        headers: {
          'content-security-policy': "default-src 'self'",
          'strict-transport-security': 'max-age=31536000; includeSubDomains',
          'x-content-type-options': 'nosniff',
          'x-frame-options': 'SAMEORIGIN',
          'referrer-policy': 'strict-origin-when-cross-origin',
          'permissions-policy': 'camera=(), microphone=()',
          'x-xss-protection': '1; mode=block',
          'cache-control': 'no-store'
        }
      });

      const result = await manager.auditSiteHeaders('https://example.com');

      // 验证审计结果
      expect(result.missingHeaders).toHaveLength(0);
      expect(result.securityScore).toBeGreaterThan(90);
    });

    it('应该处理请求失败的情况', async () => {
      // 模拟axios请求失败
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Connection refused'));

      await expect(manager.auditSiteHeaders('https://example.com')).rejects.toThrow('审计 URL');
    });
  });

  describe('generateCspPolicy', () => {
    it('应该生成基本CSP策略', async () => {
      const policy = await manager.generateCspPolicy();

      // 验证生成的策略
      expect(policy).toContain("default-src 'self'");
      expect(policy).toContain("script-src 'self'");
      expect(policy).toContain("style-src 'self'");
      expect(policy).toContain("img-src 'self' data:");
      expect(policy).toContain("frame-ancestors 'none'");
    });

    it('应该根据选项生成CSP策略', async () => {
      const policy = await manager.generateCspPolicy(undefined, {
        allowInlineScripts: true,
        allowInlineStyles: true,
        allowEval: true,
        allowFrames: true,
        trustedDomains: ['trusted.com', 'api.example.com']
      });

      // 验证生成的策略
      expect(policy).toContain("script-src 'self' 'unsafe-inline' 'unsafe-eval' trusted.com api.example.com");
      expect(policy).toContain("style-src 'self' 'unsafe-inline'");
      expect(policy).toContain("frame-ancestors 'self'");
      expect(policy).toContain("img-src 'self' data: trusted.com api.example.com");
      expect(policy).toContain("connect-src 'self' trusted.com api.example.com");
    });
  });
});
