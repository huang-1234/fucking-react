import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('kb_documents')
export class KbDocument {
  @PrimaryGeneratedColumn()
  @ApiProperty({ description: '文档ID', example: 1 })
  id: number;

  @Column('text')
  @ApiProperty({ description: '文档内容', example: '这是一段知识库内容...' })
  content: string;

  @Column('jsonb', { nullable: true })
  @ApiProperty({ description: '文档向量嵌入', type: 'array', items: { type: 'number' } })
  embedding: number[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'createdBy' })
  user: User;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  @ApiProperty({ description: '创建时间', example: '2023-01-01T00:00:00Z' })
  createdAt: Date;
}
