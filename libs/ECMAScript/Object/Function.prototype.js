// https://juejin.cn/post/7535313355825905690
// 在Function原型上添加myCall方法
Function.prototype.myCall = function (context) {
  // 处理context为null/undefined的情况，此时this应指向全局对象
  if (context === null || context === undefined) {
    context = globalThis; // 浏览器环境是window，Node环境是global
  } else {
    // 将非对象类型转换为对象，确保可以添加属性
    context = Object(context);
  }
  // 生成一个唯一的属性名，避免覆盖context原有属性
  const fnKey = Symbol('fn');
  // 将当前函数（this）作为context的属性
  context[fnKey] = this;
  // 获取除了第一个参数之外的其他参数
  const args = [...arguments].slice(1);
  // 调用函数，此时函数内部的this会指向context
  const result = context[fnKey](...args);
  // 删除添加的属性，避免污染原对象
  delete context[fnKey];
  // 返回函数执行结果
  return result;
};
// 在Function原型上添加myApply方法
Function.prototype.myApply = function (context, argsArray) {
  // 处理context为null/undefined的情况，此时this应指向全局对象
  if (context === null || context === undefined) {
    context = globalThis; // 浏览器环境是window，Node环境是global
  } else {
    // 将非对象类型转换为对象，确保可以添加属性
    context = Object(context);
  }

  // 生成一个唯一的属性名，避免覆盖context原有属性
  const fnKey = Symbol('fn');

  // 将当前函数（this）作为context的属性
  context[fnKey] = this;

  // 处理参数：如果未传入参数数组或不是数组，使用空数组
  const args = Array.isArray(argsArray) ? argsArray : [];

  // 调用函数，此时函数内部的this会指向context，并传入参数数组
  const result = context[fnKey](...args);

  // 删除添加的属性，避免污染原对象
  delete context[fnKey];

  // 返回函数执行结果
  return result;
};

// 在Function原型上添加myBind方法
Function.prototype.myBind = function (context) {
  // 保存当前函数（this指向调用myBind的函数）
  const self = this;

  // 边界检查：确保调用者是函数
  if (typeof self !== 'function') {
    throw new TypeError('The bound object must be a function');
  }

  // 提取myBind的参数（除了第一个context外），用于柯里化
  const bindArgs = [...arguments].slice(1);

  // 定义返回的绑定函数
  const boundFunction = function () {
    // 提取新函数调用时的参数
    const callArgs = [...arguments];

    // 合并绑定参数和调用参数（柯里化）
    const allArgs = bindArgs.concat(callArgs);

    // 关键：判断是否通过new调用（实例化）
    // 如果是实例化，this应指向新创建的实例；否则指向context
    const isNew = this instanceof boundFunction;
    const targetContext = isNew ? this : context;

    // 调用原函数并返回结果
    return self.apply(targetContext, allArgs);
  };

  // 保持原函数的原型链（让实例能访问原函数原型上的属性）
  if (self.prototype) {
    boundFunction.prototype = Object.create(self.prototype);
    // 修复构造函数指向
    boundFunction.prototype.constructor = boundFunction;
  }

  return boundFunction;
};




// 测试示例
function greet(greeting, punctuation) {
  return `${greeting}, ${this.name}${punctuation}`;
}

(function (key) {
  let k = key;
  if (typeof process === 'object' && process.argv.length > 2) {
    k = process.argv[2];
  } else if (typeof window !== 'undefined') {
    k = window.location.href;
  } else {
    k = 'new';
  }
  switch (k) {
    case 'apply':
      // 使用原生apply
      console.log(greet.apply(person, ['Hello', '!'])); // 输出: "Hello, Alice!"

      // 使用我们实现的myApply
      console.log(greet.myApply(person, ['Hi', '?'])); // 输出: "Hi, Alice?"

      // 测试无参数情况
      console.log(greet.myApply(person)); // 输出: "undefined, Aliceundefined"

      // 测试context为null的情况
      console.log(greet.myApply(null, ['Hello', '.'])); // 输出: "Hello, undefined."
      break;
    case 'call':
      // 测试示例
      // 使用原生call
      console.log(greet.call(person, 'Hello', '!')); // 输出: "Hello, Alice!"

      // 使用我们实现的myCall
      console.log(greet.myCall(person, 'Hi', '?')); // 输出: "Hi, Alice?"

      // 测试context为null的情况
      console.log(greet.myCall(null, 'Hello', '.')); // 输出: "Hello, undefined." (非严格模式)
      break;
    case 'bind':
      // 测试示例
      function Person(name, age) {
        this.name = name;
        this.age = age;
      }

      Person.prototype.sayHi = function () {
        return `Hi, I'm ${this.name}, ${this.age} years old`;
      };

      // 测试1：基础绑定
      const obj = {};
      const BoundPerson = Person.myBind(obj, 'Alice');
      BoundPerson(20);
      console.log(obj); // { name: 'Alice', age: 20 }

      // 测试2：柯里化传参
      const BoundPerson2 = Person.myBind(null, 'Bob');
      const person2 = new BoundPerson2(25);
      console.log(person2.sayHi()); // "Hi, I'm Bob, 25 years old"

      // 测试3：实例化场景（this指向实例）
      const BoundPerson3 = Person.myBind(obj);
      const person3 = new BoundPerson3('Charlie', 30);
      console.log(person3.name); // "Charlie"（不影响obj）
      console.log(obj.name); // undefined（验证实例化时this正确指向实例）

      // 测试4：原型链继承
      console.log(person3 instanceof Person); // true（继承原函数原型）

      break;
    default:
      break;
  }
})();

