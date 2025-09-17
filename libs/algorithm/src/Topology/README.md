# 拓扑排序算法集合

## 概述

拓扑排序是一种针对有向无环图(DAG, Directed Acyclic Graph)的排序算法，它将图中的所有顶点排成一个线性序列，使得对于图中的任意一条有向边(u, v)，顶点u在序列中都出现在顶点v之前。

## 算法目录

### 1. 基础拓扑排序
- **Kahn算法**: 基于BFS的实现
- **DFS算法**: 基于深度优先搜索的实现

### 2. 应用实例
- **任务调度器**: 异步任务依赖管理
- **课程依赖**: 学习路径规划

## 核心算法设计

### Kahn算法 (基于BFS)

#### 算法原理
Kahn算法是一种基于广度优先搜索(BFS)的拓扑排序算法，其核心思想是不断移除图中入度为0的顶点。

#### 核心步骤

1. **计算入度**
```javascript
function calculateInDegree(graph) {
    const inDegree = new Map()
    
    // 初始化所有顶点的入度为0
    for (const vertex of graph.getVertices()) {
        inDegree.set(vertex, 0)
    }
    
    // 计算每个顶点的入度
    for (const vertex of graph.getVertices()) {
        for (const neighbor of graph.getNeighbors(vertex)) {
            inDegree.set(neighbor.vertex, inDegree.get(neighbor.vertex) + 1)
        }
    }
    
    return inDegree
}
```

2. **Kahn算法实现**
```javascript
function topologicalSortKahn(graph) {
    const inDegree = calculateInDegree(graph)
    const queue = []
    const result = []
    
    // 将所有入度为0的顶点加入队列
    for (const [vertex, degree] of inDegree) {
        if (degree === 0) {
            queue.push(vertex)
        }
    }
    
    while (queue.length > 0) {
        // 出队一个入度为0的顶点
        const current = queue.shift()
        result.push(current)
        
        // 将该顶点的所有邻接点的入度减1
        for (const neighbor of graph.getNeighbors(current)) {
            inDegree.set(neighbor.vertex, inDegree.get(neighbor.vertex) - 1)
            
            // 如果邻接点的入度变为0，则加入队列
            if (inDegree.get(neighbor.vertex) === 0) {
                queue.push(neighbor.vertex)
            }
        }
    }
    
    // 检查是否存在环
    if (result.length !== graph.getVertices().length) {
        throw new Error('图中存在环，无法进行拓扑排序')
    }
    
    return result
}
```

**时间复杂度**: O(V + E)  
**空间复杂度**: O(V)

### DFS算法 (基于深度优先搜索)

#### 算法原理
DFS算法是一种基于深度优先搜索的拓扑排序算法，其核心思想是在DFS的过程中记录顶点的访问状态，并在回溯时将顶点加入结果序列。

#### 核心步骤

1. **状态定义**
```javascript
const WHITE = 0  // 未访问
const GRAY = 1   // 访问中
const BLACK = 2  // 已访问
```

2. **DFS算法实现**
```javascript
function topologicalSortDFS(graph) {
    const color = new Map()
    const result = []
    
    // 初始化所有顶点为白色（未访问）
    for (const vertex of graph.getVertices()) {
        color.set(vertex, WHITE)
    }
    
    function dfs(vertex) {
        // 标记为灰色（访问中）
        color.set(vertex, GRAY)
        
        // 访问所有邻接点
        for (const neighbor of graph.getNeighbors(vertex)) {
            const neighborColor = color.get(neighbor.vertex)
            
            if (neighborColor === GRAY) {
                throw new Error('图中存在环，无法进行拓扑排序')
            }
            
            if (neighborColor === WHITE) {
                dfs(neighbor.vertex)
            }
        }
        
        // 标记为黑色（已访问）并加入结果
        color.set(vertex, BLACK)
        result.unshift(vertex)  // 逆序插入
    }
    
    // 对所有未访问的顶点进行DFS
    for (const vertex of graph.getVertices()) {
        if (color.get(vertex) === WHITE) {
            dfs(vertex)
        }
    }
    
    return result
}
```

