import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { KnowledgeBaseService } from './knowledge-base.service';

interface AddDocumentDto {
  content: string;
}

interface QueryDto {
  query: string;
}

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Post('add')
  async addDocument(@Body() body: AddDocumentDto): Promise<{ success: boolean; message: string }> {
    try {
      await this.knowledgeBaseService.addDocument(body.content);
      return { success: true, message: '文档已成功添加到知识库' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  @Get('query')
  async queryKnowledgeBase(@Query() query: QueryDto): Promise<{ answer: string }> {
    const answer = await this.knowledgeBaseService.retrieveAndGenerate(query.query);
    return { answer };
  }
}
