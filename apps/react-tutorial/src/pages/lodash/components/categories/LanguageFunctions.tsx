import React from 'react';
import FunctionCard from '../FunctionCard';
import { clone, eq, isArray, isBoolean, isEmpty, isFunction, isNumber, isString, toArray, toNumber } from 'lodash-es';

const LanguageFunctions: React.FC = () => {
  return (
    <div className="language-functions">
      <h2 className="category-title">语言特性函数</h2>
      <p>Lodash 提供了许多用于类型检查和值转换的函数，帮助处理 JavaScript 语言特性。</p>

      <FunctionCard
        name="_.clone"
        signature="_.clone(value)"
        description="创建一个 value 的浅拷贝。这个方法会递归拷贝值，但不会递归拷贝对象的属性。"
        code={`import { clone } from 'lodash-es';

const objects = [{ 'a': 1 }, { 'b': 2 }];

const shallow = clone(objects);
console.log(shallow[0] === objects[0]);
// => true (对象引用相同)

// 与深拷贝的区别
const deep = _.cloneDeep(objects);
console.log(deep[0] === objects[0]);
// => false (对象引用不同)`}
        result="(需要比较对象引用)"
      />

      <FunctionCard
        name="_.eq"
        signature="_.eq(value, other)"
        description="执行 SameValueZero 比较，确定两个值是否相等。类似于严格相等运算符 (===)，但可以正确处理 NaN。"
        code={`import { eq } from 'lodash-es';

const object = { 'a': 1 };
const other = { 'a': 1 };

const result1 = eq(object, object);
// => true (相同引用)

const result2 = eq(object, other);
// => false (不同引用)

const result3 = eq('a', 'a');
// => true

const result4 = eq(NaN, NaN);
// => true (与 === 不同，=== 会返回 false)`}
        result={eq(NaN, NaN)}
      />

      <FunctionCard
        name="_.isArray"
        signature="_.isArray(value)"
        description="检查 value 是否是 Array 类型。等同于 Array.isArray。"
        code={`import { isArray } from 'lodash-es';

const result1 = isArray([1, 2, 3]);
// => true

const result2 = isArray('abc');
// => false

const result3 = isArray(document.body.children);
// => false (类数组对象)

const result4 = isArray(function() { return arguments; }());
// => false (类数组对象)`}
        result={isArray([1, 2, 3])}
      />

      <FunctionCard
        name="_.isBoolean"
        signature="_.isBoolean(value)"
        description="检查 value 是否是布尔值。"
        code={`import { isBoolean } from 'lodash-es';

const result1 = isBoolean(false);
// => true

const result2 = isBoolean(null);
// => false

const result3 = isBoolean(0);
// => false`}
        result={isBoolean(false)}
      />

      <FunctionCard
        name="_.isEmpty"
        signature="_.isEmpty(value)"
        description="检查 value 是否为空。集合（数组、Map、Set、对象等）的长度为 0 时为空。"
        code={`import { isEmpty } from 'lodash-es';

const result1 = isEmpty(null);
// => true

const result2 = isEmpty(true);
// => true

const result3 = isEmpty(1);
// => true

const result4 = isEmpty([1, 2, 3]);
// => false

const result5 = isEmpty({ 'a': 1 });
// => false

const result6 = isEmpty('');
// => true

const result7 = isEmpty('abc');
// => false`}
        result={isEmpty([])}
      />

      <FunctionCard
        name="_.isFunction"
        signature="_.isFunction(value)"
        description="检查 value 是否是 Function 类型。"
        code={`import { isFunction } from 'lodash-es';

const result1 = isFunction(function() {});
// => true

const result2 = isFunction(/abc/);
// => false

const result3 = isFunction(async () => {});
// => true

const result4 = isFunction(class {});
// => true`}
        result={isFunction(function() {})}
      />

      <FunctionCard
        name="_.isNumber"
        signature="_.isNumber(value)"
        description="检查 value 是否是 Number 类型。注意 NaN 也是一个数字。"
        code={`import { isNumber } from 'lodash-es';

const result1 = isNumber(3);
// => true

const result2 = isNumber(Number.MIN_VALUE);
// => true

const result3 = isNumber(Infinity);
// => true

const result4 = isNumber('3');
// => false

const result5 = isNumber(NaN);
// => true`}
        result={isNumber(3.14)}
      />

      <FunctionCard
        name="_.isString"
        signature="_.isString(value)"
        description="检查 value 是否是 String 类型。"
        code={`import { isString } from 'lodash-es';

const result1 = isString('abc');
// => true

const result2 = isString(1);
// => false

const result3 = isString(new String('abc'));
// => true`}
        result={isString('abc')}
      />

      <FunctionCard
        name="_.toArray"
        signature="_.toArray(value)"
        description="将 value 转换为数组。"
        code={`import { toArray } from 'lodash-es';

const result1 = toArray({ 'a': 1, 'b': 2 });
// => [1, 2]

const result2 = toArray('abc');
// => ['a', 'b', 'c']

const result3 = toArray(1);
// => []

const result4 = toArray(null);
// => []`}
        result={toArray('abc')}
      />

      <FunctionCard
        name="_.toNumber"
        signature="_.toNumber(value)"
        description="将 value 转换为数字。"
        code={`import { toNumber } from 'lodash-es';

const result1 = toNumber(3.2);
// => 3.2

const result2 = toNumber(Number.MIN_VALUE);
// => 5e-324

const result3 = toNumber(Infinity);
// => Infinity

const result4 = toNumber('3.2');
// => 3.2

const result5 = toNumber('');
// => 0`}
        result={toNumber('3.14')}
      />
    </div>
  );
};

export default LanguageFunctions;
