/**
 * 基于拓扑排序的任务调度器
 *
 * 该模块展示了拓扑排序在任务调度中的实际应用。
 * 当任务之间存在依赖关系时，我们需要按照正确的顺序执行它们。
 */

import { Graph, topologicalSortKahn, Vertex } from './index';

// 任务类型定义
interface Task {
  id: string;
  name: string;
  duration: number; // 任务执行时间（毫秒）
  dependencies: string[]; // 依赖的任务ID列表
}

/**
 * 任务调度器类
 */
export class TaskScheduler {
  private tasks: Map<string, Task>;

  constructor() {
    this.tasks = new Map();
  }

  /**
   * 添加任务
   */
  addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }

  /**
   * 批量添加任务
   */
  addTasks(tasks: Task[]): void {
    tasks.forEach(task => this.addTask(task));
  }

  /**
   * 构建任务依赖图并返回拓扑排序结果
   */
  getExecutionOrder(): string[] {
    // 创建图
    const graph = new Graph<string>();

    // 添加所有任务作为顶点
    this.tasks.forEach(task => graph.addVertex(task.id));

    // 添加依赖关系作为边
    this.tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        if (this.tasks.has(depId)) {
          // 添加依赖边：依赖任务 -> 当前任务
          graph.addEdge(depId, task.id);
        }
      });
    });

    // 执行拓扑排序
    const order = topologicalSortKahn(graph);

    // 如果存在环（循环依赖），则抛出错误
    if (order.length === 0) {
      throw new Error('任务之间存在循环依赖，无法确定执行顺序');
    }

    // 确保返回的是字符串数组
    return order.map(item => String(item));
  }

  /**
   * 执行所有任务
   */
  async executeAll(): Promise<void> {
    try {
      const executionOrder = this.getExecutionOrder();
      console.log('任务执行顺序:', executionOrder.join(' -> '));

      // 按顺序执行任务
      for (const taskId of executionOrder) {
        const task = this.tasks.get(taskId)!;
        console.log(`开始执行任务: ${task.name} (ID: ${task.id})`);

        // 模拟任务执行
        await this.executeTask(task);

        console.log(`任务完成: ${task.name} (ID: ${task.id})`);
      }

      console.log('所有任务已完成');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('执行任务失败:', error.message);
      } else {
        console.error('执行任务失败:', String(error));
      }
    }
  }

  /**
   * 执行单个任务（异步）
   */
  private executeTask(task: Task): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, task.duration);
    });
  }
}

/**
 * 示例：构建项目的任务调度
 */
export function buildProjectExample(): void {
  const scheduler = new TaskScheduler();

  // 添加构建项目的任务
  scheduler.addTasks([
    {
      id: 'setup',
      name: '环境配置',
      duration: 1000,
      dependencies: []
    },
    {
      id: 'deps',
      name: '安装依赖',
      duration: 2000,
      dependencies: ['setup']
    },
    {
      id: 'compile',
      name: '编译代码',
      duration: 1500,
      dependencies: ['deps']
    },
    {
      id: 'test',
      name: '运行测试',
      duration: 1800,
      dependencies: ['compile']
    },
    {
      id: 'lint',
      name: '代码检查',
      duration: 800,
      dependencies: ['compile']
    },
    {
      id: 'build',
      name: '构建项目',
      duration: 2500,
      dependencies: ['compile', 'test', 'lint']
    },
    {
      id: 'docs',
      name: '生成文档',
      duration: 1200,
      dependencies: ['compile']
    },
    {
      id: 'deploy',
      name: '部署项目',
      duration: 1800,
      dependencies: ['build', 'docs']
    }
  ]);

  // 执行所有任务
  scheduler.executeAll();
}

/**
 * 示例：包含循环依赖的任务
 */
export function cyclicDependencyExample(): void {
  const scheduler = new TaskScheduler();

  // 添加包含循环依赖的任务
  scheduler.addTasks([
    {
      id: 'A',
      name: '任务A',
      duration: 1000,
      dependencies: ['C'] // A依赖C
    },
    {
      id: 'B',
      name: '任务B',
      duration: 1500,
      dependencies: ['A'] // B依赖A
    },
    {
      id: 'C',
      name: '任务C',
      duration: 800,
      dependencies: ['B'] // C依赖B，形成循环依赖
    }
  ]);

  try {
    // 尝试执行所有任务
    scheduler.executeAll();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('预期的错误:', error.message);
    } else {
      console.error('预期的错误:', String(error));
    }
  }
}

// 如果直接运行此文件，则执行示例
if (require.main === module) {
  console.log('=== 正常项目构建示例 ===');
  buildProjectExample();

  // 延迟执行循环依赖示例
  setTimeout(() => {
    console.log('\n=== 循环依赖示例 ===');
    cyclicDependencyExample();
  }, 15000); // 等待第一个示例完成
}