/**
 * 工具函数主入口
 */

// 特性检测相关
export {
  detectFeatures,
  detectFeature,
  getBrowserInfo,
  getEnvironmentInfo,
  checkMinVersion,
  generateCompatibilityReport,
  featureCache,
  featureDetectors
} from './detection';

// Polyfill管理相关
export {
  PolyfillLoader,
  createPolyfillLoader,
  conditionalLoadPolyfill,
  getGlobalPolyfillLoader,
  setGlobalPolyfillLoader,
  BUILTIN_POLYFILLS
} from './polyfills';

// 错误处理相关
export {
  StreamError,
  CompatibilityError,
  TransferError,
  DataFormatError,
  MemoryError,
  ErrorHandler
} from './errors';

// 便捷函数
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function calculateSpeed(bytes: number, timeMs: number): number {
  if (timeMs <= 0) return 0;
  return (bytes * 1000) / timeMs; // bytes per second
}

export function estimateRemainingTime(loaded: number, total: number, speed: number): number {
  if (speed <= 0 || loaded >= total) return 0;
  const remaining = total - loaded;
  return (remaining / speed) * 1000; // milliseconds
}

export function createProgressTracker() {
  const startTime = Date.now();
  let lastTime = startTime;
  let lastLoaded = 0;

  return function updateProgress(loaded: number, total: number) {
    const now = Date.now();
    const elapsed = now - startTime;
    const deltaTime = now - lastTime;
    const deltaLoaded = loaded - lastLoaded;

    const percentage = total > 0 ? Math.round((loaded / total) * 100) : 0;
    const speed = deltaTime > 0 ? calculateSpeed(deltaLoaded, deltaTime) : 0;
    const remainingTime = estimateRemainingTime(loaded, total, speed);

    lastTime = now;
    lastLoaded = loaded;

    return {
      loaded,
      total,
      percentage,
      speed,
      remainingTime,
      elapsed
    };
  };
}

export function isArrayBufferView(value: any): value is ArrayBufferView {
  return value && typeof value === 'object' && 'buffer' in value && value.buffer instanceof ArrayBuffer;
}

export function isTypedArray(value: any): value is TypedArray {
  return value instanceof Uint8Array ||
         value instanceof Uint16Array ||
         value instanceof Uint32Array ||
         value instanceof Int8Array ||
         value instanceof Int16Array ||
         value instanceof Int32Array ||
         value instanceof Float32Array ||
         value instanceof Float64Array;
}

export function getTypedArrayConstructor(value: TypedArray): TypedArrayConstructor {
  if (value instanceof Uint8Array) return Uint8Array;
  if (value instanceof Uint16Array) return Uint16Array;
  if (value instanceof Uint32Array) return Uint32Array;
  if (value instanceof Int8Array) return Int8Array;
  if (value instanceof Int16Array) return Int16Array;
  if (value instanceof Int32Array) return Int32Array;
  if (value instanceof Float32Array) return Float32Array;
  if (value instanceof Float64Array) return Float64Array;
  throw new Error('Unknown typed array type');
}

export function concatArrayBuffers(...buffers: ArrayBufferLike[]): ArrayBufferLike {
  const totalLength = buffers.reduce((sum, buffer) => sum + buffer.byteLength, 0);
  const result = new ArrayBuffer(totalLength);
  const resultView = new Uint8Array(result);

  let offset = 0;
  for (const buffer of buffers) {
    resultView.set(new Uint8Array(buffer), offset);
    offset += buffer.byteLength;
  }

  return result;
}

export function sliceArrayBuffer(buffer: ArrayBufferLike, start: number, end?: number): ArrayBufferLike {
  const actualEnd = end !== undefined ? end : buffer.byteLength;
  return buffer.slice(start, actualEnd);
}

export function arrayBufferToBase64(buffer: ArrayBufferLike): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBufferLike {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export function stringToArrayBuffer(str: string, encoding: string = 'utf-8'): ArrayBufferLike {
  if (typeof TextEncoder !== 'undefined') {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
  }

  // 降级方案
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xFF;
  }
  return bytes.buffer;
}

export function arrayBufferToString(buffer: ArrayBufferLike, encoding: string = 'utf-8'): string {
  if (typeof TextDecoder !== 'undefined') {
    const decoder = new TextDecoder(encoding);
    return decoder.decode(buffer as AllowSharedBufferSource);
  }

  // 降级方案
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

// 类型定义
type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | Int8Array
  | Int16Array
  | Int32Array
  | Float32Array
  | Float64Array;

type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;