**时间复杂度**: O(V + E)  
**空间复杂度**: O(V)

## 应用实例

### 任务调度器

#### 问题描述
实现一个任务调度器，支持任务间的依赖关系，确保任务按正确顺序执行。

#### 设计实现
```javascript
class TaskScheduler {
    constructor() {
        this.tasks = new Map()
        this.graph = new Graph(true)  // 有向图
    }
    
    // 添加任务
    addTask(task) {
        const { id, name, duration, dependencies = [] } = task
        
        this.tasks.set(id, { name, duration, dependencies })
        this.graph.addVertex(id)
        
        // 添加依赖边
        for (const depId of dependencies) {
            this.graph.addEdge(depId, id)
        }
    }
    
    // 获取执行顺序
    getExecutionOrder() {
        try {
            return topologicalSortKahn(this.graph)
        } catch (error) {
            throw new Error('任务间存在循环依赖')
        }
    }
    
    // 执行所有任务
    async executeAll() {
        const executionOrder = this.getExecutionOrder()
        
        for (const taskId of executionOrder) {
            const task = this.tasks.get(taskId)
            console.log(`开始执行任务: ${task.name}`)
            
            // 模拟任务执行
            await new Promise(resolve => 
                setTimeout(resolve, task.duration)
            )
            
            console.log(`任务完成: ${task.name}`)
        }
    }
    
    // 检测循环依赖
    detectCyclicDependency() {
        try {
            this.getExecutionOrder()
            return false
        } catch (error) {
            return true
        }
    }
}
```

#### 使用示例
```javascript
const scheduler = new TaskScheduler()

// 添加任务
scheduler.addTask({
    id: 'task1',
    name: '任务1',
    duration: 1000,
    dependencies: []
})

scheduler.addTask({
    id: 'task2',
    name: '任务2',
    duration: 2000,
    dependencies: ['task1']  // 任务2依赖于任务1
})

scheduler.addTask({
    id: 'task3',
    name: '任务3',
    duration: 1500,
    dependencies: ['task1', 'task2']  // 任务3依赖于任务1和任务2
})

// 获取执行顺序
console.log(scheduler.getExecutionOrder())  // ['task1', 'task2', 'task3']

// 执行所有任务
scheduler.executeAll()
```

### 课程依赖系统

#### 问题描述
设计一个课程学习系统，根据课程间的先修关系确定学习顺序。

#### 设计实现
```javascript
class CourseScheduler {
    constructor() {
        this.courses = new Map()
        this.graph = new Graph(true)
    }
    
    // 添加课程
    addCourse(courseId, courseName, prerequisites = []) {
        this.courses.set(courseId, { name: courseName, prerequisites })
        this.graph.addVertex(courseId)
        
        // 添加先修关系
        for (const prereq of prerequisites) {
            this.graph.addEdge(prereq, courseId)
        }
    }
    
    // 获取学习路径
    getLearningPath() {
        return topologicalSortKahn(this.graph)
    }
    
    // 检查是否可以完成所有课程
    canFinishAllCourses() {
        try {
            const path = this.getLearningPath()
            return path.length === this.courses.size
        } catch (error) {
            return false
        }
    }
    
    // 获取可以立即学习的课程
    getAvailableCourses(completedCourses = new Set()) {
        const available = []
        
        for (const [courseId, course] of this.courses) {
            if (completedCourses.has(courseId)) continue
            
            // 检查所有先修课程是否已完成
            const canTake = course.prerequisites.every(prereq => 
                completedCourses.has(prereq)
            )
            
            if (canTake) {
                available.push(courseId)
            }
        }
        
        return available
    }
}
```

## 算法对比分析

| 算法 | 实现方式 | 优点 | 缺点 | 适用场景 |
|------|----------|------|------|----------|
| Kahn算法 | BFS + 入度表 | 直观易懂，便于理解 | 需要额外空间存储入度 | 在线算法，适合动态图 |
| DFS算法 | DFS + 颜色标记 | 空间效率高，检测环更直接 | 递归实现，可能栈溢出 | 静态图，深度分析 |

