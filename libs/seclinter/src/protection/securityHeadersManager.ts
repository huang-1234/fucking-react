/**
 * 安全头自动配置与检查模块
 * 不仅审计，还能自动生成或修复缺失的安全头配置
 */
import { Response } from 'express';
import axios from 'axios';

/**
 * 安全头配置接口
 */
export interface SecurityHeadersConfig {
  /** 内容安全策略 */
  csp?: string;
  /** HTTP严格传输安全 */
  strictTransportSecurity?: string;
  /** X-Content-Type-Options头 */
  xContentTypeOptions?: string;
  /** X-Frame-Options头 */
  xFrameOptions?: string;
  /** Referrer-Policy头 */
  referrerPolicy?: string;
  /** Permissions-Policy头 */
  permissionsPolicy?: string;
  /** X-XSS-Protection头 */
  xXssProtection?: string;
  /** Cache-Control头 */
  cacheControl?: string;
  /** 自定义头 */
  customHeaders?: Record<string, string>;
}

/**
 * 安全头审计结果接口
 */
export interface SecurityHeadersAuditResult {
  /** 审计的URL */
  url: string;
  /** 发现的安全头 */
  presentHeaders: Record<string, string>;
  /** 缺失的安全头 */
  missingHeaders: string[];
  /** 安全头配置建议 */
  recommendations: string[];
  /** 安全评分（0-100） */
  securityScore: number;
  /** 建议的安全头配置 */
  suggestedConfig?: SecurityHeadersConfig;
}

/**
 * 安全头管理器类
 * 提供安全头的设置、审计和建议功能
 */
export class SecurityHeadersManager {
  /**
   * 默认安全头配置
   */
  private defaultConfig: SecurityHeadersConfig = {
    csp: "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
    strictTransportSecurity: 'max-age=31536000; includeSubDomains',
    xContentTypeOptions: 'nosniff',
    xFrameOptions: 'SAMEORIGIN',
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
    xXssProtection: "1; mode=block",
    cacheControl: "no-store, max-age=0"
  };

  /**
   * 关键安全头及其重要性权重
   */
  private securityHeadersWeights: Record<string, number> = {
    'content-security-policy': 25,
    'strict-transport-security': 20,
    'x-content-type-options': 10,
    'x-frame-options': 15,
    'referrer-policy': 10,
    'permissions-policy': 10,
    'x-xss-protection': 5,
    'cache-control': 5
  };

  /**
   * 创建安全头管理器实例
   * @param customDefaultConfig 自定义默认配置
   */
  constructor(customDefaultConfig?: SecurityHeadersConfig) {
    if (customDefaultConfig) {
      this.defaultConfig = { ...this.defaultConfig, ...customDefaultConfig };
    }
  }

