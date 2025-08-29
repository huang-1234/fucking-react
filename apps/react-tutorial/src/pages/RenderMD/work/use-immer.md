# 使用Immer优化Markdown渲染性能

通过分析当前Markdown渲染模块的代码，我发现已经实现了一些性能优化措施，如缓存机制和性能监控。但我们可以通过引入Immer来进一步优化大对象的状态更新，特别是在配置变更和主题切换时。

## 一、Immer优化方案

### 1. 安装Immer依赖

```bash
pnpm add immer
```

### 2. 创建性能工具模块

首先，我们需要创建缺失的性能监控工具：

```typescript
// apps/react-tutorial/src/pages/RenderMD/tools/performance.ts
class PerformanceMonitor {
  private timers: Record<string, number> = {};
  private measurements: Record<string, number[]> = {};
  private enabled: boolean = true;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  public start(label: string): void {
    if (!this.enabled) return;
    this.timers[label] = performance.now();
  }

  public end(label: string): number {
    if (!this.enabled || !this.timers[label]) return 0;

    const duration = performance.now() - this.timers[label];
    if (!this.measurements[label]) {
      this.measurements[label] = [];
    }
    this.measurements[label].push(duration);
    delete this.timers[label];

    return duration;
  }

  public getAverage(label: string): number {
    if (!this.measurements[label] || this.measurements[label].length === 0) {
      return 0;
    }

    const sum = this.measurements[label].reduce((acc, val) => acc + val, 0);
    return sum / this.measurements[label].length;
  }

  public getMetrics(): Record<string, { average: number, count: number, total: number }> {
    const metrics: Record<string, { average: number, count: number, total: number }> = {};

    for (const [label, times] of Object.entries(this.measurements)) {
      const total = times.reduce((acc, val) => acc + val, 0);
      metrics[label] = {
        average: total / times.length,
        count: times.length,
        total
      };
    }

    return metrics;
  }

  public reset(): void {
    this.timers = {};
    this.measurements = {};
  }

  public enable(): void {
    this.enabled = true;
  }

  public disable(): void {
    this.enabled = false;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

### 3. 使用Immer优化配置更新

```typescript
// apps/react-tutorial/src/pages/RenderMD/index.tsx
import { produce } from 'immer';
import { performanceMonitor } from './tools/performance';

// 优化配置更新逻辑
const handleConfigChange = (newConfig: MarkdownConfig) => {
  performanceMonitor.start('config_update');

  setConfig(produce(draft => {
    // 只更新变化的属性，避免不必要的重新渲染
    Object.keys(newConfig).forEach(key => {
      if (draft[key as keyof MarkdownConfig] !== newConfig[key as keyof MarkdownConfig]) {
        (draft[key as keyof MarkdownConfig] as any) = newConfig[key as keyof MarkdownConfig];
      }
    });
  }));

  // 同步主题（如果变化）
  if (newConfig.theme !== theme) {
    setTheme(newConfig.theme);
  }

  performanceMonitor.end('config_update');
  message.success('配置已更新');
};
```

### 4. 优化虚拟滚动中的内容分块

```typescript
// apps/react-tutorial/src/pages/RenderMD/components/VirtualizedMarkdown.tsx
import { produce } from 'immer';
import { performanceMonitor } from '../tools/performance';