## 性能优化

### 1. 增量更新
```javascript
class IncrementalTopologicalSort {
    constructor() {
        this.graph = new Graph(true)
        this.inDegree = new Map()
        this.topologicalOrder = []
    }
    
    // 增量添加边
    addEdge(from, to) {
        this.graph.addEdge(from, to)
        this.inDegree.set(to, (this.inDegree.get(to) || 0) + 1)
        
        // 重新计算受影响的部分
        this.updateTopologicalOrder()
    }
    
    // 增量删除边
    removeEdge(from, to) {
        this.graph.removeEdge(from, to)
        this.inDegree.set(to, this.inDegree.get(to) - 1)
        
        this.updateTopologicalOrder()
    }
    
    updateTopologicalOrder() {
        // 只重新计算受影响的部分，而不是整个图
        // 具体实现依赖于应用场景
    }
}
```

### 2. 并行处理
```javascript
class ParallelTaskScheduler extends TaskScheduler {
    async executeAllParallel() {
        const inDegree = new Map()
        const running = new Set()
        const completed = new Set()
        
        // 初始化入度
        for (const taskId of this.tasks.keys()) {
            const task = this.tasks.get(taskId)
            inDegree.set(taskId, task.dependencies.length)
        }
        
        while (completed.size < this.tasks.size) {
            // 找到所有可以并行执行的任务
            const readyTasks = []
            for (const [taskId, degree] of inDegree) {
                if (degree === 0 && !running.has(taskId) && !completed.has(taskId)) {
                    readyTasks.push(taskId)
                }
            }
            
            // 并行执行所有就绪任务
            const promises = readyTasks.map(async taskId => {
                running.add(taskId)
                const task = this.tasks.get(taskId)
                
                console.log(`开始执行任务: ${task.name}`)
                await new Promise(resolve => setTimeout(resolve, task.duration))
                console.log(`任务完成: ${task.name}`)
                
                running.delete(taskId)
                completed.add(taskId)
                
                // 更新依赖此任务的其他任务的入度
                for (const [otherId, otherTask] of this.tasks) {
                    if (otherTask.dependencies.includes(taskId)) {
                        inDegree.set(otherId, inDegree.get(otherId) - 1)
                    }
                }
            })
            
            await Promise.all(promises)
        }
    }
}
```

## 测试用例

```javascript
// 基础拓扑排序测试
const graph = new Graph(true)
graph.addEdge('A', 'B')
graph.addEdge('A', 'C')
graph.addEdge('B', 'D')
graph.addEdge('C', 'D')

console.log(topologicalSortKahn(graph))  // ['A', 'B', 'C', 'D'] 或 ['A', 'C', 'B', 'D']

// 任务调度测试
const scheduler = new TaskScheduler()
scheduler.addTask({ id: '1', name: '任务1', duration: 1000, dependencies: [] })
scheduler.addTask({ id: '2', name: '任务2', duration: 2000, dependencies: ['1'] })
console.log(scheduler.getExecutionOrder())  // ['1', '2']

// 循环依赖检测
try {
    const cyclicGraph = new Graph(true)
    cyclicGraph.addEdge('A', 'B')
    cyclicGraph.addEdge('B', 'C')
    cyclicGraph.addEdge('C', 'A')  // 形成环
    topologicalSortKahn(cyclicGraph)
} catch (error) {
    console.log('检测到循环依赖')  // 应该输出这个
}
```

## 实际应用场景

1. **编译系统**: 确定源文件的编译顺序
2. **包管理器**: 解决软件包依赖关系
3. **项目管理**: 任务调度和资源分配
4. **数据库**: 外键约束的处理顺序
5. **电路设计**: 逻辑门的计算顺序

## 总结

拓扑排序是解决有向无环图排序问题的重要算法。Kahn算法和DFS算法各有优势，在实际应用中应根据具体场景选择合适的算法。通过合理的设计和优化，可以构建高效的依赖管理和任务调度系统。