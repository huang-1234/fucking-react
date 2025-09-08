/**
 * 事件类型定义
 */

/**
 * 扩展相关事件
 */
export enum ExtensionEvents {
  // 扩展生命周期事件
  EXTENSION_REGISTERED = 'extension.registered',
  EXTENSION_UNREGISTERED = 'extension.unregistered',
  EXTENSIONS_LOADED = 'extensions.loaded',

  // 扩展UI事件
  EXTENSION_UI_OPENED = 'extension.ui.opened',
  EXTENSION_UI_CLOSED = 'extension.ui.closed',

  // 扩展通信事件
  EXTENSION_MESSAGE = 'extension.message'
}

/**
 * AI相关事件
 */
export enum AIEvents {
  // AI提供者事件
  PROVIDER_REGISTERED = 'ai.provider.registered',
  PROVIDER_UNREGISTERED = 'ai.provider.unregistered',
  PROVIDER_CHANGED = 'ai.provider.changed',

  // AI处理事件
  PROCESSING_STARTED = 'ai.processing.started',
  PROCESSING_COMPLETED = 'ai.processing.completed',
  PROCESSING_ERROR = 'ai.processing.error',

  // 代码生成事件
  CODE_GENERATION_STARTED = 'ai.code.generation.started',
  CODE_GENERATION_COMPLETED = 'ai.code.generation.completed',
  CODE_GENERATION_ERROR = 'ai.code.generation.error',

  // 代码分析事件
  CODE_ANALYSIS_STARTED = 'ai.code.analysis.started',
  CODE_ANALYSIS_COMPLETED = 'ai.code.analysis.completed',
  CODE_ANALYSIS_ERROR = 'ai.code.analysis.error'
}

/**
 * UI相关事件
 */
export enum UIEvents {
  // 主面板事件
  MAIN_PANEL_OPENED = 'ui.main.panel.opened',
  MAIN_PANEL_CLOSED = 'ui.main.panel.closed',

  // Webview事件
  WEBVIEW_READY = 'ui.webview.ready',
  WEBVIEW_MESSAGE = 'ui.webview.message'
}

/**
 * 工作区相关事件
 */
export enum WorkspaceEvents {
  // 文件事件
  FILE_CREATED = 'workspace.file.created',
  FILE_CHANGED = 'workspace.file.changed',
  FILE_DELETED = 'workspace.file.deleted',

  // 项目事件
  PROJECT_OPENED = 'workspace.project.opened',
  PROJECT_CLOSED = 'workspace.project.closed'
}