// 优化内容分块逻辑
const optimizeChunks = (content: string): string[] => {
  performanceMonitor.start('optimize_chunks');

  const lines = content.split('\n');
  const blocks: string[] = [];

  // 使用immer来构建块数组，避免频繁的数组拷贝
  const result = produce(blocks, draft => {
    let currentBlock = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // 检测新块的开始（标题、列表、代码块等）
      if (
        /^#{1,6}\s/.test(line) || // 标题
        /^[-*+]\s/.test(line) ||  // 无序列表
        /^>\s/.test(line) ||      // 引用
        /^```/.test(line) ||      // 代码块
        line.trim() === ''        // 空行作为段落分隔
      ) {
        if (currentBlock) {
          draft.push(currentBlock);
          currentBlock = '';
        }
      }

      currentBlock += line + '\n';

      // 确保最后一块也被添加
      if (i === lines.length - 1 && currentBlock) {
        draft.push(currentBlock);
      }
    }
  });

  performanceMonitor.end('optimize_chunks');
  return result;
};

// 修改组件使用优化后的分块
const VirtualizedMarkdown: React.FC<VirtualizedMarkdownProps> = (props) => {
  const { content, height = 600, itemHeight = 50, width = '100%', overscanCount = 5, ...markdownProps } = props;
  const [chunks, setChunks] = useState<string[]>([]);

  // 使用优化的分块逻辑
  useEffect(() => {
    performanceMonitor.start('content_chunking');

    // 对于复杂的Markdown，使用优化的分块
    if (content.length > 5000) {
      setChunks(optimizeChunks(content));
    } else {
      setChunks([content]);
    }

    performanceMonitor.end('content_chunking');
  }, [content]);

  // 其余组件逻辑...
};
```

### 5. 优化主题切换逻辑

```typescript
// apps/react-tutorial/src/pages/RenderMD/hooks/useTheme.ts
import { produce } from 'immer';
import { performanceMonitor } from '../tools/performance';

export const useTheme = (initialTheme: string = 'light') => {
  const [theme, setTheme] = useState<string>(initialTheme);
  const [themeConfig, setThemeConfig] = useState<MarkdownTheme>(
    markdownThemes[initialTheme as keyof typeof markdownThemes] || markdownThemes.light
  );

  // 使用Immer优化主题配置更新
  useEffect(() => {
    performanceMonitor.start('theme_update');

    // 当主题改变时，更新主题配置
    const baseTheme = markdownThemes[theme as keyof typeof markdownThemes] || markdownThemes.light;

    // 使用Immer创建新的主题配置，避免不必要的对象创建
    setThemeConfig(produce(draft => {
      Object.keys(baseTheme).forEach(key => {
        (draft[key as keyof MarkdownTheme] as any) = baseTheme[key as keyof MarkdownTheme];
      });
    }));

    // 使用RAF避免同步样式计算
    requestAnimationFrame(() => {
      // 保存到localStorage
      localStorage.setItem('md-theme', theme);

      // 更新文档根元素的data-theme属性，用于CSS变量
      document.documentElement.setAttribute('data-theme', theme);

      // 为深色主题添加dark类名到body
      if (theme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }

      performanceMonitor.end('theme_update');
    });
  }, [theme]);

  return { theme, setTheme, themeConfig };
};
```

### 6. 优化缓存机制

```typescript
// apps/react-tutorial/src/pages/RenderMD/utils/cache.ts
import { produce } from 'immer';

class MarkdownCache {
  // 现有代码...

  /**
   * 缓存Markdown HTML
   * @param content Markdown原始内容
   * @param html 渲染后的HTML
   */
  public cacheMarkdown(content: string, html: string): void {
    performanceMonitor.start('cache_write');

    // 使用Immer更新缓存Map
    this.cache = produce(this.cache, draft => {
      draft.set(this.generateKey(content), {
        content,
        timestamp: Date.now(),
        html
      });
    });

    // 清理过期缓存
    this.cleanExpiredCache();

    performanceMonitor.end('cache_write');
  }

  /**
   * 清理过期缓存
   */
  private cleanExpiredCache(): void {
    performanceMonitor.start('cache_clean');

    const now = Date.now();
    this.cache = produce(this.cache, draft => {
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > this.cacheDuration) {
          draft.delete(key);
        }
      }
    });

    performanceMonitor.end('cache_clean');
  }
}
```

### 7. 优化标题提取逻辑

```typescript
// apps/react-tutorial/src/pages/RenderMD/components/MarkdownRenderer.tsx
import { produce } from 'immer';

// 提取标题并生成目录
useEffect(() => {
  if (onHeadingsChange) {
    performanceMonitor.start('extract_headings');

    const regex = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(regex));

    // 使用Immer创建标题列表
    const headingList = produce([] as Heading[], draft => {
      matches.forEach(match => {
        const level = match[1].length;
        const text = match[2];
        const id = `heading-${text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
        draft.push({ id, text, level });
      });
    });

    headingsRef.current = headingList;
    onHeadingsChange(headingList);

    performanceMonitor.end('extract_headings');
  }
}, [content, onHeadingsChange]);
```

## 二、性能监控与分析

### 1. 创建性能分析组件

```typescript
// apps/react-tutorial/src/pages/RenderMD/components/PerformancePanel.tsx
import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Typography } from 'antd';
import { performanceMonitor } from '../tools/performance';
import styles from './PerformancePanel.module.less';

