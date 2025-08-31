# Serverless SSR 部署指南

本文档提供了将 React SSR 应用部署到各种 Serverless 平台的详细指南。

## 目录

1. [准备工作](#准备工作)
2. [环境配置](#环境配置)
3. [构建应用](#构建应用)
4. [部署到 AWS Lambda](#部署到-aws-lambda)
5. [部署到阿里云函数计算](#部署到阿里云函数计算)
6. [部署到腾讯云 SCF](#部署到腾讯云-scf)
7. [静态资源部署](#静态资源部署)
8. [缓存配置](#缓存配置)
9. [监控与日志](#监控与日志)
10. [常见问题](#常见问题)

## 准备工作

### 安装依赖

首先，确保你已经安装了以下工具：

```bash
# 安装 Serverless Framework
npm install -g serverless

# 安装项目依赖
pnpm install
```

### 配置云服务提供商凭证

#### AWS

```bash
# 配置 AWS 凭证
serverless config credentials --provider aws --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

#### 阿里云

```bash
# 配置阿里云凭证
serverless config credentials --provider aliyun --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

#### 腾讯云

```bash
# 配置腾讯云凭证
serverless config credentials --provider tencent --key YOUR_ACCESS_KEY --secret YOUR_SECRET_KEY
```

## 环境配置

1. 复制环境变量示例文件并进行配置：

```bash
cp env.example .env
```

2. 根据你的需求编辑 `.env` 文件，配置以下关键参数：

```
# 缓存配置
CACHE_ENABLED=true
CACHE_STORAGE=memory  # 或 'redis'

# 静态资源配置
ASSETS_PREFIX=https://your-cdn-domain.com
CLIENT_ENTRY=/client.js

# 云服务提供商配置
AWS_REGION=us-east-1
ALI_REGION=cn-hangzhou
```

## 构建应用

在部署之前，需要构建客户端和服务端代码：

```bash
# 构建客户端代码
pnpm build:client

# 构建服务端代码
pnpm build:server
```

## 部署到 AWS Lambda

### 基本部署

```bash
serverless deploy --provider aws --stage dev
```

### 指定区域和环境

```bash
serverless deploy --provider aws --stage prod --region us-west-2
```

### 部署单个函数

```bash
serverless deploy function --function aws-ssr
```

### 配置 VPC

如果需要访问 VPC 内的资源（如 RDS、ElastiCache 等），请在 `.env` 文件中配置：

```
VPC_SECURITY_GROUP=sg-xxxxxxxx
VPC_SUBNET_A=subnet-xxxxxxxx
VPC_SUBNET_B=subnet-xxxxxxxx
```

### 配置预置并发

为了减少冷启动延迟，可以配置预置并发：

```
PROVISIONED_CONCURRENCY=10
```

## 部署到阿里云函数计算

```bash
serverless deploy --provider aliyun --stage dev
```

## 部署到腾讯云 SCF

```bash
serverless deploy --provider tencent --stage dev
```

## 静态资源部署

### 部署到 S3 和 CloudFront

1. 在 `.env` 文件中配置：

```
ASSETS_BUCKET=your-bucket-name
CDN_DOMAIN=your-cloudfront-domain
```

2. 部署静态资源：

```bash
# 部署静态资源到 S3
serverless deploy --config serverless.assets.yml
```

3. 更新 `ASSETS_PREFIX` 环境变量：

```
ASSETS_PREFIX=https://your-cloudfront-domain.cloudfront.net
```

### 部署到阿里云 OSS

1. 配置阿里云 OSS：

```bash
# 安装阿里云 OSS 工具
npm install -g @alicloud/fun

# 部署到 OSS
fun deploy
```

## 缓存配置

### 内存缓存

默认使用内存缓存，适用于简单场景：

```
CACHE_STORAGE=memory
CACHE_TTL=60000  # 缓存有效期（毫秒）
CACHE_MAX_SIZE=1000  # 最大缓存项数
```

### Redis 缓存

对于生产环境，建议使用 Redis 缓存：

1. 在 `.env` 文件中配置 Redis：

```
CACHE_STORAGE=redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_DB=0
```

2. 在 AWS 上创建 ElastiCache Redis：

```bash
# 部署包含 ElastiCache 的完整堆栈
serverless deploy --provider aws --stage prod
```

## 监控与日志

### AWS CloudWatch

部署后，可以在 AWS CloudWatch 中查看日志和指标：

```bash
# 查看函数日志
serverless logs --function aws-ssr --tail
```

### 阿里云日志服务

在阿里云控制台中查看函数计算日志。

### 腾讯云日志服务

在腾讯云控制台中查看云函数日志。

## 常见问题

### 冷启动延迟过高

1. 增加预置并发：

```
PROVISIONED_CONCURRENCY=10
```

2. 优化包大小：

```bash
# 分析包大小
serverless package --analyze
```

3. 使用更高的内存配置：

```yaml
provider:
  memorySize: 2048  # 增加内存配置
```

### 缓存不生效

1. 检查缓存配置：

```
CACHE_ENABLED=true
```

2. 检查 Redis 连接：

```bash
# 测试 Redis 连接
redis-cli -h $REDIS_HOST -p $REDIS_PORT -a $REDIS_PASSWORD ping
```

### 静态资源加载失败

1. 检查 CDN 配置：

```
ASSETS_PREFIX=https://your-cdn-domain.com
```

2. 确保资源已正确上传：

```bash
# 列出 S3 桶中的文件
aws s3 ls s3://your-bucket-name --recursive
```

### VPC 配置问题

如果在 VPC 中部署，确保：

1. Lambda 函数有正确的安全组和子网配置
2. 子网有 NAT 网关或 VPC 端点，以便访问外部服务
3. 安全组允许必要的出站流量

### 内存不足错误

增加 Lambda 函数的内存配置：

```yaml
provider:
  memorySize: 2048  # 增加到 2GB
```

---

如需更多帮助，请参考 [Serverless Framework 文档](https://www.serverless.com/framework/docs/) 或联系我们的支持团队。
