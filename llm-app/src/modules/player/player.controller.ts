import { Controller, Get, Post, Body, Param, Query, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PlayerService, Player, PlayerRelationship } from './player.service';
import { IsString, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(1)
  age: number;
}

class CreateFollowDto {
  @IsString()
  @IsNotEmpty()
  fromPlayerId: string;

  @IsString()
  @IsNotEmpty()
  toPlayerId: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  degree: number = 50; // 默认关注程度
}

@ApiTags('players')
@Controller('players')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Get()
  @ApiOperation({ summary: '获取所有球员', description: '返回球员列表，支持限制返回数量' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: '限制返回数量' })
  @ApiResponse({ status: 200, description: '成功返回球员列表' })
  async findAll(@Query('limit') limit?: number): Promise<Player[]> {
    return this.playerService.findAllPlayers(limit);
  }

  @Get(':name')
  @ApiOperation({ summary: '根据名称查询球员', description: '返回指定名称的球员信息' })
  @ApiParam({ name: 'name', type: String, description: '球员名称' })
  @ApiResponse({ status: 200, description: '成功返回球员信息' })
  @ApiResponse({ status: 404, description: '球员不存在' })
  async findByName(@Param('name') name: string): Promise<Player> {
    const player = await this.playerService.findPlayerByName(name);
    if (!player) {
      throw new BadRequestException(`未找到名为 ${name} 的球员`);
    }
    return player;
  }

  @Get(':id/follows')
  @ApiOperation({ summary: '查询球员关注的其他球员', description: '返回指定球员关注的其他球员列表' })
  @ApiParam({ name: 'id', type: String, description: '球员ID' })
  @ApiResponse({ status: 200, description: '成功返回关注列表' })
  async findFollows(@Param('id') id: string): Promise<PlayerRelationship[]> {
    return this.playerService.findPlayersFollowedBy(id);
  }

  @Post()
  @ApiOperation({ summary: '创建球员', description: '创建新的球员' })
  @ApiBody({ type: CreatePlayerDto })
  @ApiResponse({ status: 201, description: '球员创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async create(@Body(ValidationPipe) createPlayerDto: CreatePlayerDto): Promise<{ success: boolean; message: string }> {
    const success = await this.playerService.createPlayer(
      createPlayerDto.name,
      createPlayerDto.age,
    );

    return {
      success,
      message: success ? '球员创建成功' : '球员创建失败',
    };
  }

  @Post('follow')
  @ApiOperation({ summary: '创建关注关系', description: '创建球员之间的关注关系' })
  @ApiBody({ type: CreateFollowDto })
  @ApiResponse({ status: 201, description: '关注关系创建成功' })
  @ApiResponse({ status: 400, description: '请求参数错误' })
  async createFollow(@Body(ValidationPipe) createFollowDto: CreateFollowDto): Promise<{ success: boolean; message: string }> {
    const success = await this.playerService.createFollowRelationship(
      createFollowDto.fromPlayerId,
      createFollowDto.toPlayerId,
      createFollowDto.degree,
    );

    return {
      success,
      message: success ? '关注关系创建成功' : '关注关系创建失败',
    };
  }
}
