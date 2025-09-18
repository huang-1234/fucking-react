/**
 * Stream模块基础使用示例
 */

// 注意：这些示例将在核心类实现后可以正常运行
// 目前仅作为API设计参考和文档示例

import {
  BinaryData,
  DataTransfer,
  StreamOperations,
  initStreamModule
} from '../index';

// 初始化模块示例
async function initExample() {
  await initStreamModule({
    debug: true,
    transfer: {
      chunkSize: 1024 * 1024, // 1MB
      retryCount: 3
    }
  });
}

// 二进制数据处理示例
async function binaryDataExample() {
  // 从不同源创建二进制数据
  const fromString = BinaryData.from('Hello, World!');
  const fromArrayBuffer = BinaryData.from(new ArrayBuffer(1024));
  const fromBlob = BinaryData.from(new Blob(['test data']));

  // 数据转换
  const arrayBuffer = fromString.toArrayBuffer();
  const blob = fromString.toBlob('text/plain');
  const text = await fromString.toText();
  const base64 = fromString.encodeBase64();

  // 数据操作
  const sliced = fromString.slice(0, 5);
  const concatenated = fromString.concat(BinaryData.from(' More data'));

  console.log('Binary data operations completed');
}

// 大文件上传示例
async function fileUploadExample(file: File) {
  const transfer = new DataTransfer({
    chunkSize: 1024 * 1024, // 1MB chunks
    retryCount: 3
  });

  // 断点续传上传
  const upload = transfer.resumableTransfer('/api/upload', {
    checkPoint: true,
    onProgress: (progress) => {
      console.log(`Upload progress: ${progress.percentage}%`);
      console.log(`Speed: ${progress.speed} bytes/s`);
      console.log(`Remaining: ${progress.remainingTime}ms`);
    },
    onInterrupt: () => {
      console.log('Upload interrupted, will resume later');
    }
  });

  try {
    const result = await upload.upload(BinaryData.from(file));
    console.log('Upload completed:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}

// 流式下载示例
async function streamDownloadExample(url: string) {
  const transfer = new DataTransfer();

  // 创建下载流
  const downloadStream = transfer.streamTransfer(url, {
    chunkSize: 512 * 1024, // 512KB chunks
    onProgress: (progress) => {
      console.log(`Download progress: ${progress.percentage}%`);
    }
  });

  // 处理下载的数据流
  const processedStream = downloadStream.pipeThrough(
    StreamOperations.createTransformStream({
      transform: (chunk, controller) => {
        // 可以在这里处理每个数据块
        console.log(`Processing chunk of size: ${chunk.length}`);
        controller.enqueue(chunk);
      }
    })
  );

  // 转换为二进制数据
  const result = await StreamOperations.streamToBinary(processedStream);
  console.log('Download completed, size:', result.size);

  return result;
}

// 压缩传输示例
async function compressedTransferExample(data: BinaryData) {
  const transfer = new DataTransfer();

  try {
    // 使用gzip压缩传输
    const result = await transfer.compressedTransfer('/api/upload-compressed', {
      compressAlgorithm: 'gzip',
      level: 6,
      onProgress: (progress) => {
        console.log(`Compressed upload: ${progress.percentage}%`);
      }
    });

    console.log('Compressed transfer completed:', result);
  } catch (error) {
    console.error('Compressed transfer failed:', error);
  }
}

// 流处理管道示例
async function streamPipelineExample(inputData: BinaryData) {
  // 创建输入流
  const inputStream = StreamOperations.binaryToStream(inputData, 1024);

  // 创建处理管道
  const processedStream = inputStream
    .pipeThrough(
      // 第一个转换：数据验证
      StreamOperations.createTransformStream({
        transform: (chunk, controller) => {
          if (chunk.length > 0) {
            controller.enqueue(chunk);
          }
        }
      })
    )
    .pipeThrough(
      // 第二个转换：数据处理
      StreamOperations.createTransformStream({
        transform: (chunk, controller) => {
          // 简单的数据处理示例
          const processed = new Uint8Array(chunk.length);
          for (let i = 0; i < chunk.length; i++) {
            processed[i] = chunk[i] ^ 0xFF; // 简单的位运算
          }
          controller.enqueue(processed);
        }
      })
    );

  // 获取处理结果
  const result = await StreamOperations.streamToBinary(processedStream);
  console.log('Stream pipeline completed, processed size:', result.size);

  return result;
}

// 错误处理示例
async function errorHandlingExample() {
  try {
    const transfer = new DataTransfer({
      retryCount: 3,
      retryDelay: 1000
    });

    await transfer.streamTransfer('/api/unreliable-endpoint', {
      chunkSize: 1024 * 1024
    });
  } catch (error) {
    if (error instanceof TransferError) {
      console.error('Transfer failed:', error.message);
      console.error('URL:', error.url);
      console.error('Status:', error.statusCode);
    } else if (error instanceof CompatibilityError) {
      console.error('Compatibility issue:', error.feature);
    } else {
      console.error('Unknown error:', error);
    }
  }
}

// 性能监控示例
async function performanceMonitoringExample(data: BinaryData) {
  const startTime = performance.now();

  const transfer = new DataTransfer();

  let totalBytes = 0;
  const result = await transfer.streamTransfer('/api/upload', {
    chunkSize: 1024 * 1024,
    onProgress: (progress) => {
      totalBytes = progress.loaded;
      const elapsed = performance.now() - startTime;
      const speed = totalBytes / (elapsed / 1000); // bytes per second

      console.log(`Performance metrics:`, {
        elapsed: `${elapsed.toFixed(2)}ms`,
        speed: `${(speed / 1024 / 1024).toFixed(2)} MB/s`,
        progress: `${progress.percentage}%`
      });
    }
  });

  const totalTime = performance.now() - startTime;
  console.log(`Total transfer time: ${totalTime.toFixed(2)}ms`);
}
