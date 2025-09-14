import { Injectable, Logger } from '@nestjs/common';
import { AiService } from '../ai/ai.service';

// 简化版向量存储接口，实际项目中应连接到真实的向量数据库
interface VectorStore {
  addDocuments(docs: { content: string; embedding: number[] }[]): Promise<void>;
  similaritySearch(embedding: number[], limit: number): Promise<{ pageContent: string; score: number }[]>;
}

@Injectable()
export class KnowledgeBaseService {
  private readonly logger = new Logger(KnowledgeBaseService.name);
  // 简易内存向量存储，仅用于演示
  private vectorStore: VectorStore = {
    documents: [] as { content: string; embedding: number[] }[],

    async addDocuments(docs: { content: string; embedding: number[] }[]) {
      this.documents.push(...docs);
    },

    async similaritySearch(queryEmbedding: number[], limit: number) {
      // 简易余弦相似度计算
      const calculateCosineSimilarity = (a: number[], b: number[]): number => {
        const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
        const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
        const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
        return dotProduct / (magnitudeA * magnitudeB);
      };

      return this.documents
        .map(doc => ({
          pageContent: doc.content,
          score: calculateCosineSimilarity(queryEmbedding, doc.embedding)
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
  } as VectorStore & { documents: { content: string; embedding: number[] }[] };

  constructor(private readonly aiService: AiService) {}

  // 添加文档到知识库
  async addDocument(content: string): Promise<void> {
    try {
      // 文本分割（简化版）
      const chunks = this.splitText(content);

      // 为每个块生成嵌入向量
      const embeddedChunks = await Promise.all(
        chunks.map(async (chunk) => ({
          content: chunk,
          embedding: await this.aiService.generateEmbedding(chunk)
        }))
      );

      // 存储到向量数据库
      await this.vectorStore.addDocuments(embeddedChunks);

      this.logger.log(`成功添加文档到知识库，共 ${chunks.length} 个文本块`);
    } catch (error: any) {
      this.logger.error('添加文档到知识库失败', error);
      throw new Error(`知识库添加文档失败: ${error.message}`);
    }
  }

  // 简易文本分割
  private splitText(text: string, chunkSize: number = 1000): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  // 检索增强生成（RAG）
  async retrieveAndGenerate(query: string): Promise<string> {
    try {
      // 1. 为查询生成向量
      const queryEmbedding = await this.aiService.generateEmbedding(query);

      // 2. 从向量数据库检索最相关的K个文档片段
      const relevantDocs = await this.vectorStore.similaritySearch(queryEmbedding, 5);

      // 3. 构建Prompt，将检索到的文档作为上下文
      const context = relevantDocs.map(doc => doc.pageContent).join('\n---\n');
      const prompt = `
请根据以下上下文信息回答问题。如果上下文不包含答案，请如实告知。
上下文：
${context}
问题：${query}
答案：`;

      // 4. 调用LLM生成最终答案
      return await this.aiService.createChatCompletion([{ role: 'user', content: prompt }]);
    } catch (error: any) {
      this.logger.error('RAG查询失败', error);
      throw new Error(`RAG查询失败: ${error.message}`);
    }
  }
}
