/**
 * 扩展相关的类型定义
 */
import { EventBus } from '../core/eventBus';
import { AIManager } from '../core/aiManager';
import { IDEAdapter } from '../core/ideAdapter';

/**
 * 扩展上下文接口
 */
export interface IExtensionContext {
  id: string;
  path: string;
  manifest: any;
  subscriptions: { dispose(): any }[];
  eventBus: EventBus;
  aiManager: AIManager;
  ideAdapter: IDEAdapter;
}

/**
 * 扩展接口
 */
export interface IExtension {
  id: string;
  name: string;
  description: string;
  version: string;
  api: any;
  context: IExtensionContext;
}

/**
 * 扩展激活函数类型
 */
export type ExtensionActivateFunction = (context: IExtensionContext) => Promise<any> | any;

/**
 * 扩展停用函数类型
 */
export type ExtensionDeactivateFunction = () => Promise<void> | void;

/**
 * 扩展清单接口
 */
export interface IExtensionManifest {
  id: string;
  name: string;
  description?: string;
  version?: string;
  main: string;
  contributes?: {
    commands?: {
      command: string;
      title: string;
      category?: string;
      icon?: string;
    }[];
    views?: {
      [viewContainer: string]: {
        id: string;
        name: string;
        when?: string;
      }[];
    };
    menus?: {
      [menuId: string]: {
        command: string;
        group?: string;
        when?: string;
      }[];
    };
    configuration?: {
      title: string;
      properties: {
        [key: string]: {
          type: string;
          default: any;
          description: string;
        };
      };
    };
  };
}
