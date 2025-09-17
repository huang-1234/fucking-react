import { List } from 'immutable';

/**
 * 模拟AI模型生成的流式响应处理器
 *
 * 时间复杂度：O(n) - 其中n是流中数据块的数量
 * 空间复杂度：O(n) - 存储累积的结果
 */
export class StreamProcessor {
  private decoder: TextDecoder;
  private result: string;
  private isPaused: boolean;
  private onUpdateCallback: ((result: string) => void) | null;
  private onCompleteCallback: ((result: string) => void) | null;
  private onErrorCallback: ((error: Error) => void) | null;

  constructor() {
    this.decoder = new TextDecoder();
    this.result = '';
    this.isPaused = false;
    this.onUpdateCallback = null;
    this.onCompleteCallback = null;
    this.onErrorCallback = null;
  }

  /**
   * 处理流式响应
   * @param stream 可读流
   * @returns 处理完成的Promise
   */
  async processStreamingResponse(stream: ReadableStream<Uint8Array>): Promise<string> {
    const reader = stream.getReader();

    try {
      while (true) {
        // 如果暂停，则等待恢复
        if (this.isPaused) {
          await new Promise<void>(resolve => {
            const checkPaused = () => {
              if (!this.isPaused) {
                resolve();
              } else {
                setTimeout(checkPaused, 100);
              }
            };
            checkPaused();
          });
        }

        const { done, value } = await reader.read();

        if (done) {
          this.onCompleteCallback?.(this.result);
          break;
        }

        // 解码并处理数据块
        const chunk = this.decoder.decode(value, { stream: true });
        this.result += chunk;

        // 通知更新
        this.onUpdateCallback?.(this.result);
      }

      return this.result;
    } catch (error) {
      this.onErrorCallback?.(error as Error);
      throw error;
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * 暂停处理
   */
  pause(): void {
    this.isPaused = true;
  }

  /**
   * 恢复处理
   */
  resume(): void {
    this.isPaused = false;
  }

  /**
   * 重置处理器
   */
  reset(): void {
    this.result = '';
  }

  /**
   * 设置更新回调
   * @param callback 更新回调函数
   */
  onUpdate(callback: (result: string) => void): this {
    this.onUpdateCallback = callback;
    return this;
  }

  /**
   * 设置完成回调
   * @param callback 完成回调函数
   */
  onComplete(callback: (result: string) => void): this {
    this.onCompleteCallback = callback;
    return this;
  }

  /**
   * 设置错误回调
   * @param callback 错误回调函数
   */
  onError(callback: (error: Error) => void): this {
    this.onErrorCallback = callback;
    return this;
  }
}

/**
 * 创建模拟的流式响应
 * @param chunks 要发送的数据块
 * @param chunkDelayMs 每个数据块之间的延迟（毫秒）
 * @returns 可读流
 */
export function createMockStream(
  chunks: string[],
  chunkDelayMs: number = 100
): ReadableStream<Uint8Array> {
  // 使用Immutable.js确保不修改输入数组
  const immutableChunks = List(chunks);

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      for (let i = 0; i < immutableChunks.size; i++) {
        const chunk = immutableChunks.get(i);
        if (chunk) {
          controller.enqueue(encoder.encode(chunk));

          // 添加延迟模拟网络延迟
          if (i < immutableChunks.size - 1) {
            await new Promise(resolve => setTimeout(resolve, chunkDelayMs));
          }
        }
      }

      controller.close();
    }
  });
}

/**
 * 生成流处理的可视化数据
 * @param chunks 数据块数组
 * @param chunkDelayMs 每个数据块之间的延迟
 * @param pauseAt 暂停处理的索引（可选）
 * @param resumeAt 恢复处理的索引（可选）
 * @returns 可视化数据对象
 */
export function visualizeStreamProcessing(
  chunks: string[],
  chunkDelayMs: number,
  pauseAt?: number,
  resumeAt?: number
) {
  const timeline: Array<{
    time: number,
    chunk: string,
    accumulated: string,
    event?: 'pause' | 'resume'
  }> = [];

  let currentTime = 0;
  let accumulated = '';

  chunks.forEach((chunk, index) => {
    accumulated += chunk;

    const event = index === pauseAt ? 'pause' : index === resumeAt ? 'resume' : undefined;

    timeline.push({
      time: currentTime,
      chunk,
      accumulated,
      event
    });

    // 如果暂停，增加额外的时间
    if (index === pauseAt && resumeAt && resumeAt > pauseAt) {
      currentTime += (resumeAt - pauseAt) * chunkDelayMs * 2;
    } else {
      currentTime += chunkDelayMs;
    }
  });

  return {
    chunks,
    timeline,
    totalTime: currentTime
  };
}
