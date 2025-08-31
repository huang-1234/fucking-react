/**
 * 华为云函数工作流适配器
 * 用于将华为云函数事件格式转换为标准 API Gateway 格式
 */

/**
 * 华为云函数事件类型
 */
export interface HuaweiEvent {
  // 华为云函数工作流事件格式
  httpMethod?: string;
  path?: string;
  headers?: Record<string, string>;
  queryStringParameters?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
  requestContext?: {
    stage?: string;
    sourceIp?: string;
    requestId?: string;
  };
}

/**
 * 华为云函数响应类型
 */
export interface HuaweiResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

/**
 * 标准 API Gateway 事件格式
 */
export interface StandardEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}

/**
 * 标准响应格式
 */
export interface StandardResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
  isBase64Encoded?: boolean;
}

/**
 * 将华为云函数事件转换为标准 API Gateway 事件格式
 */
export function convertEvent(huaweiEvent: HuaweiEvent): StandardEvent {
  return {
    path: huaweiEvent.path || '/',
    httpMethod: huaweiEvent.httpMethod || 'GET',
    headers: huaweiEvent.headers || {},
    queryStringParameters: huaweiEvent.queryStringParameters || {},
    body: huaweiEvent.body || '',
    isBase64Encoded: huaweiEvent.isBase64Encoded || false
  };
}

/**
 * 将标准响应格式转换为华为云函数响应格式
 */
export function convertResponse(standardResponse: StandardResponse): HuaweiResponse {
  return {
    statusCode: standardResponse.statusCode,
    headers: {
      'Content-Type': 'text/html',
      ...standardResponse.headers
    },
    body: standardResponse.body,
    isBase64Encoded: standardResponse.isBase64Encoded || false
  };
}

/**
 * 创建错误响应
 */
export function createErrorResponse(error: unknown): HuaweiResponse {
  const isDev = process.env.NODE_ENV === 'development';

  return {
    statusCode: 500,
    headers: {
      'Content-Type': 'text/html'
    },
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <title>服务器错误</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>服务器错误</h1>
        <p>抱歉，服务器发生了错误。请稍后再试。</p>
        ${isDev ? `<pre>${error instanceof Error ? error.stack : String(error)}</pre>` : ''}
      </body>
      </html>
    `
  };
}
