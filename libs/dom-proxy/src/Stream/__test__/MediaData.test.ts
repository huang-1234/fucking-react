/**
 * MediaData 媒体数据传输API测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MediaData, MediaType, VideoCodec, AudioCodec, ImageFormat, ContainerFormat, MediaMetadata, MediaSegment, StreamingConfig } from '../core/MediaData';
import { BinaryData } from '../core/BinaryData';
import { StreamError, DataFormatError } from '../utils/errors';
import { BrowserMock, TestDataGenerator, setupStreamTests, MockUtils, AssertUtils } from './setup';

describe('MediaData', () => {
  setupStreamTests();

  let testVideoData: ArrayBuffer;
  let testAudioData: ArrayBuffer;
  let testImageData: ArrayBuffer;
  let mockFile: File;
  let mockVideoMetadata: MediaMetadata;
  let mockAudioMetadata: MediaMetadata;
  let mockImageMetadata: MediaMetadata;

  beforeEach(() => {
    // 生成测试数据
    testVideoData = TestDataGenerator.generateArrayBuffer(1024 * 1024); // 1MB
    testAudioData = TestDataGenerator.generateArrayBuffer(512 * 1024); // 512KB
    testImageData = TestDataGenerator.generateArrayBuffer(256 * 1024); // 256KB

    // 创建Mock文件
    mockFile = new File([testVideoData], 'test-video.mp4', { type: 'video/mp4' });

    // 创建测试元数据
    mockVideoMetadata = {
      type: 'video',
      codec: 'h264',
      container: 'mp4',
      duration: 60,
      bitrate: 1000000,
      frameRate: 30,
      resolution: { width: 1920, height: 1080 },
      createdAt: new Date()
    };

    mockAudioMetadata = {
      type: 'audio',
      codec: 'aac',
      duration: 180,
      bitrate: 128000,
      sampleRate: 44100,
      channels: 2,
      createdAt: new Date()
    };

    mockImageMetadata = {
      type: 'image',
      codec: 'jpeg',
      resolution: { width: 1920, height: 1080 },
      createdAt: new Date()
    };

    // Mock Canvas API
    BrowserMock.mockCanvas();

    // Mock Image constructor
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      naturalWidth = 1920;
      naturalHeight = 1080;

      set src(value: string) {
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 10);
      }
    } as any;

    // Mock URL.createObjectURL
    global.URL = {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn()
    } as any;
  });

  afterEach(() => {
    BrowserMock.restoreAll();
  });

  describe('构造函数和基本属性', () => {
    it('应该正确创建MediaData实例', () => {
      const mediaData = new MediaData(testVideoData, mockVideoMetadata);

      expect(mediaData).toBeInstanceOf(MediaData);
      expect(mediaData).toBeInstanceOf(BinaryData);
      expect(mediaData.size).toBe(testVideoData.byteLength);
      expect(mediaData.getMetadata()).toEqual(mockVideoMetadata);
    });

    it('应该使用默认流式配置', () => {
      const mediaData = new MediaData(testVideoData, mockVideoMetadata);
      const config = mediaData.getStreamingConfig();

      expect(config.bufferSize).toBe(1024 * 1024);
      expect(config.maxBufferTime).toBe(30);
      expect(config.preloadStrategy).toBe('metadata');
      expect(config.adaptiveQuality).toBe(false);
      expect(config.retryCount).toBe(3);
    });

    it('应该接受自定义流式配置', () => {
      const customConfig: StreamingConfig = {
        bufferSize: 2048 * 1024,
        maxBufferTime: 60,
        preloadStrategy: 'auto',
        adaptiveQuality: true,
        retryCount: 5
      };

      const mediaData = new MediaData(testVideoData, mockVideoMetadata, customConfig);
      const config = mediaData.getStreamingConfig();

      expect(config).toEqual(customConfig);
    });

    it('应该正确设置MIME类型', () => {
      const videoData = new MediaData(testVideoData, mockVideoMetadata);
      const audioData = new MediaData(testAudioData, mockAudioMetadata);
      const imageData = new MediaData(testImageData, mockImageMetadata);

      expect(videoData.type).toBe('video/mp4');
      expect(audioData.type).toBe('audio/aac');
      expect(imageData.type).toBe('image/jpeg');
    });
  });

  describe('静态工厂方法', () => {
    describe('fromFile', () => {
      it('应该从文件创建MediaData', async () => {
        const mediaData = await MediaData.fromFile(mockFile);

        expect(mediaData).toBeInstanceOf(MediaData);
        expect(mediaData.size).toBe(mockFile.size);

        const metadata = mediaData.getMetadata();
        expect(metadata.type).toBe('video');
        expect(metadata.codec).toBe('mp4');
        expect(metadata.container).toBe('mp4');
      });

      it('应该提取图像文件的尺寸信息', async () => {
        const imageFile = new File([testImageData], 'test.jpg', { type: 'image/jpeg' });
        const mediaData = await MediaData.fromFile(imageFile);

        const metadata = mediaData.getMetadata();
        expect(metadata.resolution).toEqual({ width: 1920, height: 1080 });
      });
    });

    describe('fromURL', () => {
      it('应该从URL创建MediaData', async () => {
        const mockResponse = {
          ok: true,
          status: 200,
          statusText: 'OK',
          headers: new Map([['content-type', 'video/mp4']]),
          arrayBuffer: vi.fn().mockResolvedValue(testVideoData)
        };

        global.fetch = vi.fn().mockResolvedValue(mockResponse);

        const mediaData = await MediaData.fromURL('https://example.com/video.mp4');

        expect(mediaData).toBeInstanceOf(MediaData);
        expect(mediaData.size).toBe(testVideoData.byteLength);

        const metadata = mediaData.getMetadata();
        expect(metadata.type).toBe('video');
        expect(metadata.codec).toBe('mp4');
      });

      it('应该处理网络错误', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

        await expect(MediaData.fromURL('https://example.com/video.mp4'))
          .rejects.toThrow(StreamError);
      });

      it('应该处理HTTP错误', async () => {
        const mockResponse = {
          ok: false,
          status: 404,
          statusText: 'Not Found'
        };

        global.fetch = vi.fn().mockResolvedValue(mockResponse);

        await expect(MediaData.fromURL('https://example.com/video.mp4'))
          .rejects.toThrow(StreamError);
      });
    });

    describe('createVideo', () => {
      it('应该创建视频数据', () => {
        const videoData = MediaData.createVideo(
          testVideoData,
          'h264',
          { width: 1920, height: 1080 },
          { duration: 60, frameRate: 30 }
        );

        expect(videoData).toBeInstanceOf(MediaData);

        const metadata = videoData.getMetadata();
        expect(metadata.type).toBe('video');
        expect(metadata.codec).toBe('h264');
        expect(metadata.resolution).toEqual({ width: 1920, height: 1080 });
        expect(metadata.duration).toBe(60);
        expect(metadata.frameRate).toBe(30);
      });
    });

    describe('createAudio', () => {
      it('应该创建音频数据', () => {
        const audioData = MediaData.createAudio(
          testAudioData,
          'aac',
          44100,
          2,
          { duration: 180, bitrate: 128000 }
        );

        expect(audioData).toBeInstanceOf(MediaData);

        const metadata = audioData.getMetadata();
        expect(metadata.type).toBe('audio');
        expect(metadata.codec).toBe('aac');
        expect(metadata.sampleRate).toBe(44100);
        expect(metadata.channels).toBe(2);
        expect(metadata.duration).toBe(180);
        expect(metadata.bitrate).toBe(128000);
      });
    });

    describe('createImage', () => {
      it('应该创建图像数据', () => {
        const imageData = MediaData.createImage(
          testImageData,
          'jpeg',
          { width: 1920, height: 1080 }
        );

        expect(imageData).toBeInstanceOf(MediaData);

        const metadata = imageData.getMetadata();
        expect(metadata.type).toBe('image');
        expect(metadata.codec).toBe('jpeg');
        expect(metadata.resolution).toEqual({ width: 1920, height: 1080 });
      });

      it('应该创建不带尺寸的图像数据', () => {
        const imageData = MediaData.createImage(testImageData, 'png');

        const metadata = imageData.getMetadata();
        expect(metadata.type).toBe('image');
        expect(metadata.codec).toBe('png');
        expect(metadata.resolution).toBeUndefined();
      });
    });
  });

  describe('元数据操作', () => {
    let mediaData: MediaData;

    beforeEach(() => {
      mediaData = new MediaData(testVideoData, mockVideoMetadata);
    });

    it('应该获取元数据副本', () => {
      const metadata = mediaData.getMetadata();

      expect(metadata).toEqual(mockVideoMetadata);
      expect(metadata).not.toBe(mockVideoMetadata); // 应该是副本
    });

    it('应该更新元数据', () => {
      const updates = {
        duration: 120,
        bitrate: 2000000,
        custom: { quality: 'high' }
      };

      mediaData.updateMetadata(updates);

      const metadata = mediaData.getMetadata();
      expect(metadata.duration).toBe(120);
      expect(metadata.bitrate).toBe(2000000);
      expect(metadata.custom).toEqual({ quality: 'high' });
      expect(metadata.codec).toBe('h264'); // 原有属性保持不变
    });

    it('应该在更新元数据时更新MIME类型', () => {
      mediaData.updateMetadata({ container: 'webm' });

      expect(mediaData.type).toBe('video/webm');
    });
  });

  describe('媒体分割', () => {
    let mediaData: MediaData;

    beforeEach(() => {
      mediaData = new MediaData(testVideoData, mockVideoMetadata);
    });

    it('应该将媒体分割为片段', async () => {
      const segments = await mediaData.segmentize(10);

      expect(segments).toHaveLength(6); // 60秒 / 10秒 = 6个片段

      segments.forEach((segment, index) => {
        expect(segment.index).toBe(index);
        expect(segment.startTime).toBe(index * 10);
        expect(segment.endTime).toBe(Math.min((index + 1) * 10, 60));
        expect(segment.data).toBeInstanceOf(BinaryData);
        expect(segment.isKeyFrame).toBe(index === 0);
      });
    });

    it('应该处理不整除的分割', async () => {
      const segments = await mediaData.segmentize(25);

      expect(segments).toHaveLength(3); // 60秒 / 25秒 = 3个片段
      expect(segments[0].endTime).toBe(25);
      expect(segments[1].endTime).toBe(50);
      expect(segments[2].endTime).toBe(60); // 最后一个片段到结尾
    });

    it('应该在没有时长信息时抛出错误', async () => {
      const metadataWithoutDuration = { ...mockVideoMetadata };
      delete metadataWithoutDuration.duration;

      const mediaDataWithoutDuration = new MediaData(testVideoData, metadataWithoutDuration);

      await expect(mediaDataWithoutDuration.segmentize())
        .rejects.toThrow(StreamError);
    });

    it('应该根据时间范围获取片段', async () => {
      await mediaData.segmentize(10);
      
      const segments = mediaData.getSegmentsByTimeRange(15, 35);
      
      // 时间范围 15-35 会包含：
      // 片段1: 10-20 (与15-35有重叠)
      // 片段2: 20-30 (完全在15-35内)
      // 片段3: 30-40 (与15-35有重叠)
      expect(segments).toHaveLength(3);
      expect(segments[0].startTime).toBe(10);
      expect(segments[1].startTime).toBe(20);
      expect(segments[2].startTime).toBe(30);
    });
  });

  describe('媒体转换', () => {
    let mediaData: MediaData;

    beforeEach(() => {
      mediaData = new MediaData(testVideoData, mockVideoMetadata);
    });

    it('应该抛出转码未实现错误', async () => {
      await expect(mediaData.transcode('h265'))
        .rejects.toThrow(StreamError);
    });

    it('应该创建缩略图', async () => {
      const thumbnail = await mediaData.createThumbnail({
        width: 320,
        height: 240,
        quality: 0.8,
        format: 'jpeg'
      });

      expect(thumbnail).toBeInstanceOf(MediaData);

      const metadata = thumbnail.getMetadata();
      expect(metadata.type).toBe('image');
      expect(metadata.codec).toBe('jpeg');
      expect(metadata.resolution).toEqual({ width: 320, height: 240 });
    });

    it('应该为非视频/图像媒体抛出缩略图错误', async () => {
      const audioData = new MediaData(testAudioData, mockAudioMetadata);

      await expect(audioData.createThumbnail())
        .rejects.toThrow(StreamError);
    });

    it('应该抛出音频提取未实现错误', () => {
      expect(() => mediaData.extractAudioTrack())
        .toThrow(StreamError);
    });

    it('应该为非视频媒体抛出音频提取错误', () => {
      const audioData = new MediaData(testAudioData, mockAudioMetadata);

      expect(() => audioData.extractAudioTrack())
        .toThrow(StreamError);
    });
  });

  describe('媒体合并', () => {
    it('应该合并相同类型的媒体', async () => {
      const media1 = MediaData.createVideo(testVideoData, 'h264', { width: 1920, height: 1080 }, { duration: 30 });
      const media2 = MediaData.createVideo(testVideoData, 'h264', { width: 1920, height: 1080 }, { duration: 40 });

      const merged = await MediaData.merge([media1, media2]);

      expect(merged).toBeInstanceOf(MediaData);
      expect(merged.size).toBe(media1.size + media2.size);

      const metadata = merged.getMetadata();
      expect(metadata.duration).toBe(70); // 30 + 40
      expect(metadata.type).toBe('video');
    });

    it('应该使用指定的输出编码', async () => {
      const media1 = MediaData.createVideo(testVideoData, 'h264', { width: 1920, height: 1080 });
      const media2 = MediaData.createVideo(testVideoData, 'h264', { width: 1920, height: 1080 });

      const merged = await MediaData.merge([media1, media2], {
        outputCodec: 'h265',
        outputContainer: 'webm'
      });

      const metadata = merged.getMetadata();
      expect(metadata.codec).toBe('h265');
      expect(metadata.container).toBe('webm');
    });

    it('应该在空列表时抛出错误', async () => {
      await expect(MediaData.merge([]))
        .rejects.toThrow(StreamError);
    });

    it('应该在媒体类型不一致时抛出错误', async () => {
      const videoData = MediaData.createVideo(testVideoData, 'h264', { width: 1920, height: 1080 });
      const audioData = MediaData.createAudio(testAudioData, 'aac', 44100, 2);

      await expect(MediaData.merge([videoData, audioData]))
        .rejects.toThrow(StreamError);
    });
  });

  describe('流式处理', () => {
    let mediaData: MediaData;

    beforeEach(() => {
      mediaData = new MediaData(testVideoData, mockVideoMetadata, {
        bufferSize: 1024 // 小缓冲区用于测试
      });
    });

    it('应该创建可读流', async () => {
      const stream = mediaData.createStream();

      expect(stream).toBeInstanceOf(ReadableStream);

      const reader = stream.getReader();
      const chunks: Uint8Array[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
        }
      } finally {
        reader.releaseLock();
      }

      expect(chunks.length).toBeGreaterThan(1);

      // 验证总大小
      const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      expect(totalSize).toBe(mediaData.size);
    });

    it('应该使用配置的缓冲区大小', async () => {
      const stream = mediaData.createStream();
      const reader = stream.getReader();

      const { value } = await reader.read();
      expect(value).toBeDefined();
      expect(value!.length).toBeLessThanOrEqual(1024);

      reader.releaseLock();
    });
  });

  describe('属性访问器', () => {
    let mediaData: MediaData;

    beforeEach(() => {
      mediaData = new MediaData(testVideoData, mockVideoMetadata);
    });

    it('应该正确返回isStreamable属性', () => {
      const videoData = new MediaData(testVideoData, mockVideoMetadata);
      const audioData = new MediaData(testAudioData, mockAudioMetadata);
      const imageData = new MediaData(testImageData, mockImageMetadata);

      expect(videoData.isStreamable).toBe(true);
      expect(audioData.isStreamable).toBe(true);
      expect(imageData.isStreamable).toBe(false);
    });

    it('应该返回时长', () => {
      expect(mediaData.duration).toBe(60);
    });

    it('应该返回比特率', () => {
      expect(mediaData.bitrate).toBe(1000000);
    });

    it('应该返回分辨率', () => {
      expect(mediaData.resolution).toEqual({ width: 1920, height: 1080 });
    });
  });

  describe('配置管理', () => {
    let mediaData: MediaData;

    beforeEach(() => {
      mediaData = new MediaData(testVideoData, mockVideoMetadata);
    });

    it('应该获取流式配置副本', () => {
      const config = mediaData.getStreamingConfig();

      expect(config).toEqual({
        bufferSize: 1024 * 1024,
        maxBufferTime: 30,
        preloadStrategy: 'metadata',
        adaptiveQuality: false,
        retryCount: 3
      });
    });

    it('应该更新流式配置', () => {
      const updates = {
        bufferSize: 2048 * 1024,
        adaptiveQuality: true
      };

      mediaData.updateStreamingConfig(updates);

      const config = mediaData.getStreamingConfig();
      expect(config.bufferSize).toBe(2048 * 1024);
      expect(config.adaptiveQuality).toBe(true);
      expect(config.maxBufferTime).toBe(30); // 原有值保持不变
    });
  });

  describe('序列化', () => {
    let mediaData: MediaData;

    beforeEach(() => {
      mediaData = new MediaData(testVideoData, mockVideoMetadata);
    });

    it('应该转换为JSON', () => {
      const json = mediaData.toJSON();

      expect(json).toHaveProperty('metadata');
      expect(json).toHaveProperty('streamingConfig');
      expect(json).toHaveProperty('segmentCount');
      expect((json as any).metadata).toEqual(mockVideoMetadata);
    });

    it('应该转换为字符串', () => {
      const str = mediaData.toString();

      expect(str).toContain('MediaData');
      expect(str).toContain(mediaData.size.toString());
      expect(str).toContain('video');
      expect(str).toContain('h264');
      expect(str).toContain('60s');
    });

    it('应该处理没有编码和时长的情况', () => {
      const simpleMetadata: MediaMetadata = { type: 'image' };
      const simpleMedia = new MediaData(testImageData, simpleMetadata);

      const str = simpleMedia.toString();
      expect(str).toContain('MediaData');
      expect(str).toContain('image');
      expect(str).not.toContain('undefined');
    });
  });

  describe('错误处理', () => {
    it('应该处理Canvas不支持的情况', async () => {
      // Mock Canvas context 返回 null
      const mockCanvas = {
        getContext: vi.fn(() => null),
        width: 0,
        height: 0
      };

      global.document = {
        createElement: vi.fn(() => mockCanvas)
      } as any;

      const mediaData = new MediaData(testVideoData, mockVideoMetadata);

      await expect(mediaData.createThumbnail())
        .rejects.toThrow(StreamError);
    });

    it('应该处理图像加载错误', async () => {
      global.Image = class MockImage {
        onerror: (() => void) | null = null;

        set src(value: string) {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror();
            }
          }, 10);
        }
      } as any;

      const imageFile = new File([testImageData], 'test.jpg', { type: 'image/jpeg' });

      // 应该忽略尺寸获取错误，但仍能创建MediaData
      const mediaData = await MediaData.fromFile(imageFile);
      expect(mediaData).toBeInstanceOf(MediaData);
    });
  });

  describe('边界情况', () => {
    it('应该处理空数据', () => {
      const emptyData = new ArrayBuffer(0);
      const mediaData = new MediaData(emptyData, mockVideoMetadata);

      expect(mediaData.size).toBe(0);
      expect(mediaData.getMetadata()).toEqual(mockVideoMetadata);
    });

    it('应该处理最小分割时长', async () => {
      const mediaData = new MediaData(testVideoData, { ...mockVideoMetadata, duration: 1 });

      const segments = await mediaData.segmentize(0.5);
      expect(segments).toHaveLength(2);
    });

    it('应该处理未知内容类型', () => {
      const mockResponse = {
        ok: true,
        status: 200,
        headers: new Map([['content-type', 'application/unknown']]),
        arrayBuffer: vi.fn().mockResolvedValue(testVideoData)
      };

      global.fetch = vi.fn().mockResolvedValue(mockResponse);

      return expect(MediaData.fromURL('https://example.com/unknown'))
        .resolves.toBeInstanceOf(MediaData);
    });
  });

  describe('性能测试', () => {
    it('应该高效处理大型媒体文件', () => {
      const largeData = TestDataGenerator.generateArrayBuffer(10 * 1024 * 1024); // 10MB

      const start = performance.now();
      const mediaData = new MediaData(largeData, mockVideoMetadata);
      const end = performance.now();

      expect(end - start).toBeLessThan(100); // 应该在100ms内完成
      expect(mediaData.size).toBe(largeData.byteLength);
    });

    it('应该高效创建流', () => {
      const mediaData = new MediaData(testVideoData, mockVideoMetadata);

      const start = performance.now();
      const stream = mediaData.createStream();
      const end = performance.now();

      expect(end - start).toBeLessThan(10); // 应该在10ms内完成
      expect(stream).toBeInstanceOf(ReadableStream);
    });
  });
});