import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { HeaderAuditor } from '../../../src/core/headerAuditor';

// 模拟 axios
vi.mock('axios');

describe('HeaderAuditor', () => {
  let auditor: HeaderAuditor;

  beforeEach(() => {
    auditor = new HeaderAuditor();
    vi.resetAllMocks();
  });

  it('应正确识别缺失的安全头', async () => {
    // 模拟 axios 响应
    vi.mocked(axios.get).mockResolvedValueOnce({
      headers: {
        'content-type': 'text/html',
        'x-frame-options': 'DENY'
        // 缺少其他安全头
      }
    });

    const result = await auditor.audit('https://example.com');

    expect(result.url).toBe('https://example.com');
    expect(result.headers['content-type']).toBe('text/html');
    expect(result.headers['x-frame-options']).toBe('DENY');

    // 应该识别出缺失的安全头
    expect(result.missingHeaders).toContain('strict-transport-security');
    expect(result.missingHeaders).toContain('content-security-policy');
    expect(result.missingHeaders).toContain('x-content-type-options');
    expect(result.missingHeaders).not.toContain('x-frame-options');

    // 应该提供相应的建议
    expect(result.recommendations.length).toBeGreaterThan(0);
  });

  it('应正确处理所有安全头都存在的情况', async () => {
    // 模拟所有安全头都存在的响应
    vi.mocked(axios.get).mockResolvedValueOnce({
      headers: {
        'strict-transport-security': 'max-age=31536000; includeSubDomains',
        'x-frame-options': 'DENY',
        'x-content-type-options': 'nosniff',
        'content-security-policy': 'default-src \'self\'',
        'x-xss-protection': '1; mode=block',
        'referrer-policy': 'strict-origin-when-cross-origin',
        'permissions-policy': 'camera=(), microphone=()'
      }
    });

    const result = await auditor.audit('https://example.com');

    expect(result.missingHeaders).toHaveLength(0);
    expect(result.recommendations).toHaveLength(0);
  });

  it('应分析 CSP 头的有效性', async () => {
    // 模拟带有不安全 CSP 配置的响应
    vi.mocked(axios.get).mockResolvedValueOnce({
      headers: {
        'content-security-policy': 'default-src *; script-src \'unsafe-inline\' \'unsafe-eval\' *'
      }
    });

    const result = await auditor.audit('https://example.com');

    // 应该提供关于不安全 CSP 配置的建议
    expect(result.recommendations.some(r => r.includes('unsafe-inline'))).toBe(true);
    expect(result.recommendations.some(r => r.includes('unsafe-eval'))).toBe(true);
  });

  it('应处理请求失败的情况', async () => {
    // 模拟 axios 请求失败
    vi.mocked(axios.get).mockRejectedValueOnce(new Error('Connection refused'));

    await expect(auditor.audit('https://example.com')).rejects.toThrow('审计 URL https://example.com 失败');
  });
});
