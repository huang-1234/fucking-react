import React, { useState } from 'react';
import { Tabs } from 'antd';
import {
  DebounceVisualizer,
  FlattenPromisesVisualizer,
  StreamProcessingVisualizer,
  WorkerProcessingVisualizer,
  ReactiveSystemVisualizer
} from './Visualizer';
import styles from './index.module.less';
import {
  commonCodeDebounce,
  commonCodeFlattenPromises,
  commonCodeReactiveSystem,
  commonCodeStreamProcessing,
  commonCodeWorkerProcessing
} from './common/code';
import { CodeBlock } from '@/components/CodeBlock';

const { TabPane } = Tabs;

// 定义Tab数据结构
interface TabItem {
  key: string;
  title: string;
  heading: string;
  description: string;
  scenarios: string[];
  visualizer: React.ReactNode;
  codeImplementation: string;
  useCodeBlock?: boolean;
}

/**
 * 系统设计页面
 */
const SystemDesign: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  // Tab数据配置
  const tabItems: TabItem[] = [
    {
      key: '1',
      title: '防抖函数',
      heading: '防抖函数 (Debounce)',
      description: '防抖函数用于限制函数的调用频率，确保函数在一段时间内只执行一次。当持续触发事件时，防抖函数会在最后一次触发后等待指定时间再执行，如果在等待期间再次触发，则重新计时。',
      scenarios: [
        '搜索框输入时延迟请求',
        '窗口大小调整完成后重新布局',
        '按钮点击防止重复提交'
      ],
      visualizer: (
        <DebounceVisualizer
          callTimestamps={[0, 100, 300, 600, 1200]}
          delay={500}
          className={styles.visualizer}
        />
      ),
      codeImplementation: commonCodeDebounce
    },
    {
      key: '2',
      title: 'Promise扁平化',
      heading: 'Promise扁平化与异步处理',
      description: '扁平化处理嵌套数组并并行解析所有Promise，将复杂的嵌套结构转换为扁平的结果数组。这种技术在处理异步操作时非常有用，可以简化代码并提高性能。',
      scenarios: [
        '批量处理API请求',
        '处理嵌套的异步数据结构',
        '并行执行多个独立的异步任务'
      ],
      visualizer: (
        <FlattenPromisesVisualizer
          inputArray={[1, [2, 3], [[4]], [5, [6]]]}
          resolveTimings={[100, 300, 200, 500, 150, 250]}
          parallel={true}
          className={styles.visualizer}
        />
      ),
      codeImplementation: commonCodeFlattenPromises
    },
    {
      key: '3',
      title: '流式数据处理',
      heading: '流式数据处理',
      description: '流式数据处理允许在数据到达时立即处理，而不需要等待所有数据加载完成。这种方式特别适合处理大型数据集或实时数据流，如AI模型生成的流式响应。',
      scenarios: [
        'AI聊天机器人的实时响应',
        '大文件上传/下载进度展示',
        '实时数据可视化'
      ],
      visualizer: (
        <StreamProcessingVisualizer
          chunks={["你好，", "我是", "AI", "助手。", "我可以", "帮助你", "解决", "问题。"]}
          chunkDelayMs={300}
          pauseAt={3}
          resumeAt={5}
          className={styles.visualizer}
        />
      ),
      codeImplementation: commonCodeStreamProcessing
    },
    {
      key: '4',
      title: 'Web Worker处理',
      heading: 'Web Worker大数据处理',
      description: 'Web Worker允许在后台线程中执行JavaScript代码，避免阻塞主线程。这对于处理大型数据集、复杂计算或长时间运行的任务特别有用。',
      scenarios: [
        '大数据集的过滤、排序和聚合',
        '图像或视频处理',
        '复杂计算（如数据分析、机器学习）'
      ],
      visualizer: (
        <WorkerProcessingVisualizer
          dataSize={100000}
          chunkSize={20000}
          processingTime={500}
          className={styles.visualizer}
        />
      ),
      codeImplementation: commonCodeWorkerProcessing
    },
    {
      key: '5',
      title: '响应式系统',
      heading: '响应式系统与依赖收集',
      description: '响应式系统能够自动追踪数据变化并更新相关的UI或执行副作用。其核心是依赖收集机制，它记录数据与副作用之间的关系，并在数据变化时触发更新。',
      scenarios: [
        '现代前端框架（Vue、React）的响应式更新',
        '数据绑定系统',
        '状态管理库（如MobX）'
      ],
      visualizer: (
        <ReactiveSystemVisualizer
          state={{ count: 0, message: 'Hello' }}
          effects={[
            { name: 'logCount', fn: () => console.log('Count changed') },
            { name: 'updateUI', fn: () => console.log('Update UI') }
          ]}
          operations={[
            { type: 'get', key: 'count' },
            { type: 'set', key: 'count', value: 1 },
            { type: 'set', key: 'message', value: 'World' },
            { type: 'get', key: 'message' }
          ]}
          className={styles.visualizer}
        />
      ),
      codeImplementation: commonCodeReactiveSystem,
      useCodeBlock: true
    }
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>系统设计算法可视化</h1>

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

            {item.visualizer}

            <div className={styles.codeBlock}>
              <h3>核心实现</h3>
              {item.useCodeBlock ? (
                <CodeBlock readOnly={true} code={item.codeImplementation} />
              ) : (
                <pre>{item.codeImplementation}</pre>
              )}
            </div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );
};

export default React.memo(SystemDesign);