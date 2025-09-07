/**
 * 安全中间件模块
 * 提供各种Web安全防护中间件，可与Express、Koa、Next.js等框架集成
 */
import { Request, Response, NextFunction, CookieOptions } from 'express';
import { v4 as uuidv4 } from 'uuid';
import rateLimit, { ValueDeterminingMiddleware } from 'express-rate-limit';

// 扩展Express的Request接口，添加session属性
declare module 'express' {
  interface Request {
    session?: Record<string, any>;
    cookies?: Record<string, string>;
  }
}

/**
 * CSRF防护中间件配置选项
 */
export interface CsrfProtectionOptions {
  /** 排除的路径列表，这些路径将不进行CSRF验证 */
  excludedPaths?: string[];
  /** CSRF令牌的请求头名称 */
  headerName?: string;
  /** CSRF令牌在请求体中的字段名 */
  bodyFieldName?: string;
  /** 是否在Cookie中存储令牌（而不是session） */
  useCookies?: boolean;
  /** Cookie配置（当useCookies为true时使用） */
  cookieOptions?: CookieOptions;
}

/**
 * 默认CSRF防护配置
 */
const defaultCsrfOptions: CsrfProtectionOptions = {
  excludedPaths: ['/api/webhook', '/api/callback'],
  headerName: 'x-csrf-token',
  bodyFieldName: 'csrfToken',
  useCookies: false,
  cookieOptions: {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 3600000 // 1小时
  }
};

/**
 * CSRF防护中间件
 *
 * 为应用提供跨站请求伪造(CSRF)防护，通过验证请求中的令牌与服务端存储的令牌是否匹配
 *
 * @param options 中间件配置选项
 * @returns Express中间件函数
 */
export const csrfProtectionMiddleware = (options?: CsrfProtectionOptions) => {
  const config = { ...defaultCsrfOptions, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    // 排除某些路径（如API端点、webhook）
    if (config.excludedPaths?.some(path => req.path.startsWith(path))) {
      return next();
    }

    // 针对非GET、HEAD、OPTIONS请求进行CSRF Token验证
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      const clientToken = req.headers[config.headerName || 'x-csrf-token'] as string ||
                          req.body?.[config.bodyFieldName || 'csrfToken'];

      let serverToken: string | undefined;

      // 从session或cookie获取服务端令牌
      if (config.useCookies) {
        serverToken = req.cookies?.['csrf_token'];
      } else if (req.session) {
        serverToken = (req.session as any).csrfToken;
      }

      if (!clientToken || clientToken !== serverToken) {
        return res.status(403).json({
          error: 'CSRF token validation failed',
          message: '跨站请求伪造(CSRF)令牌验证失败'
        });
      }
    } else {
      // 为GET请求生成并设置新的CSRF Token
      const newToken = uuidv4();

      // 根据配置存储令牌到session或cookie
      if (config.useCookies) {
        res.cookie('csrf_token', newToken, config.cookieOptions as CookieOptions);
      } else if (req.session) {
        (req.session as any).csrfToken = newToken;
      }

      // 在响应头中返回令牌
      res.setHeader(config.headerName || 'X-CSRF-Token', newToken);
    }

    next();
  };
};

/**
 * XSS防护中间件配置选项
 */
export interface XssProtectionOptions {
  /** 是否设置X-XSS-Protection头 */
  setXssHeader?: boolean;
  /** 是否自动转义响应体中的HTML */
  escapeHtml?: boolean;
}

/**
 * XSS防护中间件
 *
 * 提供跨站脚本(XSS)防护，通过设置安全头和自动转义响应
 *
 * @param options 中间件配置选项
 * @returns Express中间件函数
 */
export const xssProtectionMiddleware = (options?: XssProtectionOptions) => {
  const config = {
    setXssHeader: true,
    escapeHtml: false,
    ...options
  };

  return (req: Request, res: Response, next: NextFunction) => {
    // 设置X-XSS-Protection头
    if (config.setXssHeader) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    // 如果需要自动转义HTML
    if (config.escapeHtml) {
      const originalSend = res.send;
      res.send = function(body) {
        if (typeof body === 'string') {
          body = escapeHtml(body);
        }
        return originalSend.call(this, body);
      };
    }

    next();
  };
};

/**
 * 转义HTML特殊字符
 * @param html HTML字符串
 * @returns 转义后的字符串
 */
