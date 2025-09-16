// 默认绑定示例
const defaultBindingCode = `// 默认绑定
function foo() {
  console.log(this.a);
}

var a = 'global';
foo(); // 'global' (非严格模式) 或 undefined (严格模式)`;

// 隐式绑定示例
const implicitBindingCode = `// 隐式绑定
const obj = {
  a: 2,
  foo: function() {
    console.log(this.a);
  }
};

obj.foo(); // 2

// 隐式绑定丢失
const bar = obj.foo;
bar(); // undefined (因为this指向全局对象或undefined)`;

// 显式绑定示例
const explicitBindingCode = `// 显式绑定
function bar() {
  console.log(this.a);
}

const obj2 = { a: 3 };
bar.call(obj2); // 3
bar.apply(obj2); // 3

// 硬绑定
const boundBar = bar.bind(obj2);
boundBar(); // 3`;

// new绑定示例
const newBindingCode = `// new 绑定
function Baz(a) {
  this.a = a;
}

const baz = new Baz(4);
console.log(baz.a); // 4`;

// 箭头函数绑定示例
const arrowFunctionCode = `// 箭头函数的this
const obj = {
  a: 5,
  foo: function() {
    // 这里的this指向obj
    console.log(this.a); // 5

    // 箭头函数的this继承自外层函数
    const arrowFn = () => {
      console.log(this.a); // 5
    };
    arrowFn();

    // 普通函数的this取决于调用方式
    function normalFn() {
      console.log(this.a); // undefined (因为this指向全局对象或undefined)
    }
    normalFn();
  }
};

obj.foo();`;

// 手动实现call/apply/bind
const implementationCode = `// call 实现
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...args);
  delete context[fn];
  return result;
};

// apply 实现
Function.prototype.myApply = function(context, argsArray = []) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context[fn](...argsArray);
  delete context[fn];
  return result;
};

// bind 实现
Function.prototype.myBind = function(context, ...args) {
  const self = this;
  return function(...innerArgs) {
    return self.apply(context, [...args, ...innerArgs]);
  };
};`;

// 测试代码
const testCode = `function greet(greeting, punctuation) {
  return greeting + ', ' + this.name + punctuation;
}

const person = { name: 'Alice' };

// 测试 myCall
console.log(greet.myCall(person, 'Hello', '!')); // "Hello, Alice!"

// 测试 myApply
console.log(greet.myApply(person, ['Hi', '?'])); // "Hi, Alice?"

// 测试 myBind
const boundGreet = greet.myBind(person, 'Hey');
console.log(boundGreet('~')); // "Hey, Alice~"`;

export {
  defaultBindingCode,
  implicitBindingCode,
  explicitBindingCode,
  newBindingCode,
  arrowFunctionCode,
  implementationCode,
  testCode
}