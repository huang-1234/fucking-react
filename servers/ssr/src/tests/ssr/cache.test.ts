/**
 * 缓存中间件测试
 * 测试SSR缓存机制
 */
import { describe, it, expect, beforeEach } from 'vitest';
import Koa from 'koa';
import request from 'supertest';
import cacheMiddleware from '../../server/middleware/cache';

describe('缓存中间件测试', () => {
  let app: Koa;

  beforeEach(() => {
    app = new Koa();
  });

  it('应该缓存GET请求', async () => {
    let counter = 0;

    // 设置缓存中间件
    app.use(cacheMiddleware({
      enabled: true,
      ttl: 1000 // 1秒缓存
    }));

    // 测试路由
    app.use(async (ctx) => {
      counter++;
      ctx.body = { count: counter };
    });

    const agent = request(app.callback());

    // 第一次请求
    const res1 = await agent.get('/test');
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ count: 1 });
    expect(res1.headers['x-cache']).toBe('MISS');

    // 第二次请求（应该命中缓存）
    const res2 = await agent.get('/test');
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ count: 1 }); // 计数器不应该增加
    expect(res2.headers['x-cache']).toBe('HIT');

    // 不同路径的请求
    const res3 = await agent.get('/test2');
    expect(res3.status).toBe(200);
    expect(res3.body).toEqual({ count: 2 }); // 计数器应该增加
    expect(res3.headers['x-cache']).toBe('MISS');
  });

  it('不应该缓存POST请求', async () => {
    let counter = 0;

    // 设置缓存中间件
    app.use(cacheMiddleware({
      enabled: true,
      ttl: 1000
    }));

    // 测试路由
    app.use(async (ctx) => {
      counter++;
      ctx.body = { count: counter };
    });

    const agent = request(app.callback());

    // POST请求
    const res1 = await agent.post('/test').send({ data: 'test' });
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ count: 1 });
    expect(res1.headers['x-cache']).toBeUndefined();

    // 再次POST请求（不应该命中缓存）
    const res2 = await agent.post('/test').send({ data: 'test' });
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ count: 2 }); // 计数器应该增加
    expect(res2.headers['x-cache']).toBeUndefined();
  });

  it('禁用缓存时不应该缓存请求', async () => {
    let counter = 0;

    // 设置缓存中间件（禁用）
    app.use(cacheMiddleware({
      enabled: false
    }));

    // 测试路由
    app.use(async (ctx) => {
      counter++;
      ctx.body = { count: counter };
    });

    const agent = request(app.callback());

    // 第一次请求
    const res1 = await agent.get('/test');
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ count: 1 });
    expect(res1.headers['x-cache']).toBeUndefined();

    // 第二次请求（不应该命中缓存）
    const res2 = await agent.get('/test');
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ count: 2 }); // 计数器应该增加
    expect(res2.headers['x-cache']).toBeUndefined();
  });

  it('带有nocache查询参数的请求不应该缓存', async () => {
    let counter = 0;

    // 设置缓存中间件
    app.use(cacheMiddleware({
      enabled: true,
      ttl: 1000
    }));

    // 测试路由
    app.use(async (ctx) => {
      counter++;
      ctx.body = { count: counter };
    });

    const agent = request(app.callback());

    // 带有nocache参数的请求
    const res1 = await agent.get('/test?nocache=1');
    expect(res1.status).toBe(200);
    expect(res1.body).toEqual({ count: 1 });
    expect(res1.headers['x-cache']).toBeUndefined();

    // 再次请求（不应该命中缓存）
    const res2 = await agent.get('/test?nocache=1');
    expect(res2.status).toBe(200);
    expect(res2.body).toEqual({ count: 2 }); // 计数器应该增加
    expect(res2.headers['x-cache']).toBeUndefined();
  });
});
