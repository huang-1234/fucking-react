以下是 TypeScript 各版本的核心类型特性梳理，以及高阶工具类型的低阶实现详解。内容综合自官方迭代记录与类型系统演进分析：

### **一、TypeScript 版本与类型系统演进**
| **版本** | **年份** | **核心类型特性**                                                                 | **描述**                                                                                                |
|----------|----------|---------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------|
| 1.0      | 2014     | 基础泛型、类型别名                                                              | 引入泛型函数/接口，支持 `type` 关键字创建类型别名                              |
| 2.0      | 2016     | 可辨识联合（Discriminated Unions）、`never` 类型                               | 通过字面量类型区分联合类型，`never` 表示永不出现的值                           |
| 2.8      | 2018     | 条件类型（`T extends U ? X : Y`）、`infer` 关键字                              | 实现类型逻辑分支，`infer` 提取嵌套类型                                        |
| 3.0      | 2018     | 映射类型修饰符（`readonly`/`?`）、`unknown` 类型                              | 扩展映射类型语法，`unknown` 替代 `any` 提升类型安全                           |
| 4.0      | 2020     | 可变元组类型、模板字面量类型                                                    | 支持 `[...T]` 操作元组，模板字面量生成字符串字面量类型                        |
| 4.1      | 2020     | 递归条件类型、键重映射（`as`）                                                  | 实现深度类型递归，重映射键名（如 `[K in keyof T as \`get${Capitalize<K>}\`]`）              |
| 5.0      | 2023     | `const` 类型参数、`extends` 泛型约束优化                                        | 泛型参数默认 `const` 推导，泛型约束更灵活                                                 |
| 5.8      | 2025     | 性能优化（Go 重写编译器）                                                       | 类型检查速度提升 10 倍，内存占用减半                                                     |

> 注：2025 年发布的 TypeScript 5.8 主要优化性能，未新增类型特性。

---

### **二、高阶工具类型的低阶实现**
以下工具类型均基于 TS 基础操作（泛型、条件类型、映射类型）实现：

#### **1. 对象结构工具**
- **`Partial<T>`**  
  使所有属性可选：  
  ```typescript
  type Partial<T> = { [P in keyof T]?: T[P] };
  ```

- **`Required<T>`**  
  使所有属性必填：  
  ```typescript
  type Required<T> = { [P in keyof T]-?: T[P] };
  ```

- **`Readonly<T>`**  
  使所有属性只读：  
  ```typescript
  type Readonly<T> = { readonly [P in keyof T]: T[P] };
  ```

#### **2. 属性筛选工具**
- **`Pick<T, K extends keyof T>`**  
  选取指定属性：  
  ```typescript
  type Pick<T, K extends keyof T> = { [P in K]: T[P] };
  ```

- **`Record<K extends keyof any, T>`**  
  构建键值映射：  
  ```typescript
  type Record<K extends keyof any, T> = { [P in K]: T };
  ```

#### **3. 联合类型工具**
- **`Exclude<T, U>`**  
  从 T 中排除 U 的子类型：  
  ```typescript
  type Exclude<T, U> = T extends U ? never : T;
  ```

- **`Extract<T, U>`**  
  提取 T 中 U 的子类型：  
  ```typescript
  type Extract<T, U> = T extends U ? T : never;
  ```

- **`Omit<T, K extends keyof any>`**  
  排除指定属性：  
  ```typescript
  type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
  ```

#### **4. 函数类型工具**
- **`Parameters<T extends (...args: any) => any>`**  
  提取函数参数类型：  
  ```typescript
  type Parameters<T> = T extends (...args: infer P) => any ? P : never;
  ```

- **`ReturnType<T extends (...args: any) => any>`**  
  提取函数返回值类型：  
  ```typescript
  type ReturnType<T> = T extends (...args: any) => infer R ? R : any;
  ```

---

### **关键设计思想**
1. **条件类型（`extends ? :`）**：通过类型逻辑分支实现动态推导（如 `Exclude`）。  
2. **`infer` 关键字**：在条件类型中提取嵌套类型（如函数参数 `infer P`）。  
3. **映射类型修饰符**：`?`（可选）、`-?`（必填）、`readonly`（只读）控制属性行为。  
4. **索引类型操作**：`keyof T` 获取键集合，`T[P]` 获取值类型，组合实现深度操作（如 `Pick`）。  

> 提示：所有工具类型均通过组合基础类型操作实现，无编译器魔法。实际使用时建议直接使用内置工具类型，避免重复造轮子。
