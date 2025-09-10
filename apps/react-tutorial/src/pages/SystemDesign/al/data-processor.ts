import { List } from 'immutable';

/**
 * 大型数据处理器
 *
 * 时间复杂度：取决于具体的处理操作，但通过Web Worker避免阻塞主线程
 * 空间复杂度：O(n) - 需要存储数据和处理结果
 */
export class DataProcessor {
  private worker: Worker | null = null;
  private isProcessing: boolean = false;

  /**
   * 初始化数据处理器
   * @param workerScript Web Worker脚本的URL
   */
  constructor(private workerScript: string) {}

  /**
   * 处理大型数据集
   * @param data 需要处理的数据数组
   * @param operation 操作类型（'filter', 'map', 'reduce', 'sort', 'aggregate'）
   * @param options 操作选项
   * @returns 处理结果的Promise
   */
  processData<T, R>(
    data: T[],
    operation: 'filter' | 'map' | 'reduce' | 'sort' | 'aggregate',
    options: any = {}
  ): Promise<R> {
    if (this.isProcessing) {
      return Promise.reject(new Error('已有处理任务正在进行'));
    }

    this.isProcessing = true;

    return new Promise<R>((resolve, reject) => {
      try {
        // 创建新的Worker
        this.worker = new Worker(this.workerScript);

        // 设置消息处理
        this.worker.onmessage = (event) => {
          const { type, result, error } = event.data;

          if (type === 'result') {
            resolve(result as R);
          } else if (type === 'error') {
            reject(new Error(error));
          }

          this.terminateWorker();
        };

        // 设置错误处理
        this.worker.onerror = (error) => {
          reject(error);
          this.terminateWorker();
        };

        // 发送数据和操作到Worker
        this.worker.postMessage({
          data,
          operation,
          options
        });
      } catch (error) {
        this.terminateWorker();
        reject(error);
      }
    });
  }

  /**
   * 分片处理大型数据集
   * @param data 需要处理的数据数组
   * @param operation 操作类型
   * @param options 操作选项
   * @param chunkSize 每个分片的大小
   * @returns 处理结果的Promise
   */
  processDataInChunks<T, R>(
    data: T[],
    operation: 'filter' | 'map' | 'reduce' | 'sort' | 'aggregate',
    options: any = {},
    chunkSize: number = 10000
  ): Promise<R[]> {
    // 使用Immutable.js确保不修改输入数组
    const immutableData = List(data);

    // 将数据分片
    const chunks: T[][] = [];
    for (let i = 0; i < immutableData.size; i += chunkSize) {
      chunks.push(immutableData.slice(i, i + chunkSize).toArray());
    }

    // 处理每个分片
    const promises = chunks.map((chunk, index) => {
      return new Promise<R>((resolve, reject) => {
        // 创建新的Worker
        const worker = new Worker(this.workerScript);

        // 设置消息处理
        worker.onmessage = (event) => {
          const { type, result, error } = event.data;

          if (type === 'result') {
            resolve(result as R);
          } else if (type === 'error') {
            reject(new Error(error));
          }

          worker.terminate();
        };

        // 设置错误处理
        worker.onerror = (error) => {
          reject(error);
          worker.terminate();
        };

        // 发送数据和操作到Worker
        worker.postMessage({
          data: chunk,
          operation,
          options,
          chunkIndex: index
        });
      });
    });

    // 等待所有分片处理完成
    return Promise.all(promises);
  }

  /**
   * 终止Worker
   */
  private terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.isProcessing = false;
  }

  /**
   * 取消当前处理任务
   */
  cancel(): void {
    this.terminateWorker();
  }
}

/**
 * 创建Web Worker脚本内容
 * @returns Worker脚本内容
 */
export function createWorkerScript(): string {
  return `
    self.onmessage = function(event) {
      try {
        const { data, operation, options, chunkIndex } = event.data;

        let result;

        switch (operation) {
          case 'filter':
            result = data.filter(item => {
              // 使用Function构造函数动态创建过滤函数
              const filterFn = new Function('item', 'return ' + options.condition);
              return filterFn(item);
            });
            break;

          case 'map':
            result = data.map(item => {
              // 使用Function构造函数动态创建映射函数
              const mapFn = new Function('item', 'return ' + options.transform);
              return mapFn(item);
            });
            break;

          case 'reduce':
            result = data.reduce((acc, item) => {
              // 使用Function构造函数动态创建归约函数
              const reduceFn = new Function('acc', 'item', 'return ' + options.reducer);
              return reduceFn(acc, item);
            }, options.initialValue);
            break;

          case 'sort':
            result = [...data].sort((a, b) => {
              // 使用Function构造函数动态创建排序函数
              const compareFn = new Function('a', 'b', 'return ' + options.comparator);
              return compareFn(a, b);
            });
            break;

          case 'aggregate':
            // 执行聚合操作（如计数、求和、平均值等）
            result = {};

            if (options.count) {
              result.count = data.length;
            }

            if (options.sum && options.field) {
              result.sum = data.reduce((sum, item) => sum + item[options.field], 0);
            }

            if (options.average && options.field) {
              result.average = data.reduce((sum, item) => sum + item[options.field], 0) / data.length;
            }

            if (options.min && options.field) {
              result.min = Math.min(...data.map(item => item[options.field]));
            }

            if (options.max && options.field) {
              result.max = Math.max(...data.map(item => item[options.field]));
            }

            break;

          default:
            throw new Error('不支持的操作类型: ' + operation);
        }

        // 发送处理结果
        self.postMessage({
          type: 'result',
          result,
          chunkIndex
        });
      } catch (error) {
        // 发送错误信息
        self.postMessage({
          type: 'error',
          error: error.message
        });
      }
    };
  `;
}

/**
 * 生成Web Worker数据处理的可视化数据
 * @param dataSize 数据大小
 * @param chunkSize 分片大小
 * @param processingTime 每个分片的处理时间（毫秒）
 * @returns 可视化数据对象
 */
export function visualizeWorkerProcessing(
  dataSize: number,
  chunkSize: number,
  processingTime: number
) {
  // 计算分片数量
  const chunkCount = Math.ceil(dataSize / chunkSize);

  // 生成分片处理时间线
  const timeline: Array<{
    chunkIndex: number,
    startTime: number,
    endTime: number,
    itemsProcessed: number
  }> = [];

  for (let i = 0; i < chunkCount; i++) {
    const itemsInChunk = i === chunkCount - 1 && dataSize % chunkSize !== 0
      ? dataSize % chunkSize
      : chunkSize;

    timeline.push({
      chunkIndex: i,
      startTime: 0, // 所有Worker同时开始
      endTime: processingTime * (0.8 + Math.random() * 0.4), // 添加一些随机性
      itemsProcessed: itemsInChunk
    });
  }

  // 计算总处理时间（假设并行处理）
  const totalTime = Math.max(...timeline.map(item => item.endTime));

  // 计算主线程处理同样数据需要的时间（假设是Worker时间的5倍）
  const mainThreadTime = dataSize / chunkSize * processingTime * 5;

  return {
    dataSize,
    chunkSize,
    chunkCount,
    timeline,
    totalTime,
    mainThreadTime,
    speedup: mainThreadTime / totalTime
  };
}
