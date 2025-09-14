import { Injectable, Logger } from '@nestjs/common';
import { NebulaService } from '../nebula/nebula.service';

export interface Player {
  id: string;
  name: string;
  age: number;
}

export interface PlayerRelationship {
  id: string;
  degree: number;
}

@Injectable()
export class PlayerService {
  private readonly logger = new Logger(PlayerService.name);

  constructor(private readonly nebulaService: NebulaService) {}

  /**
   * 根据名称查询球员
   * @param name 球员名称
   * @returns 球员信息
   */
  async findPlayerByName(name: string): Promise<Player | null> {
    try {
      // 使用参数化查询防止注入
      const ngql = `MATCH (v:player{name:$name}) RETURN id(v) AS id, v.name AS name, v.age AS age`;
      const result = await this.nebulaService.executeQuery<Player>(ngql, { name });

      if (!result.success || result.data.length === 0) {
        return null;
      }

      return result.data[0];
    } catch (error: any) {
      this.logger.error(`查询球员失败: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * 查询所有球员
   * @param limit 限制返回数量
   * @returns 球员列表
   */
  async findAllPlayers(limit: number = 10): Promise<Player[]> {
    try {
      const ngql = `MATCH (v:player) RETURN id(v) AS id, v.name AS name, v.age AS age LIMIT ${limit}`;
      const result = await this.nebulaService.executeQuery<Player>(ngql);

      if (!result.success) {
        return [];
      }

      return result.data;
    } catch (error: any) {
      this.logger.error(`查询所有球员失败: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 查询球员关注的其他球员
   * @param playerId 球员ID
   * @returns 关注关系列表
   */
  async findPlayersFollowedBy(playerId: string): Promise<PlayerRelationship[]> {
    try {
      const ngql = `GO FROM "${playerId}" OVER follow YIELD dst(edge) AS id, properties(edge).degree AS degree`;
      const result = await this.nebulaService.executeQuery<PlayerRelationship>(ngql);

      if (!result.success) {
        return [];
      }

      return result.data;
    } catch (error: any) {
      this.logger.error(`查询球员关注关系失败: ${error.message}`, error.stack);
      return [];
    }
  }

  /**
   * 创建球员
   * @param name 球员名称
   * @param age 球员年龄
   * @returns 创建结果
   */
  async createPlayer(name: string, age: number): Promise<boolean> {
    try {
      // 生成唯一ID
      const playerId = `player_${Date.now()}`;
      const ngql = `INSERT VERTEX player(name, age) VALUES "${playerId}":("${name}", ${age})`;

      const result = await this.nebulaService.executeQuery(ngql);
      return result.success;
    } catch (error: any) {
      this.logger.error(`创建球员失败: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * 创建球员之间的关注关系
   * @param fromPlayerId 关注者ID
   * @param toPlayerId 被关注者ID
   * @param degree 关注程度
   * @returns 创建结果
   */
  async createFollowRelationship(fromPlayerId: string, toPlayerId: string, degree: number): Promise<boolean> {
    try {
      const ngql = `INSERT EDGE follow(degree) VALUES "${fromPlayerId}" -> "${toPlayerId}":(${degree})`;

      const result = await this.nebulaService.executeQuery(ngql);
      return result.success;
    } catch (error: any) {
      this.logger.error(`创建关注关系失败: ${error.message}`, error.stack);
      return false;
    }
  }
}
