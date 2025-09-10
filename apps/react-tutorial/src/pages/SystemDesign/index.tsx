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

const { TabPane } = Tabs;

/**
 * 系统设计页面
 */
const SystemDesign: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>系统设计算法可视化</h1>

      <Tabs activeKey={activeTab} onChange={setActiveTab} className={styles.tabs}>
        <TabPane tab="防抖函数" key="1">
          <div className={styles.description}>
            <h2>防抖函数 (Debounce)</h2>
            <p>
              防抖函数用于限制函数的调用频率，确保函数在一段时间内只执行一次。
              当持续触发事件时，防抖函数会在最后一次触发后等待指定时间再执行，
              如果在等待期间再次触发，则重新计时。
            </p>
            <h3>应用场景</h3>
            <ul>
              <li>搜索框输入时延迟请求</li>
              <li>窗口大小调整完成后重新布局</li>
              <li>按钮点击防止重复提交</li>
            </ul>
          </div>

          <DebounceVisualizer
            callTimestamps={[0, 100, 300, 600, 1200]}
            delay={500}
            width={800}
            height={300}
            className={styles.visualizer}
          />

          <div className={styles.codeBlock}>
            <h3>核心实现</h3>
            <pre>
{`function debounce(func, delay) {
  let timeoutId = null;

  const debouncedFn = function(...args) {
    clearTimeout(timeoutId); // 清除之前的定时器
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };

  debouncedFn.cancel = function() { // 添加取消方法
    clearTimeout(timeoutId);
  };

  return debouncedFn;
}`}
            </pre>
          </div>
        </TabPane>

        <TabPane tab="Promise扁平化" key="2">
          <div className={styles.description}>
            <h2>Promise扁平化与异步处理</h2>
            <p>
              扁平化处理嵌套数组并并行解析所有Promise，将复杂的嵌套结构转换为扁平的结果数组。
              这种技术在处理异步操作时非常有用，可以简化代码并提高性能。
            </p>
            <h3>应用场景</h3>
            <ul>
              <li>批量处理API请求</li>
              <li>处理嵌套的异步数据结构</li>
              <li>并行执行多个独立的异步任务</li>
            </ul>
          </div>

          <FlattenPromisesVisualizer
            inputArray={[1, [2, 3], [[4]], [5, [6]]]}
            resolveTimings={[100, 300, 200, 500, 150, 250]}
            parallel={true}
            width={800}
            height={400}
            className={styles.visualizer}
          />

          <div className={styles.codeBlock}>
            <h3>核心实现</h3>
            <pre>
{`async function flattenAndResolvePromises(inputArray) {
  // 首先扁平化数组
  const flatArray = inputArray.flat(Infinity);

  // 然后映射每个元素：如果是Promise，则直接使用；否则，用Promise.resolve包裹
  const promiseArray = flatArray.map(item =>
    item instanceof Promise ? item : Promise.resolve(item)
  );

  // 最后用Promise.all并行解析
  return Promise.all(promiseArray);
}`}
            </pre>
          </div>
        </TabPane>

        <TabPane tab="流式数据处理" key="3">
          <div className={styles.description}>
            <h2>流式数据处理</h2>
            <p>
              流式数据处理允许在数据到达时立即处理，而不需要等待所有数据加载完成。
              这种方式特别适合处理大型数据集或实时数据流，如AI模型生成的流式响应。
            </p>
            <h3>应用场景</h3>
            <ul>
              <li>AI聊天机器人的实时响应</li>
              <li>大文件上传/下载进度展示</li>
              <li>实时数据可视化</li>
            </ul>
          </div>

          <StreamProcessingVisualizer
            chunks={["你好，", "我是", "AI", "助手。", "我可以", "帮助你", "解决", "问题。"]}
            chunkDelayMs={300}
            pauseAt={3}
            resumeAt={5}
            width={800}
            height={400}
            className={styles.visualizer}
          />

          <div className={styles.codeBlock}>
            <h3>核心实现</h3>
            <pre>
{`async function processStreamingResponse(stream) {
  const decoder = new TextDecoder();
  const reader = stream.getReader();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // 解码并处理数据块
      const chunk = decoder.decode(value, { stream: true });
      result += chunk;

      // 更新UI
      updateUI(result);
    }
  } finally {
    reader.releaseLock();
  }
}`}
            </pre>
          </div>
        </TabPane>

        <TabPane tab="Web Worker处理" key="4">
          <div className={styles.description}>
            <h2>Web Worker大数据处理</h2>
            <p>
              Web Worker允许在后台线程中执行JavaScript代码，避免阻塞主线程。
              这对于处理大型数据集、复杂计算或长时间运行的任务特别有用。
            </p>
            <h3>应用场景</h3>
            <ul>
              <li>大数据集的过滤、排序和聚合</li>
              <li>图像或视频处理</li>
              <li>复杂计算（如数据分析、机器学习）</li>
            </ul>
          </div>

          <WorkerProcessingVisualizer
            dataSize={100000}
            chunkSize={20000}
            processingTime={500}
            width={800}
            height={400}
            className={styles.visualizer}
          />

          <div className={styles.codeBlock}>
            <h3>核心实现</h3>
            <pre>
{`// 主线程
const worker = new Worker('data-processor.js');
worker.postMessage(largeDataArray);
worker.onmessage = function(event) {
  const processedResult = event.data;
  updateUI(processedResult);
};

// data-processor.js (Web Worker脚本)
self.onmessage = function(event) {
  const data = event.data;
  // 执行过滤、统计等耗时操作
  const result = data.filter(...).map(...); // 耗时的计算
  self.postMessage(result);
};`}
            </pre>
          </div>
        </TabPane>

        <TabPane tab="响应式系统" key="5">
          <div className={styles.description}>
            <h2>响应式系统与依赖收集</h2>
            <p>
              响应式系统能够自动追踪数据变化并更新相关的UI或执行副作用。
              其核心是依赖收集机制，它记录数据与副作用之间的关系，并在数据变化时触发更新。
            </p>
            <h3>应用场景</h3>
            <ul>
              <li>现代前端框架（Vue、React）的响应式更新</li>
              <li>数据绑定系统</li>
              <li>状态管理库（如MobX）</li>
            </ul>
          </div>

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
            width={800}
            height={500}
            className={styles.visualizer}
          />

          <div className={styles.codeBlock}>
            <h3>核心实现</h3>
            <pre>
{`// 当前正在执行的effect
let activeEffect = null;

// 存储依赖关系的全局Map
const targetMap = new WeakMap();

function track(target, key) {
  if (!activeEffect) return;
  let depsMap = targetMap.get(target);
  if (!depsMap) targetMap.set(target, (depsMap = new Map()));
  let dep = depsMap.get(key);
  if (!dep) depsMap.set(key, (dep = new Set()));
  dep.add(activeEffect);
}

function trigger(target, key) {
  const depsMap = targetMap.get(target);
  if (!depsMap) return;
  const dep = depsMap.get(key);
  if (dep) dep.forEach(effect => effect());
}

function reactive(obj) {
  return new Proxy(obj, {
    get(target, key, receiver) {
      const result = Reflect.get(target, key, receiver);
      track(target, key);
      return result;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      trigger(target, key);
      return result;
    }
  });
}`}
            </pre>
          </div>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default React.memo(SystemDesign);
