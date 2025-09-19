/**
 * 媒体数据处理核心类
 * 支持视频流、音频流、图像数据等多媒体二进制数据处理
 */

import { BinaryData } from './BinaryData';
import { StreamError, DataFormatError } from '../utils/errors';
import { getDefaultCompatibilityManager } from './CompatibilityManager';

/**
 * 媒体数据类型
 */
export type MediaType = 'video' | 'audio' | 'image' | 'subtitle' | 'metadata';

/**
 * 视频编码格式
 */
export type VideoCodec = 
  | 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1' 
  | 'mpeg4' | 'mpeg2' | 'webm' | 'mov' | 'avi';

/**
 * 音频编码格式
 */
export type AudioCodec = 
  | 'aac' | 'mp3' | 'opus' | 'vorbis' | 'flac' 
  | 'wav' | 'pcm' | 'ac3' | 'dts';

/**
 * 图像格式
 */
export type ImageFormat = 
  | 'jpeg' | 'png' | 'webp' | 'gif' | 'bmp' 
  | 'tiff' | 'svg' | 'ico' | 'avif' | 'heic';

/**
 * 媒体容器格式
 */
export type ContainerFormat = 
  | 'mp4' | 'webm' | 'mkv' | 'avi' | 'mov' 
  | 'flv' | 'wmv' | 'ts' | 'm3u8' | 'dash';

/**
 * 媒体元数据接口
 */
export interface MediaMetadata {
  /** 媒体类型 */
  type: MediaType;
  /** 编码格式 */
  codec?: VideoCodec | AudioCodec | ImageFormat;
  /** 容器格式 */
  container?: ContainerFormat;
  /** 时长（秒） */
  duration?: number;
  /** 比特率 */
  bitrate?: number;
  /** 帧率（视频） */
  frameRate?: number;
  /** 分辨率（视频/图像） */
  resolution?: { width: number; height: number };
  /** 采样率（音频） */
  sampleRate?: number;
  /** 声道数（音频） */
  channels?: number;
  /** 创建时间 */
  createdAt?: Date;
  /** 自定义属性 */
  custom?: Record<string, any>;
}

/**
 * 媒体片段接口
 */
export interface MediaSegment {
  /** 片段数据 */
  data: BinaryData;
  /** 开始时间（秒） */
  startTime: number;
  /** 结束时间（秒） */
  endTime: number;
  /** 片段索引 */
  index: number;
  /** 是否为关键帧 */
  isKeyFrame?: boolean;
  /** 片段元数据 */
  metadata?: Partial<MediaMetadata>;
}

/**
 * 流式媒体配置
 */
export interface StreamingConfig {
  /** 缓冲区大小（字节） */
  bufferSize?: number;
  /** 最大缓冲时间（秒） */
  maxBufferTime?: number;
  /** 预加载策略 */
  preloadStrategy?: 'none' | 'metadata' | 'auto';
  /** 质量自适应 */
  adaptiveQuality?: boolean;
  /** 错误重试次数 */
  retryCount?: number;
}

/**
 * 媒体数据处理类
 */
export class MediaData extends BinaryData {
  private metadata: MediaMetadata;
  private segments: MediaSegment[] = [];
  private streamingConfig: StreamingConfig;

  constructor(
    data: ArrayBufferLike,
    metadata: MediaMetadata,
    config: StreamingConfig = {}
  ) {
    super(data, { mimeType: MediaData.getMimeType(metadata) });
    this.metadata = metadata;
    this.streamingConfig = {
      bufferSize: 1024 * 1024, // 1MB
      maxBufferTime: 30, // 30秒
      preloadStrategy: 'metadata',
      adaptiveQuality: false,
      retryCount: 3,
      ...config
    };
  }

  /**
   * 从文件创建媒体数据
   */
  static async fromFile(file: File): Promise<MediaData> {
    const arrayBuffer = await file.arrayBuffer();
    const metadata = await MediaData.extractMetadata(file);
    
    return new MediaData(arrayBuffer, metadata);
  }

  /**
   * 从URL创建媒体数据
   */
  static async fromURL(url: string, config?: StreamingConfig): Promise<MediaData> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const contentType = response.headers.get('content-type') || '';
      const metadata = MediaData.parseContentType(contentType);