const { Title } = Typography;

interface PerformanceMetric {
  label: string;
  average: number;
  count: number;
  total: number;
}

const PerformancePanel: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const rawMetrics = performanceMonitor.getMetrics();
    const formattedMetrics = Object.entries(rawMetrics).map(([label, data]) => ({
      label,
      average: parseFloat(data.average.toFixed(2)),
      count: data.count,
      total: parseFloat(data.total.toFixed(2))
    }));

    setMetrics(formattedMetrics);
  }, [refreshKey]);

  const columns = [
    {
      title: '操作',
      dataIndex: 'label',
      key: 'label',
    },
    {
      title: '平均耗时(ms)',
      dataIndex: 'average',
      key: 'average',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.average - b.average,
    },
    {
      title: '执行次数',
      dataIndex: 'count',
      key: 'count',
    },
    {
      title: '总耗时(ms)',
      dataIndex: 'total',
      key: 'total',
      sorter: (a: PerformanceMetric, b: PerformanceMetric) => a.total - b.total,
    },
  ];

  return (
    <Card className={styles.performancePanel}>
      <div className={styles.header}>
        <Title level={4}>性能监控面板</Title>
        <Button
          type="primary"
          onClick={() => {
            performanceMonitor.reset();
            setRefreshKey(prev => prev + 1);
          }}
        >
          重置数据
        </Button>
      </div>
      <Table
        dataSource={metrics}
        columns={columns}
        rowKey="label"
        pagination={false}
        size="small"
      />
    </Card>
  );
};

export default React.memo(PerformancePanel);
```

### 2. 添加性能面板样式

```less
// apps/react-tutorial/src/pages/RenderMD/components/PerformancePanel.module.less
.performancePanel {
  margin-top: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
```

### 3. 集成性能面板到主页面

```typescript
// apps/react-tutorial/src/pages/RenderMD/index.tsx
import PerformancePanel from './components/PerformancePanel';

// 在TabPane中添加性能面板
<TabPane
  tab={<span><LineChartOutlined />性能</span>}
  key="performance"
>
  <PerformancePanel />
</TabPane>
```

## 三、优化效果分析

通过引入Immer和性能监控，我们可以预期以下优化效果：

1. **减少不必要的重新渲染**：
   - 使用Immer进行状态更新时，只有实际变化的部分会触发重新渲染
   - 特别是在大型配置对象和主题切换时，性能提升明显

2. **优化大型文档处理**：
   - 改进的分块逻辑使用Immer避免了频繁的数组拷贝
   - 性能监控可以清晰地显示各个环节的耗时

3. **提高缓存效率**：
   - 使用Immer优化缓存写入和清理操作
   - 避免在缓存操作时创建过多临时对象

4. **可视化性能瓶颈**：
   - 新增的性能面板可以直观显示各个操作的耗时
   - 有助于识别和解决性能瓶颈

## 四、实施建议

1. **立即实施**：
   - 创建性能监控工具
   - 使用Immer优化配置更新和主题切换
   - 添加性能监控面板

2. **中期优化**：
   - 优化虚拟滚动的分块逻辑
   - 改进缓存机制

3. **长期改进**：
   - 考虑使用Web Worker进行Markdown解析
   - 实现更细粒度的组件记忆化

通过这些优化，Markdown渲染模块将在处理大型文档和频繁状态更新时获得显著的性能提升，同时提供了可视化的性能监控工具，便于持续优化。