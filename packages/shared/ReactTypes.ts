/**
 * React类型定义
 */

// 基本类型
export type Type = any;
export type Key = string | null;
export type Ref = { current: any } | ((instance: any) => void) | null;
export type Props = {
  [key: string]: any;
  children?: ReactNodeList;
};
export type ElementType = string | React.FC<any> | React.ComponentClass<any> | ((props: any) => ReactElement | null);

// React元素类型
export interface ReactElement {
  $$typeof: symbol | number;
  type: ElementType;
  key: Key;
  props: Props;
  ref: Ref;
  __mark: string;
}

// React节点类型
export type ReactNode =
  | ReactElement
  | string
  | number
  | boolean
  | null
  | undefined
  | ReactNodeArray;

// React节点数组
export interface ReactNodeArray extends Array<ReactNode> { }

// React节点列表
export type ReactNodeList = ReactNode | ReactNodeArray;

// React上下文类型
export type ReactContext<T> = {
  $$typeof: symbol | number;
  Provider: ReactProviderType<T>;
  Consumer: ReactConsumerType<T>;
  _currentValue: T;
};

// React提供者类型
export type ReactProviderType<T> = {
  $$typeof: symbol | number;
  _context: ReactContext<T>;
};

// React消费者类型
export type ReactConsumerType<T> = {
  $$typeof: symbol | number;
  _context: ReactContext<T>;
};

// React命名空间
export namespace React {
  // 函数组件
  export interface FC<P = {}> {
    (props: P): ReactElement | null;
    displayName?: string;
  }

  // 类组件
  export interface ComponentClass<P = {}, S = {}> {
    new(props: P): Component<P, S>;
    displayName?: string;
  }

  // 组件基类
  export class Component<P = {}, S = {}> {
    constructor(props: P) {
      // 实现
    }
    props: P = {} as P;
    state: S = {} as S;
    setState(state: Partial<S> | ((prevState: S, props: P) => Partial<S>), callback?: () => void): void {
      // 实现
    }
    forceUpdate(callback?: () => void): void {
      // 实现
    }
    render(): ReactElement | void {
      // 实现
    }
  }
}