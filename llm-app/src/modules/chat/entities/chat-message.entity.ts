import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '消息ID', example: 1 })
  id: number;

  @Column({
    type: 'enum',
    enum: MessageRole,
    default: MessageRole.USER,
  })
  @ApiProperty({ description: '消息角色', enum: MessageRole, example: 'user' })
  role: MessageRole;

  @Column('text')
  @ApiProperty({ description: '消息内容', example: '你好，请问你能帮我做什么？' })
  content: string;

  @Column({ nullable: true })
  @ApiProperty({ description: '会话ID', example: 'session-123' })
  sessionId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: number;

  @Column({ nullable: true })
  @ApiProperty({ description: '使用的模型', example: 'gpt-3.5-turbo' })
  model: string;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2023-01-01T00:00:00Z' })
  createdAt: Date;
}
