import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  StreamProcessor,
  createMockStream,
  visualizeStreamProcessing
} from '../al/streaming-processor';

describe('流式数据处理器测试', () => {
  let streamProcessor: StreamProcessor;

  beforeEach(() => {
    streamProcessor = new StreamProcessor();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该正确处理流式数据', async () => {
    const chunks = ['Hello', ', ', 'World', '!'];
    const mockStream = createMockStream(chunks, 100);

    const updateCallback = vi.fn();
    const completeCallback = vi.fn();

    streamProcessor
      .onUpdate(updateCallback)
      .onComplete(completeCallback);

    // 由于处理是异步的，我们需要使用Promise
    const processPromise = streamProcessor.processStreamingResponse(mockStream);

    // 模拟时间流逝，处理每个数据块
    for (let i = 0; i < chunks.length; i++) {
      await vi.advanceTimersByTimeAsync(100);

      // 验证更新回调被调用
      const expectedAccumulated = chunks.slice(0, i + 1).join('');
      expect(updateCallback).toHaveBeenCalledWith(expectedAccumulated);
    }

    // 完成流处理
    const result = await processPromise;

    // 验证结果
    expect(result).toBe('Hello, World!');
    expect(completeCallback).toHaveBeenCalledWith('Hello, World!');
    expect(updateCallback).toHaveBeenCalledTimes(chunks.length);
  });

  it('应该支持暂停和恢复功能', async () => {
    const chunks = ['Hello', ', ', 'World', '!'];
    const mockStream = createMockStream(chunks, 100);

    const updateCallback = vi.fn();

    streamProcessor.onUpdate(updateCallback);

    // 开始处理流
    const processPromise = streamProcessor.processStreamingResponse(mockStream);

    // 处理前两个数据块
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    // 暂停处理
    streamProcessor.pause();

    // 尝试处理下一个数据块，但由于暂停，不应该处理
    await vi.advanceTimersByTimeAsync(100);
    expect(updateCallback).toHaveBeenCalledTimes(2);

    // 恢复处理
    streamProcessor.resume();

    // 处理剩余的数据块
    await vi.advanceTimersByTimeAsync(100);
    await vi.advanceTimersByTimeAsync(100);

    // 完成流处理
    const result = await processPromise;

    // 验证结果
    expect(result).toBe('Hello, World!');
    expect(updateCallback).toHaveBeenCalledTimes(4);
  });

  it('应该正确处理错误', async () => {
    // 创建一个会抛出错误的流
    const errorStream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode('Error'));
        controller.error(new Error('Stream error'));
      }
    });

    const errorCallback = vi.fn();
    streamProcessor.onError(errorCallback);

    // 期望处理过程抛出错误
    await expect(streamProcessor.processStreamingResponse(errorStream)).rejects.toThrow('Stream error');
    expect(errorCallback).toHaveBeenCalledWith(expect.any(Error));
  });

  it('应该能够重置处理器状态', async () => {
    // 先处理一些数据
    const chunks1 = ['Hello'];
    const mockStream1 = createMockStream(chunks1, 100);
    await streamProcessor.processStreamingResponse(mockStream1);

    // 重置处理器
    streamProcessor.reset();

    // 再处理一些数据
    const chunks2 = ['World'];
    const mockStream2 = createMockStream(chunks2, 100);
    const result = await streamProcessor.processStreamingResponse(mockStream2);

    // 验证结果只包含第二次处理的数据
    expect(result).toBe('World');
  });
});

describe('模拟流创建测试', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('应该创建包含正确数据块的流', async () => {
    const chunks = ['Hello', ', ', 'World', '!'];
    const mockStream = createMockStream(chunks, 100);

    const reader = mockStream.getReader();
    const receivedChunks: string[] = [];

    // 模拟读取流
    for (let i = 0; i < chunks.length; i++) {
      // 等待下一个数据块
      await vi.advanceTimersByTimeAsync(100);

      const { value, done } = await reader.read();

      if (!done) {
        receivedChunks.push(new TextDecoder().decode(value));
      }
    }

    // 验证接收到的数据块
    expect(receivedChunks).toEqual(chunks);

    // 验证流已结束
    const { done } = await reader.read();
    expect(done).toBe(true);
  });
});

describe('流处理可视化测试', () => {
  it('应该正确生成可视化数据', () => {
    const chunks = ['Hello', ', ', 'World', '!'];
    const chunkDelayMs = 100;

    const result = visualizeStreamProcessing(chunks, chunkDelayMs);

    // 验证基本结构
    expect(result).toHaveProperty('chunks');
    expect(result).toHaveProperty('timeline');
    expect(result).toHaveProperty('totalTime');

    // 验证时间线长度
    expect(result.timeline.length).toBe(chunks.length);

    // 验证累积结果
    expect(result.timeline[result.timeline.length - 1].accumulated).toBe('Hello, World!');

    // 验证总时间
    expect(result.totalTime).toBe(chunkDelayMs * chunks.length);
  });

  it('应该正确处理暂停和恢复', () => {
    const chunks = ['Hello', ', ', 'World', '!'];
    const chunkDelayMs = 100;
    const pauseAt = 1;
    const resumeAt = 3;

    const result = visualizeStreamProcessing(chunks, chunkDelayMs, pauseAt, resumeAt);

    // 验证事件标记
    expect(result.timeline[pauseAt].event).toBe('pause');
    expect(result.timeline[resumeAt].event).toBe('resume');

    // 验证暂停期间的额外时间
    expect(result.totalTime).toBeGreaterThan(chunkDelayMs * chunks.length);
  });
});
