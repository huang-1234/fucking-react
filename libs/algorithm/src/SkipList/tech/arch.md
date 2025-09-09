# 跳表 (Skip List) 实现

本目录包含了跳表数据结构的完整实现，支持 TypeScript 和 Rust 两种语言版本。

## 目录结构

```
SkipList/
├── al/                     # 算法实现
│   ├── SkipList.ts        # TypeScript 实现
│   ├── SkipList.rs        # Rust 实现
│   └── SkipList.test.ts   # 单元测试
├── tech/                  # 技术文档
│   ├── base.md           # 基础理论文档
│   └── arch.md           # 架构设计文档
└── README.md             # 本文件
```

## 快速开始

### TypeScript 版本

```typescript
import { SkipList } from './al/SkipList';

// 创建跳表实例
const skipList = new SkipList<number>(16, 0.5);

// 插入数据
skipList.insert(5);
skipList.insert(3);
skipList.insert(8);
skipList.insert(1);

// 搜索数据
const result = skipList.search(5);
console.log(result ? '找到' : '未找到');

// 删除数据
const deleteResult = skipList.delete(3);
console.log(deleteResult.success ? '删除成功' : '删除失败');

// 获取所有数据（有序）
console.log(skipList.toArray()); // [1, 5, 8]
```

### Rust 版本

```rust
use skip_list::SkipList;

fn main() {
    // 创建跳表实例
    let mut skip_list = SkipList::new(16, 0.5);

    // 插入数据
    skip_list.insert(5);
    skip_list.insert(3);
    skip_list.insert(8);
    skip_list.insert(1);

    // 搜索数据
    if let Some(_) = skip_list.search(&5) {
        println!("找到");
    }

    // 删除数据
    if skip_list.delete(&3) {
        println!("删除成功");
    }

    // 获取所有数据（有序）
    println!("{:?}", skip_list.to_vec()); // [1, 5, 8]
}
```

## API 文档

### TypeScript API

#### 构造函数
```typescript
new SkipList<T>(maxLevel?: number, probability?: number, compareFn?: (a: T, b: T) => number)
```

#### 主要方法
- `insert(value: T): { success: boolean; updatePath: SkipListNode<T>[] }`
- `search(value: T): SkipListNode<T> | null`
- `delete(value: T): { success: boolean; deletedNode: SkipListNode<T> | null }`
- `toArray(): T[]`
- `getSize(): number`
- `isEmpty(): boolean`
- `clear(): void`

#### 配置方法
- `setConfig(config: { maxLevel?: number; probability?: number }): void`
- `setComparator(compareFn: (a: T, b: T) => number): void`

#### 可视化支持
- `getLevels(): Array<Array<{ node: SkipListNode<T>; position: number }>>`
- `serialize(): any`
- `deserialize(data: any): void`

### Rust API

#### 构造函数
```rust
SkipList::new(max_level: usize, probability: f32) -> Self
```

#### 主要方法
- `insert(&mut self, value: T) -> bool`
- `search(&self, value: &T) -> Option<*mut SkipListNode<T>>`
- `delete(&mut self, value: &T) -> bool`
- `to_vec(&self) -> Vec<T>`
- `size(&self) -> usize`
- `is_empty(&self) -> bool`
- `clear(&mut self)`

#### 高级功能
- `range_query(&self, start: &T, end: &T) -> Vec<T>`
- `get_levels(&self) -> Vec<Vec<T>>`

## 性能特征

### 时间复杂度
- **搜索**: 平均 O(log n)，最坏 O(n)
- **插入**: 平均 O(log n)，最坏 O(n)
- **删除**: 平均 O(log n)，最坏 O(n)

### 空间复杂度
- **总体**: O(n)
- **每个节点**: O(log n) 平均层数

### 概率分析
- 使用概率 p=0.5 时，期望层数为 log₂(n)
- 第 k 层包含约 n/2ᵏ 个节点
- 最大层级建议设置为 log₂(n) + 常数

## 配置参数

### maxLevel (最大层级)
- **默认值**: 16
- **建议范围**: 4-32
- **说明**: 限制跳表的最大层数，影响性能上限

### probability (升级概率)
- **默认值**: 0.5
- **建议范围**: 0.25-0.75
- **说明**: 节点升级到下一层的概率，0.5 为理论最优值

## 使用场景

1. **有序数据维护**: 需要频繁插入、删除并保持有序的场景
2. **范围查询**: 需要高效进行范围查询的应用
3. **并发访问**: 相比平衡树，跳表更适合并发环境
4. **内存数据库**: Redis 等内存数据库的有序集合实现
5. **搜索引擎**: 倒排索引的快速定位

## 优势与劣势

### 优势
- 实现简单，无需复杂的旋转操作
- 并发性能好，锁粒度小
- 范围查询效率高
- 概率平衡，无需严格平衡维护

### 劣势
- 空间开销较大（多级指针）
- 性能依赖随机性，最坏情况较差
- 缓存局部性不如数组

## 测试

运行 TypeScript 测试：
```bash
npm test SkipList.test.ts
```

运行 Rust 测试：
```bash
cargo test
```

## 可视化

本实现包含完整的可视化支持，可以在 React 应用中查看跳表的结构和操作过程。

访问路径：`/algorithm/skiplist`

## 参考资料

1. [Skip Lists: A Probabilistic Alternative to Balanced Trees](https://epaperpress.com/sortsearch/download/skiplist.pdf) - William Pugh
2. [Redis 源码中的跳表实现](https://github.com/redis/redis/blob/unstable/src/t_zset.c)
3. [跳表的并发实现](https://www.cs.tau.ac.il/~shanir/nir-pubs-web/Papers/OPODIS2006-BA.pdf)