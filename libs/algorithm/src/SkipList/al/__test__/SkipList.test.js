import { SkipList, SkipListNode } from '../SkipList';

describe('SkipList', () => {
  let skipList;

  beforeEach(() => {
    skipList = new SkipList<number>(16, 0.5);
  });

  describe('基本操作', () => {
    test('应该能够创建空跳表', () => {
      expect(skipList.isEmpty()).toBe(true);
      expect(skipList.getSize()).toBe(0);
      expect(skipList.getCurrentLevel()).toBe(0);
    });

    test('应该能够插入单个元素', () => {
      const result = skipList.insert(5);
      expect(result.success).toBe(true);
      expect(skipList.getSize()).toBe(1);
      expect(skipList.isEmpty()).toBe(false);
      expect(skipList.toArray()).toEqual([5]);
    });

    test('应该能够插入多个元素并保持有序', () => {
      const values = [5, 2, 8, 1, 9, 3];
      values.forEach(value => {
        skipList.insert(value);
      });

      expect(skipList.getSize()).toBe(6);
      expect(skipList.toArray()).toEqual([1, 2, 3, 5, 8, 9]);
    });

    test('不应该插入重复元素', () => {
      skipList.insert(5);
      const result = skipList.insert(5);

      expect(result.success).toBe(false);
      expect(skipList.getSize()).toBe(1);
      expect(skipList.toArray()).toEqual([5]);
    });
  });

  describe('搜索操作', () => {
    beforeEach(() => {
      [1, 3, 5, 7, 9].forEach(value => skipList.insert(value));
    });

    test('应该能够找到存在的元素', () => {
      const result = skipList.search(5);
      expect(result).not.toBeNull();
      expect(result?.value).toBe(5);
    });

    test('搜索不存在的元素应该返回null', () => {
      const result = skipList.search(4);
      expect(result).toBeNull();
    });

    test('应该能够搜索边界元素', () => {
      const first = skipList.search(1);
      const last = skipList.search(9);

      expect(first).not.toBeNull();
      expect(last).not.toBeNull();
      expect(first?.value).toBe(1);
      expect(last?.value).toBe(9);
    });
  });

  describe('删除操作', () => {
    beforeEach(() => {
      [1, 3, 5, 7, 9].forEach(value => skipList.insert(value));
    });

    test('应该能够删除存在的元素', () => {
      const result = skipList.delete(5);

      expect(result.success).toBe(true);
      expect(result.deletedNode?.value).toBe(5);
      expect(skipList.getSize()).toBe(4);
      expect(skipList.toArray()).toEqual([1, 3, 7, 9]);
    });

    test('删除不存在的元素应该失败', () => {
      const result = skipList.delete(4);

      expect(result.success).toBe(false);
      expect(result.deletedNode).toBeNull();
      expect(skipList.getSize()).toBe(5);
    });

    test('应该能够删除第一个元素', () => {
      const result = skipList.delete(1);

      expect(result.success).toBe(true);
      expect(skipList.toArray()).toEqual([3, 5, 7, 9]);
    });

    test('应该能够删除最后一个元素', () => {
      const result = skipList.delete(9);

      expect(result.success).toBe(true);
      expect(skipList.toArray()).toEqual([1, 3, 5, 7]);
    });

    test('删除所有元素后跳表应该为空', () => {
      [1, 3, 5, 7, 9].forEach(value => skipList.delete(value));

      expect(skipList.isEmpty()).toBe(true);
      expect(skipList.getSize()).toBe(0);
      expect(skipList.getCurrentLevel()).toBe(0);
    });
  });

  describe('配置和工具方法', () => {
    test('应该能够设置配置', () => {
      skipList.setConfig({ maxLevel: 8, probability: 0.25 });
      expect(skipList.getMaxLevel()).toBe(8);
    });

    test('应该能够设置自定义比较函数', () => {
      // 创建字符串跳表，按长度排序
      const stringSkipList = new SkipList<string>(16, 0.5, (a, b) => {
        if (a.length < b.length) return -1;
        if (a.length > b.length) return 1;
        return a.localeCompare(b);
      });

      stringSkipList.insert('a');
      stringSkipList.insert('abc');
      stringSkipList.insert('ab');

      expect(stringSkipList.toArray()).toEqual(['a', 'ab', 'abc']);
    });

    test('应该能够清空跳表', () => {
      [1, 2, 3, 4, 5].forEach(value => skipList.insert(value));

      skipList.clear();

      expect(skipList.isEmpty()).toBe(true);
      expect(skipList.getSize()).toBe(0);
      expect(skipList.getCurrentLevel()).toBe(0);
    });

    test('应该能够获取层级信息', () => {
      [1, 2, 3, 4, 5].forEach(value => skipList.insert(value));

      const levels = skipList.getLevels();
      expect(levels).toBeInstanceOf(Array);
      expect(levels.length).toBeGreaterThan(0);

      // 最底层应该包含所有元素
      const bottomLevel = levels[levels.length - 1];
      expect(bottomLevel.length).toBe(5);
    });
  });

  describe('序列化和反序列化', () => {
    test('应该能够序列化跳表数据', () => {
      [1, 3, 5, 7, 9].forEach(value => skipList.insert(value));

      const serialized = skipList.serialize();

      expect(serialized).toHaveProperty('maxLevel');
      expect(serialized).toHaveProperty('probability');
      expect(serialized).toHaveProperty('size');
      expect(serialized).toHaveProperty('data');
      expect(serialized.data).toEqual([1, 3, 5, 7, 9]);
    });

    test('应该能够反序列化跳表数据', () => {
      const data = {
        maxLevel: 16,
        probability: 0.5,
        size: 3,
        data: [2, 4, 6]
      };

      skipList.deserialize(data);

      expect(skipList.getSize()).toBe(3);
      expect(skipList.toArray()).toEqual([2, 4, 6]);
    });
  });

  describe('性能测试', () => {
    test('大量数据插入性能', () => {
      const startTime = performance.now();

      // 插入1000个随机数
      for (let i = 0; i < 1000; i++) {
        skipList.insert(Math.floor(Math.random() * 10000));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 应该在合理时间内完成（这里设置为1秒）
      expect(duration).toBeLessThan(1000);
      expect(skipList.getSize()).toBeGreaterThan(0);
    });

    test('大量数据搜索性能', () => {
      // 先插入一些数据
      for (let i = 0; i < 100; i++) {
        skipList.insert(i);
      }

      const startTime = performance.now();

      // 执行1000次搜索
      for (let i = 0; i < 1000; i++) {
        skipList.search(Math.floor(Math.random() * 100));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // 搜索应该很快
      expect(duration).toBeLessThan(100);
    });
  });

  describe('边界情况', () => {
    test('空跳表的操作', () => {
      expect(skipList.search(1)).toBeNull();
      expect(skipList.delete(1).success).toBe(false);
      expect(skipList.toArray()).toEqual([]);
      expect(skipList.getLevels()).toEqual([]);
    });

    test('单元素跳表的操作', () => {
      skipList.insert(42);

      expect(skipList.search(42)).not.toBeNull();
      expect(skipList.search(41)).toBeNull();
      expect(skipList.toArray()).toEqual([42]);

      const result = skipList.delete(42);
      expect(result.success).toBe(true);
      expect(skipList.isEmpty()).toBe(true);
    });

    test('极端概率值', () => {
      // 概率为0，所有节点都只在第0层
      const lowProbSkipList = new SkipList<number>(16, 0);
      lowProbSkipList.insert(1);
      lowProbSkipList.insert(2);
      lowProbSkipList.insert(3);

      expect(lowProbSkipList.getCurrentLevel()).toBe(0);

      // 概率为1，理论上节点会尽可能升到最高层（但受maxLevel限制）
      const highProbSkipList = new SkipList<number>(4, 1);
      highProbSkipList.insert(1);

      // 由于概率为1，节点应该升到最高层
      expect(highProbSkipList.getCurrentLevel()).toBeGreaterThan(0);
    });
  });
});