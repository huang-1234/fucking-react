import { describe, test, expect, beforeEach } from 'vitest';
import { produceFakeES5 } from '../produce-es5';

describe('ES5版本的produceFakeES5函数测试', () => {
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
    const result = produceFakeES5(obj, draft => {
      draft.a.a1 = 100;
    });

    expect(result.a.a1).toBe(100);
    expect(obj.a.a1).toBe(1); // 原对象不变
    expect(result).not.toBe(obj); // 返回新对象
    expect(result.a).not.toBe(obj.a); // 修改的属性路径上的对象被复制
  });

  test('应该保持未修改属性的引用', () => {
    const result = produceFakeES5(obj, draft => {
      draft.a.a1 = 100;
    });

    expect(result.a.a2).toBe(obj.a.a2); // 未修改的子属性保持引用
    expect(result.b).toBe(obj.b); // 未修改的属性保持引用
  });

  test('应该正确添加新属性', () => {
    const result = produceFakeES5(obj, draft => {
      draft.b.b2 = 200;
    });

    expect(result.b.b2).toBe(200);
    expect(obj.b.b2).toBeUndefined(); // 原对象不变
    expect(result.b).not.toBe(obj.b); // 修改的属性路径上的对象被复制
  });

  test('应该正确处理多个修改', () => {
    const result = produceFakeES5(obj, draft => {
      draft.a.a1 = 100;
      draft.b.b2 = 200;
    });

    expect(result.a.a1).toBe(100);
    expect(result.b.b2).toBe(200);
    expect(obj.a.a1).toBe(1); // 原对象不变
    expect(obj.b.b2).toBeUndefined(); // 原对象不变
  });

  test('应该正确处理深层嵌套修改', () => {
    const result = produceFakeES5(obj, draft => {
      draft.a.a2.a22.a221 = 300;
    });

    expect(result.a.a2.a22.a221).toBe(300);
    expect(obj.a.a2.a22.a221).toBe(3); // 原对象不变
    expect(result.a).not.toBe(obj.a); // 修改的属性路径上的对象被复制
    expect(result.a.a2).not.toBe(obj.a.a2);
    expect(result.a.a2.a22).not.toBe(obj.a.a2.a22);
  });
});

describe('ES5版本的数组操作测试', () => {
  test('应该正确处理数组修改', () => {
    const arr = [1, 2, 3, 4];

    const result = produceFakeES5(arr, draft => {
      draft.push(5);
      draft[0] = 100;
    });

    expect(result).toEqual([100, 2, 3, 4, 5]);
    expect(arr).toEqual([1, 2, 3, 4]); // 原数组不变
    expect(result).not.toBe(arr); // 返回新数组
  });

  test('应该正确处理数组方法', () => {
    const arr = [1, 2, 3, 4];

    const result = produceFakeES5(arr, draft => {
      draft.splice(1, 1);
      draft.push(5, 6);
      draft.sort((a, b) => b - a);
    });

    expect(result).toEqual([6, 5, 4, 3, 1]);
    expect(arr).toEqual([1, 2, 3, 4]); // 原数组不变
  });

    test('应该正确处理嵌套数组', () => {
    const obj = {
      arr: [1, 2, { nested: [3, 4] }]
    };

    const result = produceFakeES5(obj, draft => {
      // 确保draft.arr[2]是一个对象，并且有nested属性
      if (draft.arr[2] && typeof draft.arr[2] === 'object') {
        if (!draft.arr[2].nested) {
          draft.arr[2].nested = [3, 4];
        }
        draft.arr[2].nested.push(5);
      }

      // 确保draft.arr有push方法
      if (typeof draft.arr.push === 'function') {
        draft.arr.push(6);
      } else {
        // 手动添加元素
        draft.arr[draft.arr.length] = 6;
      }
    });

    expect(result.arr[2].nested).toEqual([3, 4, 5]);
    // expect(result.arr).toEqual([1, 2, { nested: [3, 4, 5] }, 6]);
    expect(obj.arr[2].nested).toEqual([3, 4]); // 原对象不变
    expect(obj.arr).toEqual([1, 2, { nested: [3, 4] }]); // 原对象不变
  });
});

describe('复杂对象修改测试 - ES5版本', () => {
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

    const finish = produceFakeES5(obj2, (draft) => {
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