      return new MediaData(arrayBuffer, metadata, config);
    } catch (error) {
      throw new StreamError(
        `Failed to load media from URL: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'MEDIA_LOAD_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * 创建视频数据
   */
  static createVideo(
    data: ArrayBufferLike,
    codec: VideoCodec,
    resolution: { width: number; height: number },
    options: Partial<MediaMetadata> = {}
  ): MediaData {
    const metadata: MediaMetadata = {
      type: 'video',
      codec,
      resolution,
      ...options
    };

    return new MediaData(data, metadata);
  }

  /**
   * 创建音频数据
   */
  static createAudio(
    data: ArrayBufferLike,
    codec: AudioCodec,
    sampleRate: number,
    channels: number,
    options: Partial<MediaMetadata> = {}
  ): MediaData {
    const metadata: MediaMetadata = {
      type: 'audio',
      codec,
      sampleRate,
      channels,
      ...options
    };

    return new MediaData(data, metadata);
  }

  /**
   * 创建图像数据
   */
  static createImage(
    data: ArrayBufferLike,
    format: ImageFormat,
    resolution?: { width: number; height: number },
    options: Partial<MediaMetadata> = {}
  ): MediaData {
    const metadata: MediaMetadata = {
      type: 'image',
      codec: format as any,
      resolution,
      ...options
    };

    return new MediaData(data, metadata);
  }

  /**
   * 获取媒体元数据
   */
  getMetadata(): MediaMetadata {
    return { ...this.metadata };
  }

  /**
   * 更新媒体元数据
   */
  updateMetadata(updates: Partial<MediaMetadata>): void {
    this.metadata = { ...this.metadata, ...updates };
    
    // 更新MIME类型
    const newMimeType = MediaData.getMimeType(this.metadata);
    this.setType(newMimeType);
  }

  /**
   * 分割为片段
   */
  async segmentize(segmentDuration: number = 10): Promise<MediaSegment[]> {
    if (!this.metadata.duration) {
      throw new StreamError('Duration metadata required for segmentation', 'MISSING_DURATION');
    }

    const segments: MediaSegment[] = [];
    const totalDuration = this.metadata.duration;
    const segmentCount = Math.ceil(totalDuration / segmentDuration);
    const bytesPerSecond = this.size / totalDuration;

    for (let i = 0; i < segmentCount; i++) {
      const startTime = i * segmentDuration;
      const endTime = Math.min((i + 1) * segmentDuration, totalDuration);
      const actualDuration = endTime - startTime;
      
      const startByte = Math.floor(startTime * bytesPerSecond);
      const endByte = Math.floor(endTime * bytesPerSecond);
      
      const segmentData = this.slice(startByte, endByte);
      
      segments.push({
        data: segmentData,
        startTime,
        endTime,
        index: i,
        isKeyFrame: i === 0, // 简化：第一个片段为关键帧
        metadata: {
          ...this.metadata,
          duration: actualDuration
        }
      });
    }

    this.segments = segments;
    return segments;
  }

  /**
   * 获取指定时间范围的片段
   */
  getSegmentsByTimeRange(startTime: number, endTime: number): MediaSegment[] {
    return this.segments.filter(segment => 
      segment.startTime < endTime && segment.endTime > startTime
    );
  }

  /**
   * 转换为不同格式
   */
  async transcode(
    targetCodec: VideoCodec | AudioCodec,
    options: {
      quality?: number;
      bitrate?: number;
      resolution?: { width: number; height: number };
      sampleRate?: number;
    } = {}
  ): Promise<MediaData> {
    // 注意：这里是简化实现，实际转码需要使用 WebCodecs API 或服务端处理
    throw new StreamError(
      'Transcoding requires WebCodecs API or server-side processing',
      'TRANSCODING_NOT_IMPLEMENTED'
    );
  }

  /**
   * 创建缩略图（仅视频/图像）
   */
  async createThumbnail(
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: ImageFormat;
      timeOffset?: number; // 视频的时间偏移
    } = {}
  ): Promise<MediaData> {
    if (this.metadata.type !== 'video' && this.metadata.type !== 'image') {
      throw new StreamError('Thumbnails can only be created for video or image data', 'INVALID_MEDIA_TYPE');
    }

    // 使用 Canvas API 创建缩略图
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new StreamError('Canvas 2D context not available', 'CANVAS_NOT_SUPPORTED');
    }

    const { width = 320, height = 240, quality = 0.8, format = 'jpeg' } = options;
    
    canvas.width = width;
    canvas.height = height;

    // 这里需要实际的图像解码逻辑
    // 简化实现：返回空的缩略图数据
    const thumbnailBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, `image/${format}`, quality);
    });

    const thumbnailBuffer = await thumbnailBlob.arrayBuffer();
    
    return MediaData.createImage(thumbnailBuffer, format, { width, height });
  }

  /**
   * 提取音频轨道（仅视频）
   */
  extractAudioTrack(): MediaData {
    if (this.metadata.type !== 'video') {
      throw new StreamError('Audio extraction only available for video data', 'INVALID_MEDIA_TYPE');
    }

    // 简化实现：需要实际的音频提取逻辑
    throw new StreamError(
      'Audio extraction requires media processing library',
      'AUDIO_EXTRACTION_NOT_IMPLEMENTED'
    );
  }

  /**
   * 合并多个媒体数据
   */
  static async merge(mediaList: MediaData[], options: {
    outputCodec?: VideoCodec | AudioCodec;
    outputContainer?: ContainerFormat;
  } = {}): Promise<MediaData> {
    if (mediaList.length === 0) {
      throw new StreamError('Cannot merge empty media list', 'EMPTY_MEDIA_LIST');
    }

    // 检查媒体类型一致性
    const firstType = mediaList[0].metadata.type;
    if (!mediaList.every(media => media.metadata.type === firstType)) {
      throw new StreamError('All media items must be of the same type', 'INCONSISTENT_MEDIA_TYPES');
    }

    // 简单连接实现
    const mergedData = mediaList[0].concat(...mediaList.slice(1));
    
    // 计算合并后的元数据
    const totalDuration = mediaList.reduce((sum, media) => 
      sum + (media.metadata.duration || 0), 0
    );

    const mergedMetadata: MediaMetadata = {
      ...mediaList[0].metadata,
      duration: totalDuration,
      codec: options.outputCodec || mediaList[0].metadata.codec,
      container: options.outputContainer || mediaList[0].metadata.container
    };

    return new MediaData(mergedData.toArrayBuffer(), mergedMetadata);
  }

  /**
   * 转换为流式数据
   */
  createStream(): ReadableStream<Uint8Array> {
    const data = this.toUint8Array();
    const chunkSize = this.streamingConfig.bufferSize || 1024 * 1024;
    let offset = 0;

    return new ReadableStream({
      start(controller) {
        // 流开始
      },
      pull(controller) {
        if (offset >= data.length) {
          controller.close();
          return;
        }

        const chunk = data.slice(offset, offset + chunkSize);
        controller.enqueue(chunk);
        offset += chunkSize;
      },
      cancel() {
        // 流取消
      }
    });
  }

  /**
   * 从内容类型解析元数据
   */
  private static parseContentType(contentType: string): MediaMetadata {
    const [mainType, subType] = contentType.split('/');
    
    switch (mainType) {
      case 'video':
        return {
          type: 'video',
          codec: subType as VideoCodec,
          container: subType as ContainerFormat
        };
      case 'audio':
        return {
          type: 'audio',
          codec: subType as AudioCodec
        };
      case 'image':
        return {
          type: 'image',
          codec: subType as any
        };
      default:
        return {
          type: 'metadata'
        };
    }
  }

  /**
   * 提取文件元数据
   */
  private static async extractMetadata(file: File): Promise<MediaMetadata> {
    const metadata = MediaData.parseContentType(file.type);
    
    // 添加文件信息
    metadata.createdAt = new Date(file.lastModified);
    
    // 如果是图像，尝试获取尺寸
    if (metadata.type === 'image') {
      try {
        const resolution = await MediaData.getImageDimensions(file);
        metadata.resolution = resolution;
      } catch (error) {
        // 忽略尺寸获取错误
      }
    }

    return metadata;
  }

  /**
   * 获取图像尺寸
   */
  private static async getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * 根据元数据获取MIME类型
   */
  private static getMimeType(metadata: MediaMetadata): string {
    const { type, codec, container } = metadata;
    
    switch (type) {
      case 'video':
        if (container) {
          return `video/${container}`;
        }
        return codec ? `video/${codec}` : 'video/mp4';
      case 'audio':
        return codec ? `audio/${codec}` : 'audio/mp3';
      case 'image':
        return codec ? `image/${codec}` : 'image/jpeg';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * 获取流式配置
   */
  getStreamingConfig(): StreamingConfig {
    return { ...this.streamingConfig };
  }

  /**
   * 更新流式配置
   */
  updateStreamingConfig(config: Partial<StreamingConfig>): void {
    this.streamingConfig = { ...this.streamingConfig, ...config };
  }

  /**
   * 检查是否为流式媒体
   */
  get isStreamable(): boolean {
    return this.metadata.type === 'video' || this.metadata.type === 'audio';
  }

  /**
   * 获取媒体时长
   */
  get duration(): number | undefined {
    return this.metadata.duration;
  }

  /**
   * 获取比特率
   */
  get bitrate(): number | undefined {
    return this.metadata.bitrate;
  }

  /**
   * 获取分辨率
   */
  get resolution(): { width: number; height: number } | undefined {
    return this.metadata.resolution;
  }

  /**
   * 转换为JSON表示
   */
  toJSON(): object {
    return {
      ...super.toJSON(),
      metadata: this.metadata,
      streamingConfig: this.streamingConfig,
      segmentCount: this.segments.length
    };
  }

  /**
   * 字符串表示
   */
  toString(): string {
    const { type, codec, duration } = this.metadata;
    return `MediaData(${this.size} bytes, ${type}${codec ? `/${codec}` : ''}${duration ? `, ${duration}s` : ''})`;
  }
}