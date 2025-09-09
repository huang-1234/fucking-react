# 跳表可视化组件

这是一个完整的跳表数据结构可视化实现，包含交互式操作界面和动画演示。

## 目录结构

```md
SkipList/
├── index.tsx                    # 主页面组件
├── components/                  # UI 组件
│   ├── SkipListConfigPanel.tsx # 配置面板
│   └── SkipListDemo.tsx        # 演示组件
├── visualizer/                  # 可视化组件
│   └── SkipListVisualizer.tsx  # D3.js 可视化实现
├── tools/                       # 工具函数
│   └── skipListUtils.ts        # 跳表工具函数
├── module/                      # 模块导出
│   └── index.ts                # 统一导出
└── README.md                   # 本文件
```

## 功能特性

### 🎯 核心功能
- **实时可视化**: 基于 D3.js 的跳表结构可视化
- **交互操作**: 支持插入、删除、搜索操作
- **动画效果**: 操作过程的动画演示
- **配置面板**: 可调整跳表参数和视觉样式

### 🎨 可视化特性
- **多层结构展示**: 清晰显示跳表的层级关系
- **节点高亮**: 操作路径和搜索结果的高亮显示
- **实时更新**: 操作后立即更新可视化
- **响应式布局**: 适配不同屏幕尺寸

### ⚙️ 配置选项
- **最大层级**: 4-32 层可调
- **升级概率**: 0.1-0.9 可调
- **颜色主题**: 自定义节点和连线颜色
- **动画速度**: 200-3000ms 可调

## 使用方法

### 基本使用

```tsx
import { SkipListPage } from './pages/Algorithm/SkipList';

function App() {
  return <SkipListPage />;
}
```

### 单独使用可视化组件

```tsx
import { SkipList } from './libs/algorithm/src/SkipList/al/SkipList';
import { SkipListVisualizer } from './pages/Algorithm/SkipList';

function MyComponent() {
  const skipList = new SkipList<number>(16, 0.5);
  const config = {
    maxLevel: 16,
    probability: 0.5,
    nodeColor: '#1890ff',
    linkColor: '#d9d9d9',
    highlightColor: '#ff4d4f',
    animationSpeed: 1000,
  };

  return (
    <SkipListVisualizer
      skipList={skipList}
      config={config}
      highlightedNodes={new Set()}
      updatePath={[]}
      isAnimating={false}
    />
  );
}
```

### 使用配置面板

```tsx
import { SkipListConfigPanel } from './pages/Algorithm/SkipList';

function ConfigExample() {
  const [config, setConfig] = useState({
    maxLevel: 16,
    probability: 0.5,
    nodeColor: '#1890ff',
    linkColor: '#d9d9d9',
    highlightColor: '#ff4d4f',
    animationSpeed: 1000,
  });

  return (
    <SkipListConfigPanel
      config={config}
      onChange={(newConfig) => setConfig(prev => ({ ...prev, ...newConfig }))}
    />
  );
}
```

## API 文档

### SkipListVisualizer Props

| 属性 | 类型 | 描述 |
|------|------|------|
| skipList | SkipList<number> | 跳表实例 |
| config | SkipListConfig | 可视化配置 |
| highlightedNodes | Set<number> | 需要高亮的节点值 |
| updatePath | SkipListNode<number>[] | 操作路径 |
| isAnimating | boolean | 是否正在播放动画 |

### SkipListConfig 接口

```typescript
interface SkipListConfig {
  maxLevel: number;        // 最大层级 (4-32)
  probability: number;     // 升级概率 (0.1-0.9)
  nodeColor: string;       // 节点颜色
  linkColor: string;       // 连线颜色
  highlightColor: string;  // 高亮颜色
  animationSpeed: number;  // 动画速度 (ms)
}
```

### 工具函数

```typescript
// 计算可视化布局
calculateSkipListLayout(skipList, config, highlightedNodes, pathNodes)

// 生成随机测试数据
generateRandomData(count, min, max)

// 计算跳表统计信息
calculateSkipListStats(skipList)

// 验证跳表正确性
validateSkipList(skipList)

// 性能测试
performanceTest(skipList, operations)

// 数据导入导出
exportSkipListData(skipList)
importSkipListData(skipList, jsonData)
```

## 技术实现

### 可视化技术栈
- **React**: 组件框架
- **D3.js**: 数据可视化
- **Ant Design**: UI 组件库
- **TypeScript**: 类型安全

### 核心算法
- **跳表实现**: 完整的泛型跳表数据结构
- **布局算法**: 自动计算节点和连线位置
- **动画系统**: 基于 D3.js 的过渡动画

### 性能优化
- **虚拟化**: 大数据量时的渲染优化
- **防抖**: 配置变更的防抖处理
- **内存管理**: 及时清理 D3.js 实例

## 教学应用

### 适用场景
- **数据结构课程**: 跳表原理教学
- **算法可视化**: 操作过程演示
- **性能分析**: 时间复杂度验证
- **交互学习**: 学生动手实践

### 教学要点
1. **多层索引概念**: 理解跳表的核心思想
2. **概率平衡**: 随机化的优势和特点
3. **操作复杂度**: 平均 O(log n) 的实现原理
4. **实际应用**: Redis 等系统中的使用

## 扩展开发

### 添加新功能
1. 在 `tools/skipListUtils.ts` 中添加工具函数
2. 在 `components/` 中创建新的 UI 组件
3. 在 `visualizer/` 中扩展可视化效果
4. 在 `module/index.ts` 中导出新功能

### 自定义样式
1. 修改 `SkipListConfig` 接口
2. 更新 `SkipListConfigPanel` 组件
3. 在 `SkipListVisualizer` 中应用新样式

### 性能优化
1. 使用 React.memo 优化组件渲染
2. 实现虚拟滚动处理大数据
3. 添加 Web Worker 处理复杂计算

## 故障排除

### 常见问题
1. **可视化不显示**: 检查 D3.js 版本兼容性
2. **动画卡顿**: 减少动画速度或节点数量
3. **内存泄漏**: 确保组件卸载时清理 D3.js 实例

### 调试技巧
1. 使用浏览器开发者工具检查 SVG 元素
2. 在控制台查看跳表状态和统计信息
3. 使用性能测试工具验证算法效率

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目！

### 开发环境
1. Node.js 18+
2. pnpm 8+
3. TypeScript 5+

### 提交规范
1. 遵循现有代码风格
2. 添加必要的类型定义
3. 编写单元测试
4. 更新相关文档