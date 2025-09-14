import { Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CacheService } from './cache.service';

@ApiTags('cache')
@Controller('cache')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class CacheController {
  constructor(private readonly cacheService: CacheService) {}

  @Get('status')
  @ApiOperation({ summary: '获取缓存状态', description: '返回缓存服务的状态信息' })
  @ApiResponse({
    status: 200,
    description: '缓存状态',
    schema: {
      properties: {
        status: { type: 'string', example: 'active' },
        type: { type: 'string', example: 'redis' },
      }
    }
  })
  async getStatus() {
    return {
      status: 'active',
      type: process.env.REDIS_HOST ? 'redis' : 'memory',
      timestamp: new Date().toISOString(),
    };
  }

  @Delete()
  @ApiOperation({ summary: '清空缓存', description: '清空所有缓存数据，仅管理员可操作' })
  @ApiResponse({
    status: 200,
    description: '缓存已清空',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: '缓存已成功清空' },
      }
    }
  })
  async clearCache() {
    await this.cacheService.reset();
    return {
      success: true,
      message: '缓存已成功清空',
      timestamp: new Date().toISOString(),
    };
  }
}
