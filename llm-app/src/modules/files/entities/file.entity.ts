import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: '文件ID', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  id: string;

  @Column()
  @ApiProperty({ description: '文件名', example: 'document.pdf' })
  originalName: string;

  @Column()
  @ApiProperty({ description: '系统存储的文件名', example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479.pdf' })
  filename: string;

  @Column()
  @ApiProperty({ description: '文件MIME类型', example: 'application/pdf' })
  mimetype: string;

  @Column('bigint')
  @ApiProperty({ description: '文件大小（字节）', example: 1024 })
  size: number;

  @Column({ nullable: true })
  @ApiProperty({ description: '文件描述', example: '这是一份重要文档' })
  description?: string;

  @Column()
  path: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'uploadedBy' })
  user: User;

  @Column({ nullable: true })
  uploadedBy: number;

  @CreateDateColumn()
  @ApiProperty({ description: '上传时间', example: '2023-01-01T00:00:00Z' })
  uploadedAt: Date;
}
