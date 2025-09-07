import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  csrfProtectionMiddleware,
  xssProtectionMiddleware,
  contentSecurityPolicyMiddleware,
  securityMiddlewareBundle
} from '../../../src/protection/securityMiddleware';

// 模拟Express的Request, Response和NextFunction
const mockRequest = () => {
  return {
    path: '/test',
    method: 'GET',
    headers: {},
    body: {},
    cookies: {},
    session: {}
  };
};

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.setHeader = vi.fn().mockReturnValue(res);
  res.cookie = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('Security Middleware', () => {
  describe('CSRF Protection Middleware', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      req = mockRequest();
      res = mockResponse();
      vi.resetAllMocks();
    });

    it('应该为GET请求生成CSRF令牌', () => {
      req.method = 'GET';
      req.session = { csrfToken: undefined };

      const middleware = csrfProtectionMiddleware();
      middleware(req, res, mockNext);

      // 验证是否设置了CSRF令牌
      expect(req.session.csrfToken).toBeDefined();
      expect(res.setHeader).toHaveBeenCalledWith('X-CSRF-Token', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该验证非GET请求的CSRF令牌', () => {
      req.method = 'POST';
      req.session = { csrfToken: 'valid-token' };
      req.headers['x-csrf-token'] = 'valid-token';

      const middleware = csrfProtectionMiddleware();
      middleware(req, res, mockNext);

      // 验证是否通过了CSRF验证
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该拒绝无效的CSRF令牌', () => {
      req.method = 'POST';
      req.session = { csrfToken: 'valid-token' };
      req.headers['x-csrf-token'] = 'invalid-token';

      const middleware = csrfProtectionMiddleware();
      middleware(req, res, mockNext);

      // 验证是否拒绝了请求
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('应该排除指定路径', () => {
      req.method = 'POST';
      req.path = '/api/webhook';

      const middleware = csrfProtectionMiddleware({
        excludedPaths: ['/api/webhook']
      });
      middleware(req, res, mockNext);

      // 验证是否跳过了CSRF验证
      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe('XSS Protection Middleware', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      req = mockRequest();
      res = mockResponse();
      vi.resetAllMocks();
    });

    it('应该设置XSS保护头', () => {
      const middleware = xssProtectionMiddleware();
      middleware(req, res, mockNext);

      // 验证是否设置了XSS保护头
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', '1; mode=block');
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该在启用HTML转义时修改res.send方法', () => {
      const middleware = xssProtectionMiddleware({ escapeHtml: true });
      middleware(req, res, mockNext);

      // 保存原始的send方法
      const originalSend = res.send;

      // 调用修改后的send方法
      res.send('<script>alert("XSS")</script>');

      // 验证是否转义了HTML
      expect(originalSend).toHaveBeenCalledWith(expect.stringContaining('&lt;script&gt;'));
    });
  });

  describe('Content Security Policy Middleware', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      req = mockRequest();
      res = mockResponse();
      vi.resetAllMocks();
    });

    it('应该设置默认的CSP头', () => {
      const middleware = contentSecurityPolicyMiddleware();
      middleware(req, res, mockNext);

      // 验证是否设置了CSP头
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining("default-src 'self'")
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该使用自定义指令', () => {
      const middleware = contentSecurityPolicyMiddleware({
        directives: {
          'script-src': ["'self'", 'trusted-scripts.com']
        }
      });
      middleware(req, res, mockNext);

      // 验证是否使用了自定义指令
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy',
        expect.stringContaining('trusted-scripts.com')
      );
    });

    it('应该在报告模式下设置正确的头', () => {
      const middleware = contentSecurityPolicyMiddleware({
        reportOnly: true
      });
      middleware(req, res, mockNext);

      // 验证是否设置了报告模式头
      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Security-Policy-Report-Only',
        expect.any(String)
      );
    });
  });

  describe('Security Middleware Bundle', () => {
    let req: any;
    let res: any;

    beforeEach(() => {
      req = mockRequest();
      res = mockResponse();
      vi.resetAllMocks();
    });

    it('应该组合多个中间件', () => {
      const middleware = securityMiddlewareBundle();
      middleware(req, res, mockNext);

      // 验证是否设置了多个安全头
      expect(res.setHeader).toHaveBeenCalledWith('X-XSS-Protection', expect.any(String));
      expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });

    it('应该根据配置排除中间件', () => {
      const middleware = securityMiddlewareBundle({
        csrf: false,
        xss: false
      });
      middleware(req, res, mockNext);

      // 验证是否只设置了CSP头
      expect(res.setHeader).toHaveBeenCalledWith('Content-Security-Policy', expect.any(String));
      expect(res.setHeader).not.toHaveBeenCalledWith('X-XSS-Protection', expect.any(String));
      expect(mockNext).toHaveBeenCalled();
    });
  });
});
