import React from 'react';
import FunctionCard from '../FunctionCard';
import { identity, noop, range, times, uniqueId, constant, defaultTo, isEqual, isNil, isObject } from 'lodash-es';

const UtilityFunctions: React.FC = () => {
  return (
    <div className="utility-functions">
      <h2 className="category-title">实用函数</h2>
      <p>Lodash 提供了许多实用工具函数，用于简化常见的编程任务。</p>

      <FunctionCard
        name="_.identity"
        signature="_.identity(value)"
        description="返回首个提供的参数。这个函数在函数式编程中很有用，常用作默认迭代器。"
        code={`import { identity } from 'lodash-es';

const result = identity(5);
// => 5

// 作为默认迭代器
const array = [1, 2, 3];
const mapped = array.map(identity);
// => [1, 2, 3]`}
        result={identity(5)}
      />

      <FunctionCard
        name="_.noop"
        signature="_.noop()"
        description="返回 undefined，不论传入什么参数。这个函数在需要一个空操作函数的地方很有用。"
        code={`import { noop } from 'lodash-es';

const result = noop();
// => undefined

// 作为默认回调函数
function doSomething(callback = noop) {
  // 执行一些操作...
  callback();
}

// 不需要检查 callback 是否存在`}
        result={noop()}
      />

      <FunctionCard
        name="_.range"
        signature="_.range([start=0], end, [step=1])"
        description="创建一个包含从 start 到 end 的数字的数组，但不包括 end。如果 start 是负数，而 end 或 step 没有指定，那么 step 为 -1。"
        code={`import { range } from 'lodash-es';

const result1 = range(4);
// => [0, 1, 2, 3]

const result2 = range(1, 5);
// => [1, 2, 3, 4]

const result3 = range(0, 20, 5);
// => [0, 5, 10, 15]

const result4 = range(0, -4, -1);
// => [0, -1, -2, -3]`}
        result={range(1, 10, 2)}
      />

      <FunctionCard
        name="_.times"
        signature="_.times(n, [iteratee=_.identity])"
        description="调用 iteratee n 次，返回每次调用结果组成的数组。iteratee 会传入从 0 到 n-1 的索引。"
        code={`import { times } from 'lodash-es';

// 创建一个包含 5 个元素的数组
const result1 = times(5, String);
// => ['0', '1', '2', '3', '4']

// 生成随机数数组
const result2 = times(3, () => Math.floor(Math.random() * 10));
// => [随机数, 随机数, 随机数]

// 创建对象数组
const result3 = times(3, index => ({ id: index }));
// => [{ id: 0 }, { id: 1 }, { id: 2 }]`}
        result={times(5, String)}
      />

      <FunctionCard
        name="_.uniqueId"
        signature="_.uniqueId([prefix=''])"
        description="生成一个唯一的 ID。如果提供了 prefix，会将前缀添加到 ID 前面。"
        code={`import { uniqueId } from 'lodash-es';

const result1 = uniqueId();
// => '1'

const result2 = uniqueId();
// => '2'

const result3 = uniqueId('contact_');
// => 'contact_3'

const result4 = uniqueId('item_');
// => 'item_4'`}
        result={uniqueId('lodash_')}
      />

      <FunctionCard
        name="_.constant"
        signature="_.constant(value)"
        description="创建一个返回 value 的函数。"
        code={`import { constant } from 'lodash-es';

const objects = [{ 'a': 1 }, { 'a': 2 }];

// 创建一个总是返回 false 的函数
const stubFalse = constant(false);

// 使用这个函数过滤数组
const filtered = objects.filter(stubFalse);
// => []`}
        result={constant({ 'a': 1 })()}
      />

      <FunctionCard
        name="_.defaultTo"
        signature="_.defaultTo(value, defaultValue)"
        description="如果 value 是 NaN, null, 或 undefined，则返回 defaultValue，否则返回 value。"
        code={`import { defaultTo } from 'lodash-es';

const result1 = defaultTo(1, 10);
// => 1

const result2 = defaultTo(undefined, 10);
// => 10

const result3 = defaultTo(null, 10);
// => 10

const result4 = defaultTo(NaN, 10);
// => 10`}
        result={defaultTo(undefined, 'default value')}
      />

      <FunctionCard
        name="_.isEqual"
        signature="_.isEqual(value, other)"
        description="执行深比较来确定两个值是否相等。支持比较数组、数组缓冲区、布尔值、日期对象、映射、数字、对象、正则表达式、集合、字符串、符号和类型化数组。"
        code={`import { isEqual } from 'lodash-es';

const object1 = { 'a': 1, 'b': 2, 'c': { 'd': 3 } };
const object2 = { 'a': 1, 'b': 2, 'c': { 'd': 3 } };
const object3 = { 'a': 1, 'b': 2, 'c': { 'd': 4 } };

const result1 = isEqual(object1, object2);
// => true

const result2 = isEqual(object1, object3);
// => false

const result3 = isEqual([1, 2, 3], [1, 2, 3]);
// => true`}
        result={isEqual({ 'a': 1, 'b': 2 }, { 'a': 1, 'b': 2 })}
      />

      <FunctionCard
        name="_.isNil"
        signature="_.isNil(value)"
        description="检查 value 是否是 null 或 undefined。"
        code={`import { isNil } from 'lodash-es';

const result1 = isNil(null);
// => true

const result2 = isNil(undefined);
// => true

const result3 = isNil(0);
// => false

const result4 = isNil('');
// => false`}
        result={isNil(null)}
      />

      <FunctionCard
        name="_.isObject"
        signature="_.isObject(value)"
        description="检查 value 是否是 Object 类型。函数、数组和对象都会返回 true，null 会返回 false。"
        code={`import { isObject } from 'lodash-es';

const result1 = isObject({});
// => true

const result2 = isObject([1, 2, 3]);
// => true

const result3 = isObject(Function);
// => true

const result4 = isObject(null);
// => false`}
        result={isObject({})}
      />
    </div>
  );
};

export default UtilityFunctions;
