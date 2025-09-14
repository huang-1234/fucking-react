NebulaGraph 是一款高性能的**开源分布式图数据库**，擅长处理千亿顶点和万亿边的超大规模数据集，并提供毫秒级查询延时。它采用 **shared-nothing 分布式架构**，支持线性水平扩展，其核心服务包括 Graph Service（查询处理）、Storage Service（数据持久化）和 Meta Service（元数据管理），通过 Raft 协议保障数据强一致性。

下面结合 Node.js 和 NestJS 技术栈，为你提供一份综合技术文档。

### 🔧 一、核心概念与优势

1.  **数据模型**：采用**有向属性图**模型，顶点（Vertex）表示实体，边（Edge）表示关系，均支持属性。
2.  **查询语言**：**nGQL**，一种类 SQL 的声明式文本查询语言，部分兼容 openCypher，易于学习和使用。
3.  **核心优势**：
    *   **高性能**：C++ 原生开发，手动内存管理，避免 GC 波动，支持 SIMD 指令集优化。
    *   **分布式架构**：存储与计算分离，支持弹性扩缩容。
    *   **生态兼容性**：支持多种编程语言客户端（C++、Java、Python、Go、Node.js），兼容 Cypher 和 Gremlin 查询语言。

### 📦 二、环境搭建与部署

#### 1. 数据库部署：Docker (推荐)
```bash
# 1. 克隆部署仓库

# 2. 启动所有服务（Meta、Graph、Storage）
docker-compose up -d

# 3. 验证服务状态
docker-compose ps
```
默认连接信息：
*   **GraphD 服务端口**：`9669`
*   **用户名**：`root`
*   **密码**：`nebula`
*   **Studio 可视化界面**：通常运行在 `http://localhost:7001`

#### 2. Node.js 客户端库
NebulaGraph 为 Node.js 提供了官方的 `nebula-nodejs` 客户端库。
```bash
npm install nebula-nodejs
```

### 🧩 三、NestJS 集成方案

在 NestJS 中，我们通常采用模块化设计来封装 NebulaGraph 的连接和操作。

#### 1. 创建 NebulaGraph 模块
首先，我们创建一个动态模块 `NebulaModule`，用于提供数据库连接。

```typescript
// nebula/nebula.module.ts
import { DynamicModule, Module, Provider } from '@nestjs/common';
import { NebulaService } from './nebula.service';

export interface NebulaModuleOptions {
  graphdHost: string;
  graphdPort: number;
  username: string;
  password: string;
  spaceName: string; // 要使用的图空间名称
}

@Module({})
export class NebulaModule {
  static forRoot(options: NebulaModuleOptions): DynamicModule {
    const nebulaProvider: Provider = {
      provide: 'NEBULA_OPTIONS',
      useValue: options,
    };
    return {
      module: NebulaModule,
      providers: [nebulaProvider, NebulaService],
      exports: [NebulaService],
      global: true, // 注册为全局模块，方便在其他模块直接注入 NebulaService
    };
  }
}
```

#### 2. 创建核心服务 (NebulaService)
此服务封装了连接池管理、会话创建和查询执行等核心逻辑。

