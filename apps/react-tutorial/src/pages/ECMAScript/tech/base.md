# ECMAScript 规范核心概念技术文档

## 目录结构

1. ECMAScript 核心概念
   1.1 深浅拷贝实现及测试
   1.2 数组高阶函数实现
   1.3 函数词法作用域解析
   1.4 this绑定机制
   1.5 函数原型继承
   1.6 浏览器事件循环机制（含可视化）
   1.7 Promise 实现与扩展
   1.8 从 Promise 到 Async 的演变

2. 技术演示平台实现
   2.1 架构设计
   2.2 核心功能实现
   2.3 事件循环可视化

---

## 1. ECMAScript 核心概念

### 1.1 深浅拷贝实现及测试

**概念解析**：
- 浅拷贝：只复制对象的第一层属性
- 深拷贝：递归复制对象的所有层级

**手动实现**：
```javascript
// 浅拷贝实现
function shallowClone(source) {
  if (source === null || typeof source !== 'object') return source;
  const target = Array.isArray(source) ? [] : {};
  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = source[key];
    }
  }
  return target;
}

// 深拷贝实现
function deepClone(source, map = new WeakMap()) {
  if (source === null || typeof source !== 'object') return source;
  if (map.has(source)) return map.get(source);

  const target = Array.isArray(source) ? [] : {};
  map.set(source, target);

  for (let key in source) {
    if (source.hasOwnProperty(key)) {
      target[key] = deepClone(source[key], map);
    }
  }
  return target;
}
```

**测试用例**：
```javascript
// 测试对象
const obj = {
  a: 1,
  b: { c: 2 },
  d: [3, { e: 4 }]
};

// 循环引用
obj.circle = obj;

const shallow = shallowClone(obj);
const deep = deepClone(obj);

console.log('浅拷贝测试:', shallow.b === obj.b); // true
console.log('深拷贝测试:', deep.b === obj.b);     // false
console.log('循环引用测试:', deep.circle === deep); // true
```

### 1.2 数组高阶函数实现

**高阶函数实现**：
```javascript
// map 实现
Array.prototype.myMap = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    result.push(callback(this[i], i, this));
  }
  return result;
};

// filter 实现
Array.prototype.myFilter = function(callback) {
  const result = [];
  for (let i = 0; i < this.length; i++) {
    if (callback(this[i], i, this)) {
      result.push(this[i]);
    }
  }
  return result;
};

// reduce 实现
Array.prototype.myReduce = function(callback, initialValue) {
  let accumulator = initialValue !== undefined ? initialValue : this[0];
  let startIndex = initialValue !== undefined ? 0 : 1;

  for (let i = startIndex; i < this.length; i++) {
    accumulator = callback(accumulator, this[i], i, this);
  }
  return accumulator;
};
```

**测试用例**：
```javascript
const arr = [1, 2, 3, 4];

// map 测试
console.log(arr.myMap(x => x * 2)); // [2, 4, 6, 8]

// filter 测试
console.log(arr.myFilter(x => x > 2)); // [3, 4]

// reduce 测试
console.log(arr.myReduce((acc, cur) => acc + cur, 0)); // 10
```

### 1.3 函数词法作用域解析

**作用域链示例**：
```javascript
function outer() {
  const a = 10;

  function inner() {
    const b = 20;
    console.log(a + b); // 访问外部作用域变量
  }

  return inner;
}

const innerFn = outer();
innerFn(); // 30
```

**闭包原理**：
```javascript
function createCounter() {
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
```

### 1.4 this 绑定机制

**this 绑定规则**：
```javascript
// 默认绑定
function foo() {
  console.log(this.a);
}
foo(); // undefined (严格模式下) 或 window (非严格模式)

// 隐式绑定
const obj = {
  a: 2,
  foo: function() {
    console.log(this.a);
  }
};
obj.foo(); // 2

// 显式绑定
function bar() {
  console.log(this.a);
}
const obj2 = { a: 3 };
bar.call(obj2); // 3

// new 绑定
function Baz(a) {
  this.a = a;
}
const baz = new Baz(4);
console.log(baz.a); // 4
```

