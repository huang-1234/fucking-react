/**
 * 错误处理工具和错误类定义
 */

/**
 * 基础流错误类
 */
export class StreamError extends Error {
  public readonly code: string;
  public readonly cause?: Error;
  public readonly timestamp: number;

  constructor(
    message: string,
    code: string,
    cause?: Error
  ) {
    super(message);
    this.name = 'StreamError';
    this.code = code;
    this.cause = cause;
    this.timestamp = Date.now();

    // 确保错误堆栈正确
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, StreamError);
    }
  }

  /**
   * 转换为JSON格式
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp,
      stack: this.stack,
      cause: this.cause?.message
    };
  }
}

/**
 * 兼容性错误类
 */
export class CompatibilityError extends StreamError {
  public readonly feature: string;
  public readonly browserInfo?: string;

  constructor(
    feature: string,
    browserInfo?: string,
    cause?: Error
  ) {
    const message = `Feature '${feature}' is not supported in this environment${
      browserInfo ? ` (${browserInfo})` : ''
    }`;
    
    super(message, 'COMPATIBILITY_ERROR', cause);
    this.name = 'CompatibilityError';
    this.feature = feature;
    this.browserInfo = browserInfo;
  }
}

/**
 * 传输错误类
 */
export class TransferError extends StreamError {
  public readonly url: string;
  public readonly statusCode?: number;
  public readonly method?: string;

  constructor(
    message: string,
    url: string,
    statusCode?: number,
    method?: string,
    cause?: Error
  ) {
    super(message, 'TRANSFER_ERROR', cause);
    this.name = 'TransferError';
    this.url = url;
    this.statusCode = statusCode;
    this.method = method;
  }
}

/**
 * 数据格式错误类
 */
export class DataFormatError extends StreamError {
  public readonly expectedFormat: string;
  public readonly actualFormat: string;

  constructor(
    expectedFormat: string,
    actualFormat: string,
    cause?: Error
  ) {
    const message = `Expected data format '${expectedFormat}', but got '${actualFormat}'`;
    super(message, 'DATA_FORMAT_ERROR', cause);
    this.name = 'DataFormatError';
    this.expectedFormat = expectedFormat;
    this.actualFormat = actualFormat;
  }
}

/**
 * 内存错误类
 */
export class MemoryError extends StreamError {
  public readonly memoryUsage?: number;
  public readonly memoryLimit?: number;

  constructor(
    message: string,
    memoryUsage?: number,
    memoryLimit?: number,
    cause?: Error
  ) {
    super(message, 'MEMORY_ERROR', cause);
    this.name = 'MemoryError';
    this.memoryUsage = memoryUsage;
    this.memoryLimit = memoryLimit;
  }
}

/**
 * 错误上下文信息
 */
export interface ErrorContext {
  /** 操作类型 */
  operation: string;
  /** 相关参数 */
  params?: Record<string, any>;
  /** 用户代理 */
  userAgent?: string;
  /** 时间戳 */
  timestamp?: number;
  /** 额外信息 */
  metadata?: Record<string, any>;
}

/**
 * 错误处理结果
 */
export interface ErrorResult {
  /** 是否可以恢复 */
  canRecover: boolean;
  /** 降级策略 */
  fallbackStrategy?: string;
  /** 用户友好的错误消息 */
  userMessage: string;
  /** 建议的操作 */
  suggestedAction?: string;
  /** 重试配置 */
  retryConfig?: {
    maxRetries: number;
    delay: number;
    backoff: number;
  };
}

/**
 * 错误处理器类
 */
export class ErrorHandler {
  private static readonly ERROR_MESSAGES = {
    COMPATIBILITY_ERROR: '浏览器兼容性问题',
    TRANSFER_ERROR: '数据传输失败',
    DATA_FORMAT_ERROR: '数据格式错误',
    MEMORY_ERROR: '内存不足',
    NETWORK_ERROR: '网络连接错误',
    TIMEOUT_ERROR: '操作超时',
    ABORT_ERROR: '操作被中止'
  };

  /**
   * 处理错误
   */
  static handle(error: Error, context: ErrorContext): ErrorResult {
    if (error instanceof CompatibilityError) {
      return this.handleCompatibilityError(error, context);
    }
    
    if (error instanceof TransferError) {
      return this.handleTransferError(error, context);
    }
    
    if (error instanceof DataFormatError) {
      return this.handleDataFormatError(error, context);
    }
    
    if (error instanceof MemoryError) {
      return this.handleMemoryError(error, context);
    }
    
    return this.handleGenericError(error, context);
  }

  /**
   * 处理兼容性错误
   */
  private static handleCompatibilityError(
    error: CompatibilityError, 
    context: ErrorContext
  ): ErrorResult {
    return {
      canRecover: true,
      fallbackStrategy: 'polyfill',
      userMessage: `您的浏览器不支持 ${error.feature} 功能，将使用兼容性方案`,
      suggestedAction: '建议升级到最新版本的浏览器以获得更好的性能'
    };
  }

  /**
   * 处理传输错误
   */
  private static handleTransferError(
    error: TransferError, 
    context: ErrorContext
  ): ErrorResult {
    const isNetworkError = error.statusCode === undefined;
    const isServerError = error.statusCode && error.statusCode >= 500;
    
    return {
      canRecover: Boolean(isNetworkError || isServerError),
      userMessage: isNetworkError 
        ? '网络连接失败，请检查网络连接'
        : `服务器响应错误 (${error.statusCode})`,
      suggestedAction: isNetworkError 
        ? '请检查网络连接后重试'
        : '请稍后重试或联系技术支持',
      retryConfig: {
        maxRetries: isServerError ? 3 : 1,
        delay: 1000,
        backoff: 2
      }
    };
  }

  /**
   * 处理数据格式错误
   */
  private static handleDataFormatError(
    error: DataFormatError, 
    context: ErrorContext
  ): ErrorResult {
    return {
      canRecover: false,
      userMessage: `数据格式不正确，期望 ${error.expectedFormat}，实际 ${error.actualFormat}`,
      suggestedAction: '请检查输入数据的格式是否正确'
    };
  }

  /**
   * 处理内存错误
   */
  private static handleMemoryError(
    error: MemoryError, 
    context: ErrorContext
  ): ErrorResult {
    return {
      canRecover: true,
      fallbackStrategy: 'chunk_processing',
      userMessage: '内存不足，将使用分块处理模式',
      suggestedAction: '建议关闭其他应用程序释放内存，或处理较小的文件'
    };
  }

  /**
   * 处理通用错误
   */
  private static handleGenericError(
    error: Error, 
    context: ErrorContext
  ): ErrorResult {
    return {
      canRecover: false,
      userMessage: '操作失败，请重试',
      suggestedAction: '如果问题持续存在，请联系技术支持'
    };
  }

  /**
   * 获取用户友好的错误消息
   */
  static getUserFriendlyMessage(error: Error): string {
    if (error instanceof StreamError) {
      return this.ERROR_MESSAGES[error.code as keyof typeof this.ERROR_MESSAGES] || error.message;
    }
    return error.message;
  }

  /**
   * 记录错误
   */
  static logError(error: Error, context: ErrorContext): void {
    const logData = {
      error: error instanceof StreamError ? error.toJSON() : {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: Date.now()
    };

    if (typeof console !== 'undefined') {
      console.error('[StreamError]', logData);
    }
  }
}