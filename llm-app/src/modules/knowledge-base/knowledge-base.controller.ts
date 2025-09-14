import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { KnowledgeBaseService } from './knowledge-base.service';
import { AddDocumentDto } from './dto/add-document.dto';
import { QueryDto } from './dto/query.dto';

@ApiTags('knowledge-base')
@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post('add')
  @ApiOperation({ summary: '添加文档到知识库', description: '将文本内容添加到知识库中，用于后续的检索增强生成' })
  @ApiBody({ type: AddDocumentDto })
  @ApiResponse({ status: 200, description: '文档添加成功', schema: {
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: '文档已成功添加到知识库' }
    }
  }})
  @ApiResponse({ status: 400, description: '添加失败', schema: {
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: '知识库添加文档失败: 文档内容为空' }
    }
  }})
  async addDocument(@Body() body: AddDocumentDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.knowledgeBaseService.addDocument(body.content);
      return { success: true, message: '文档已成功添加到知识库' };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  }

  @Get('query')
  @ApiOperation({ summary: '查询知识库', description: '根据用户查询，从知识库中检索相关信息并生成回答' })
  @ApiQuery({ name: 'query', type: 'string', description: '查询内容', example: '什么是人工智能?' })
  @ApiResponse({ status: 200, description: '查询成功', schema: {
    properties: {
      answer: { type: 'string', example: '人工智能是计算机科学的一个分支，致力于创造能够模拟人类智能的机器...' }
    }
  }})
  async queryKnowledgeBase(@Query() query: QueryDto): Promise<{ answer: string }> {
    const answer = await this.knowledgeBaseService.retrieveAndGenerate(query.query);
    return { answer };
  }
}
