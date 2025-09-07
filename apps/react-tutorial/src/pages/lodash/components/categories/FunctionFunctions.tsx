import React from 'react';
import FunctionCard from '../FunctionCard';
import { debounce, throttle, memoize, once, curry, partial, delay } from 'lodash-es';

const FunctionFunctions: React.FC = () => {
  return (
    <div className="function-functions">
      <h2 className="category-title">函数操作</h2>
      <p>Lodash 提供了一系列函数操作工具，用于控制函数的执行方式和时机。</p>

      <FunctionCard
        name="_.debounce"
        signature="_.debounce(func, [wait=0], [options={}])"
        description="创建一个防抖函数，该函数会在等待 wait 毫秒后调用 func。如果在等待期间再次调用防抖函数，则重新计时。防抖函数适用于处理用户输入、窗口大小调整等事件。"
        code={`import { debounce } from 'lodash-es';

// 创建一个防抖函数，延迟1000毫秒执行
const debouncedSave = debounce(function(text) {
  console.log('Saving data:', text);
}, 1000);

// 快速连续调用
debouncedSave('Draft 1');
debouncedSave('Draft 2');
debouncedSave('Final Draft');

// 只有最后一次调用会在1000毫秒后执行
// => 输出: 'Saving data: Final Draft'

// 可选参数
const debouncedFn = debounce(func, 1000, {
  leading: true,   // 是否在延迟开始前调用函数
  trailing: true,  // 是否在延迟结束后调用函数
  maxWait: 5000    // 函数允许延迟的最大时间
});`}
        result="(函数创建后需要调用才能看到效果)"
      />

      <FunctionCard
        name="_.throttle"
        signature="_.throttle(func, [wait=0], [options={}])"
        description="创建一个节流函数，在 wait 毫秒内最多执行 func 一次。节流函数非常适合处理滚动事件、游戏中的按键处理等需要限制执行频率的场景。"
        code={`import { throttle } from 'lodash-es';

// 创建一个节流函数，每100毫秒最多执行一次
const throttledScroll = throttle(function() {
  console.log('Scroll event handled at:', new Date().toISOString());
}, 100);

// 添加到滚动事件
// window.addEventListener('scroll', throttledScroll);

// 可选参数
const throttledFn = throttle(func, 100, {
  leading: true,  // 是否在节流开始前调用函数
  trailing: true  // 是否在节流结束后调用函数
});`}
        result="(函数创建后需要调用才能看到效果)"
      />

      <FunctionCard
        name="_.memoize"
        signature="_.memoize(func, [resolver])"
        description="创建一个会缓存 func 结果的函数。如果提供了 resolver，则用它的返回值作为缓存的键。默认情况下，第一个参数作为缓存键。memoize 函数适用于优化计算密集型函数。"
        code={`import { memoize } from 'lodash-es';

// 创建一个记忆化的斐波那契函数
const fibonacci = memoize(function(n) {
  return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(10)); // 快速计算，不会重复计算子问题
// => 55

// 使用自定义解析器
const getUser = memoize(
  function(id) {
    return { id: id, name: 'user' + id };
  },
  function(id) {
    return 'user_' + id; // 自定义缓存键
  }
);`}
        result="(函数创建后需要调用才能看到效果)"
      />

      <FunctionCard
        name="_.once"
        signature="_.once(func)"
        description="创建一个只能调用一次的函数。重复调用返回第一次调用的结果。once 函数适用于初始化、单次事件处理等场景。"
        code={`import { once } from 'lodash-es';

// 创建一个只能调用一次的初始化函数
const initialize = once(function() {
  console.log('Initializing...');
  return { initialized: true };
});

const result1 = initialize(); // 执行初始化
// => 输出: 'Initializing...'
// => 返回: { initialized: true }

const result2 = initialize(); // 不会再次执行函数体
// => 返回: { initialized: true }，直接返回第一次的结果`}
        result="(函数创建后需要调用才能看到效果)"
      />

      <FunctionCard
        name="_.curry"
        signature="_.curry(func, [arity=func.length])"
        description="创建一个函数，该函数接收一个或多个 func 的参数。当提供的参数数量小于原函数所需的参数数量时，返回一个接受剩余参数的新函数。柯里化在函数式编程中非常有用。"
        code={`import { curry } from 'lodash-es';

// 创建一个接受三个参数的函数
function add(a, b, c) {
  return a + b + c;
}

// 柯里化这个函数
const curriedAdd = curry(add);

// 可以一次性提供所有参数
console.log(curriedAdd(1, 2, 3));
// => 6

// 或者分步提供参数
const add1 = curriedAdd(1);
const add1and2 = add1(2);
const result = add1and2(3);
console.log(result);
// => 6

// 也可以混合使用
console.log(curriedAdd(1)(2, 3));
// => 6`}
        result={curry((a: number, b: number, c: number) => a + b + c)(1)(2)(3)}
      />

      <FunctionCard
        name="_.partial"
        signature="_.partial(func, [partials])"
        description="创建一个函数，该函数调用 func，并预设部分参数。partial 函数在需要固定某些参数时非常有用。"
        code={`import { partial } from 'lodash-es';

// 创建一个基础函数
function greet(greeting, name) {
  return \`\${greeting}, \${name}!\`;
}

// 创建一个预设了第一个参数的函数
const sayHello = partial(greet, 'Hello');
console.log(sayHello('John'));
// => 'Hello, John!'

// 使用占位符
const greetJohn = partial(greet, _, 'John');
console.log(greetJohn('Hi'));
// => 'Hi, John!'`}
        result={partial((greeting: string, name: string) => `${greeting}, ${name}!`, 'Hello')('John')}
      />

      <FunctionCard
        name="_.delay"
        signature="_.delay(func, wait, [args])"
        description="延迟 wait 毫秒后调用 func。任何附加的参数会传给 func。"
        code={`import { delay } from 'lodash-es';

// 延迟1000毫秒后调用函数
delay(function(text) {
  console.log(text);
}, 1000, 'later');
// => 1000毫秒后输出: 'later'`}
        result="(函数调用后需要等待才能看到效果)"
      />
    </div>
  );
};

export default FunctionFunctions;
