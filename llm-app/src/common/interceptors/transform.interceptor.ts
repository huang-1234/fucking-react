import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  code: number;
  data: T;
  message: string;
  timestamp: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  private readonly logger = new Logger(TransformInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const request = context.switchToHttp().getRequest();
    const { method, path } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      map(data => {
        // 跳过SSE响应的转换
        if (path.includes('/sse/') || path.includes('/stream')) {
          return data;
        }

        // 计算请求处理时间
        const responseTime = Date.now() - startTime;
        this.logger.log(`${method} ${path} - ${responseTime}ms`);

        // 统一响应格式
        return {
          code: 200,
          data,
          message: '请求成功',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
