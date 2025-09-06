import React from 'react';
import FunctionCard from '../FunctionCard';
import { clamp, inRange } from 'lodash-es';

const NumberFunctions: React.FC = () => {
  return (
    <div className="number-functions">
      <h2 className="category-title">数字函数</h2>
      <p>Lodash 提供了一些用于处理数字的实用函数。</p>

      <FunctionCard
        name="_.clamp"
        signature="_.clamp(number, [lower], upper)"
        description="限制 number 在指定范围内。如果 number 小于 lower，则返回 lower；如果 number 大于 upper，则返回 upper；否则返回 number。"
        code={`import { clamp } from 'lodash-es';

const result1 = clamp(-10, -5, 5);
// => -5 (限制在 -5 到 5 之间)

const result2 = clamp(10, -5, 5);
// => 5 (限制在 -5 到 5 之间)

const result3 = clamp(3, -5, 5);
// => 3 (已经在范围内，保持不变)

// 如果只提供两个参数，则第一个参数是 number，第二个参数是 upper
const result4 = clamp(3, 5);
// => 3 (限制在 0 到 5 之间)

const result5 = clamp(10, 5);
// => 5 (限制在 0 到 5 之间)`}
        result={clamp(10, -5, 5)}
      />

      <FunctionCard
        name="_.inRange"
        signature="_.inRange(number, [start=0], end)"
        description="检查 number 是否在 start 和 end 之间，但不包括 end。如果 end 没有指定，那么 start 设置为 0。如果 start 大于 end，那么交换参数。"
        code={`import { inRange } from 'lodash-es';

const result1 = inRange(3, 2, 4);
// => true (3 在 2 到 4 之间，不包括 4)

const result2 = inRange(4, 8);
// => true (4 在 0 到 8 之间，不包括 8)

const result3 = inRange(4, 2);
// => false (4 不在 0 到 2 之间，不包括 2)

const result4 = inRange(2, 2);
// => false (2 不在 0 到 2 之间，不包括 2)

const result5 = inRange(1.2, 2);
// => true (1.2 在 0 到 2 之间，不包括 2)

// 如果 start 大于 end，则交换参数
const result6 = inRange(3, 4, 2);
// => true (3 在 2 到 4 之间，不包括 4)`}
        result={inRange(3, 2, 4)}
      />

      <FunctionCard
        name="_.random"
        signature="_.random([lower=0], [upper=1], [floating])"
        description="生成一个在指定范围内的随机数。如果只提供一个参数，则生成一个从 0 到提供数之间的随机数。如果 floating 为 true，或者 lower 或 upper 是浮点数，则返回浮点数。"
        code={`import { random } from 'lodash-es';

const result1 = random(0, 5);
// => 0 到 5 之间的整数

const result2 = random(5);
// => 0 到 5 之间的整数

const result3 = random(5, true);
// => 0 到 5 之间的浮点数

const result4 = random(1.2, 5.2);
// => 1.2 到 5.2 之间的浮点数

const result5 = random(1.2, 5.2, false);
// => 1.2 到 5.2 之间的整数`}
        result="(每次执行会得到不同的随机数)"
      />
    </div>
  );
};

export default NumberFunctions;