**手动实现 call/apply/bind**：
```javascript
// call 实现
Function.prototype.myCall = function(context, ...args) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context...args;
  delete context[fn];
  return result;
};

// apply 实现
Function.prototype.myApply = function(context, argsArray = []) {
  context = context || window;
  const fn = Symbol('fn');
  context[fn] = this;
  const result = context...argsArray;
  delete context[fn];
  return result;
};

// bind 实现
Function.prototype.myBind = function(context, ...args) {
  const self = this;
  return function(...innerArgs) {
    return self.apply(context, [...args, ...innerArgs]);
  };
};
```

### 1.5 函数原型继承

**原型继承实现**：
```javascript
// 构造函数继承
function Parent(name) {
  this.name = name;
}
Parent.prototype.sayName = function() {
  console.log(this.name);
};

function Child(name, age) {
  Parent.call(this, name);
  this.age = age;
}

// 原型链继承
Child.prototype = Object.create(Parent.prototype);
Child.prototype.constructor = Child;

// 添加子类方法
Child.prototype.sayAge = function() {
  console.log(this.age);
};

// 测试
const child = new Child('Alice', 10);
child.sayName(); // Alice
child.sayAge();  // 10
```

### 1.6 浏览器事件循环机制

**事件循环模型**：
```
   ┌───────────────────────┐
┌─>│       宏任务队列        │<───setTimeout/setInterval
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │       微任务队列        │<───Promise/MutationObserver
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │    requestAnimationFrame│
│  └──────────┬────────────┘
│  ┌──────────┴────────────┐
│  │   UI渲染/浏览器事件处理  │
│  └──────────┬────────────┘
└─────────────┘
```

**执行顺序示例**：
```javascript
console.log('script start');

setTimeout(() => {
  console.log('setTimeout');
}, 0);

Promise.resolve().then(() => {
  console.log('promise1');
}).then(() => {
  console.log('promise2');
});

console.log('script end');

// 输出顺序:
// script start
// script end
// promise1
// promise2
// setTimeout
```

### 1.7 Promise 实现与扩展

**Promise/A+ 规范实现**：
```javascript
class MyPromise {
  constructor(executor) {
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onFulfilledCallbacks = [];
    this.onRejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onFulfilledCallbacks.forEach(fn => fn());
      }
    };

    const reject = (reason) => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
    onRejected = typeof onRejected === 'function' ? onRejected : reason => { throw reason };

    const promise2 = new MyPromise((resolve, reject) => {
      const handleFulfilled = () => {
        setTimeout(() => {
          try {
            const x = onFulfilled(this.value);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      };

      const handleRejected = () => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            resolvePromise(promise2, x, resolve, reject);
          } catch (err) {
            reject(err);
          }
        });
      };

      if (this.state === 'fulfilled') {
        handleFulfilled();
      } else if (this.state === 'rejected') {
        handleRejected();
      } else {
        this.onFulfilledCallbacks.push(handleFulfilled);
        this.onRejectedCallbacks.push(handleRejected);
      }
    });

    return promise2;
  }

  catch(onRejected) {
    return this.then(null, onRejected);
  }

  static resolve(value) {
    return new MyPromise(resolve => resolve(value));
  }

  static reject(reason) {
    return new MyPromise((_, reject) => reject(reason));
  }
}

// 辅助函数
function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected'));
  }

  let called = false;
  if (x !== null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      const then = x.then;
      if (typeof then === 'function') {
        then.call(x, y => {
          if (called) return;
          called = true;
          resolvePromise(promise2, y, resolve, reject);
        }, r => {
          if (called) return;
          called = true;
          reject(r);
        });
      } else {
        resolve(x);
      }
    } catch (err) {
      if (called) return;
      called = true;
      reject(err);
    }
  } else {
    resolve(x);
  }
}
```

**Promise 扩展功能**：

