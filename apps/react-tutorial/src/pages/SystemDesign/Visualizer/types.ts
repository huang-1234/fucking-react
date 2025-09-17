/**
 * 可视化组件通用属性
 */
export interface VisualizerProps {
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 防抖函数可视化属性
 */
export interface DebounceVisualizerProps extends VisualizerProps {
  callTimestamps: number[];
  delay: number;
  immediate?: boolean;
}

/**
 * Promise扁平化可视化属性
 */
export interface FlattenPromisesVisualizerProps extends VisualizerProps {
  inputArray: any[];
  resolveTimings: number[];
  parallel?: boolean;
}

/**
 * 流处理可视化属性
 */
export interface StreamProcessingVisualizerProps extends VisualizerProps {
  chunks: string[];
  chunkDelayMs: number;
  pauseAt?: number;
  resumeAt?: number;
}

/**
 * Web Worker数据处理可视化属性
 */
export interface WorkerProcessingVisualizerProps extends VisualizerProps {
  dataSize: number;
  chunkSize: number;
  processingTime: number;
}

/**
 * 响应式系统可视化属性
 */
export interface ReactiveSystemVisualizerProps extends VisualizerProps {
  state: Record<string, any>;
  effects: Array<{ name: string; fn: () => void }>;
  operations: Array<{ type: 'get' | 'set'; key: string; value?: any }>;
}

/**
 * 时间轴项目类型
 */
export interface TimelineItem {
  time: number;
  label: string;
  type: 'call' | 'execution' | 'chunk' | 'worker' | 'effect' | 'state';
  duration?: number;
  data?: any;
}

/**
 * 节点类型
 */
export interface Node {
  id: string;
  label: string;
  type: 'object' | 'property' | 'effect' | 'value';
  x?: number;
  y?: number;
}

/**
 * 边类型
 */
export interface Edge {
  source: string;
  target: string;
  label?: string;
  type?: 'dependency' | 'property' | 'value';
}

/**
 * 图形数据类型
 */
export interface GraphData {
  nodes: Node[];
  edges: Edge[];
}