function escapeHtml(html: string): string {
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 速率限制中间件配置选项
 */
export interface RateLimitOptions {
  /** 时间窗口（毫秒） */
  windowMs?: number;
  /** 在时间窗口内允许的最大请求数 */
  max?: number;
  /** 超出限制时的消息 */
  message?: string;
  /** 是否启用IP代理信任（如果应用在代理后面） */
  trustProxy?: boolean;
  /** 请求计数器的键生成函数 */
  keyGenerator?: (req: Request) => string;
}

/**
 * 速率限制中间件
 *
 * 限制客户端在特定时间窗口内的请求数量，防止暴力破解和DDoS攻击
 *
 * @param options 中间件配置选项
 * @returns Express中间件函数
 */
export const rateLimitingMiddleware = (options?: RateLimitOptions) => {
  return rateLimit({
    windowMs: options?.windowMs || 15 * 60 * 1000, // 默认15分钟
    max: options?.max || 100, // 默认每IP每15分钟最多100次请求
    message: options?.message || '请求过于频繁，请稍后再试',
    standardHeaders: true, // 返回标准的RateLimit头
    legacyHeaders: false, // 禁用旧版头
    keyGenerator: options?.keyGenerator || ((req) => req.ip) as ValueDeterminingMiddleware<string>
  });
};

/**
 * 内容安全策略(CSP)中间件配置选项
 */
export interface CspOptions {
  /** 指令配置 */
  directives?: {
    [key: string]: string[];
  };
  /** 是否启用报告模式（不阻止资源，只报告违规） */
  reportOnly?: boolean;
  /** 违规报告URL */
  reportUri?: string;
}

/**
 * 内容安全策略(CSP)中间件
 *
 * 通过设置Content-Security-Policy头，限制浏览器加载和执行资源的来源
 *
 * @param options 中间件配置选项
 * @returns Express中间件函数
 */
export const contentSecurityPolicyMiddleware = (options?: CspOptions) => {
  const defaultDirectives = {
    'default-src': ["'self'"],
    'script-src': ["'self'"],
    'style-src': ["'self'"],
    'img-src': ["'self'", "data:"],
    'font-src': ["'self'"],
    'connect-src': ["'self'"],
    'frame-src': ["'none'"],
    'object-src': ["'none'"]
  };

  const config = {
    directives: { ...defaultDirectives, ...options?.directives },
    reportOnly: options?.reportOnly || false,
    reportUri: options?.reportUri
  };

  return (req: Request, res: Response, next: NextFunction) => {
    // 构建CSP策略字符串
    const policyParts: string[] = [];

    for (const [directive, sources] of Object.entries(config.directives)) {
      if (sources && sources.length > 0) {
        policyParts.push(`${directive} ${sources.join(' ')}`);
      }
    }

    // 添加报告URI（如果有）
    if (config.reportUri) {
      policyParts.push(`report-uri ${config.reportUri}`);
    }

    const policyString = policyParts.join('; ');

    // 设置CSP头
    const headerName = config.reportOnly ?
      'Content-Security-Policy-Report-Only' :
      'Content-Security-Policy';

    res.setHeader(headerName, policyString);
    next();
  };
};

/**
 * 安全中间件组合
 *
 * 将多个安全中间件组合为一个，方便一次性应用
 *
 * @param options 配置选项
 * @returns Express中间件函数
 */
export const securityMiddlewareBundle = (options?: {
  csrf?: CsrfProtectionOptions | false;
  xss?: XssProtectionOptions | false;
  rateLimit?: RateLimitOptions | false;
  csp?: CspOptions | false;
}) => {
  const middlewares = [
    options?.csrf !== false ? csrfProtectionMiddleware(options?.csrf) : null,
    options?.xss !== false ? xssProtectionMiddleware(options?.xss) : null,
    options?.rateLimit !== false ? rateLimitingMiddleware(options?.rateLimit) : null,
    options?.csp !== false ? contentSecurityPolicyMiddleware(options?.csp) : null
  ].filter(Boolean);

  return (req: Request, res: Response, next: NextFunction) => {
    // 按顺序执行所有中间件
    const executeMiddleware = (index: number) => {
      if (index >= middlewares.length) {
        return next();
      }

      const middleware = middlewares[index] as (req: Request, res: Response, next: NextFunction) => void;
      middleware(req, res, (err?: any) => {
        if (err) return next(err);
        executeMiddleware(index + 1);
      });
    };

    executeMiddleware(0);
  };
};
