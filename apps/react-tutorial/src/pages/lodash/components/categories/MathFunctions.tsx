import React from 'react';
import FunctionCard from '../FunctionCard';
import { add, ceil, divide, floor, max, mean, min, multiply, round, subtract, sum } from 'lodash-es';

const MathFunctions: React.FC = () => {
  return (
    <div className="math-functions">
      <h2 className="category-title">数学函数</h2>
      <p>Lodash 提供了一系列数学计算函数，用于简化常见的数学操作。</p>

      <FunctionCard
        name="_.add"
        signature="_.add(augend, addend)"
        description="两个数相加。"
        code={`import { add } from 'lodash-es';

const result = add(6, 4);
// => 10`}
        result={add(6, 4)}
      />

      <FunctionCard
        name="_.ceil"
        signature="_.ceil(number, [precision=0])"
        description="向上舍入 number 到指定的精度。"
        code={`import { ceil } from 'lodash-es';

const result1 = ceil(4.006);
// => 5

// 指定精度
const result2 = ceil(4.006, 2);
// => 4.01

// 负数精度会舍入到指定的整数位
const result3 = ceil(6040, -2);
// => 6100`}
        result={ceil(4.006, 2)}
      />

      <FunctionCard
        name="_.divide"
        signature="_.divide(dividend, divisor)"
        description="两个数相除。"
        code={`import { divide } from 'lodash-es';

const result = divide(6, 3);
// => 2`}
        result={divide(6, 3)}
      />

      <FunctionCard
        name="_.floor"
        signature="_.floor(number, [precision=0])"
        description="向下舍入 number 到指定的精度。"
        code={`import { floor } from 'lodash-es';

const result1 = floor(4.906);
// => 4

// 指定精度
const result2 = floor(4.906, 2);
// => 4.9

// 负数精度会舍入到指定的整数位
const result3 = floor(6040, -2);
// => 6000`}
        result={floor(4.906, 2)}
      />

      <FunctionCard
        name="_.max"
        signature="_.max(array)"
        description="计算数组中的最大值。如果数组为空或假值，则返回 undefined。"
        code={`import { max } from 'lodash-es';

const result1 = max([4, 2, 8, 6]);
// => 8

const result2 = max([]);
// => undefined`}
        result={max([4, 2, 8, 6])}
      />

      <FunctionCard
        name="_.mean"
        signature="_.mean(array)"
        description="计算数组的平均值。"
        code={`import { mean } from 'lodash-es';

const result = mean([4, 2, 8, 6]);
// => 5`}
        result={mean([4, 2, 8, 6])}
      />

      <FunctionCard
        name="_.min"
        signature="_.min(array)"
        description="计算数组中的最小值。如果数组为空或假值，则返回 undefined。"
        code={`import { min } from 'lodash-es';

const result1 = min([4, 2, 8, 6]);
// => 2

const result2 = min([]);
// => undefined`}
        result={min([4, 2, 8, 6])}
      />

      <FunctionCard
        name="_.multiply"
        signature="_.multiply(multiplier, multiplicand)"
        description="两个数相乘。"
        code={`import { multiply } from 'lodash-es';

const result = multiply(6, 4);
// => 24`}
        result={multiply(6, 4)}
      />

      <FunctionCard
        name="_.round"
        signature="_.round(number, [precision=0])"
        description="四舍五入 number 到指定的精度。"
        code={`import { round } from 'lodash-es';

const result1 = round(4.006);
// => 4

// 指定精度
const result2 = round(4.006, 2);
// => 4.01

// 负数精度会舍入到指定的整数位
const result3 = round(6040, -2);
// => 6000`}
        result={round(4.006, 2)}
      />

      <FunctionCard
        name="_.subtract"
        signature="_.subtract(minuend, subtrahend)"
        description="两个数相减。"
        code={`import { subtract } from 'lodash-es';

const result = subtract(6, 4);
// => 2`}
        result={subtract(6, 4)}
      />

      <FunctionCard
        name="_.sum"
        signature="_.sum(array)"
        description="计算数组中值的总和。"
        code={`import { sum } from 'lodash-es';

const result = sum([4, 2, 8, 6]);
// => 20`}
        result={sum([4, 2, 8, 6])}
      />
    </div>
  );
};

export default MathFunctions;
