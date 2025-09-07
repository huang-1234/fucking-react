import axios from 'axios';
import { HeaderAuditResult } from './types';

export class HeaderAuditor {
  // 安全头及其推荐配置
  private securityHeaders = {
    'strict-transport-security': {
      recommendation: '建议配置 Strict-Transport-Security 头以强制使用 HTTPS，例如: max-age=31536000; includeSubDomains'
    },
    'x-frame-options': {
      recommendation: '建议配置 X-Frame-Options 头以防止点击劫持攻击，例如: DENY 或 SAMEORIGIN'
    },
    'x-content-type-options': {
      recommendation: '建议配置 X-Content-Type-Options 头以防止 MIME 类型嗅探，值应为: nosniff'
    },
    'content-security-policy': {
      recommendation: '建议配置 Content-Security-Policy 头以限制资源加载，减少 XSS 风险'
    },
    'x-xss-protection': {
      recommendation: '建议配置 X-XSS-Protection 头以启用浏览器 XSS 过滤，例如: 1; mode=block'
    },
    'referrer-policy': {
      recommendation: '建议配置 Referrer-Policy 头以控制 HTTP 请求中的 Referer 信息，例如: strict-origin-when-cross-origin'
    },
    'permissions-policy': {
      recommendation: '建议配置 Permissions-Policy 头以限制浏览器功能，例如: camera=(), microphone=()'
    }
  };
  /**
   * 审计目标 URL 的 HTTP 安全头
   * @param url 目标 URL
   * @returns 审计结果
   */

  async audit(url: string): Promise<HeaderAuditResult> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'SecLinter/0.0.1 Security Header Auditor'
        },
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: () => true // 接受任何状态码
      });

      const headers = this.normalizeHeaders(response.headers);
      const missing: string[] = [];
      const recommendations: string[] = [];

      // 检查关键安全头
      Object.keys(this.securityHeaders).forEach(header => {
        if (!headers[header]) {
          missing.push(header);
          recommendations.push(this.securityHeaders[header as keyof typeof this.securityHeaders].recommendation);
        }
      });

      // 检查 CSP 头的有效性
      if (headers['content-security-policy']) {
        const cspRecommendations = this.analyzeCsp(headers['content-security-policy']);
        recommendations.push(...cspRecommendations);
      }

      return {
        url,
        headers,
        missingHeaders: missing,
        recommendations
      };
    } catch (error) {
      throw new Error(`审计 URL ${url} 失败: ${(error as Error).message}`);
    }
  }

  /**
   * 规范化 HTTP 响应头
   * @param headers 原始响应头
   * @returns 规范化后的响应头
   */
  private normalizeHeaders(headers: any): Record<string, string> {
    const normalized: Record<string, string> = {};

    Object.entries(headers).forEach(([key, value]) => {
      const normalizedKey = key.toLowerCase();
      normalized[normalizedKey] = Array.isArray(value) ? value.join(', ') : String(value);
    });

    return normalized;
  }

  /**
   * 分析 CSP 头的有效性
   * @param cspValue CSP 头值
   * @returns 分析结果
   */
  private analyzeCsp(cspValue: string): string[] {
    const recommendations: string[] = [];

    // 检查是否使用了不安全的 'unsafe-inline' 或 'unsafe-eval'
    if (cspValue.includes('unsafe-inline')) {
      recommendations.push('CSP 配置中使用了 unsafe-inline，这可能增加 XSS 攻击风险。建议使用 nonce 或 hash 替代。');
    }

    if (cspValue.includes('unsafe-eval')) {
      recommendations.push('CSP 配置中使用了 unsafe-eval，这可能增加代码注入风险。建议重构代码避免使用 eval。');
    }

    // 检查是否缺少关键指令
    if (!cspValue.includes('default-src') && !cspValue.includes('script-src')) {
      recommendations.push('CSP 配置中缺少 default-src 或 script-src 指令，建议添加以限制脚本来源。');
    }

    return recommendations;
  }
}
