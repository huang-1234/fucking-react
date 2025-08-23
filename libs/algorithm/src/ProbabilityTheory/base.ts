
/**
 * @desc 概率论工具库
 * 支持常见概率分布计算、随机抽样、统计量计算及可视化
 */
class ProbabilityTheory {
  static getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static getRandomNumberInArray(array: number[]): number {
    return array[this.getRandomNumber(0, array.length - 1)];
  }

  /**
   * @desc 微信红包拆分算法
   * @param {number} m 总金额
   * @param {number} n 人数
   * @returns {number[]} 红包金额
   */
  static splitMoney(m: number, n: number): number[] {
    // 参数校验（确保每人至少0.01元）
    if (m < 0.01 * n) throw new Error('总金额不足，每人至少0.01元');

    // 转为分计算避免浮点误差[9,10]
    let remain = Math.round(m * 100);
    const packets = new Array(n)
    /**
     * @desc 前n-1个红包分配;动态计算安全上限（保证剩余金额足够分配）
     */
    for (let i = 0;i < n - 1;i++) {
      /** @desc 随机红包金额[1,safeMax] */
      const safeMax = remain - (n - i - 1);
      // 二倍均值
      const avg = remain / (n - i);
      const max = Math.min(safeMax, Math.floor(avg * 2));

      // 生成至少1分的随机金额[3,5]
      const amount = Math.floor(Math.random() * (max - 1)) + 1;
      packets[i] = amount;
      remain -= amount;
    }
    // 最后一个红包
    packets[n - 1] = remain;

    // 洗牌保证公平性（先抢后抢概率相同）
    for (let i = packets.length - 1;i > 0;i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [packets[i], packets[j]] = [packets[j], packets[i]];
    }
    // 转为元单位并保留两位小数
    // return packets.map(amount => (amount / 100).toFixed(2));
    return packets.map(amount => (amount / 100));
  }
  // ================= 概率分布计算 =================
  /**
   * @desc 均匀分布PDF
   * @param x 自变量值
   * @param a 下界
   * @param b 上界
   */
  static uniformPdf(x: number, a: number, b: number): number {
    return x >= a && x <= b ? 1 / (b - a) : 0;
  }

  /**
   * @desc 正态分布PDF
   * @param x 自变量值
   * @param mu 均值
   * @param sigma 标准差
   */
  static normalPdf(x: number, mu: number, sigma: number): number {
    const variance = sigma * sigma;
    const exponent = -Math.pow(x - mu, 2) / (2 * variance);
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(exponent);
  }

  /**
   * @desc 二项分布PMF
   * @param k 成功次数
   * @param n 试验次数
   * @param p 成功概率
   */
  static binomialPmf(k: number, n: number, p: number): number {
    const binomialCoeff = this.combination(n, k);
    return binomialCoeff * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  // ================= 统计计算 =================
  /**
   * @desc 计算组合数 C(n,k)
   */
  static combination(n: number, k: number): number {
    if (k > n || k < 0) return 0;
    if (k === 0 || k === n) return 1;

    let result = 1;
    for (let i = 1;i <= k;i++) {
      result = result * (n - i + 1) / i;
    }
    return result;
  }

  /**
   * @desc 计算期望值（离散分布）
   * @param values 取值数组
   * @param probabilities 概率数组
   */
  static expectedValue(values: number[], probabilities: number[]): number {
    return values.reduce((sum, val, i) =>
      sum + val * probabilities[i], 0);
  }

  // 生成分布数据点
  protected static generateDistributionData(
    dist: string,
    params: any
  ): [number, number][] {
    const points: [number, number][] = [];
    const range = this.getRange(dist, params);
    const step = (range[1] - range[0]) / 200;

    for (let x = range[0];x <= range[1];x += step) {
      let y = 0;
      switch (dist) {
        case 'normal':
          y = this.normalPdf(x, params.mu, params.sigma);
          break;
        case 'binomial':
          y = this.binomialPmf(Math.round(x), params.n, params.p);
          break;
        case 'uniform':
          y = this.uniformPdf(x, params.a, params.b);
          break;
      }
      points.push([x, y]);
    }
    return points;
  }

  // 获取分布范围
  private static getRange(dist: string, params: any): [number, number] {
    switch (dist) {
      case 'normal':
        return [params.mu - 4 * params.sigma, params.mu + 4 * params.sigma];
      case 'binomial':
        return [0, params.n];
      case 'uniform':
        return [params.a, params.b];
      default:
        return [-10, 10];
    }
  }
}

export default ProbabilityTheory;

export {
  ProbabilityTheory
}
