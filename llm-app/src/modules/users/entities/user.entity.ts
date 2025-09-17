import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '用户ID', example: 1 })
  id: number;

  @Column({ unique: true })
  @ApiProperty({ description: '用户名', example: 'user123' })
  username: string;

  @Column({ unique: true })
  @ApiProperty({ description: '邮箱', example: 'user@example.com' })
  email: string;

  @Column()
  password: string; // 不暴露给API

  @Column({ default: false })
  @ApiProperty({ description: '是否为管理员', example: false })
  isAdmin: boolean;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2023-01-01T00:00:00Z' })
  createdAt: Date;

  @Column({ nullable: true })
  @ApiProperty({ description: '最后登录时间', example: '2023-01-01T00:00:00Z' })
  lastLoginAt: Date;
}
