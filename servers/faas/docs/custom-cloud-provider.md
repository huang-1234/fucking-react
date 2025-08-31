# 自定义云服务提供商集成指南

本文档提供了如何将 React SSR 应用集成到自定义云服务提供商的详细指南。

## 目录

1. [概述](#概述)
2. [支持的云服务提供商](#支持的云服务提供商)
3. [自定义适配步骤](#自定义适配步骤)
4. [配置文件说明](#配置文件说明)
5. [事件格式转换](#事件格式转换)
6. [部署流程](#部署流程)
7. [常见问题](#常见问题)

## 概述

除了内置支持的 AWS Lambda、阿里云函数计算和腾讯云 SCF 外，本框架还支持集成到其他云服务提供商。通过自定义适配器和配置，您可以将应用部署到任何支持 Node.js 的 FaaS（Function as a Service）平台。

## 支持的云服务提供商

内置支持：
- AWS Lambda
- 阿里云函数计算
- 腾讯云 SCF

可自定义适配：
- 华为云函数工作流
- 百度智能云函数计算
- Google Cloud Functions
- Azure Functions
- IBM Cloud Functions
- 京东云函数服务
- 其他支持 Node.js 的 FaaS 平台

## 自定义适配步骤

### 1. 创建自定义配置文件

复制 `custom-cloud.example.env` 文件并重命名为 `custom-cloud.env`，然后根据您的云服务提供商进行配置：

```bash
cp custom-cloud.example.env custom-cloud.env
```

### 2. 配置云服务提供商参数

编辑 `custom-cloud.env` 文件，设置必要的参数：

```
SERVERLESS_PROVIDER=custom
CUSTOM_PROVIDER=huawei  # 您的云服务提供商名称
CUSTOM_REGION=cn-north-4
CUSTOM_RUNTIME=nodejs18
CUSTOM_HANDLER=src/serverless/adapter.customHandler
```

### 3. 创建事件转换适配器（可选）

如果您的云服务提供商的事件格式与标准 API Gateway 格式不同，您可能需要创建一个自定义适配器。

在 `src/serverless/adapters` 目录下创建适配器文件，例如 `huawei-adapter.ts`：

```typescript
// src/serverless/adapters/huawei-adapter.ts
export function convertEvent(huaweiEvent: any): any {
  // 将华为云事件格式转换为标准 API Gateway 格式
  return {
    path: huaweiEvent.path || '/',
    httpMethod: huaweiEvent.httpMethod || 'GET',
    headers: huaweiEvent.headers || {},
    queryStringParameters: huaweiEvent.queryStringParameters || {},
    body: huaweiEvent.body || '',
    isBase64Encoded: huaweiEvent.isBase64Encoded || false
  };
}

export function convertResponse(standardResponse: any): any {
  // 将标准响应格式转换为华为云响应格式
  return {
    statusCode: standardResponse.statusCode,
    headers: standardResponse.headers,
    body: standardResponse.body,
    isBase64Encoded: standardResponse.isBase64Encoded
  };
}
```

### 4. 注册自定义适配器

修改 `src/serverless/adapter.ts` 文件，导入并使用您的自定义适配器：

```typescript
// 在 src/serverless/adapter.ts 中添加
import * as huaweiAdapter from './adapters/huawei-adapter';

// 添加华为云处理函数
export async function huaweiHandler(event: any, context: any) {
  process.env.IS_SERVERLESS = 'true';
  process.env.HUAWEI_PROVIDER = 'huawei';
  process.env.SERVERLESS_PROVIDER = 'huawei';

  try {
    // 转换事件格式
    const apiGatewayEvent = huaweiAdapter.convertEvent(event);

    // 调用通用处理程序
    const result = await handler(apiGatewayEvent, context);

    // 转换响应格式
    return huaweiAdapter.convertResponse(result);
  } catch (error) {
    console.error('华为云函数处理错误:', error);
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
```

## 配置文件说明

`custom-cloud.env` 文件中的主要配置项：

| 配置项 | 说明 | 示例 |
|-------|------|------|
| SERVERLESS_PROVIDER | 应设置为 "custom" | custom |
| CUSTOM_PROVIDER | 云服务提供商名称 | huawei |
| CUSTOM_REGION | 部署区域 | cn-north-4 |
| CUSTOM_RUNTIME | 运行时环境 | nodejs18 |
| CUSTOM_HANDLER | 处理函数路径 | src/serverless/adapter.huaweiHandler |
| CUSTOM_ASSETS_PREFIX | 静态资源前缀 | https://your-cdn.com |
| CUSTOM_ASSETS_DEPLOY_CMD | 静态资源部署命令 | your-cli upload ./dist/client your-bucket |

## 事件格式转换

大多数云服务提供商的函数事件格式与 AWS API Gateway 格式不同。下面是一个通用的转换模板：

```typescript
// 标准 API Gateway 事件格式
interface StandardEvent {
  path: string;
  httpMethod: string;
  headers: Record<string, string>;
  queryStringParameters: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}

// 转换函数示例
function convertToStandardEvent(customEvent: any): StandardEvent {
  return {
    path: customEvent.path || customEvent.requestPath || '/',
    httpMethod: customEvent.httpMethod || customEvent.method || 'GET',
    headers: customEvent.headers || {},
    queryStringParameters: customEvent.queryStringParameters || customEvent.query || {},
    body: customEvent.body || '',
    isBase64Encoded: customEvent.isBase64Encoded || false
  };
}
```

## 部署流程

使用自定义部署脚本：

```bash
# 使用自定义配置部署
./scripts/deploy.sh --provider custom --custom-config ./custom-cloud.env

# 部署包括静态资源
./scripts/deploy.sh --provider custom --custom-config ./custom-cloud.env --assets
```

## 常见问题

### 1. 事件格式不匹配

**问题**：云函数无法正确处理请求，出现 404 或格式错误。

**解决方案**：检查事件转换适配器，确保正确转换请求路径、方法和参数。

### 2. 静态资源访问问题

**问题**：应用加载但静态资源（JS、CSS）无法访问。

**解决方案**：
- 检查 `CUSTOM_ASSETS_PREFIX` 配置
- 确认静态资源已正确部署到 CDN 或对象存储
- 检查 CORS 配置

### 3. 冷启动延迟过高

**问题**：首次请求响应时间过长。

**解决方案**：
- 检查函数内存配置，适当增加内存
- 优化包大小，移除不必要的依赖
- 使用云服务提供商的预热功能（如果支持）

### 4. 环境变量问题

**问题**：应用无法访问配置的环境变量。

**解决方案**：
- 确认环境变量已正确配置在云函数设置中
- 检查变量名称是否一致
- 部分云服务可能需要特定前缀

---

如需更多帮助，请参考您的云服务提供商的官方文档或联系我们的支持团队。
