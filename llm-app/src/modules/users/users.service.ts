import { Injectable, NotFoundException, ConflictException, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async onModuleInit(): Promise<void> {
    // 初始化一个管理员用户
    await this.createAdminUser();
  }

  private async createAdminUser(): Promise<void> {
    const adminExists = await this.userRepository.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const admin = this.userRepository.create({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        isAdmin: true,
        lastLoginAt: new Date(),
      });
      await this.userRepository.save(admin);
      this.logger.log('已创建管理员用户');
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingUsername = await this.userRepository.findOne({ where: { username: createUserDto.username } });
    if (existingUsername) {
      throw new ConflictException('用户名已存在');
    }

    // 检查邮箱是否已存在
    const existingEmail = await this.userRepository.findOne({ where: { email: createUserDto.email } });
    if (existingEmail) {
      throw new ConflictException('邮箱已存在');
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // 创建新用户
    const newUser = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      isAdmin: false,
      lastLoginAt: new Date(),
    });

    await this.userRepository.save(newUser);
    this.logger.log(`用户创建成功: ${newUser.username}`);

    // 返回用户信息（不包含密码）
    const { password, ...result } = newUser;
    return result as User;
  }

  async findOne(username: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { username } });
  }

  async findById(id: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateLastLogin(username: string): Promise<void> {
    await this.userRepository.update({ username }, { lastLoginAt: new Date() });
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.findOne(username);

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    // 更新最后登录时间
    await this.updateLastLogin(username);

    // 返回用户信息（不包含密码）
    const { password: _, ...result } = user;
    return result;
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    return users.map(user => {
      const { password, ...result } = user;
      return result as User;
    });
  }
}
