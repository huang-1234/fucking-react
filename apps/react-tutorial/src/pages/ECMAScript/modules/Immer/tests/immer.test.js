import { describe, test, expect, beforeEach } from 'vitest';

import { pathWrite, produceFake } from './immerBase';

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

describe('produceFake 函数测试', () => {
  let obj;

  beforeEach(() => {
    obj = {
      a: {
        a1: 1,
        a2: {
          a21: 2,
          a22: {
            a221: 3,
            a222: 4
          }
        }
      },
      b: { b1: 3 }
    };
  });

  test('应该正确修改嵌套属性', () => {
    const result = produceFake(obj, draft => {
      draft.a.a1 = 100;
    });

    expect(result.a.a1).toBe(100);
    expect(obj.a.a1).toBe(1); // 原对象不变
    expect(result).not.toBe(obj); // 返回新对象
    expect(result.a).not.toBe(obj.a); // 修改的属性路径上的对象被复制
  });

  test('应该保持未修改属性的引用', () => {
    const result = produceFake(obj, draft => {
      draft.a.a1 = 100;
    });

    expect(result.a.a2).toBe(obj.a.a2); // 未修改的子属性保持引用
    expect(result.b).toBe(obj.b); // 未修改的属性保持引用
  });

  test('应该正确添加新属性', () => {
    const result = produceFake(obj, draft => {
      draft.b.b2 = 200;
    });

    expect(result.b.b2).toBe(200);
    expect(obj.b.b2).toBeUndefined(); // 原对象不变
    expect(result.b).not.toBe(obj.b); // 修改的属性路径上的对象被复制
  });

  test('应该正确处理多个修改', () => {
    const result = produceFake(obj, draft => {
      draft.a.a1 = 100;
      draft.b.b2 = 200;
    });

    expect(result.a.a1).toBe(100);
    expect(result.b.b2).toBe(200);
    expect(obj.a.a1).toBe(1); // 原对象不变
    expect(obj.b.b2).toBeUndefined(); // 原对象不变
  });

  test('应该正确处理深层嵌套修改', () => {
    const result = produceFake(obj, draft => {
      draft.a.a2.a22.a221 = 300;
    });

    expect(result.a.a2.a22.a221).toBe(300);
    expect(obj.a.a2.a22.a221).toBe(3); // 原对象不变
    expect(result.a).not.toBe(obj.a); // 修改的属性路径上的对象被复制
    expect(result.a.a2).not.toBe(obj.a.a2);
    expect(result.a.a2.a22).not.toBe(obj.a.a2.a22);
  });
});

describe('数组操作测试', () => {
  test('应该正确处理数组修改', () => {
    const card = {
      key: 1,
      a: {
        a1: {
          a11: 111,
          a12: 112,
          a13: 113,
        },
      },
      b: {
        b1: 21,
        b2: 22,
        b3: {
          b31: 231,
          b32: 232,
          b33: 233,
        },
      }
    };

    const dataList = {
      list: new Array(10).fill(0).map((_, index) => ({
        ...card,
        key: index + card.key,
      }))
    };

    const newDataList = produceFake(dataList, (draft) => {
      draft.list.push(...new Array(2).fill(0).map((_, index) => ({
        ...card,
        key: index + draft.list.length + (draft.list?.[0]?.key || 2),
      })));
    });

    expect(newDataList.list.length).toBe(12); // 原始10个 + 新增2个
    expect(dataList.list.length).toBe(10); // 原对象不变
    expect(newDataList.list).not.toBe(dataList.list); // 数组被复制
    expect(newDataList.list[0]).toBe(dataList.list[0]); // 未修改的元素保持引用
  });
});

describe('复杂对象修改测试', () => {
  test('应该正确处理复杂对象修改', () => {
    const obj2 = {
      a: {
        a1: {
          a11: 11112,
          a12: 11113,
          a13: 11114,
        },
      },
      b: {
        b1: 11115,
        b2: 11116,
      },
      c: {
        c1: 11117,
        c2: 11118,
      },
    };

    const finish = produceFake(obj2, (draft) => {
      draft.a.a1.a3 = 100010;
      draft.b.b1 = 100011;
      draft.c.c1 = 100012;
    });

    expect(finish.a.a1.a3).toBe(100010);
    expect(finish.b.b1).toBe(100011);
    expect(finish.c.c1).toBe(100012);

    expect(obj2.a.a1.a3).toBeUndefined(); // 原对象不变
    expect(obj2.b.b1).toBe(11115); // 原对象不变
    expect(obj2.c.c1).toBe(11117); // 原对象不变

    expect(finish.a).not.toBe(obj2.a); // 修改的属性路径上的对象被复制
    expect(finish.a.a1).not.toBe(obj2.a.a1);
    expect(finish.b).not.toBe(obj2.b);
    expect(finish.c).not.toBe(obj2.c);
  });
});
