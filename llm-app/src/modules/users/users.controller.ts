import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册', description: '创建新用户账号' })
  @ApiResponse({ status: 201, description: '用户创建成功', type: User })
  @ApiResponse({ status: 409, description: '用户名或邮箱已存在' })
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有用户', description: '仅管理员可访问' })
  @ApiResponse({ status: 200, description: '成功获取用户列表', type: [User] })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }
}
