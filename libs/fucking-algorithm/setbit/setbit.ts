class BitSet {
  private readonly n: number;      // 全集元素数量（0 到 n-1）
  private value: number;           // 用整数表示集合（n<=31）

  /**
   * 创建位集合
   * @param n 全集大小（0 到 n-1）
   * @param initialValue 初始集合值（可选，默认为空集）
   */
  constructor(n: number, initialValue: number = 0) {
    if (n > 31) throw new Error("BitSet only supports n <= 31");
    this.n = n;
    this.value = initialValue & ((1 << n) - 1); // 确保在全集范围内
  }

  /* 核心集合操作 (返回新实例) */
  /** 交集：A ∩ B */
  intersection(other: BitSet): BitSet {
    this.validateSameN(other);
    return new BitSet(this.n, this.value & other.value);
  }

  /** 并集：A ∪ B */
  union(other: BitSet): BitSet {
    this.validateSameN(other);
    return new BitSet(this.n, this.value | other.value);
  }

  /** 对称差：A Δ B */
  symmetricDifference(other: BitSet): BitSet {
    this.validateSameN(other);
    return new BitSet(this.n, this.value ^ other.value);
  }

  /** 差集：A \ B */
  difference(other: BitSet): BitSet {
    this.validateSameN(other);
    return new BitSet(this.n, this.value & ~other.value);
  }

  /** 子集判断：A ⊆ B */
  isSubsetOf(other: BitSet): boolean {
    this.validateSameN(other);
    return (this.value & other.value) === this.value;
  }

  /* 元素级别操作 */
  /** 添加元素：S ∪ {i} */
  addElement(i: number): BitSet {
    this.validateElement(i);
    return new BitSet(this.n, this.value | (1 << i));
  }

  /** 移除元素：S \ {i} */
  removeElement(i: number): BitSet {
    this.validateElement(i);
    return new BitSet(this.n, this.value & ~(1 << i));
  }

  /** 检查包含：i ∈ S */
  contains(i: number): boolean {
    this.validateElement(i);
    return (this.value >> i & 1) === 1;
  }

  /** 删除最小元素（lowbit 操作） */
  removeLowest(): BitSet {
    return new BitSet(this.n, this.value & (this.value - 1));
  }

  /* 特殊集合 */
  /** 全集：U = {0, 1, ..., n-1} */
  static universe(n: number): BitSet {
    return new BitSet(n, (1 << n) - 1);
  }

  /** 空集：∅ */
  static empty(n: number): BitSet {
    return new BitSet(n, 0);
  }

  /** 单元素集合：{i} */
  static singleton(n: number, i: number): BitSet {
    const set = new BitSet(n);
    return set.addElement(i);
  }

  /** 补集：∁U S = U \ S */
  complement(): BitSet {
    return new BitSet(this.n, ~this.value & ((1 << this.n) - 1));
  }

  /* 枚举和迭代 */
  /** 获取集合所有元素 */
  *elements(): Generator<number> {
    let temp = this.value;
    while (temp) {
      const lowbit = temp & -temp;
      const i = Math.log2(lowbit);
      yield i;
      temp ^= lowbit;
    }
  }

  /** 枚举子集（从大到小，包含空集） */
  *subsets(): Generator<BitSet> {
    let subset = this.value;
    do {
      yield new BitSet(this.n, subset);
      subset = (subset - 1) & this.value;
    } while (subset !== this.value); // 防止无限循环
  }

  /** 枚举非空子集（从大到小） */
  *nonEmptySubsets(): Generator<BitSet> {
    let subset = this.value;
    while (subset) {
      yield new BitSet(this.n, subset);
      subset = (subset - 1) & this.value;
    }
  }

  /** 枚举超集（从小到大） */
  *supersets(): Generator<BitSet> {
    let s = this.value;
    while (s < (1 << this.n)) {
      yield new BitSet(this.n, s);
      s = (s + 1) | this.value;
    }
  }

  /* 实用方法 */
  /** 集合大小（元素个数） */
  size(): number {
    let count = 0;
    let temp = this.value;
    while (temp) {
      count++;
      temp &= temp - 1; // 清除最低位的1
    }
    return count;
  }

  /** 最小元素 */
  minElement(): number | null {
    if (this.value === 0) return null;
    return Math.log2(this.value & -this.value);
  }

  /** 最大元素 */
  maxElement(): number | null {
    if (this.value === 0) return null;
    return Math.floor(Math.log2(this.value));
  }

  /** 二进制表示（带前导0） */
  toString(): string {
    return this.value.toString(2).padStart(this.n, '0');
  }

  /** 集合内容可视化 */
  toSetString(): string {
    return `{${[...this.elements()].join(',')}}`;
  }

  /* 验证方法 */
  private validateSameN(other: BitSet): void {
    if (this.n !== other.n) throw new Error("Set size mismatch");
  }

  private validateElement(i: number): void {
    if (i < 0 || i >= this.n) throw new Error(`Element ${i} out of range [0, ${this.n - 1}]`);
  }
}