```javascript
// 控制并发
function promisePool(promises, limit) {
  const results = [];
  let index = 0;
  let active = 0;

  return new Promise((resolve) => {
    function runNext() {
      if (index >= promises.length && active === 0) {
        resolve(results);
        return;
      }

      while (active < limit && index < promises.length) {
        const currentIndex = index++;
        const promise = promises[currentIndex];
        active++;

        Promise.resolve(promise())
          .then(result => {
            results[currentIndex] = result;
          })
          .catch(err => {
            results[currentIndex] = err;
          })
          .finally(() => {
            active--;
            runNext();
          });
      }
    }

    runNext();
  });
}

// 自动重试
function retry(fn, times = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      fn()
        .then(resolve)
        .catch(err => {
          if (n <= 1) {
            reject(err);
          } else {
            setTimeout(() => attempt(n - 1), delay);
          }
        });
    };
    attempt(times);
  });
}
```

### 1.8 从 Promise 到 Async 的演变

**Promise 到 Async/Await**：
```javascript
// Promise 链式调用
function fetchData() {
  return fetch('/api/data')
    .then(response => response.json())
    .then(data => {
      return fetch(`/api/details/${data.id}`);
    })
    .then(response => response.json())
    .catch(err => {
      console.error('Error:', err);
    });
}

// Async/Await 实现
async function fetchDataAsync() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    const detailResponse = await fetch(`/api/details/${data.id}`);
    const details = await detailResponse.json();
    return details;
  } catch (err) {
    console.error('Error:', err);
  }
}
```

**Async/Await 原理（基于 Generator）**：
```javascript
function asyncToGenerator(generatorFn) {
  return function() {
    const gen = generatorFn.apply(this, arguments);

    return new Promise((resolve, reject) => {
      function step(key, arg) {
        let result;
        try {
          result = genarg;
        } catch (err) {
          reject(err);
          return;
        }

        const { value, done } = result;
        if (done) {
          resolve(value);
        } else {
          return Promise.resolve(value)
            .then(val => step('next', val))
            .catch(err => step('throw', err));
        }
      }

      step('next');
    });
  };
}

// 使用示例
const fetchDataGenerator = asyncToGenerator(function* () {
  const response = yield fetch('/api/data');
  const data = yield response.json();
  const detailResponse = yield fetch(`/api/details/${data.id}`);
  const details = yield detailResponse.json();
  return details;
});
```

---

## 2. 技术演示平台实现

### 2.1 架构设计

**技术栈**：
- Vite + React + TypeScript
- Monaco Editor 代码编辑器
- React Flow 或 D3.js 用于可视化
- Jest + Testing Library 测试

**项目结构**：
```
/src
  /components
    /EventLoopVisualizer   # 事件循环可视化组件
    /CodeEditor            # Monaco 编辑器封装
    /PromiseDemo           # Promise 演示组件
    /ScopeDemo             # 作用域演示组件
  /pages
    /HomePage              # 主页面
    /EventLoopPage         # 事件循环页面
    /PromisePage           # Promise 页面
  /utils
    /promiseImplementations # Promise 实现
    /eventLoopSimulator     # 事件循环模拟器
  /tests
```

### 2.2 核心功能实现

**Monaco 编辑器封装组件**：
```tsx
import React, { useEffect, useRef } from 'react';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onChange: (value: string) => void;
  theme?: string;
  language?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  theme = 'vs-dark',
  language = 'javascript'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const editorInstance = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      editorInstance.current = monaco.editor.create(editorRef.current, {
        value: code,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
      });

      editorInstance.current.onDidChangeModelContent(() => {
        onChange(editorInstance.current?.getValue() || '');
      });
    }

    return () => {
      editorInstance.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (editorInstance.current && editorInstance.current.getValue() !== code) {
      editorInstance.current.setValue(code);
    }
  }, [code]);

  return <div ref={editorRef} style={{ height: '400px', width: '100%' }} />;
};

export default CodeEditor;
```

### 2.3 事件循环可视化

