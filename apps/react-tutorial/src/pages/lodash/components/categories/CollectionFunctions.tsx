import React from 'react';
import FunctionCard from '../FunctionCard';
import { countBy, every, filter, find, groupBy, includes, map, orderBy, reduce } from 'lodash-es';

const CollectionFunctions: React.FC = () => {
  // 示例数据
  const users = [
    { 'user': 'barney', 'age': 36, 'active': true },
    { 'user': 'fred', 'age': 40, 'active': false },
    { 'user': 'pebbles', 'age': 1, 'active': true }
  ];

  const numbers = [1, 2, 3, 4, 5];

  return (
    <div className="collection-functions">
      <h2 className="category-title">集合操作函数</h2>
      <p>Lodash 提供了多种集合操作函数，可以处理数组和对象类型的集合。</p>

      <FunctionCard
        name="_.countBy"
        signature="_.countBy(collection, [iteratee=_.identity])"
        description="创建一个组成对象，key 是经过 iteratee 处理的集合的每个元素，value 是处理结果相同的元素的数量。"
        code={`import { countBy } from 'lodash-es';

// 统计数组中每个元素出现的次数
const array = [6.1, 4.2, 6.3];
const result1 = countBy(array, Math.floor);
// => { '4': 1, '6': 2 }

// 统计对象数组中某个属性的分布
const users = [
  { 'user': 'barney', 'active': true },
  { 'user': 'betty', 'active': true },
  { 'user': 'fred', 'active': false }
];
const result2 = countBy(users, 'active');
// => { 'true': 2, 'false': 1 }`}
        result={countBy(users, 'active')}
      />

      <FunctionCard
        name="_.every"
        signature="_.every(collection, [predicate=_.identity])"
        description="检查集合中的所有元素是否都通过了指定的断言测试。如果集合中的所有元素都通过了测试，则返回 true，否则返回 false。"
        code={`import { every } from 'lodash-es';

const users = [
  { 'user': 'barney', 'age': 36, 'active': true },
  { 'user': 'fred', 'age': 40, 'active': false }
];

// 检查是否所有用户都是活跃的
const result1 = every(users, { 'active': true });
// => false

// 检查是否所有用户年龄都大于30
const result2 = every(users, o => o.age > 30);
// => true`}
        result={every(users, o => o.age > 30)}
      />

      <FunctionCard
        name="_.filter"
        signature="_.filter(collection, [predicate=_.identity])"
        description="遍历集合中的元素，返回所有通过断言测试的元素组成的数组。"
        code={`import { filter } from 'lodash-es';

const users = [
  { 'user': 'barney', 'age': 36, 'active': true },
  { 'user': 'fred', 'age': 40, 'active': false },
  { 'user': 'pebbles', 'age': 1, 'active': true }
];

// 过滤出活跃用户
const result1 = filter(users, { 'active': true });
// => [{ 'user': 'barney', 'age': 36, 'active': true },
//     { 'user': 'pebbles', 'age': 1, 'active': true }]

// 过滤出年龄大于30的用户
const result2 = filter(users, o => o.age > 30);
// => [{ 'user': 'barney', 'age': 36, 'active': true },
//     { 'user': 'fred', 'age': 40, 'active': false }]`}
        result={filter(users, { 'active': true })}
      />

      <FunctionCard
        name="_.find"
        signature="_.find(collection, [predicate=_.identity], [fromIndex=0])"
        description="遍历集合中的元素，返回第一个通过断言测试的元素。"
        code={`import { find } from 'lodash-es';

const users = [
  { 'user': 'barney', 'age': 36, 'active': true },
  { 'user': 'fred', 'age': 40, 'active': false },
  { 'user': 'pebbles', 'age': 1, 'active': true }
];

// 查找第一个活跃用户
const result1 = find(users, { 'active': true });
// => { 'user': 'barney', 'age': 36, 'active': true }

// 查找第一个年龄大于30的用户
const result2 = find(users, o => o.age > 30);
// => { 'user': 'barney', 'age': 36, 'active': true }`}
        result={find(users, { 'active': true })}
      />

      <FunctionCard
        name="_.forEach"
        signature="_.forEach(collection, [iteratee=_.identity])"
        description="遍历集合中的元素，为每个元素执行迭代函数。与原生的 Array.prototype.forEach 不同，Lodash 的 forEach 可以遍历对象。"
        code={`import { forEach } from 'lodash-es';

// 遍历数组
forEach([1, 2], function(value) {
  console.log(value);
});
// => 输出: 1, 2

// 遍历对象
forEach({ 'a': 1, 'b': 2 }, function(value, key) {
  console.log(key, value);
});
// => 输出: 'a' 1, 'b' 2`}
        result="(无返回值，执行副作用操作)"
      />

      <FunctionCard
        name="_.groupBy"
        signature="_.groupBy(collection, [iteratee=_.identity])"
        description="创建一个对象，key 是经过 iteratee 处理的集合中每个元素的返回值，value 是产生该 key 的元素数组。"
        code={`import { groupBy } from 'lodash-es';

// 按照数字的整数部分分组
const result1 = groupBy([6.1, 4.2, 6.3], Math.floor);
// => { '4': [4.2], '6': [6.1, 6.3] }

// 按照字符串长度分组
const result2 = groupBy(['one', 'two', 'three'], 'length');
// => { '3': ['one', 'two'], '5': ['three'] }`}
        result={groupBy(['one', 'two', 'three'], 'length')}
      />

      <FunctionCard
        name="_.includes"
        signature="_.includes(collection, value, [fromIndex=0])"
        description="检查集合中是否包含指定的值。对于字符串，检查是否包含子字符串。"
        code={`import { includes } from 'lodash-es';

// 检查数组中是否包含某个值
const result1 = includes([1, 2, 3], 1);
// => true

// 检查对象的值中是否包含某个值
const result2 = includes({ 'a': 1, 'b': 2 }, 1);
// => true

// 检查字符串中是否包含子字符串
const result3 = includes('abcd', 'bc');
// => true`}
        result={includes([1, 2, 3], 1)}
      />

      <FunctionCard
        name="_.map"
        signature="_.map(collection, [iteratee=_.identity])"
        description="创建一个新数组，其中的值是对集合中的每个元素调用 iteratee 函数的结果。"
        code={`import { map } from 'lodash-es';

// 映射数组中的每个元素
const result1 = map([4, 8], n => n * n);
// => [16, 64]

// 映射对象数组中的特定属性
const users = [
  { 'user': 'barney' },
  { 'user': 'fred' }
];
const result2 = map(users, 'user');
// => ['barney', 'fred']`}
        result={map(users, 'user')}
      />

      <FunctionCard
        name="_.orderBy"
        signature="_.orderBy(collection, [iteratees=[_.identity]], [orders])"
        description="创建一个元素数组，按照指定的排序条件进行排序。支持多个排序条件和排序方向。"
        code={`import { orderBy } from 'lodash-es';

const users = [
  { 'user': 'fred',   'age': 48 },
  { 'user': 'barney', 'age': 34 },
  { 'user': 'fred',   'age': 40 },
  { 'user': 'barney', 'age': 36 }
];

// 按照 user 升序排序，然后按照 age 降序排序
const result = orderBy(users, ['user', 'age'], ['asc', 'desc']);
// => [
//   { 'user': 'barney', 'age': 36 },
//   { 'user': 'barney', 'age': 34 },
//   { 'user': 'fred',   'age': 48 },
//   { 'user': 'fred',   'age': 40 }
// ]`}
        result={orderBy(users, ['user', 'age'], ['asc', 'desc'])}
      />

      <FunctionCard
        name="_.reduce"
        signature="_.reduce(collection, [iteratee=_.identity], [accumulator])"
        description="对集合中的每个元素执行迭代函数，每次迭代的返回值会作为下一次迭代的累加器。"
        code={`import { reduce } from 'lodash-es';

// 计算数组元素的和
const result1 = reduce([1, 2, 3], (sum, n) => sum + n, 0);
// => 6

// 将对象数组转换为以某个属性为键的对象
const users = [
  { 'id': 1, 'user': 'barney' },
  { 'id': 2, 'user': 'fred' }
];
const result2 = reduce(users, (result, value) => {
  result[value.id] = value.user;
  return result;
}, {});
// => { '1': 'barney', '2': 'fred' }`}
        result={reduce(numbers, (sum, n) => sum + n, 0)}
      />
    </div>
  );
};

export default CollectionFunctions;