```typescript
// nebula/nebula.service.ts
import { Injectable, Inject, OnApplicationShutdown } from '@nestjs/common';
import { SessionPool, Connection } from 'nebula-nodejs'; // 假设 nebula-nodejs 提供这些类或类似功能

export interface QueryResult {
  data: any[];
  executionTime: number;
  success: boolean;
  error?: string;
}

@Injectable()
export class NebulaService implements OnApplicationShutdown {
  private sessionPool: SessionPool;
  private connection: Connection;

  constructor(@Inject('NEBULA_OPTIONS') private readonly options) {
    this.initConnection();
  }

  private async initConnection() {
    try {
      // 1. 创建连接
      this.connection = new Connection();
      await this.connection.open(this.options.graphdHost, this.options.graphdPort);

      // 2. 身份认证
      const authResult = await this.connection.authenticate(this.options.username, this.options.password);
      if (!authResult) {
        throw new Error('NebulaGraph authentication failed');
      }

      // 3. 选择图空间
      await this.connection.execute(`USE ${this.options.spaceName}`);

      // 4. 初始化会话池 (可根据需要配置大小)
      this.sessionPool = new SessionPool(this.connection, { maxSize: 10 });
      console.log('NebulaGraph connection pool initialized successfully');

    } catch (error) {
      console.error('Failed to initialize NebulaGraph connection:', error);
      throw error;
    }
  }

  async executeQuery<T = any>(ngql: string, params?: Record<string, any>): Promise<QueryResult> {
    const startTime = Date.now();
    let session;

    try {
      session = await this.sessionPool.acquire();
      // 如果有参数，可以考虑使用参数化查询来防止注入（如果客户端库支持）
      const result = await session.execute(ngql);
      const executionTime = Date.now() - startTime;

      // 处理结果，转换为友好格式
      return {
        data: result?.data || [], // 根据实际返回数据结构调整
        executionTime,
        success: true,
      };
    } catch (error) {
      return {
        data: [],
        executionTime: Date.now() - startTime,
        success: false,
        error: error.message,
      };
    } finally {
      if (session) {
        await this.sessionPool.release(session);
      }
    }
  }

  async onApplicationShutdown() {
    if (this.connection) {
      await this.connection.close();
      console.log('NebulaGraph connection closed');
    }
  }
}
```

#### 3. 在 AppModule 中注册
在根模块中导入 `NebulaModule` 并配置连接参数。

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { NebulaModule } from './nebula/nebula.module';
import { AppController } from './app.controller';

