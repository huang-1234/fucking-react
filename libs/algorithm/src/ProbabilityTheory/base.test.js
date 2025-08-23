import { describe, test, expect, vi } from 'vitest';
import { ProbabilityTheory } from './base';

describe('概率论基础算法测试', () => {
  describe('微信红包拆分算法', () => {
    test('splitMoney 总金额和人数参数校验', () => {
      expect(() => ProbabilityTheory.splitMoney(0.05, 10)).toThrow('总金额不足，每人至少0.01元');
      expect(() => ProbabilityTheory.splitMoney(0, 5)).toThrow('总金额不足，每人至少0.01元');
      expect(() => ProbabilityTheory.splitMoney(-1, 5)).toThrow('总金额不足，每人至少0.01元');
    });
    test('splitMoney 红包数量正确', () => {
      const totalAmount = 100;
      const peopleCount = 10;
      const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);
      expect(result.length).toBe(peopleCount);
    });
  });
  describe('基础随机函数', () => {
    test('getRandomNumber 生成指定范围内的随机数', () => {
      const min = 1;
      const max = 10;

      // 多次测试以确保随机性和范围正确
      for (let i = 0;i < 100;i++) {
        const result = ProbabilityTheory.getRandomNumber(min, max);
        expect(result).toBeGreaterThanOrEqual(min);
        expect(result).toBeLessThanOrEqual(max);
        expect(Number.isInteger(result)).toBe(true);
      }
    });

    test('getRandomNumberInArray 从数组中随机选择一个元素', () => {
      const array = [1, 2, 3, 4, 5];

      // 多次测试以确保随机性和范围正确
      for (let i = 0;i < 100;i++) {
        const result = ProbabilityTheory.getRandomNumberInArray(array);
        expect(array).toContain(result);
      }
    });
  });

  describe('微信红包拆分算法', () => {
    test('splitMoney 总金额和人数参数校验', () => {
      // 测试金额不足的情况
      expect(() => ProbabilityTheory.splitMoney(0.05, 10)).toThrow('总金额不足，每人至少0.01元');
      expect(() => ProbabilityTheory.splitMoney(0, 5)).toThrow('总金额不足，每人至少0.01元');
      expect(() => ProbabilityTheory.splitMoney(-1, 5)).toThrow('总金额不足，每人至少0.01元');
    });

    test('splitMoney 红包数量正确', () => {
      const totalAmount = 100;
      const peopleCount = 10;

      const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);

      expect(result.length).toBe(peopleCount);
    });

    test('splitMoney 红包总金额正确', () => {
      const totalAmount = 100;
      const peopleCount = 10;

      const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);

      // 由于浮点数精度问题，使用近似比较
      const sum = result.reduce((acc, curr) => acc + curr, 0);
      expect(sum).toBeCloseTo(totalAmount, 1); // 精确到小数点后1位
    });

    test('splitMoney 红包金额都大于等于0.01元', () => {
      const totalAmount = 1;
      const peopleCount = 10;

      const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);

      result.forEach(amount => {
        expect(amount).toBeGreaterThanOrEqual(0.01);
      });
    });

    test('splitMoney 红包金额随机性', () => {
      // 模拟随机函数以确保测试的可重复性
      const mockRandom = vi.spyOn(Math, 'random');

      // 第一次测试：模拟固定的随机值
      mockRandom.mockReturnValueOnce(0.5) // 第一个红包
        .mockReturnValueOnce(0.3) // 第二个红包
        .mockReturnValueOnce(0.7) // 第三个红包
        .mockReturnValueOnce(0.2) // 洗牌1
        .mockReturnValueOnce(0.8) // 洗牌2
        .mockReturnValueOnce(0.4); // 洗牌3

      const result1 = ProbabilityTheory.splitMoney(1, 4);

      // 第二次测试：模拟不同的随机值
      mockRandom.mockReturnValueOnce(0.2) // 第一个红包
        .mockReturnValueOnce(0.8) // 第二个红包
        .mockReturnValueOnce(0.4) // 第三个红包
        .mockReturnValueOnce(0.6) // 洗牌1
        .mockReturnValueOnce(0.1) // 洗牌2
        .mockReturnValueOnce(0.9); // 洗牌3

      const result2 = ProbabilityTheory.splitMoney(1, 4);

      // 两次结果应该不同，证明有随机性
      expect(result1).not.toEqual(result2);

      // 清理mock
      mockRandom.mockRestore();
    });

    test('splitMoney 二倍均值法的期望值验证', () => {
      // 模拟大量实验以验证期望值
      const totalAmount = 100;
      const peopleCount = 10;
      const expectedAverage = totalAmount / peopleCount; // 期望每人平均10元
      const experiments = 1000;

      // 收集每个位置的总金额
      const positionSums = Array(peopleCount).fill(0);

      for (let i = 0;i < experiments;i++) {
        const result = ProbabilityTheory.splitMoney(totalAmount, peopleCount);

        // 累加每个位置的金额
        result.forEach((amount, index) => {
          positionSums[index] += amount;
        });
      }

      // 计算每个位置的平均值，应该接近期望值
      const positionAverages = positionSums.map(sum => sum / experiments);

      // 验证每个位置的平均值都接近期望值（允许5%的误差）
      positionAverages.forEach((average, index) => {
        expect(average).toBeCloseTo(expectedAverage, 0); // 精确到整数位
      });
    });
  });

  describe('概率分布函数', () => {
    test('uniformPdf 均匀分布概率密度函数', () => {
      // 在区间[1,3]内的点，PDF值应为1/(3-1)=0.5
      expect(ProbabilityTheory.uniformPdf(2, 1, 3)).toBe(0.5);

      // 区间外的点，PDF值应为0
      expect(ProbabilityTheory.uniformPdf(0, 1, 3)).toBe(0);
      expect(ProbabilityTheory.uniformPdf(4, 1, 3)).toBe(0);

      // 边界点
      expect(ProbabilityTheory.uniformPdf(1, 1, 3)).toBe(0.5);
      expect(ProbabilityTheory.uniformPdf(3, 1, 3)).toBe(0.5);
    });

    test('normalPdf 正态分布概率密度函数', () => {
      // 标准正态分布(μ=0,σ=1)在x=0处的PDF值
      const standardNormalAt0 = 1 / Math.sqrt(2 * Math.PI);
      expect(ProbabilityTheory.normalPdf(0, 0, 1)).toBeCloseTo(standardNormalAt0, 5);

      // 正态分布对称性检验
      const mu = 5;
      const sigma = 2;
      expect(ProbabilityTheory.normalPdf(mu - 1, mu, sigma))
        .toBeCloseTo(ProbabilityTheory.normalPdf(mu + 1, mu, sigma), 10);

      // 不同参数的正态分布
      expect(ProbabilityTheory.normalPdf(5, 5, 2)).toBeGreaterThan(
        ProbabilityTheory.normalPdf(7, 5, 2)
      );
    });

    test('binomialPmf 二项分布概率质量函数', () => {
      // 抛10次硬币，恰好5次正面的概率
      const probability = ProbabilityTheory.binomialPmf(5, 10, 0.5);
      expect(probability).toBeCloseTo(0.246, 3);

      // 边界情况
      expect(ProbabilityTheory.binomialPmf(0, 10, 0.5)).toBeCloseTo(0.001, 3);
      expect(ProbabilityTheory.binomialPmf(10, 10, 0.5)).toBeCloseTo(0.001, 3);

      // p=1的情况，n次全部成功的概率为1
      expect(ProbabilityTheory.binomialPmf(10, 10, 1)).toBe(1);

      // p=0的情况，n次全部失败的概率为1
      expect(ProbabilityTheory.binomialPmf(0, 10, 0)).toBe(1);
    });
  });

  describe('统计计算函数', () => {
    test('combination 组合数计算', () => {
      // C(5,2) = 10
      expect(ProbabilityTheory.combination(5, 2)).toBe(10);

      // C(10,0) = 1
      expect(ProbabilityTheory.combination(10, 0)).toBe(1);

      // C(10,10) = 1
      expect(ProbabilityTheory.combination(10, 10)).toBe(1);

      // C(20,10) = 184756
      expect(ProbabilityTheory.combination(20, 10)).toBeCloseTo(184756, 0);

      // 无效参数
      expect(ProbabilityTheory.combination(5, 6)).toBe(0);
      expect(ProbabilityTheory.combination(5, -1)).toBe(0);
    });

    test('expectedValue 期望值计算', () => {
      // 公平骰子的期望值 (1+2+3+4+5+6)/6 = 3.5
      const diceValues = [1, 2, 3, 4, 5, 6];
      const diceProbs = Array(6).fill(1 / 6);
      expect(ProbabilityTheory.expectedValue(diceValues, diceProbs)).toBeCloseTo(3.5, 10);

      // 不公平硬币的期望值
      const coinValues = [0, 1]; // 0=反面，1=正面
      const coinProbs = [0.7, 0.3]; // 30%概率正面
      expect(ProbabilityTheory.expectedValue(coinValues, coinProbs)).toBeCloseTo(0.3, 10);
    });
  });
});
