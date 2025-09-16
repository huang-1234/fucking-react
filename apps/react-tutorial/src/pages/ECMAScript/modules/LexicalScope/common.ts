
// 词法作用域示例代码
export const lexicalScopeCode = `function outer() {
  const a = 10;

  function inner() {
    const b = 20;
    console.log(a + b); // 访问外部作用域变量
  }

  return inner;
}

const innerFn = outer();
innerFn(); // 输出: 30`;

// 闭包示例代码
export const closureCode = `function createCounter() {
  let count = 0;

  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.decrement()); // 1`;

// 作用域链示例
export const scopeChainCode = `var global = 'global';

function outer() {
  var outerVar = 'outer';

  function middle() {
    var middleVar = 'middle';

    function inner() {
      var innerVar = 'inner';

      console.log(innerVar);   // 'inner' - 当前作用域
      console.log(middleVar);  // 'middle' - 父级作用域
      console.log(outerVar);   // 'outer' - 祖父级作用域
      console.log(global);     // 'global' - 全局作用域
    }

    inner();
  }

  middle();
}

outer();`;

// 块级作用域示例
export const blockScopeCode = `function blockScopeDemo() {
  // var 声明的变量没有块级作用域
  if (true) {
    var varVariable = 'var变量';
    let letVariable = 'let变量';
    const constVariable = 'const变量';
  }

  console.log(varVariable);     // 'var变量' - 可访问
  console.log(letVariable);     // ReferenceError: letVariable is not defined
  console.log(constVariable);   // ReferenceError: constVariable is not defined
}

blockScopeDemo();`;
