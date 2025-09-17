#!/bin/bash
# 安装核心依赖，避免安装可能导致权限问题的原生模块

# NestJS核心依赖
pnpm add @nestjs/common @nestjs/config @nestjs/core @nestjs/platform-express

# OpenAI和Serverless相关
pnpm add openai @codegenie/serverless-express@4.17.0

# 工具库
pnpm add rxjs reflect-metadata

# 开发工具
pnpm add -D typescript ts-node ts-node-dev @types/node
