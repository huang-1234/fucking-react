#!/bin/bash

# Serverless SSR 部署脚本

# 显示帮助信息
show_help() {
  echo "用法: $0 [选项]"
  echo
  echo "选项:"
  echo "  -p, --provider PROVIDER   指定云服务提供商 (aws, aliyun, tencent, custom)"
  echo "  -s, --stage STAGE         指定部署环境 (dev, test, prod)"
  echo "  -r, --region REGION       指定部署区域"
  echo "  -c, --cache TYPE          指定缓存类型 (memory, redis)"
  echo "  -a, --assets              部署静态资源"
  echo "  -f, --function NAME       仅部署指定函数"
  echo "  --custom-config FILE      指定自定义配置文件路径"
  echo "  --skip-build              跳过构建步骤"
  echo "  -h, --help                显示此帮助信息"
  echo
  echo "示例:"
  echo "  $0 --provider aws --stage prod --region us-east-1 --cache redis"
  echo "  $0 --provider aliyun --stage dev --assets"
  echo "  $0 --provider custom --custom-config ./custom-cloud.env"
  exit 0
}

# 默认值
PROVIDER="aws"
STAGE="dev"
REGION=""
CACHE_TYPE="memory"
DEPLOY_ASSETS=false
SKIP_BUILD=false
FUNCTION=""
CUSTOM_CONFIG=""

# 解析命令行参数
while [[ $# -gt 0 ]]; do
  case "$1" in
    -p|--provider)
      PROVIDER="$2"
      shift 2
      ;;
    -s|--stage)
      STAGE="$2"
      shift 2
      ;;
    -r|--region)
      REGION="$2"
      shift 2
      ;;
    -c|--cache)
      CACHE_TYPE="$2"
      shift 2
      ;;
    -a|--assets)
      DEPLOY_ASSETS=true
      shift
      ;;
    -f|--function)
      FUNCTION="$2"
      shift 2
      ;;
    --custom-config)
      CUSTOM_CONFIG="$2"
      shift 2
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    -h|--help)
      show_help
      ;;
    *)
      echo "未知选项: $1"
      show_help
      ;;
  esac
done

# 验证参数
if [[ "$PROVIDER" != "aws" && "$PROVIDER" != "aliyun" && "$PROVIDER" != "tencent" && "$PROVIDER" != "custom" ]]; then
  echo "错误: 无效的云服务提供商。支持的值: aws, aliyun, tencent, custom"
  exit 1
fi

if [[ "$CACHE_TYPE" != "memory" && "$CACHE_TYPE" != "redis" ]]; then
  echo "错误: 无效的缓存类型。支持的值: memory, redis"
  exit 1
fi

# 设置环境变量
export CACHE_STORAGE="$CACHE_TYPE"
export SERVERLESS_PROVIDER="$PROVIDER"

# 加载自定义配置（如果指定）
if [[ -n "$CUSTOM_CONFIG" && -f "$CUSTOM_CONFIG" ]]; then
  echo "加载自定义配置: $CUSTOM_CONFIG"
  source "$CUSTOM_CONFIG"
fi

# 构建应用
if [[ "$SKIP_BUILD" = false ]]; then
  echo "开始构建应用..."

  echo "构建客户端代码..."
  pnpm build:client

  echo "构建服务端代码..."
  pnpm build:server

  echo "构建完成"
fi

# 部署静态资源
if [[ "$DEPLOY_ASSETS" = true ]]; then
  echo "部署静态资源..."

  if [[ "$PROVIDER" = "aws" ]]; then
    # 部署到 S3
    echo "部署静态资源到 AWS S3..."
    serverless deploy --config serverless.assets.yml --stage "$STAGE"

  elif [[ "$PROVIDER" = "aliyun" ]]; then
    # 部署到阿里云 OSS
    echo "部署静态资源到阿里云 OSS..."
    if command -v ossutil > /dev/null; then
      # 使用阿里云 OSS 工具
      ossutil cp -rf ./dist/client oss://${ALIYUN_OSS_BUCKET}/
    else
      echo "警告: 未找到 ossutil 工具，请手动部署静态资源到阿里云 OSS"
    fi

  elif [[ "$PROVIDER" = "tencent" ]]; then
    # 部署到腾讯云 COS
    echo "部署静态资源到腾讯云 COS..."
    if command -v coscmd > /dev/null; then
      # 使用腾讯云 COS 工具
      coscmd upload -r ./dist/client/ /
    else
      echo "警告: 未找到 coscmd 工具，请手动部署静态资源到腾讯云 COS"
    fi

  elif [[ "$PROVIDER" = "custom" ]]; then
    # 自定义云服务的静态资源部署
    echo "部署静态资源到自定义云服务..."
    if [[ -n "$CUSTOM_ASSETS_DEPLOY_CMD" ]]; then
      echo "执行自定义静态资源部署命令: $CUSTOM_ASSETS_DEPLOY_CMD"
      eval "$CUSTOM_ASSETS_DEPLOY_CMD"
    else
      echo "警告: 未配置自定义静态资源部署命令 (CUSTOM_ASSETS_DEPLOY_CMD)，请手动部署静态资源"
    fi
  fi

  echo "静态资源部署完成"
fi

# 部署 Serverless 函数
echo "部署 Serverless 函数到 $PROVIDER..."

DEPLOY_CMD="serverless deploy --provider $PROVIDER --stage $STAGE"

# 添加区域参数（如果指定）
if [[ -n "$REGION" ]]; then
  DEPLOY_CMD="$DEPLOY_CMD --region $REGION"
fi

# 部署单个函数（如果指定）
if [[ -n "$FUNCTION" ]]; then
  DEPLOY_CMD="serverless deploy function --function $FUNCTION --provider $PROVIDER --stage $STAGE"

  if [[ -n "$REGION" ]]; then
    DEPLOY_CMD="$DEPLOY_CMD --region $REGION"
  fi
fi

# 执行部署命令
echo "执行: $DEPLOY_CMD"
eval "$DEPLOY_CMD"

echo "部署完成"