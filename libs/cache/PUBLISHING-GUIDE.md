# 发布前指南

本文档提供发布前的准备工作和常见问题解决方案。

## 发布前检查清单

1. 确保已经登录到npm账号
   ```bash
   # 检查当前登录状态
   npm whoami

   # 如果未登录，请登录
   npm login
   ```

2. 确保package.json中的配置正确
   - name: 包名称必须唯一且符合npm规范
   - version: 版本号遵循语义化版本规范
   - publishConfig: 确保registry和access设置正确
   ```json
   "publishConfig": {
     "registry": "https://registry.npmjs.org/",
     "access": "public"
   }
   ```

3. 确保已经构建并测试通过
   ```bash
   npm run build
   npm test
   ```

## 常见问题解决方案

### 1. 认证错误 (ENEEDAUTH)

**问题**:
```
npm error code ENEEDAUTH
npm error need auth This command requires you to be logged in
```

**解决方案**:
- 确保已登录npm账号: `npm login`
- 检查登录状态: `npm whoami`
- 检查~/.npmrc文件中的认证信息是否存在
- 如果使用公司内部npm源，确保切换到正确的registry:
  ```bash
  npm config set registry https://registry.npmjs.org/
  ```

### 2. 版本冲突 (EPUBLISHCONFLICT)

**问题**:
```
npm error code EPUBLISHCONFLICT
npm error publish conflict
```

**解决方案**:
- 检查npm上是否已存在相同版本: `npm view <package-name> versions`
- 更新package.json中的版本号
- 使用`npm version patch|minor|major`自动更新版本号

### 3. 权限问题 (EACCES)

**问题**:
```
npm error code EACCES
npm error insufficient permissions
```

**解决方案**:
- 确认你有发布该包的权限
- 如果是组织包，确认你是组织成员并有发布权限
- 联系包的管理员添加你为维护者

### 4. 包名冲突 (E403)

**问题**:
```
npm error code E403
npm error 403 Forbidden - PUT
```

**解决方案**:
- 检查包名是否已被占用: `npm view <package-name>`
- 修改package.json中的包名
- 如果是作用域包，确保使用正确的作用域前缀: `@your-scope/package-name`

### 5. 网络问题

**问题**:
```
npm error network
npm error errno ETIMEDOUT
```

**解决方案**:
- 检查网络连接
- 尝试使用不同的网络环境
- 尝试使用不同的npm客户端，如yarn: `yarn publish`

## 发布后验证

发布完成后，可以通过以下方式验证:

1. 检查npm网站上的包信息
   ```
   https://www.npmjs.com/package/web-cache
   https://www.npmjs.com/package/web-service-work
   ```

2. 查看包的标签和版本
   ```bash
   npm view web-cache dist-tags
   npm view web-service-work dist-tags
   ```

3. 在新项目中安装并测试
   ```bash
   mkdir test-install
   cd test-install
   npm init -y
   npm install web-cache
   # 或
   npm install web-service-work
   ```
