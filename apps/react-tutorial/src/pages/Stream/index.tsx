import React, { useState, useRef, useEffect } from 'react';
import { Tabs, Button, Input, Upload, message, Progress, Space, Typography, Select, Switch } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { CodeBlock } from '@/components/CodeBlock';
import styles from './index.module.less';
import {
  BinaryData,
  StreamOperations,
  DataTransfer,
  initStreamModule,
  type ProgressInfo
} from '../../../../../libs/dom-proxy/src/Stream';

const { TabPane } = Tabs;
const { Text, Paragraph } = Typography;
const { Option } = Select;

// 示例代码
const binaryDataCode = `// BinaryData 使用示例
const textData = BinaryData.from('Hello, World!');
const base64 = textData.encodeBase64();

// 转换为不同格式
const arrayBuffer = textData.toArrayBuffer();
const blob = textData.toBlob('text/plain');
const text = await textData.toText();

// 数据操作
const sliced = textData.slice(0, 5); // 'Hello'
const concatenated = textData.concat(BinaryData.from(' More data'));`;

const streamOperationsCode = `// 创建可读流
const readableStream = StreamOperations.createReadableStream({
  pull(controller) {
    controller.enqueue(new TextEncoder().encode('Hello, Stream!'));
    controller.close();
  }
});

// 创建转换流
const transformStream = StreamOperations.createTransformStream({
  transform(chunk, controller) {
    // 转换数据
    const text = new TextDecoder().decode(chunk);
    const transformed = text.toUpperCase();
    controller.enqueue(new TextEncoder().encode(transformed));
  }
});

// 管道连接
const processedStream = readableStream.pipeThrough(transformStream);`;

const dataTransferCode = `// 流式传输
const transfer = new DataTransfer();
const result = await transfer.streamTransfer('/api/upload', {
  chunkSize: 1024 * 1024, // 1MB chunks
  onProgress: (progress) => {
    console.log(\`Upload progress: \${progress.percentage}%\`);
    console.log(\`Speed: \${progress.speed} bytes/s\`);
  }
});

// 断点续传
const resumableTransfer = transfer.resumableTransfer('/api/upload', {
  checkPoint: true,
  onProgress: (progress) => {
    console.log(\`Upload progress: \${progress.percentage}%\`);
  },
  onInterrupt: () => {
    console.log('Upload interrupted, will resume later');
  }
});`;

// 二进制数据转换演示组件
const BinaryDataDemo: React.FC = () => {
  const [inputText, setInputText] = useState('Hello, Stream API!');
  const [base64Output, setBase64Output] = useState('');
  const [hexOutput, setHexOutput] = useState('');
  const [textOutput, setTextOutput] = useState('');
  const [sliceStart, setSliceStart] = useState(0);
  const [sliceEnd, setSliceEnd] = useState(5);

  useEffect(() => {
    // 初始化Stream模块
    initStreamModule().catch((err: Error) => {
      console.error('初始化Stream模块失败:', err);
      message.error('初始化Stream模块失败');
    });
  }, []);

  const convertToBase64 = () => {
    try {
      // 使用实际的BinaryData API
      const binaryData = BinaryData.from(inputText);
      const base64 = binaryData.encodeBase64();
      setBase64Output(base64);
    } catch (error) {
      console.error('Base64转换错误:', error);
      message.error('Base64转换失败');
    }
  };

  const convertToHex = () => {
    try {
      // 使用BinaryData API并转换为十六进制
      const binaryData = BinaryData.from(inputText);
      const uint8Array = binaryData.toUint8Array();
      const hex = Array.from(uint8Array)
        .map((b: unknown) => b.toString(16).padStart(2, '0'))
        .join(' ');
      setHexOutput(hex);
    } catch (error) {
      console.error('十六进制转换错误:', error);
      message.error('十六进制转换失败');
    }
  };

  const sliceText = () => {
    try {
      // 使用BinaryData的slice方法
      const binaryData = BinaryData.from(inputText);
      const sliced = binaryData.slice(sliceStart, sliceEnd);
      // 转换回文本
      sliced.toText().then((text: string) => {
        setTextOutput(text);
      });
    } catch (error) {
      console.error('切片操作错误:', error);
      message.error('切片操作失败');
    }
  };

  return (
    <div className={styles.demoCard}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          rows={3}
          placeholder="输入文本数据"
        />

        <div className={styles.controlPanel}>
          <Button type="primary" onClick={convertToBase64}>转换为Base64</Button>
          <Button onClick={convertToHex}>转换为十六进制</Button>
          <Space>
            <Input
              style={{ width: 80 }}
              type="number"
              value={sliceStart}
              onChange={e => setSliceStart(parseInt(e.target.value) || 0)}
              placeholder="开始"
            />
            <Input
              style={{ width: 80 }}
              type="number"
              value={sliceEnd}
              onChange={e => setSliceEnd(parseInt(e.target.value) || 0)}
              placeholder="结束"
            />
            <Button onClick={sliceText}>切片操作</Button>
          </Space>
        </div>

        <div className={styles.resultPanel}>
          {base64Output && (
            <div>
              <Text strong>Base64输出：</Text>
              <Paragraph copyable ellipsis={{ rows: 2, expandable: true }}>{base64Output}</Paragraph>
            </div>
          )}
          {hexOutput && (
            <div>
              <Text strong>十六进制输出：</Text>
              <Paragraph copyable ellipsis={{ rows: 2, expandable: true }}>{hexOutput}</Paragraph>
            </div>
          )}
          {textOutput && (
            <div>
              <Text strong>切片结果：</Text>
              <Paragraph copyable>{textOutput}</Paragraph>
            </div>
          )}
        </div>
      </Space>
    </div>
  );
};

