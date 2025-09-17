import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from '../users/dto/login-user.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    try {
      return await this.usersService.validateUser(username, password);
    } catch (error: any) {
      this.logger.error(`用户验证失败: ${error.message}`, error.stack);
      throw new UnauthorizedException('用户名或密码错误');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ access_token: string }> {
    const { username, password } = loginUserDto;
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const payload = {
      sub: user.id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin
    };

    this.logger.log(`用户登录成功: ${username}`);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
