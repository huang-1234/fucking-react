import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';

@Injectable()
export class ParamValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ParamValidationMiddleware.name);

  constructor() {}

  use(req: Request, res: Response, next: NextFunction) {
    try {
      this.logger.debug(`${req.method} ${req.path} 请求参数: ${JSON.stringify(req.body)}`);
      // 处理GET请求参数
      if (req.method === 'GET') {
        this.validateQueryParams(req);
      }

      // 处理POST请求参数
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        this.validateBodyParams(req);
      }

      // 记录请求参数
      this.logRequestParams(req);

      next();
      this.logger.debug(`${req.method} ${req.path} 响应参数: ${JSON.stringify(res)}`);
    } catch (error: any) {
      this.logger.error(`参数验证失败: ${error.message}`, error.stack);
      throw new BadRequestException({
        code: 400,
        message: `参数验证失败: ${error.message}`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  private validateQueryParams(req: Request): void {
    const query = req.query;

    // 检查必需的查询参数
    if (req.path.includes('/query') && !query.query) {
      throw new Error('缺少必要的查询参数: query');
    }

    // 检查参数类型
    Object.keys(query).forEach(key => {
      const value = query[key];
      if (typeof value === 'string' && value.trim() === '') {
        throw new Error(`查询参数 ${key} 不能为空`);
      }
    });
  }

  private validateBodyParams(req: Request): void {
    const body = req.body;

    // 检查请求体是否存在
    if (!body || Object.keys(body).length === 0) {
      throw new Error('请求体不能为空');
    }

    // 检查特定路径的必需参数
    if (req.path.includes('/chat/sse/stream')) {
      if (!body.message) {
        throw new Error('缺少必要的参数: message');
      }
    }

    if (req.path.includes('/knowledge-base/add')) {
      if (!body.content) {
        throw new Error('缺少必要的参数: content');
      }

      if (typeof body.content === 'string' && body.content.trim() === '') {
        throw new Error('参数 content 不能为空');
      }
    }
  }

  private logRequestParams(req: Request): void {
    const method = req.method;
    const path = req.path;
    const params = method === 'GET' ? req.query : req.body;

    // 敏感信息处理
    const sanitizedParams = this.sanitizeParams(params);

    this.logger.debug(`${method} ${path} 请求参数: ${JSON.stringify(sanitizedParams)}`);
  }

  private sanitizeParams(params: any): any {
    if (!params) return {};

    const sanitized = { ...params };

    // 隐藏敏感字段
    const sensitiveFields = ['password', 'token', 'apiKey', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '******';
      }
    });

    return sanitized;
  }
}