**事件循环可视化组件**：
```tsx
import React, { useState, useEffect, useRef } from 'react';
import { ReactFlowProvider, ReactFlow, addEdge, useNodesState, useEdgesState } from 'reactflow';
import 'reactflow/dist/style.css';

const EventLoopVisualizer = () => {
  const [tasks, setTasks] = useState<Array<{ id: string; type: 'macro' | 'micro'; content: string }>>([]);
  const [callStack, setCallStack] = useState<string[]>([]);
  const [output, setOutput] = useState<string[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const addTask = (type: 'macro' | 'micro', content: string) => {
    const id = `${type}-${Date.now()}`;
    setTasks(prev => [...prev, { id, type, content }]);

    // 添加可视化节点
    setNodes(prev => [
      ...prev,
      {
        id,
        data: { label: `${type === 'macro' ? '宏任务' : '微任务'}: ${content}` },
        position: { x: type === 'macro' ? 100 : 300, y: prev.length * 100 },
        style: {
          background: type === 'macro' ? '#ffd591' : '#b7eb8f',
          border: '1px solid #222',
          borderRadius: 5,
          padding: 10,
        },
      },
    ]);
  };

  const executeNextTask = () => {
    if (tasks.length === 0) return;

    const task = tasks[0];
    setCallStack(prev => [...prev, task.id]);

    // 模拟任务执行
    setTimeout(() => {
      setOutput(prev => [...prev, `执行 ${task.type === 'macro' ? '宏任务' : '微任务'}: ${task.content}`]);

      // 如果是微任务，执行后可能产生新的微任务
      if (task.type === 'micro' && Math.random() > 0.7) {
        addTask('micro', `来自 ${task.content} 的微任务`);
      }

      setCallStack(prev => prev.filter(id => id !== task.id));
      setTasks(prev => prev.slice(1));

      // 如果还有微任务，继续执行
      if (tasks.length > 0 && tasks[0].type === 'micro') {
        executeNextTask();
      }
    }, 1000);
  };

  return (
    <div className="event-loop-container">
      <h2>浏览器事件循环可视化</h2>

      <div className="controls">
        <button onClick={() => addTask('macro', 'setTimeout')}>添加宏任务</button>
        <button onClick={() => addTask('micro', 'Promise.then')}>添加微任务</button>
        <button onClick={executeNextTask}>执行下一个任务</button>
      </div>

      <div className="visualization">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <div className="call-stack">
              <h3>调用栈</h3>
              {callStack.map(id => (
                <div key={id} className="task">
                  {id}
                </div>
              ))}
            </div>
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      <div className="output">
        <h3>输出</h3>
        {output.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
};

export default EventLoopVisualizer;
```

**事件循环模拟器**：
```typescript
class EventLoopSimulator {
  private macroTasks: Array<{ type: string; callback: () => void }> = [];
  private microTasks: Array<{ type: string; callback: () => void }> = [];
  private callStack: string[] = [];
  private output: string[] = [];

  addMacroTask(type: string, callback: () => void) {
    this.macroTasks.push({ type, callback });
  }

  addMicroTask(type: string, callback: () => void) {
    this.microTasks.push({ type, callback });
  }

  run() {
    while (this.macroTasks.length > 0 || this.microTasks.length > 0) {
      // 先执行所有微任务
      while (this.microTasks.length > 0) {
        const task = this.microTasks.shift()!;
        this.callStack.push(`micro:${task.type}`);
        this.output.push(`执行微任务: ${task.type}`);
        task.callback();
        this.callStack.pop();
      }

      // 执行一个宏任务
      if (this.macroTasks.length > 0) {
        const task = this.macroTasks.shift()!;
        this.callStack.push(`macro:${task.type}`);
        this.output.push(`执行宏任务: ${task.type}`);
        task.callback();
        this.callStack.pop();
      }
    }
  }

  getOutput() {
    return this.output;
  }

  getCurrentState() {
    return {
      macroTasks: this.macroTasks.map(t => t.type),
      microTasks: this.microTasks.map(t => t.type),
      callStack: [...this.callStack],
    };
  }
}
```

---

## 总结

本文档详细介绍了 ECMAScript 核心概念及其实现，包括：

1. 深浅拷贝原理与实现
2. 数组高阶函数手动实现
3. 词法作用域与闭包机制
4. this 绑定规则及 call/apply/bind 实现
5. 原型继承系统
6. 浏览器事件循环机制及可视化实现
7. Promise/A+ 规范实现及扩展功能
8. 从 Promise 到 Async/Await 的演变

技术演示平台采用 Vite + React + TypeScript 架构，结合 Monaco Editor 提供交互式代码编辑体验，使用 React Flow 实现事件循环的可视化演示。通过这个平台，开发者可以深入理解 JavaScript 的核心机制，提升对异步编程、作用域、原型链等关键概念的理解。