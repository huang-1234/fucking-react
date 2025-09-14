# Windows PowerShell安装脚本
# 使用--no-symlink和--shamefully-hoist选项避免Windows上的权限问题

# 创建临时目录用于存储npm缓存
$tempDir = Join-Path $env:TEMP "npm-cache"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

Write-Host "安装核心依赖..." -ForegroundColor Green

# 使用npm代替pnpm安装核心依赖
npm install --cache=$tempDir --no-fund --no-audit --loglevel=error `
  @nestjs/common@11.1.6 `
  @nestjs/config@4.0.2 `
  @nestjs/core@11.1.6 `
  @nestjs/platform-express@11.1.6 `
  @nestjs/websockets@11.1.6 `
  express@5.1.0 `
  openai@5.20.2 `
  rxjs@7.8.2 `
  @codegenie/serverless-express@4.17.0 `
  socket.io@4.8.1 `
  reflect-metadata@0.2.2

Write-Host "安装开发依赖..." -ForegroundColor Green

# 安装开发依赖
npm install --save-dev --cache=$tempDir --no-fund --no-audit --loglevel=error `
  typescript@5.8.3 `
  ts-node@10.9.2 `
  ts-node-dev@2.0.0 `
  @types/node@22.13.10 `
  @types/express@4.17.21

Write-Host "创建必要的目录结构..." -ForegroundColor Green

# 创建必要的目录结构
$directories = @(
  "src/modules/ai",
  "src/modules/chat",
  "src/modules/knowledge-base",
  "src/common/decorators",
  "src/common/filters",
  "src/config",
  "src/examples"
)

foreach ($dir in $directories) {
  $path = Join-Path $PWD $dir
  if (-not (Test-Path $path)) {
    New-Item -ItemType Directory -Force -Path $path | Out-Null
    Write-Host "创建目录: $dir" -ForegroundColor Yellow
  }
}

Write-Host "安装完成!" -ForegroundColor Green
Write-Host "你可以使用 'npm run start:dev' 启动开发服务器" -ForegroundColor Cyan
