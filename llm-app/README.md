# NestJS NebulaGraph 集成示例（模拟模式）

本项目展示了如何在NestJS应用中集成NebulaGraph图数据库，实现图数据的存储和查询。由于NebulaGraph的Node.js客户端库可能存在兼容性问题，本项目使用模拟模式来演示集成方案。

## 项目结构

```
src/
├── modules/
│   ├── nebula/                # NebulaGraph模块
│   │   ├── nebula.module.ts   # 动态模块定义
│   │   └── nebula.service.ts  # 封装NebulaGraph操作的服务（模拟实现）
│   └── player/                # 示例业务模块
│       ├── player.module.ts   # 球员模块定义
│       ├── player.service.ts  # 球员服务
│       └── player.controller.ts # 球员API控制器
├── config/
│   └── configuration.ts       # 应用配置，包含NebulaGraph连接信息
└── app.module.ts              # 应用根模块
```

## 功能特性

- 模拟NebulaGraph查询接口
- 提供统一的查询API
- 支持参数化查询模拟
- 错误处理和日志记录
- 应用关闭时自动清理资源
- 示例球员关系图API

## 安装

```bash
# 安装依赖
pnpm install
```

## 配置

在`.env`文件中配置模拟的NebulaGraph连接信息：

```
NEBULA_HOST=localhost
NEBULA_PORT=9669
NEBULA_USERNAME=root
NEBULA_PASSWORD=nebula
NEBULA_SPACE=basketballplayer
NEBULA_POOL_SIZE=10
```

## 初始化模拟数据

```bash
# 查看模拟数据初始化脚本（不会实际连接数据库）
pnpm run nebula:setup
```

> 注意：模拟数据已在 `src/modules/nebula/nebula.service.ts` 中预定义，不需要实际连接NebulaGraph数据库。

## 运行

```bash
# 开发模式
pnpm start

# 生产模式
pnpm run start:prod
```

## API示例

### 获取所有球员

```
GET /players?limit=10
```

### 根据名称查询球员

```
GET /players/:name
```

### 查询球员关注的其他球员

```
GET /players/:id/follows
```

### 创建球员

```
POST /players
{
  "name": "LeBron James",
  "age": 36
}
```

### 创建关注关系

```
POST /players/follow
{
  "fromPlayerId": "player100",
  "toPlayerId": "player101",
  "degree": 95
}
```

## 支持的nGQL查询示例

模拟服务支持以下格式的nGQL查询：

```cypher
// 查询所有球员
MATCH (v:player) RETURN id(v) AS id, v.name AS name, v.age AS age LIMIT 10;

// 根据名称查询球员
MATCH (v:player{name:"Tim Duncan"}) RETURN id(v) AS id, v.name AS name, v.age AS age;

// 查询球员关注的其他球员
GO FROM "player101" OVER follow YIELD dst(edge) AS id, properties(edge).degree AS degree;

// 创建球员
INSERT VERTEX player(name, age) VALUES "player110":("LeBron James", 36);

// 创建关注关系
INSERT EDGE follow(degree) VALUES "player110" -> "player100":(90);
```

## 从模拟模式迁移到实际NebulaGraph

要将此示例迁移到实际的NebulaGraph数据库：

1. 安装官方的NebulaGraph客户端库
2. 修改`src/modules/nebula/nebula.service.ts`，替换模拟实现为实际的客户端调用
3. 更新`scripts/setup-nebula.js`，将`mockMode`设置为`false`
4. 确保NebulaGraph服务已启动并可访问

## 注意事项

- 此项目使用模拟模式，不需要实际的NebulaGraph服务
- 模拟数据存储在内存中，应用重启后会重置
- 模拟实现仅支持有限的nGQL查询格式
- 实际生产环境中应使用官方的NebulaGraph客户端库

## 参考文档

- [NebulaGraph官方文档](https://docs.nebula-graph.io/)
- [NestJS官方文档](https://nestjs.com/)