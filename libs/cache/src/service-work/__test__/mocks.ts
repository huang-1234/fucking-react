/**
 * Service Worker 测试模拟工具
 */

// 模拟缓存存储
export class MockCache {
  private store: Map<string, Response> = new Map();

  async match(request: Request | string): Promise<Response | undefined> {
    const key = typeof request === 'string' ? request : request.url;
    return this.store.get(key);
  }

  async put(request: Request | string, response: Response): Promise<void> {
    const key = typeof request === 'string' ? request : request.url;
    this.store.set(key, response.clone());
  }

  async delete(request: Request | string): Promise<boolean> {
    const key = typeof request === 'string' ? request : request.url;
    return this.store.delete(key);
  }

  async keys(): Promise<Request[]> {
    return Array.from(this.store.keys()).map(url => new Request(url));
  }

  async matchAll(): Promise<Response[]> {
    return Array.from(this.store.values());
  }

  clear(): void {
    this.store.clear();
  }
}

// 模拟缓存存储管理器
export class MockCacheStorage {
  private caches: Map<string, MockCache> = new Map();

  async open(cacheName: string): Promise<MockCache> {
    if (!this.caches.has(cacheName)) {
      this.caches.set(cacheName, new MockCache());
    }
    return this.caches.get(cacheName)!;
  }

  async has(cacheName: string): Promise<boolean> {
    return this.caches.has(cacheName);
  }

  async delete(cacheName: string): Promise<boolean> {
    return this.caches.delete(cacheName);
  }

  async keys(): Promise<string[]> {
    return Array.from(this.caches.keys());
  }

  async match(request: Request): Promise<Response | undefined> {
    for (const cache of this.caches.values()) {
      const response = await cache.match(request);
      if (response) return response;
    }
    return undefined;
  }
}

// 模拟 Service Worker 注册
export class MockServiceWorkerRegistration {
  scope: string;
  active: ServiceWorker | null = null;
  installing: ServiceWorker | null = null;
  waiting: ServiceWorker | null = null;
  navigationPreload = {
    enable: vi.fn().mockResolvedValue(undefined),
    disable: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn().mockResolvedValue({ enabled: false }),
    setHeaderValue: vi.fn().mockResolvedValue(undefined)
  };
  updateViaCache: ServiceWorkerUpdateViaCache = 'imports';
  onupdatefound: ((this: ServiceWorkerRegistration, ev: Event) => any) | null = null;

  constructor(scope: string = '/') {
    this.scope = scope;
  }

  async getNotifications(): Promise<Notification[]> {
    return [];
  }

  async showNotification(): Promise<void> {
    return;
  }

  async update(): Promise<void> {
    return;
  }

  async unregister(): Promise<boolean> {
    return true;
  }
}

// 模拟 Service Worker
export class MockServiceWorker {
  scriptURL: string;
  state: ServiceWorkerState;
  onstatechange: ((this: ServiceWorker, ev: Event) => any) | null = null;

  constructor(scriptURL: string, state: ServiceWorkerState = 'installed') {
    this.scriptURL = scriptURL;
    this.state = state;
  }

  postMessage(message: any): void {}

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {}

  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {}

  dispatchEvent(event: Event): boolean {
    return true;
  }
}

// 模拟 Clients
export class MockClients {
  private clients: any[] = [];

  async get(id: string): Promise<any> {
    return this.clients.find(client => client.id === id) || null;
  }

  async matchAll(options?: any): Promise<any[]> {
    return this.clients;
  }

  async claim(): Promise<void> {
    return;
  }

  async openWindow(url: string): Promise<any> {
    return null;
  }

  addClient(client: any): void {
    this.clients.push(client);
  }
}

// 模拟 ExtendableEvent
export class MockExtendableEvent extends Event {
  private _waitUntilPromises: Promise<any>[] = [];

  constructor(type: string) {
    super(type);
  }

  waitUntil(promise: Promise<any>): void {
    this._waitUntilPromises.push(promise);
  }