@Module({
  imports: [
    NebulaModule.forRoot({
      graphdHost: 'localhost',
      graphdPort: 9669,
      username: 'root',
      password: 'nebula',
      spaceName: 'your_space_name', // 替换为你的图空间名称
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
```

#### 4. 在 Controller 或 Service 中使用
现在，你可以在任何 NestJS 控制器或服务中注入并使用 `NebulaService`。

```typescript
// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { NebulaService } from './nebula/nebula.service';

@Controller()
export class AppController {
  constructor(private readonly nebulaService: NebulaService) {}

  @Get('query')
  async executeSampleQuery() {
    const ngql = `MATCH (v:player) RETURN id(v) AS id, v.name AS name LIMIT 5`;
    const result = await this.nebulaService.executeQuery(ngql);
    return result;
  }
}
```

### 💡 四、nGQL 操作核心指南

以下是一些在你的 Node.js/NestJS 应用中可能会用到的常见 nGQL 操作示例：

| 操作类型 | nGQL 示例 | 说明 |
| :--- | :--- | :--- |
| **创建图空间** | `CREATE SPACE basketballplayer (vid_type = FIXED_STRING(30))` | 创建一个名为 `basketballplayer` 的图空间，指定顶点ID类型。 |
| **选择图空间** | `USE basketballplayer` | 切换到 `basketballplayer` 图空间进行操作。 |
| **创建 Tag** | `CREATE TAG player(name string, age int)` | 创建一个名为 `player` 的标签，包含 `name` 和 `age` 属性。 |
| **创建 Edge** | `CREATE EDGE follow(degree int)` | 创建一个名为 `follow` 的边类型，包含 `degree` 属性。 |
| **插入顶点** | `INSERT VERTEX player(name, age) VALUES "player100":("Tim Duncan", 42)` | 插入一个 ID 为 `"player100"` 的顶点，并设置属性。 |
| **插入边** | `INSERT EDGE follow(degree) VALUES "player101" -> "player100":(95)` | 在 `"player101"` 和 `"player100"` 之间插入一条边，并设置 `degree` 为 95。 |
| **查询数据 (MATCH)** | `MATCH (v:player{name:"Tim Duncan"}) RETURN v` | 查询名为 "Tim Duncan" 的 player 顶点。 |
| **查询路径** | `MATCH p=(a:player)-[e:follow]->(b:player) RETURN p` | 查询所有 player 通过 follow 边连接的路径。 |
| **遍历查询 (GO)** | `GO FROM "player101" OVER follow YIELD dst(edge)` | 从顶点 "player101" 开始，沿 follow 边遍历，并返回目标顶点ID。 |

### 🚀 五、实战示例：构建一个简单的图数据 API

假设我们要构建一个查询篮球球员及其关系的 API。

1.  **确保图空间和数据存在**：首先在 NebulaGraph Studio 或 Console 中创建图空间 (`basketballplayer`)，并执行上述的 `CREATE TAG`、`INSERT VERTEX` 等语句初始化数据。
2.  **创建 PlayerService**：
    ```typescript
    // player/player.service.ts
    import { Injectable } from '@nestjs/common';
    import { NebulaService } from '../nebula/nebula.service';

    @Injectable()
    export class PlayerService {
      constructor(private readonly nebulaService: NebulaService) {}

      async findPlayerByName(name: string) {
        const ngql = `MATCH (v:player{name:"${name}"}) RETURN id(v) AS id, v.name AS name, v.age AS age`;
        return await this.nebulaService.executeQuery(ngql);
      }

      async findPlayersFollowedBy(playerId: string) {
        const ngql = `GO FROM "${playerId}" OVER follow YIELD dst(edge) AS id, properties(edge).degree AS degree`;
        return await this.neulaService.executeQuery(ngql);
      }
    }
    ```
3.  **创建 PlayerController**：
    ```typescript
    // player/player.controller.ts
    import { Controller, Get, Param } from '@nestjs/common';
    import { PlayerService } from './player.service';

    @Controller('players')
    export class PlayerController {
      constructor(private readonly playerService: PlayerService) {}

      @Get(':name')
      findOne(@Param('name') name: string) {
        return this.playerService.findPlayerByName(name);
      }

      @Get(':id/follows')
      findFollows(@Param('id') id: string) {
        return this.playerService.findPlayersFollowedBy(id);
      }
    }
    ```
4.  **注册模块**：将 `PlayerService` 和 `PlayerController` 在相应的 NestJS Module 中声明。

### ⚠️ 六、性能优化与注意事项

1.  **连接池管理**：使用并正确管理连接池至关重要，避免频繁创建和销毁连接。
2.  **异步操作**：所有数据库操作都应是异步的，避免阻塞 Node.js 事件循环。
3.  **错误处理**：健壮的错误处理是必须的，包括连接失败、查询超时、语法错误等。
4.  **nGQL 注入防护**：在拼接 nGQL 语句时，特别是使用用户输入时，**务必对参数进行转义或验证**，强烈建议使用参数化查询（如果 `nebula-nodejs` 客户端支持）。
5.  **监控与日志**：记录重要的操作和慢查询，便于排查问题和性能分析。
6.  **合理设计数据模型**：良好的点、边、标签、属性设计是高效查询的基础。

### 📚 七、总结与后续探索

通过将 NebulaGraph 与 NestJS 集成，你可以构建出处理复杂关系数据的强大应用。

*   **下一步**：你可以探索更复杂的图查询，如多跳查询、最短路径计算（`FIND SHORTEST PATH`）或 PageRank 等图算法。
*   **高级特性**：研究 NebulaGraph 的**索引优化**（为 Tag 或 Edge Type 的属性创建索引以加速查询）和**集群部署**以应对更大规模的数据。
*   **可视化**：结合 `nebula-graph-studio` 或 `D3.js`、`G6` 等前端库来可视化你的图数据。

希望这份详细的技术文档能帮助你和使用 Cursor 快速上手 NebulaGraph 与 Node.js/NestJS 的开发！