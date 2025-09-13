import { DySchema, DyMaterialProps } from '../../types/schema';
import { IStyleBasic } from '../../types/style';

/**
 * 渲染节点接口
 */
export interface IRenderNode {
  componentName: string;
  props: Record<string, any>;
  children?: IRenderNode[];
  condition?: IConditionExpression;
  loop?: ILoopExpression;
  events?: IEventBinding[];
}

/**
 * 条件表达式接口
 */
export interface IConditionExpression {
  type: 'expression';
  value: string;
}

/**
 * 循环表达式接口
 */
export interface ILoopExpression {
  type: 'expression';
  value: string;
  itemName: string;
  indexName?: string;
}

/**
 * 事件绑定接口
 */
export interface IEventBinding {
  type: string;
  handler: string;
}

/**
 * 资源包接口
 */
export interface IAssetsPackage {
  components: Record<string, any>;
  utils?: Record<string, Function>;
}

/**
 * 渲染实例接口
 */
export interface IRenderInstance {
  container: HTMLElement;
  update: (schema: DySchema) => Promise<void>;
  destroy: () => void;
}

/**
 * 组件元数据接口
 */
export interface IComponentMeta {
  name: string;
  component: any;
  props: Record<string, any>;
}

/**
 * 数据源配置接口
 */
export interface IDataSourceConfig {
  id: string;
  type: 'api' | 'static';
  config: Record<string, any>;
}

/**
 * 工具函数声明接口
 */
export interface IUtilsDeclaration {
  name: string;
  body: string;
}

/**
 * 渲染选项接口
 */
export interface IRenderOptions {
  /** 是否启用沙箱模式 */
  enableSandbox?: boolean;
  /** 是否启用性能监控 */
  enablePerformanceMonitor?: boolean;
  /** 自定义组件映射 */
  customComponentMap?: Record<string, any>;
  /** 自定义工具函数 */
  customUtils?: Record<string, Function>;
}

/**
 * 渲染指标接口
 */
export interface IRenderMetric {
  schemaId: string;
  duration: number;
  timestamp: number;
}

/**
 * 样式处理选项
 */
export interface IStyleProcessOptions {
  /** 是否应用默认样式 */
  applyDefaultStyles?: boolean;
  /** 是否转换样式单位 */
  convertUnits?: boolean;
  /** 是否处理样式前缀 */
  handlePrefixes?: boolean;
}