  /**
   * 设置安全头
   * @param res Express响应对象
   * @param customConfig 自定义安全头配置
   */
  setHeaders(res: Response, customConfig?: SecurityHeadersConfig): void {
    const config = { ...this.defaultConfig, ...customConfig };

    if (config.csp) {
      res.setHeader('Content-Security-Policy', config.csp);
    }

    if (config.strictTransportSecurity) {
      res.setHeader('Strict-Transport-Security', config.strictTransportSecurity);
    }

    res.setHeader('X-Content-Type-Options', config.xContentTypeOptions || 'nosniff');
    res.setHeader('X-Frame-Options', config.xFrameOptions || 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', config.referrerPolicy || 'strict-origin-when-cross-origin');

    if (config.permissionsPolicy) {
      res.setHeader('Permissions-Policy', config.permissionsPolicy);
    }

    if (config.xXssProtection) {
      res.setHeader('X-XSS-Protection', config.xXssProtection);
    }

    if (config.cacheControl) {
      res.setHeader('Cache-Control', config.cacheControl);
    }

    // 设置自定义头
    if (config.customHeaders) {
      Object.entries(config.customHeaders).forEach(([name, value]) => {
        res.setHeader(name, value);
      });
    }
  }

  /**
   * 审计站点安全头
   * @param url 目标URL
   * @returns 审计结果
   */
  async auditSiteHeaders(url: string): Promise<SecurityHeadersAuditResult> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'SecLinter/0.0.1 Security Header Auditor'
        },
        maxRedirects: 5,
        timeout: 10000,
        validateStatus: () => true // 接受任何状态码
      });

      const headers = this.normalizeHeaders(response.headers as Record<string, string | string[] | undefined>);
      const missing: string[] = [];
      const recommendations: string[] = [];

      // 检查关键安全头
      Object.keys(this.securityHeadersWeights).forEach(header => {
        if (!headers[header]) {
          missing.push(header);
          recommendations.push(this.getRecommendation(header));
        }
      });

      // 计算安全评分
      const score = this.calculateSecurityScore(headers);

      // 生成建议配置
      const suggestedConfig = this.generateSuggestedConfig(headers);

      return {
        url,
        presentHeaders: headers,
        missingHeaders: missing,
        recommendations,
        securityScore: score,
        suggestedConfig
      };
    } catch (error) {
      throw new Error(`审计 URL ${url} 失败: ${(error as Error).message}`);
    }
  }

  /**
   * 生成CSP策略
   * @param url 目标URL（可选，用于分析页面资源）
   * @param options 策略生成选项
   * @returns CSP策略字符串
   */
  async generateCspPolicy(url?: string, options?: {
    allowInlineScripts?: boolean;
    allowInlineStyles?: boolean;
    allowEval?: boolean;
    allowFrames?: boolean;
    trustedDomains?: string[];
  }): Promise<string> {
    const defaultDirectives = {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'", "data:"],
      'font-src': ["'self'"],
      'connect-src': ["'self'"],
      'frame-ancestors': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"]
    };

    // 添加选项
    if (options?.allowInlineScripts) {
      defaultDirectives['script-src'].push("'unsafe-inline'");
    }

    if (options?.allowInlineStyles) {
      defaultDirectives['style-src'].push("'unsafe-inline'");
    }

    if (options?.allowEval) {
      defaultDirectives['script-src'].push("'unsafe-eval'");
    }

    if (options?.allowFrames) {
      defaultDirectives['frame-ancestors'] = ["'self'"];
    }

    // 添加可信域名
    if (options?.trustedDomains && options.trustedDomains.length > 0) {
      const domains = options.trustedDomains;
      defaultDirectives['script-src'].push(...domains);
      defaultDirectives['connect-src'].push(...domains);
      defaultDirectives['img-src'].push(...domains);
    }

    // 如果提供了URL，尝试分析页面资源
    if (url) {
      try {
        const resources = await this.analyzePageResources(url);

        // 将资源域名添加到相应的指令中
        if (resources.scriptDomains.length > 0) {
          defaultDirectives['script-src'].push(...resources.scriptDomains);
        }

        if (resources.styleDomains.length > 0) {
          defaultDirectives['style-src'].push(...resources.styleDomains);
        }

        if (resources.imageDomains.length > 0) {
          defaultDirectives['img-src'].push(...resources.imageDomains);
        }

        if (resources.fontDomains.length > 0) {
          defaultDirectives['font-src'].push(...resources.fontDomains);
        }

        if (resources.connectDomains.length > 0) {
          defaultDirectives['connect-src'].push(...resources.connectDomains);
        }
      } catch (error) {
        console.warn(`分析页面资源失败: ${(error as Error).message}`);
      }
    }

    // 构建CSP策略字符串
    const policyParts: string[] = [];

    for (const [directive, sources] of Object.entries(defaultDirectives)) {
      // 去重
      const uniqueSources = Array.from(new Set(sources));
      policyParts.push(`${directive} ${uniqueSources.join(' ')}`);
    }

    return policyParts.join('; ');
  }

  /**
   * 规范化HTTP响应头
   * @param headers 原始响应头
   * @returns 规范化后的响应头
   */
  private normalizeHeaders(headers: Record<string, string | string[] | undefined>): Record<string, string> {
    const normalized: Record<string, string> = {};

    Object.entries(headers).forEach(([key, value]) => {
      if (value !== undefined) {
        const normalizedKey = key.toLowerCase();
        normalized[normalizedKey] = Array.isArray(value) ? value.join(', ') : String(value);
      }
    });

    return normalized;
  }

  /**
   * 获取安全头建议
   * @param header 安全头名称
   * @returns 建议文本
   */
  private getRecommendation(header: string): string {
    const recommendations: Record<string, string> = {
      'content-security-policy': `建议配置 Content-Security-Policy 头以限制资源加载，例如: ${this.defaultConfig.csp}`,
      'strict-transport-security': `建议配置 Strict-Transport-Security 头以强制使用HTTPS，例如: ${this.defaultConfig.strictTransportSecurity}`,
      'x-content-type-options': `建议配置 X-Content-Type-Options 头以防止MIME类型嗅探，值应为: ${this.defaultConfig.xContentTypeOptions}`,
      'x-frame-options': `建议配置 X-Frame-Options 头以防止点击劫持攻击，例如: ${this.defaultConfig.xFrameOptions}`,
      'referrer-policy': `建议配置 Referrer-Policy 头以控制HTTP请求中的Referer信息，例如: ${this.defaultConfig.referrerPolicy}`,
      'permissions-policy': `建议配置 Permissions-Policy 头以限制浏览器功能，例如: ${this.defaultConfig.permissionsPolicy}`,
      'x-xss-protection': `建议配置 X-XSS-Protection 头以启用浏览器XSS过滤，例如: ${this.defaultConfig.xXssProtection}`,
      'cache-control': `建议配置 Cache-Control 头以控制敏感页面的缓存行为，例如: ${this.defaultConfig.cacheControl}`
    };

    return recommendations[header] || `建议配置 ${header} 头以增强安全性`;
  }

  /**
   * 计算安全评分
   * @param headers 响应头
   * @returns 安全评分（0-100）
   */
  private calculateSecurityScore(headers: Record<string, string>): number {
    let score = 0;
    let totalWeight = 0;

    // 计算总权重
    Object.values(this.securityHeadersWeights).forEach(weight => {
      totalWeight += weight;
    });

    // 计算得分
    Object.entries(this.securityHeadersWeights).forEach(([header, weight]) => {
      if (headers[header]) {
        score += weight;

        // 额外检查CSP的质量
        if (header === 'content-security-policy') {
          const cspValue = headers[header];

          // 如果CSP包含unsafe-inline或unsafe-eval，扣分
          if (cspValue.includes('unsafe-inline')) {
            score -= weight * 0.3;
          }

          if (cspValue.includes('unsafe-eval')) {
            score -= weight * 0.3;
          }

          // 如果CSP包含default-src 'none'，加分
          if (cspValue.includes("default-src 'none'")) {
            score += weight * 0.1;
          }
        }
      }
    });

    // 转换为百分比
    return Math.max(0, Math.min(100, Math.round((score / totalWeight) * 100)));
  }

  /**
   * 生成建议的安全头配置
   * @param existingHeaders 现有的响应头
   * @returns 建议的安全头配置
   */
  private generateSuggestedConfig(existingHeaders: Record<string, string>): SecurityHeadersConfig {
    const config: SecurityHeadersConfig = {};

    // 保留现有的有效配置，缺失的使用默认值
    if (!existingHeaders['content-security-policy']) {
      config.csp = this.defaultConfig.csp;
    } else {
      // 检查现有CSP是否有安全问题，如果有则建议修复
      const cspValue = existingHeaders['content-security-policy'];
      if (cspValue.includes('unsafe-inline') || cspValue.includes('unsafe-eval')) {
        config.csp = this.defaultConfig.csp;
      } else {
        config.csp = cspValue;
      }
    }

    if (!existingHeaders['strict-transport-security']) {
      config.strictTransportSecurity = this.defaultConfig.strictTransportSecurity;
    } else {
      config.strictTransportSecurity = existingHeaders['strict-transport-security'];
    }

    config.xContentTypeOptions = existingHeaders['x-content-type-options'] || this.defaultConfig.xContentTypeOptions;
    config.xFrameOptions = existingHeaders['x-frame-options'] || this.defaultConfig.xFrameOptions;
    config.referrerPolicy = existingHeaders['referrer-policy'] || this.defaultConfig.referrerPolicy;
    config.permissionsPolicy = existingHeaders['permissions-policy'] || this.defaultConfig.permissionsPolicy;
    config.xXssProtection = existingHeaders['x-xss-protection'] || this.defaultConfig.xXssProtection;
    config.cacheControl = existingHeaders['cache-control'] || this.defaultConfig.cacheControl;

    return config;
  }

  /**
   * 分析页面资源
   * @param url 页面URL
   * @returns 资源域名列表
   */
  private async analyzePageResources(url: string): Promise<{
    scriptDomains: string[];
    styleDomains: string[];
    imageDomains: string[];
    fontDomains: string[];
    connectDomains: string[];
  }> {
    // 这里应该实现页面资源分析逻辑
    // 由于需要浏览器环境，这里只返回一个空结果
    // 实际实现可能需要使用无头浏览器或其他方式分析页面资源

    return {
      scriptDomains: [],
      styleDomains: [],
      imageDomains: [],
      fontDomains: [],
      connectDomains: []
    };
  }
}