// 流处理演示组件，使用StreamOperations API
const StreamOperationsDemo: React.FC = () => {
  const [streamData, setStreamData] = useState<string[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [transformType, setTransformType] = useState('uppercase');
  const [streamSpeed, setStreamSpeed] = useState(500);
  const abortControllerRef = useRef<AbortController | null>(null);
  const readableStreamRef = useRef<ReadableStream | null>(null);

  const sentences = [
    "Web流式API允许处理连续的数据流，",
    "而不需要等待整个数据集加载完成。",
    "这对于处理大型数据集、",
    "实时数据或长时间运行的操作非常有用。",
    "流式处理可以显著提高性能和响应性，",
    "特别是在处理大文件或网络请求时。"
  ];

  const createSourceStream = () => {
    let index = 0;

    // 使用StreamOperations创建可读流
    return StreamOperations.createReadableStream<Uint8Array>({
      pull(controller: ReadableStreamDefaultController<Uint8Array>) {
        return new Promise<void>(resolve => {
          setTimeout(() => {
            if (index < sentences.length) {
              // 将字符串转换为Uint8Array
              const encoder = new TextEncoder();
              const chunk = encoder.encode(sentences[index]);
              controller.enqueue(chunk);
              index++;
              resolve();
            } else {
              controller.close();
              resolve();
            }
          }, streamSpeed);
        });
      },

      cancel() {
        index = sentences.length; // 强制结束
      }
    });
  };

  const startStream = () => {
    try {
      setIsStreaming(true);
      setStreamData([]);

      // 创建中止控制器
      abortControllerRef.current = new AbortController();

      // 创建源流
      const sourceStream = createSourceStream();
      readableStreamRef.current = sourceStream;

      // 创建转换流
      let transformStream: TransformStream<Uint8Array, Uint8Array>;

      if (transformType === 'uppercase') {
        transformStream = StreamOperations.createTransformStream<Uint8Array, Uint8Array>({
          transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>) {
            // 转换为大写
            const decoder = new TextDecoder();
            const text = decoder.decode(chunk);
            const transformed = text.toUpperCase();
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(transformed));
          }
        });
      } else if (transformType === 'reverse') {
        transformStream = StreamOperations.createTransformStream<Uint8Array, Uint8Array>({
          transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>) {
            // 反转文本
            const decoder = new TextDecoder();
            const text = decoder.decode(chunk);
            const transformed = text.split('').reverse().join('');
            const encoder = new TextEncoder();
            controller.enqueue(encoder.encode(transformed));
          }
        });
      } else {
        // 不转换，直接传递
        transformStream = StreamOperations.createTransformStream<Uint8Array, Uint8Array>({
          transform(chunk: Uint8Array, controller: TransformStreamDefaultController<Uint8Array>) {
            controller.enqueue(chunk);
          }
        });
      }

      // 连接管道
      const processedStream = sourceStream.pipeThrough(transformStream);

      // 读取并处理流数据
      const reader = processedStream.getReader();

      const processChunks = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              setIsStreaming(false);
              break;
            }

            if (value) {
              // 解码并显示数据
              const decoder = new TextDecoder();
              const text = decoder.decode(value);
              setStreamData(prev => [...prev, text]);
            }
          }
        } catch (error) {
          console.error('流处理错误:', error);
          setIsStreaming(false);
        }
      };

      processChunks();

    } catch (error) {
      console.error('创建流错误:', error);
      message.error('创建流失败');
      setIsStreaming(false);
    }
  };

  const stopStream = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    if (readableStreamRef.current) {
      // 尝试取消流
      const reader = readableStreamRef.current.getReader();
      reader.cancel().catch(console.error);
      readableStreamRef.current = null;
    }

    setIsStreaming(false);
  };

  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return (
    <div className={styles.demoCard}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className={styles.controlPanel}>
          <Select
            value={transformType}
            onChange={setTransformType}
            style={{ width: 150 }}
          >
            <Option value="uppercase">转换为大写</Option>
            <Option value="reverse">反转文本</Option>
            <Option value="none">不转换</Option>
          </Select>

          <Select
            value={streamSpeed}
            onChange={setStreamSpeed}
            style={{ width: 150 }}
          >
            <Option value={1000}>慢速 (1秒)</Option>
            <Option value={500}>中速 (0.5秒)</Option>
            <Option value={200}>快速 (0.2秒)</Option>
          </Select>

          <Button
            type="primary"
            onClick={isStreaming ? stopStream : startStream}
            danger={isStreaming}
          >
            {isStreaming ? '停止流' : '开始流'}
          </Button>
        </div>

        <div className={styles.streamOutput}>
          {streamData.map((chunk, index) => (
            <span key={index} className={index === streamData.length - 1 ? styles.highlight : ''}>
              {chunk}
            </span>
          ))}
          {isStreaming && <span className={styles.highlight}>▌</span>}
        </div>
      </Space>
    </div>
  );
};

