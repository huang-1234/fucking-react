/**
 * Serverless 适配层
 * 将 Koa 应用转换为 Serverless 函数处理程序
 */
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import serverless from 'serverless-http';
import { createServer } from '../server';
import * as adapters from './adapters';

// 获取环境变量
const assetsPrefix = process.env.ASSETS_PREFIX || '';
const clientEntry = process.env.CLIENT_ENTRY || '/client.js';
const templatePath = process.env.TEMPLATE_PATH;

// 创建 Koa 应用实例，配置静态资源前缀和客户端入口
const app = createServer({
  assets: {
    prefix: assetsPrefix
  },
  clientEntry,
  templatePath
});

// 将 Koa 应用转换为 Serverless 函数处理程序
const handler = serverless(app, {
  provider: process.env.SERVERLESS_PROVIDER || 'aws',
  basePath: process.env.API_GATEWAY_BASE_PATH,
  binary: [
    'application/javascript',
    'application/json',
    'application/octet-stream',
    'application/xml',
    'font/eot',
    'font/opentype',
    'font/otf',
    'font/woff',
    'font/woff2',
    'image/jpeg',
    'image/png',
    'image/svg+xml',
    'text/css',
    'text/html',
    'text/javascript',
    'text/plain',
    'text/xml',
  ]
});

/**
 * AWS Lambda 处理函数
 * 处理 API Gateway 事件并返回响应
 */
export async function lambdaHandler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  // 设置环境变量
  process.env.IS_SERVERLESS = 'true';
  process.env.AWS_LAMBDA = 'true';
  process.env.SERVERLESS_PROVIDER = 'aws';

  // 记录请求信息（用于调试）
  if (process.env.NODE_ENV === 'development') {
    console.log('Lambda 事件:', JSON.stringify(event, null, 2));
  }

  try {
    // 设置 Lambda 上下文超时处理
    context.callbackWaitsForEmptyEventLoop = false;

    // 调用 serverless-http 处理请求
    const result = await handler(event, context);
    return result as APIGatewayProxyResult;
  } catch (error) {
    console.error('Serverless 处理错误:', error);

    // 返回错误响应
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
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
          ${process.env.NODE_ENV === 'development' ? `<pre>${error instanceof Error ? error.stack : String(error)}</pre>` : ''}
        </body>
        </html>
      `,
    };
  }
}

/**
 * 阿里云函数计算处理函数
 * 兼容阿里云函数计算的处理方式
 */
export async function fcHandler(req: any, resp: any, context: any) {
  process.env.IS_SERVERLESS = 'true';
  process.env.FC_PROVIDER = 'aliyun';
  process.env.SERVERLESS_PROVIDER = 'aliyun';

  try {
    // 将阿里云函数计算请求转换为 API Gateway 事件格式
    const event = {
      path: req.path,
      httpMethod: req.method,
      headers: req.headers,
      queryStringParameters: req.queries,
      body: req.body,
      isBase64Encoded: false,
    };

    // 调用 serverless-http 处理请求
    const result = await handler(event, context);

    // 设置响应
    resp.statusCode = result.statusCode;
    for (const [key, value] of Object.entries(result.headers || {})) {
      resp.setHeader(key, value);
    }
    resp.send(result.body);
  } catch (error) {
    console.error('阿里云函数处理错误:', error);
    resp.statusCode = 500;
    resp.setHeader('Content-Type', 'text/html');
    resp.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>服务器错误</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>服务器错误</h1>
        <p>抱歉，服务器发生了错误。请稍后再试。</p>
        ${process.env.NODE_ENV === 'development' ? `<pre>${error instanceof Error ? error.stack : String(error)}</pre>` : ''}
      </body>
      </html>
    `);
  }
}

/**
 * 腾讯云 SCF 处理函数
 */
export async function scfHandler(event: any, context: any) {
  process.env.IS_SERVERLESS = 'true';
  process.env.SCF_PROVIDER = 'tencent';
  process.env.SERVERLESS_PROVIDER = 'tencent';

  try {
    // 转换为标准格式
    const apiGatewayEvent = {
      path: event.path,
      httpMethod: event.httpMethod,
      headers: event.headers,
      queryStringParameters: event.queryStringParameters,
      body: event.body,
      isBase64Encoded: event.isBase64Encoded || false,
    };

    // 调用处理程序
    return await lambdaHandler(apiGatewayEvent as any, context as any);
  } catch (error) {
    console.error('腾讯云函数处理错误:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
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
          ${process.env.NODE_ENV === 'development' ? `<pre>${error instanceof Error ? error.stack : String(error)}</pre>` : ''}
        </body>
        </html>
      `,
    };
  }
}

/**
 * 华为云函数工作流处理函数
 */
export async function huaweiHandler(event: any, context: any) {
  process.env.IS_SERVERLESS = 'true';
  process.env.HUAWEI_PROVIDER = 'huawei';
  process.env.SERVERLESS_PROVIDER = 'huawei';

  try {
    // 使用华为云适配器转换事件格式
    const apiGatewayEvent = adapters.huaweiAdapter.convertEvent(event);

    // 调用处理程序
    const result = await handler(apiGatewayEvent, context);

    // 转换响应格式
    return adapters.huaweiAdapter.convertResponse(result);
  } catch (error) {
    console.error('华为云函数处理错误:', error);
    return adapters.huaweiAdapter.createErrorResponse(error);
  }
}

/**
 * 自定义云服务处理函数
 * 用于支持其他云服务提供商
 */
export async function customHandler(event: any, context: any) {
  process.env.IS_SERVERLESS = 'true';
  process.env.CUSTOM_PROVIDER = process.env.SERVERLESS_PROVIDER || 'custom';

  try {
    // 根据自定义提供商选择适配器
    const provider = process.env.CUSTOM_PROVIDER?.toLowerCase();
    let apiGatewayEvent;

    // 根据提供商选择适配器
    if (provider === 'huawei' && adapters.huaweiAdapter) {
      apiGatewayEvent = adapters.huaweiAdapter.convertEvent(event);
    } else {
      // 默认转换
      apiGatewayEvent = {
        path: event.path || event.requestPath || '/',
        httpMethod: event.httpMethod || event.method || 'GET',
        headers: event.headers || {},
        queryStringParameters: event.queryStringParameters || event.query || {},
        body: event.body || '',
        isBase64Encoded: event.isBase64Encoded || false,
      };
    }

    // 调用处理程序
    const result = await handler(apiGatewayEvent, context);

    // 根据提供商转换响应
    if (provider === 'huawei' && adapters.huaweiAdapter) {
      return adapters.huaweiAdapter.convertResponse(result);
    }

    // 返回结果
    return result;
  } catch (error) {
    console.error('自定义云函数处理错误:', error);

    // 根据提供商创建错误响应
    const provider = process.env.CUSTOM_PROVIDER?.toLowerCase();
    if (provider === 'huawei' && adapters.huaweiAdapter) {
      return adapters.huaweiAdapter.createErrorResponse(error);
    }

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/html',
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
          ${process.env.NODE_ENV === 'development' ? `<pre>${error instanceof Error ? error.stack : String(error)}</pre>` : ''}
        </body>
        </html>
      `,
    };
  }
}

// 导出默认处理函数（用于兼容不同云平台）
export default lambdaHandler;