  async resolveWaitUntil(): Promise<any[]> {
    return Promise.all(this._waitUntilPromises);
  }
}

// 模拟 FetchEvent
export class MockFetchEvent extends MockExtendableEvent {
  request: Request;
  preloadResponse: Promise<any>;
  clientId: string = '';
  resultingClientId: string = '';
  private _respondWithCalled = false;
  private _response: Response | null = null;

  constructor(request: Request | string) {
    super('fetch');
    this.request = typeof request === 'string' ? new Request(request) : request;
    this.preloadResponse = Promise.resolve(null);
  }

  respondWith(response: Promise<Response> | Response): void {
    this._respondWithCalled = true;
    if (response instanceof Promise) {
      response.then(r => {
        this._response = r;
      });
    } else {
      this._response = response;
    }
  }

  get respondWithCalled(): boolean {
    return this._respondWithCalled;
  }

  async getResponse(): Promise<Response | null> {
    if (this._response instanceof Promise) {
      return await this._response;
    }
    return this._response;
  }
}

// 模拟 MessageEvent
export class MockMessageEvent extends Event {
  data: any;
  origin: string = '';
  lastEventId: string = '';
  source: MessageEventSource | null = null;
  ports: MessagePort[] = [];

  constructor(data: any, ports: MessagePort[] = []) {
    super('message');
    this.data = data;
    this.ports = ports;
  }
}

// 模拟 MessagePort
export class MockMessagePort implements MessagePort {
  onmessage: ((this: MessagePort, ev: MessageEvent) => any) | null = null;
  onmessageerror: ((this: MessagePort, ev: MessageEvent) => any) | null = null;
  private _otherPort: MockMessagePort | null = null;
  private _closed = false;

  constructor() {
    // 创建时自动创建一对 MessagePort
    this._createChannelPair();
  }

  private _createChannelPair(): void {
    if (!this._otherPort) {
      this._otherPort = new MockMessagePort();
      this._otherPort._otherPort = this;
    }
  }

  start(): void {}

  close(): void {
    this._closed = true;
  }

  postMessage(message: any): void {
    if (this._closed) return;
    if (!this._otherPort) return;

    setTimeout(() => {
      if (this._otherPort && this._otherPort.onmessage) {
        const event = new MessageEvent('message', { data: message });
        this._otherPort.onmessage(event);
      }
    }, 0);
  }

  addEventListener(type: string, listener: EventListenerOrEventListenerObject): void {}
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject): void {}
  dispatchEvent(event: Event): boolean {
    return true;
  }
}

// 模拟 MessageChannel
export class MockMessageChannel {
  port1: MockMessagePort;
  port2: MockMessagePort;

  constructor() {
    const channel = this.createMessageChannelPair();
    this.port1 = channel.port1;
    this.port2 = channel.port2;
  }

  private createMessageChannelPair(): { port1: MockMessagePort, port2: MockMessagePort } {
    const port1 = new MockMessagePort();
    const port2 = new MockMessagePort();

    // 连接两个端口
    Object.defineProperty(port1, '_otherPort', { value: port2 });
    Object.defineProperty(port2, '_otherPort', { value: port1 });

    return { port1, port2 };
  }
}

// 模拟全局对象
export function setupServiceWorkerGlobalScope() {
  const mockCaches = new MockCacheStorage();
  const mockClients = new MockClients();

  const globalScope = {
    caches: mockCaches,
    clients: mockClients,
    registration: new MockServiceWorkerRegistration(),
    skipWaiting: vi.fn().mockResolvedValue(undefined),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    fetch: vi.fn().mockImplementation((request) => {
      return Promise.resolve(new Response('Mock response', { status: 200 }));
    }),
    Request: Request,
    Response: Response,
    Headers: Headers,
    URL: URL,
    location: new URL('https://example.com'),
    self: {} as any
  };

  // 创建循环引用
  globalScope.self = globalScope;

  return globalScope;
}
