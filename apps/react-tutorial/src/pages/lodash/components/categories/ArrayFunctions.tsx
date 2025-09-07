import React from 'react';
import FunctionCard from '../FunctionCard';
import { chunk, compact, concat, difference, drop, dropRight, fill, findIndex, flatten, flattenDeep } from 'lodash-es';

const ArrayFunctions: React.FC = () => {
  // 示例数据
  const numbers = [1, 2, 3, 4, 5];
  const messyArray = [0, 1, false, 2, '', 3, null, undefined, NaN, 4];
  const array1 = [1, 2];
  const array2 = [3, 4];
  const array3 = [2, 3];
  const nestedArray = [1, [2, [3, [4]], 5]];

  return (
    <div className="array-functions">
      <h2 className="category-title">数组操作函数</h2>
      <p>Lodash 提供了丰富的数组操作函数，用于简化数组处理逻辑。</p>

      <FunctionCard
        name="_.chunk"
        signature="_.chunk(array, [size=1])"
        description="将数组拆分为多个指定大小的子数组。当需要分页显示数据或批量处理数组元素时非常有用。"
        code={`import { chunk } from 'lodash-es';

const array = [1, 2, 3, 4, 5];
const result = chunk(array, 2);
// => [[1, 2], [3, 4], [5]]`}
        result={chunk(numbers, 2)}
      />

      <FunctionCard
        name="_.compact"
        signature="_.compact(array)"
        description={`创建一个新数组，移除原数组中所有的"假值"（false, null, 0, '', undefined, NaN）。`}
        code={`import { compact } from 'lodash-es';

const array = [0, 1, false, 2, '', 3, null, undefined, NaN, 4];
const result = compact(array);
// => [1, 2, 3, 4]`}
        result={compact(messyArray)}
      />

      <FunctionCard
        name="_.concat"
        signature="_.concat(array, [values])"
        description="创建一个新数组，将数组与其他值连接起来。类似于原生的 Array.prototype.concat，但是 Lodash 版本可以更方便地处理多个数组。"
        code={`import { concat } from 'lodash-es';

const array1 = [1, 2];
const array2 = [3, 4];
const result = concat(array1, array2);
// => [1, 2, 3, 4]

// 也可以添加单个值
const result2 = concat(array1, 2, [3], [[4]]);
// => [1, 2, 2, 3, [4]]`}
        result={concat(array1, array2)}
      />

      <FunctionCard
        name="_.difference"
        signature="_.difference(array, [values])"
        description="创建一个新数组，包含存在于第一个数组中但不存在于其他数组中的值。"
        code={`import { difference } from 'lodash-es';

const array1 = [1, 2];
const array2 = [2, 3];
const result = difference(array1, array2);
// => [1]`}
        result={difference(array1, array3)}
      />

      <FunctionCard
        name="_.drop"
        signature="_.drop(array, [n=1])"
        description="创建一个新数组，从开头删除 n 个元素。"
        code={`import { drop } from 'lodash-es';

const array = [1, 2, 3, 4, 5];
const result1 = drop(array);
// => [2, 3, 4, 5]

const result2 = drop(array, 3);
// => [4, 5]`}
        result={drop(numbers, 2)}
      />

      <FunctionCard
        name="_.dropRight"
        signature="_.dropRight(array, [n=1])"
        description="创建一个新数组，从末尾删除 n 个元素。"
        code={`import { dropRight } from 'lodash-es';

const array = [1, 2, 3, 4, 5];
const result1 = dropRight(array);
// => [1, 2, 3, 4]

const result2 = dropRight(array, 3);
// => [1, 2]`}
        result={dropRight(numbers, 2)}
      />

      <FunctionCard
        name="_.fill"
        signature="_.fill(array, value, [start=0], [end=array.length])"
        description="使用指定的值填充数组的元素，从开始索引到结束索引（不包括结束索引）。"
        code={`import { fill } from 'lodash-es';

const array = [1, 2, 3, 4, 5];
const result1 = fill([...array], '*');
// => ['*', '*', '*', '*', '*']

const result2 = fill([...array], '*', 1, 3);
// => [1, '*', '*', 4, 5]`}
        result={fill([...numbers], '*', 1, 3)}
      />

      <FunctionCard
        name="_.findIndex"
        signature="_.findIndex(array, [predicate=_.identity], [fromIndex=0])"
        description="返回数组中满足提供的测试函数的第一个元素的索引，如果没有找到则返回 -1。"
        code={`import { findIndex } from 'lodash-es';

const users = [
  { user: 'barney', active: false },
  { user: 'fred', active: false },
  { user: 'pebbles', active: true }
];

const result1 = findIndex(users, { user: 'fred', active: false });
// => 1

const result2 = findIndex(users, o => o.user === 'pebbles');
// => 2`}
        result={findIndex([
          { user: 'barney', active: false },
          { user: 'fred', active: false },
          { user: 'pebbles', active: true }
        ], { user: 'fred', active: false })}
      />

      <FunctionCard
        name="_.flatten"
        signature="_.flatten(array)"
        description="减少一级数组嵌套深度，将嵌套数组转换为一级数组。"
        code={`import { flatten } from 'lodash-es';

const array = [1, [2, [3, [4]], 5]];
const result = flatten(array);
// => [1, 2, [3, [4]], 5]`}
        result={flatten(nestedArray)}
      />

      <FunctionCard
        name="_.flattenDeep"
        signature="_.flattenDeep(array)"
        description="将数组递归地展平为一维数组，无论嵌套多少层。"
        code={`import { flattenDeep } from 'lodash-es';

const array = [1, [2, [3, [4]], 5]];
const result = flattenDeep(array);
// => [1, 2, 3, 4, 5]`}
        result={flattenDeep(nestedArray)}
      />
    </div>
  );
};

export default ArrayFunctions;
