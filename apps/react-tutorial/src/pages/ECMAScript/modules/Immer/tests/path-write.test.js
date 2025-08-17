import { describe, test, expect } from 'vitest';
import { pathWrite } from '../path-write';

describe('pathWrite 函数测试', () => {
  test('应该能够在嵌套对象中设置值', () => {
    const obj = {};
    pathWrite(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  test('应该能够处理已存在的路径', () => {
    const obj = { a: { b: { c: 10 } } };
    pathWrite(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  test('应该能够处理部分存在的路径', () => {
    const obj = { a: {} };
    pathWrite(obj, 'a.b.c', 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });

  test('应该能够处理数组路径', () => {
    const obj = {};
    pathWrite(obj, ['a', 'b', 'c'], 42);
    expect(obj).toEqual({ a: { b: { c: 42 } } });
  });
});
