/**
 * 测试环境设置
 */

import { vi } from 'vitest';

// 模拟全局对象
global.Response = class Response {
  private body: string;
  readonly status: number;
  readonly statusText: string;
  readonly headers: Headers;
  readonly ok: boolean;

  constructor(body?: string | null, init?: ResponseInit) {
    this.body = body || '';
    this.status = init?.status || 200;
    this.statusText = init?.statusText || '';
    this.headers = new Headers(init?.headers);
    this.ok = this.status >= 200 && this.status < 300;
  }

  clone(): Response {
    return new Response(this.body, {
      status: this.status,
      statusText: this.statusText,
      headers: this.headers
    });
  }

  text(): Promise<string> {
    return Promise.resolve(this.body);
  }

  json(): Promise<any> {
    return Promise.resolve(JSON.parse(this.body));
  }

  blob(): Promise<Blob> {
    return Promise.resolve(new Blob([this.body]));
  }
} as any;

global.Request = class Request {
  readonly url: string;
  readonly method: string;
  readonly headers: Headers;
  readonly body: any;
  readonly mode: RequestMode;
  readonly credentials: RequestCredentials;
  readonly cache: RequestCache;
  readonly redirect: RequestRedirect;
  readonly referrer: string;
  readonly integrity: string;

  constructor(input: string | Request, init?: RequestInit) {
    if (typeof input === 'string') {
      this.url = input;
    } else {
      this.url = input.url;
    }

    this.method = init?.method || 'GET';
    this.headers = new Headers(init?.headers);
    this.body = init?.body || null;
    this.mode = init?.mode || 'cors';
    this.credentials = init?.credentials || 'same-origin';
    this.cache = init?.cache || 'default';
    this.redirect = init?.redirect || 'follow';
    this.referrer = init?.referrer || 'about:client';
    this.integrity = init?.integrity || '';
  }

  clone(): Request {
    return new Request(this.url, {
      method: this.method,
      headers: this.headers,
      body: this.body,
      mode: this.mode,
      credentials: this.credentials,
      cache: this.cache,
      redirect: this.redirect,
      referrer: this.referrer,
      integrity: this.integrity
    });
  }
} as any;

global.Headers = class Headers {
  private headers: Map<string, string> = new Map();

  constructor(init?: HeadersInit) {
    if (init) {
      if (init instanceof Headers) {
        init.forEach((value, key) => {
          this.set(key, value);
        });
      } else if (Array.isArray(init)) {
        init.forEach(([key, value]) => {
          this.set(key, value);
        });
      } else {
        Object.entries(init).forEach(([key, value]) => {
          this.set(key, value);
        });
      }
    }
  }

  append(name: string, value: string): void {
    this.set(name, value);
  }

  delete(name: string): void {
    this.headers.delete(name.toLowerCase());
  }

  get(name: string): string | null {
    return this.headers.get(name.toLowerCase()) || null;
  }

  has(name: string): boolean {
    return this.headers.has(name.toLowerCase());
  }

  set(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  forEach(callback: (value: string, key: string) => void): void {
    this.headers.forEach((value, key) => {
      callback(value, key);
    });
  }
} as any;

global.URL = URL;

// 模拟 console 方法
console.log = vi.fn();
console.error = vi.fn();
console.warn = vi.fn();
console.info = vi.fn();

// 模拟定时器
vi.useFakeTimers();
