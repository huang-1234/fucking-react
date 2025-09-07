import React from 'react';
import FunctionCard from '../FunctionCard';
import { assign, get, has, keys, merge, omit, pick } from 'lodash-es';

const ObjectFunctions: React.FC = () => {
  // 示例数据
  const object1 = { 'a': 1, 'b': 2 };
  const object2 = { 'c': 3, 'd': 4 };

  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'secret123',
    profile: {
      age: 30,
      address: {
        city: 'New York',
        zipCode: '10001'
      }
    }
  };

  return (
    <div className="object-functions">
      <h2 className="category-title">对象操作函数</h2>
      <p>Lodash 提供了丰富的对象操作函数，用于创建、修改、检查和转换对象。</p>

      <FunctionCard
        name="_.assign"
        signature="_.assign(object, [sources])"
        description="将所有可枚举的自有属性从一个或多个源对象分配到目标对象。它会返回目标对象。类似于 Object.assign。"
        code={`import { assign } from 'lodash-es';

const object1 = { 'a': 1, 'b': 2 };
const object2 = { 'c': 3, 'd': 4 };

const result = assign({}, object1, object2);
// => { 'a': 1, 'b': 2, 'c': 3, 'd': 4 }`}
        result={assign({}, object1, object2)}
      />

      <FunctionCard
        name="_.cloneDeep"
        signature="_.cloneDeep(value)"
        description="创建一个值的深拷贝。解决了 JavaScript 中对象引用导致的问题，确保复制的对象完全独立于原始对象。"
        code={`import { cloneDeep } from 'lodash-es';

const original = {
  a: 1,
  b: {
    c: 2,
    d: [3, 4, 5],
    e: { f: 6 }
  }
};

const copy = cloneDeep(original);

// 修改复制对象的嵌套属性不会影响原始对象
copy.b.c = 100;
copy.b.d.push(6);

console.log(original.b.c); // 仍然是 2
console.log(original.b.d); // 仍然是 [3, 4, 5]`}
        result="(需要比较修改前后的对象)"
      />

      <FunctionCard
        name="_.get"
        signature="_.get(object, path, [defaultValue])"
        description="获取对象路径上的值。如果解析值为 undefined，则返回 defaultValue。安全地访问嵌套属性，避免 'Cannot read property of undefined' 错误。"
        code={`import { get } from 'lodash-es';

const object = { 'a': [{ 'b': { 'c': 3 } }] };

// 安全地获取嵌套属性
const result1 = get(object, 'a[0].b.c');
// => 3

// 使用点符号路径
const result2 = get(object, 'a.0.b.c');
// => 3

// 当属性不存在时，返回默认值
const result3 = get(object, 'a.b.c', 'default');
// => 'default'`}
        result={get(user, 'profile.address.city', 'Unknown')}
      />

      <FunctionCard
        name="_.has"
        signature="_.has(object, path)"
        description="检查路径是否是对象的直接属性。"
        code={`import { has } from 'lodash-es';

const object = { 'a': { 'b': 2 } };

const result1 = has(object, 'a');
// => true

const result2 = has(object, 'a.b');
// => true

const result3 = has(object, ['a', 'b']);
// => true

const result4 = has(object, 'c');
// => false`}
        result={has(user, 'profile.address.city')}
      />

      <FunctionCard
        name="_.keys"
        signature="_.keys(object)"
        description="创建一个对象自身可枚举属性名组成的数组。类似于 Object.keys。"
        code={`import { keys } from 'lodash-es';

const object = { 'a': 1, 'b': 2, 'c': 3 };

const result = keys(object);
// => ['a', 'b', 'c']`}
        result={keys(object1)}
      />

      <FunctionCard
        name="_.merge"
        signature="_.merge(object, [sources])"
        description="递归合并来源对象的自身和继承的可枚举属性到目标对象。与 _.assign 不同，_.merge 会递归合并源对象的嵌套属性。"
        code={`import { merge } from 'lodash-es';

const object1 = {
  'a': [{ 'b': 2 }, { 'd': 4 }]
};

const object2 = {
  'a': [{ 'c': 3 }, { 'e': 5 }]
};

const result = merge({}, object1, object2);
// => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }`}
        result={merge({},
          { a: [{ b: 2 }, { d: 4 }] },
          { a: [{ c: 3 }, { e: 5 }] }
        )}
      />

      <FunctionCard
        name="_.omit"
        signature="_.omit(object, [paths])"
        description="创建一个对象，这个对象由忽略属性之外的 object 自身和继承的可枚举属性组成。常用于移除对象中的敏感信息。"
        code={`import { omit } from 'lodash-es';

const object = { 'a': 1, 'b': 2, 'c': 3 };

const result = omit(object, ['a', 'c']);
// => { 'b': 2 }

// 用于移除敏感信息
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  password: 'secret123'
};

const safeUser = omit(user, ['password']);
// => { id: 1, name: 'John', email: 'john@example.com' }`}
        result={omit(user, ['password', 'email'])}
      />

      <FunctionCard
        name="_.pick"
        signature="_.pick(object, [paths])"
        description="创建一个从 object 中选中的属性的对象。与 _.omit 相反，它只保留指定的属性。"
        code={`import { pick } from 'lodash-es';

const object = { 'a': 1, 'b': 2, 'c': 3 };

const result = pick(object, ['a', 'c']);
// => { 'a': 1, 'c': 3 }

// 用于创建只包含必要信息的对象
const user = {
  id: 1,
  name: 'John',
  email: 'john@example.com',
  profile: {
    age: 30,
    address: '123 Main St'
  }
};

const basicInfo = pick(user, ['name', 'email']);
// => { name: 'John', email: 'john@example.com' }`}
        result={pick(user, ['name', 'profile.age'])}
      />

      <FunctionCard
        name="_.set"
        signature="_.set(object, path, value)"
        description="设置对象路径上的值。如果路径的部分不存在，则创建它们。"
        code={`import { set } from 'lodash-es';

const object = { 'a': [{ 'b': { 'c': 3 } }] };

// 设置嵌套属性的值
set(object, 'a[0].b.c', 4);
console.log(object.a[0].b.c);
// => 4

// 创建不存在的路径
set(object, 'x.y.z', 5);
console.log(object.x.y.z);
// => 5`}
        result="(修改原对象，需要查看修改后的对象)"
      />
    </div>
  );
};

export default ObjectFunctions;