// 数据传输演示组件，使用DataTransfer API
const DataTransferDemo: React.FC = () => {
  const [fileList, setFileList] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [useResumable, setUseResumable] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [transferId, setTransferId] = useState('');

  // 引用DataTransfer实例
  const dataTransferRef = useRef<DataTransfer | null>(null);
  // 引用中止控制器
  const abortControllerRef = useRef<AbortController | null>(null);
  // 引用恢复点
  const checkpointKeyRef = useRef<string>('');

  useEffect(() => {
    // 创建DataTransfer实例
    dataTransferRef.current = new DataTransfer({
      timeout: 30000,
      retryCount: 3,
      retryDelay: 1000,
      chunkSize: 1024 * 1024, // 1MB
      debug: true
    });

    // 生成唯一的传输ID
    const id = `transfer_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    setTransferId(id);
    checkpointKeyRef.current = id;

    return () => {
      // 确保中止所有传输
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleUpload = async () => {
    if (!fileList.length) {
      message.warning('请先选择文件');
      return;
    }

    if (!dataTransferRef.current) {
      message.error('传输组件未初始化');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setIsPaused(false);

      const file = fileList[0].originFileObj;

      // 创建中止控制器
      abortControllerRef.current = new AbortController();

      // 将文件转换为BinaryData
      const binaryData = await BinaryData.fromAsync(file);

      // 根据选择的传输模式执行上传
      if (useResumable) {
        // 使用断点续传
        const result = await dataTransferRef.current.resumableTransfer(
          // 在实际应用中，这里应该是真实的API端点
          '/api/upload',
          binaryData,
          {
            checkPoint: true,
            checkPointKey: checkpointKeyRef.current,
            onProgress: (progress: ProgressInfo) => {
              setUploadProgress(Math.floor(progress.percentage));
              setUploadSpeed(Math.floor(progress.speed! / 1024)); // 转换为KB/s
            },
            onInterrupt: () => {
              setIsPaused(true);
              message.info('上传已中断，可以稍后恢复');
            },
            onResume: (resumePoint: number) => {
              message.info(`从 ${resumePoint} 字节处恢复上传`);
            },
            headers: {
              'X-Transfer-ID': transferId
            }
          }
        );

        if (result.success) {
          message.success('上传完成');
        } else {
          message.error(`上传失败: ${result.error?.message}`);
        }
      } else {
        // 使用流式传输
        const result = await dataTransferRef.current.streamTransfer(
          // 在实际应用中，这里应该是真实的API端点
          '/api/upload',
          binaryData,
          {
            chunkSize: 512 * 1024, // 512KB
            onProgress: (progress: ProgressInfo) => {
              setUploadProgress(Math.floor(progress.percentage));
              setUploadSpeed(Math.floor(progress.speed! / 1024)); // 转换为KB/s
            },
            signal: abortControllerRef.current.signal,
            headers: {
              'X-Transfer-ID': transferId
            }
          }
        );

        if (result.success) {
          message.success('上传完成');
        } else {
          message.error(`上传失败: ${result.error?.message}`);
        }
      }
    } catch (error) {
      console.error('上传错误:', error);
      message.error('上传过程中发生错误');
    } finally {
      setIsUploading(false);
    }
  };

  const pauseUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsPaused(true);
    message.info('上传已暂停，可以稍后恢复');
  };

  const resumeUpload = () => {
    if (isPaused) {
      handleUpload();
    }
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(0);
    setIsPaused(false);
    message.info('上传已取消');
  };

  const uploadProps = {
    beforeUpload: (file: any) => {
      setFileList([file]);
      return false;
    },
    fileList
  };

  return (
    <div className={styles.demoCard}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className={styles.fileUpload}>
          <Upload {...uploadProps} maxCount={1}>
            <Button icon={<UploadOutlined />}>选择文件</Button>
          </Upload>
        </div>

        <div className={styles.controlPanel}>
          <Switch
            checkedChildren="断点续传"
            unCheckedChildren="普通上传"
            checked={useResumable}
            onChange={setUseResumable}
            disabled={isUploading}
          />

          {!isUploading && !isPaused ? (
            <Button type="primary" onClick={handleUpload} disabled={!fileList.length}>
              开始上传
            </Button>
          ) : (
            <Space>
              {isPaused ? (
                <Button type="primary" onClick={resumeUpload}>
                  恢复上传
                </Button>
              ) : (
                <Button onClick={pauseUpload} disabled={!useResumable}>
                  暂停上传
                </Button>
              )}
              <Button danger onClick={cancelUpload}>
                取消上传
              </Button>
            </Space>
          )}
        </div>

        {(isUploading || isPaused) && (
          <>
            <div className={styles.progressBar}>
              <div
                className={styles.progress}
                style={{ width: `${uploadProgress}%` }}
              >
                {uploadProgress}%
              </div>
            </div>
            <div>
              <Text>上传速度: {uploadSpeed} KB/s</Text>
              {useResumable && (
                <Text style={{ marginLeft: 16 }}>
                  {isPaused ? '已暂停，可以随时恢复' : '支持断点续传'}
                </Text>
              )}
            </div>
          </>
        )}
      </Space>
    </div>
  );
};

// 压缩传输演示组件，使用DataTransfer的压缩API
const CompressionDemo: React.FC = () => {
  const [text, setText] = useState('');
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);
  const [algorithm, setAlgorithm] = useState<string>('gzip');
  const [isCompressing, setIsCompressing] = useState(false);

  // 引用DataTransfer实例
  const dataTransferRef = useRef<DataTransfer | null>(null);

  useEffect(() => {
    // 创建DataTransfer实例
    dataTransferRef.current = new DataTransfer({
      timeout: 30000,
      retryCount: 2,
      chunkSize: 64 * 1024, // 64KB
      debug: true
    });
  }, []);

  const compressData = async () => {
    if (!text) {
      message.warning('请输入要压缩的文本');
      return;
    }

    if (!dataTransferRef.current) {
      message.error('传输组件未初始化');
      return;
    }

    try {
      setIsCompressing(true);

      // 创建BinaryData
      const binaryData = BinaryData.fromText(text);

      // 计算原始大小
      const original = binaryData.size;
      setOriginalSize(original);

      // 使用压缩传输API
      const result = await dataTransferRef.current.compressedTransfer(
        // 在实际应用中，这里应该是真实的API端点
        '/api/compress',
        binaryData,
        {
          compressAlgorithm: algorithm as 'gzip' | 'deflate',
          level: 6, // 压缩级别 (1-9)
          onProgress: (progress: ProgressInfo) => {
            // 可以处理压缩进度
            console.log(`压缩进度: ${progress.percentage}%`);
          }
        }
      );

      if (result.success && result.data) {
        // 在实际应用中，服务器会返回压缩后的大小
        // 这里我们模拟一下压缩结果
        let compressionFactor = 0;
        switch (algorithm) {
          case 'gzip':
            compressionFactor = 0.4 + Math.random() * 0.2; // 压缩率约 40-60%
            break;
          case 'deflate':
            compressionFactor = 0.5 + Math.random() * 0.2; // 压缩率约 50-70%
            break;
          case 'brotli':
            compressionFactor = 0.3 + Math.random() * 0.2; // 压缩率约 30-50%
            break;
        }

        // 计算压缩后大小
        const compressed = Math.floor(original * compressionFactor);
        setCompressedSize(compressed);

        // 计算压缩比
        const ratio = ((original - compressed) / original * 100).toFixed(2);
        setCompressionRatio(parseFloat(ratio));

        message.success(`使用 ${algorithm} 算法压缩完成`);
      } else {
        message.error(`压缩失败: ${result.error?.message || '未知错误'}`);
      }
    } catch (error) {
      console.error('压缩错误:', error);
      message.error('压缩过程中发生错误');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className={styles.demoCard}>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Input.TextArea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={5}
          placeholder="输入要压缩的文本数据"
        />

        <div className={styles.controlPanel}>
          <Select
            value={algorithm}
            onChange={setAlgorithm}
            style={{ width: 150 }}
          >
            <Option value="gzip">GZIP</Option>
            <Option value="deflate">Deflate</Option>
            <Option value="brotli">Brotli</Option>
          </Select>

          <Button
            type="primary"
            onClick={compressData}
            loading={isCompressing}
            disabled={isCompressing}
          >
            {isCompressing ? '压缩中...' : '压缩数据'}
          </Button>
        </div>

        {compressionRatio !== null && (
          <div className={styles.resultPanel}>
            <div>
              <Text strong>原始大小：</Text>
              <Text>{originalSize} 字节</Text>
            </div>
            <div>
              <Text strong>压缩后大小：</Text>
              <Text>{compressedSize} 字节</Text>
            </div>
            <div>
              <Text strong>压缩比：</Text>
              <Text>{compressionRatio}%</Text>
            </div>
            <Progress
              percent={compressionRatio}
              status="success"
              format={percent => `节省 ${percent}%`}
            />
          </div>
        )}
      </Space>
    </div>
  );
};

/**
 * Stream API演示页面
 */
const StreamDemo: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Tab数据配置
  const tabItems = [
    {
      key: '1',
      title: '二进制数据',
      heading: '二进制数据 (BinaryData)',
      description: 'BinaryData类提供了统一的二进制数据处理API，支持多种数据格式转换和操作。它可以从ArrayBuffer、TypedArray、Blob或字符串创建，并提供各种转换和操作方法。',
      scenarios: [
        '文件上传前的处理和格式转换',
        '图像数据处理',
        'Base64编码/解码',
        '二进制数据切片和连接'
      ],
      demo: <BinaryDataDemo />,
      codeImplementation: binaryDataCode
    },
    {
      key: '2',
      title: '流操作',
      heading: '流操作 (StreamOperations)',
      description: 'StreamOperations类提供了对Web Streams API的封装，简化了流的创建、转换和处理。它支持可读流、可写流和转换流的操作，以及流之间的管道连接。',
      scenarios: [
        '实时数据处理',
        '大文件分块处理',
        '数据转换管道',
        '文本编码/解码流'
      ],
      demo: <StreamOperationsDemo />,
      codeImplementation: streamOperationsCode
    },
    {
      key: '3',
      title: '数据传输',
      heading: '数据传输 (DataTransfer)',
      description: 'DataTransfer类提供了高级数据传输功能，支持分页传输、流式传输、压缩传输和断点续传。它可以处理大型数据集的上传和下载，并提供进度跟踪和错误处理。',
      scenarios: [
        '大文件上传/下载',
        '断点续传',
        '实时进度监控',
        '网络错误恢复'
      ],
      demo: <DataTransferDemo />,
      codeImplementation: dataTransferCode
    },
    {
      key: '4',
      title: '压缩传输',
      heading: '压缩传输',
      description: '压缩传输功能允许在数据传输过程中应用压缩算法，减少传输数据量，提高传输效率。支持多种压缩算法，如GZIP、Deflate和Brotli。',
      scenarios: [
        '大型文本数据传输',
        'API响应压缩',
        '网络带宽受限场景',
        '移动设备数据传输优化'
      ],
      demo: <CompressionDemo />,
      codeImplementation: ''
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Web流式API演示</h1>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className={styles.tabs}>
        {tabItems.map(item => (
          <TabPane tab={item.title} key={item.key}>
            <div className={styles.description}>
              <h2>{item.heading}</h2>
              <p>{item.description}</p>
              <h3>应用场景</h3>
              <ul>
                {item.scenarios.map((scenario, index) => (
                  <li key={index}>{scenario}</li>
                ))}
              </ul>
            </div>

            {item.demo}

            {item.codeImplementation && (
              <div className={styles.codeBlock}>
                <h3>核心实现</h3>
                <CodeBlock readOnly={true} code={item.codeImplementation} />
              </div>
            )}
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default React.memo(StreamDemo);
