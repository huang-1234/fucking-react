# 发布指南

本文档描述了如何发布web-cache包及其子包。

## 准备工作

1. 确保你已经安装了Node.js和npm
2. 确保你已经登录到npm账号：`npm login`
3. 确保你有发布权限

## 版本类型

支持以下版本类型发布：

- `main`: 正式版本，使用`latest`标签
- `beta`: 测试版本，使用`beta`标签
- `alpha`: 预览版本，使用`alpha`标签
- `inner`: 内部版本，使用`inner`标签

## 发布流程

### 发布主包和所有子包

```bash
# 发布正式版
npm run publish:all [版本类型]

# 发布测试版
npm run publish:all:beta [版本类型]

# 发布预览版
npm run publish:all:alpha [版本类型]

# 发布内部版
npm run publish:all:inner [版本类型]
```

版本类型可以是：`patch`, `minor`, `major`, `prepatch`, `preminor`, `premajor`, `prerelease`，默认为`patch`。

### 只发布主包

```bash
# 发布正式版
npm run publish:main [版本类型]

# 发布测试版
npm run publish:main:beta [版本类型]

# 发布预览版
npm run publish:main:alpha [版本类型]

# 发布内部版
npm run publish:main:inner [版本类型]
```

### 只发布service-work子包

```bash
# 发布正式版
npm run publish:service-work [版本类型]

# 发布测试版
npm run publish:service-work:beta [版本类型]

# 发布预览版
npm run publish:service-work:alpha [版本类型]

# 发布内部版
npm run publish:service-work:inner [版本类型]
```

## 版本号规则

- 正式版: `x.y.z`
- 测试版: `x.y.z-beta.n`
- 预览版: `x.y.z-alpha.n`
- 内部版: `x.y.z-inner.n`

## 安装特定版本

```bash
# 安装最新正式版
npm install web-cache

# 安装最新测试版
npm install web-cache@beta

# 安装最新预览版
npm install web-cache@alpha

# 安装最新内部版
npm install web-cache@inner

# 安装特定版本
npm install web-cache@1.0.0
```

## 发布过程

发布脚本会自动执行以下步骤：

1. 构建项目
2. 运行测试
3. 更新版本号
4. 发布到npm，并使用相应的标签（tag）

## 发布后的验证

发布完成后，可以通过以下方式验证：

1. 在npm网站上检查包是否已经发布：https://www.npmjs.com/package/web-cache
2. 检查不同标签的版本：
   ```bash
   npm view web-cache dist-tags
   ```
3. 在一个新项目中安装并测试：
   ```bash
   npm install web-cache@latest  # 或 @beta, @alpha, @inner
   # 或者安装子包
   npm install web-service-work@latest  # 或 @beta, @alpha, @inner
   ```

## 发布注意事项

- 确保所有测试通过
- 确保版本号正确
- 确保README.md文档更新
- 确保package.json中的依赖正确
- 确保构建产物正确

## 子包发布

service-work子包会作为独立的包发布，但也会作为主包的一部分导出。用户可以选择以下任一方式使用：

1. 直接安装子包：`npm install web-service-work@[标签]`
2. 通过主包引入：`import { serviceWork } from 'web-cache'`