# 从vscode包迁移到@types/vscode和vscode-test

本文档描述了如何将VSCode扩展项目从已废弃的`vscode`包迁移到推荐的`@types/vscode`和`vscode-test`。

## 背景

根据[NPM上的vscode包说明](https://www.npmjs.com/package/vscode)，`vscode`包已被废弃，官方推荐使用`@types/vscode`和`vscode-test`替代。这种分离允许更大的灵活性，减少依赖，并且将持续获得更新。

## 迁移步骤

### 1. 更新依赖

在`package.json`中移除`vscode`依赖，添加`@types/vscode`和`vscode-test`：

```json
"devDependencies": {
  "@types/vscode": "^1.103.0",
  "vscode-test": "^1.6.1",
  // 其他开发依赖...
}
```

### 2. 代码导入不变

好消息是，代码中的导入语句不需要改变！您仍然可以使用：

```typescript
import * as vscode from 'vscode';
```

这是因为`@types/vscode`提供了类型定义，而实际的VSCode API是在扩展运行时由VSCode本身提供的。

### 3. 更新测试框架

使用`vscode-test`替代原来的测试方法：

1. 创建测试运行器（例如`src/test/runTest.ts`）：

```typescript
import * as path from 'path';
import { runTests } from 'vscode-test';

async function main() {
  try {
    const extensionDevelopmentPath = path.resolve(__dirname, '../../');
    const extensionTestsPath = path.resolve(__dirname, './suite/index');

    await runTests({
      extensionDevelopmentPath,
      extensionTestsPath,
    });
  } catch (err) {
    console.error('测试运行失败:', err);
    process.exit(1);
  }
}

main();
```

2. 创建测试套件入口（例如`src/test/suite/index.ts`）：

```typescript
import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const testsRoot = path.resolve(__dirname, '..');

  return new Promise((resolve, reject) => {
    glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
      if (err) {
        return reject(err);
      }

      files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

      try {
        mocha.run(failures => {
          if (failures > 0) {
            reject(new Error(`${failures} 个测试失败`));
          } else {
            resolve();
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}
```

3. 更新`package.json`中的测试脚本：

```json
"scripts": {
  "test": "node ./out/test/runTest.js",
  "pretest": "npm run build"
}
```

### 4. 构建配置

确保在Vite、Webpack或其他构建工具中将`vscode`标记为外部依赖：

```javascript
// vite.config.ts
export default defineConfig({
  // ...
  build: {
    // ...
    rollupOptions: {
      external: ['vscode'],
      // ...
    }
  },
  optimizeDeps: {
    exclude: ['vscode']
  }
});
```

## 注意事项

1. `@types/vscode`只提供类型定义，不包含任何运行时代码
2. 实际的VSCode API是在扩展运行时由VSCode本身提供的
3. `vscode-test`用于测试VSCode扩展，它提供了启动VSCode实例和运行测试的功能
4. 确保使用与您的扩展兼容的VSCode API版本（在`engines.vscode`字段中指定）

## 参考资料

- [vscode NPM包](https://www.npmjs.com/package/vscode)
- [VSCode扩展开发文档](https://code.visualstudio.com/api)
- [VSCode扩展测试文档](https://code.visualstudio.com/api/working-with-extensions/testing-extension)
