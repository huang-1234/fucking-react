/**
 * 全局类型声明
 */

// 全局变量
declare global {
  // 客户端全局变量
  interface Window {
    __PRELOADED_STATE__: any;
    __SSR_ERROR__?: boolean;
  }

  // 服务端全局变量
  var window: Window & typeof globalThis;
  var document: Document;
  var navigator: Navigator;
  var location: Location;
  var history: History;
  var HTMLElement: typeof HTMLElement;
  var Element: typeof Element;
  var Node: typeof Node;
  var Event: typeof Event;
}

export {};
