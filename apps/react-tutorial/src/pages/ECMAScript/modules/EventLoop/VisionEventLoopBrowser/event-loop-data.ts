// 定义任务类型
export interface Task {
  id: string;
  type: 'sync' | 'macro' | 'micro';
  content: string;
  status: 'waiting' | 'executing' | 'completed';
  code?: string;
}

// 定义每个步骤的状态
export interface EventLoopStep {
  description: string;
  explanation: string;
  callStack: Task[];
  macroTaskQueue: Task[];
  microTaskQueue: Task[];
  output?: string;
  code: string;
}

// 事件循环的步骤数据
export const eventLoopSteps: EventLoopStep[] = [
  // 步骤1: 开始执行
  {
    description: "初始状态",
    explanation: "JavaScript引擎开始执行代码，准备处理同步任务。",
    callStack: [],
    macroTaskQueue: [
      { id: "script", type: "sync", content: "全局脚本", status: "waiting" }
    ],
    microTaskQueue: [],
    code: `console.log('start');`
  },

  // 步骤2: 执行console.log('start')
  {
    description: "执行同步任务: console.log('start')",
    explanation: "执行第一个同步任务，输出'start'。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [],
    microTaskQueue: [],
    output: "start",
    code: `console.log('start');`
  },

  // 步骤3: 遇到Promise.resolve().then()
  {
    description: "遇到Promise.resolve().then()",
    explanation: "创建一个已解决的Promise，并将then回调加入微任务队列。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    code: `Promise.resolve().then(() => {
  setTimeout(() => {
    console.log('1 timer task promise 1 then setTimeout 2');
  }, 0);
});`
  },

  // 步骤4: 遇到setTimeout
  {
    description: "遇到setTimeout",
    explanation: "将setTimeout回调加入宏任务队列。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    code: `setTimeout(() => {
  console.log('===== timer task =====');
}, 0);`
  },

  // 步骤5: 定义async1函数
  {
    description: "定义async1函数",
    explanation: "定义async1函数，但尚未执行。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    code: `async function async1() {
  console.log('sync task: async1 start');
  await async2();
  // 这是一个一阶微任务，在async2执行完之后执行
  console.log('1 promise then resolve 1');
}`
  },

  // 步骤6: 定义async2函数
  {
    description: "定义async2函数",
    explanation: "定义async2函数，但尚未执行。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    code: `async function async2() {
  console.log('sync task: async2 start');
}`
  },

  // 步骤7: 定义async3函数
  {
    description: "定义async3函数",
    explanation: "定义async3函数，但尚未执行。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    code: `async function async3() {
  console.log('sync task: async3 start');
  await async4();
  console.log('2222 await async4 end promise then resolve 3');
}`
  },

  // 步骤8: 定义async4函数
  {
    description: "定义async4函数",
    explanation: "定义async4函数，但尚未执行。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    code: `async function async4() {
  return new Promise((resolve) => {
    console.log('sync task: async4 start');
    setTimeout(() => {
      console.log('1 timer task async4 setTimeout 4');
    }, 0);
    resolve();
  }).then(() => {
    console.log('1 promise then resolve 2');
    new Promise((resolve) => {
      resolve();
    }).then(() => {
      // 这是一个二阶微任务，并不是一个三阶微任务
      console.log('2 promise then resolve 1: 插队成功');
    }).then(() => {
      console.log('2 promise then resolve 2: 插队失败， 放入队尾');
    });
  }).then(() => {
    console.log('2 promise then resolve 1');
  });
}`
  },

  // 步骤9: 调用async1函数
  {
    description: "调用async1函数",
    explanation: "调用async1函数，将其加入调用栈。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" },
      { id: "async1", type: "sync", content: "async1函数", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    output: "sync task: async1 start",
    code: `async1();`
  },

  // 步骤10: 执行async1内部代码
  {
    description: "执行async1内部代码",
    explanation: "输出'sync task: async1 start'，然后调用async2函数。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" },
      { id: "async1", type: "sync", content: "async1函数", status: "executing" },
      { id: "async2", type: "sync", content: "async2函数", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" }
    ],
    output: "sync task: async2 start",
    code: `console.log('sync task: async1 start');
await async2();`
  },

  // 步骤11: async2函数执行完毕
  {
    description: "async2函数执行完毕",
    explanation: "async2函数执行完毕，返回一个已解决的Promise。await表达式会将后续代码加入微任务队列。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" }
    ],
    code: `// async2函数执行完毕，await后的代码被放入微任务队列`
  },

  // 步骤12: 调用async3函数
  {
    description: "调用async3函数",
    explanation: "调用async3函数，将其加入调用栈。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" },
      { id: "async3", type: "sync", content: "async3函数", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" }
    ],
    output: "sync task: async3 start",
    code: `async3();`
  },

  // 步骤13: 执行async3内部代码
  {
    description: "执行async3内部代码",
    explanation: "输出'sync task: async3 start'，然后调用async4函数。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" },
      { id: "async3", type: "sync", content: "async3函数", status: "executing" },
      { id: "async4", type: "sync", content: "async4函数", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" }
    ],
    output: "sync task: async4 start",
    code: `console.log('sync task: async3 start');
await async4();`
  },

  // 步骤14: 执行async4内部代码
  {
    description: "执行async4内部代码",
    explanation: "创建一个新的Promise，输出'sync task: async4 start'，设置一个setTimeout，然后resolve Promise。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" },
      { id: "timeout2", type: "macro", content: "async4中的setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" },
      { id: "async4-then1", type: "micro", content: "async4中的第一个then回调", status: "waiting" }
    ],
    code: `return new Promise((resolve) => {
  console.log('sync task: async4 start');
  setTimeout(() => {
    console.log('1 timer task async4 setTimeout 4');
  }, 0);
  resolve();
})`
  },

  // 步骤15: 创建新的Promise
  {
    description: "创建新的Promise",
    explanation: "执行new Promise()，并立即resolve。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" },
      { id: "timeout2", type: "macro", content: "async4中的setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" },
      { id: "async4-then1", type: "micro", content: "async4中的第一个then回调", status: "waiting" },
      { id: "promise2-then1", type: "micro", content: "新Promise的then回调", status: "waiting" },
      { id: "promise2-then2", type: "micro", content: "新Promise的第二个then回调", status: "waiting" }
    ],
    code: `new Promise((resolve) => {
  resolve();
}).then(() => {
  console.log('1 promise then resolve 3');
  setTimeout(() => {
    console.log('2 timer task async4 setTimeout 4');
  }, 0);
}).then(() => {
  console.log('2 promise then resolve 2');
  new Promise((resolve) => {
    resolve();
  }).then(() => {
    console.log('22 promise then resolve 1: 插队成功');
  }).then(() => {
    console.log('22 promise then resolve 2: 插队失败， 放入队尾');
  });
});`
  },

  // 步骤16: 添加最后一个Promise
  {
    description: "添加最后一个Promise",
    explanation: "添加Promise.resolve().then()到微任务队列。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" },
      { id: "timeout2", type: "macro", content: "async4中的setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" },
      { id: "async4-then1", type: "micro", content: "async4中的第一个then回调", status: "waiting" },
      { id: "promise2-then1", type: "micro", content: "新Promise的then回调", status: "waiting" },
      { id: "promise2-then2", type: "micro", content: "新Promise的第二个then回调", status: "waiting" },
      { id: "promise3", type: "micro", content: "最后一个Promise.then回调", status: "waiting" }
    ],
    code: `Promise.resolve().then(() => {
  console.log('1 promise then resolve 4');
});`
  },

  // 步骤17: 执行console.log('end')
  {
    description: "执行console.log('end')",
    explanation: "执行最后一个同步任务，输出'end'。",
    callStack: [
      { id: "script", type: "sync", content: "全局脚本", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" },
      { id: "timeout2", type: "macro", content: "async4中的setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" },
      { id: "async4-then1", type: "micro", content: "async4中的第一个then回调", status: "waiting" },
      { id: "promise2-then1", type: "micro", content: "新Promise的then回调", status: "waiting" },
      { id: "promise2-then2", type: "micro", content: "新Promise的第二个then回调", status: "waiting" },
      { id: "promise3", type: "micro", content: "最后一个Promise.then回调", status: "waiting" }
    ],
    output: "end",
    code: `console.log('end');`
  },

  // 步骤18: 同步代码执行完毕，开始执行微任务
  {
    description: "同步代码执行完毕，开始执行微任务",
    explanation: "全局脚本执行完毕，调用栈清空，开始执行微任务队列中的任务。",
    callStack: [],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" },
      { id: "timeout2", type: "macro", content: "async4中的setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "waiting" },
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" },
      { id: "async4-then1", type: "micro", content: "async4中的第一个then回调", status: "waiting" },
      { id: "promise2-then1", type: "micro", content: "新Promise的then回调", status: "waiting" },
      { id: "promise2-then2", type: "micro", content: "新Promise的第二个then回调", status: "waiting" },
      { id: "promise3", type: "micro", content: "最后一个Promise.then回调", status: "waiting" }
    ],
    code: `// 同步代码执行完毕，开始执行微任务`
  },

  // 步骤19: 执行第一个微任务
  {
    description: "执行第一个微任务",
    explanation: "执行Promise.resolve().then回调，将setTimeout加入宏任务队列。",
    callStack: [
      { id: "promise1", type: "micro", content: "Promise.resolve().then回调", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" },
      { id: "timeout2", type: "macro", content: "async4中的setTimeout回调", status: "waiting" },
      { id: "timeout3", type: "macro", content: "Promise.then中的setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "waiting" },
      { id: "async4-then1", type: "micro", content: "async4中的第一个then回调", status: "waiting" },
      { id: "promise2-then1", type: "micro", content: "新Promise的then回调", status: "waiting" },
      { id: "promise2-then2", type: "micro", content: "新Promise的第二个then回调", status: "waiting" },
      { id: "promise3", type: "micro", content: "最后一个Promise.then回调", status: "waiting" }
    ],
    code: `setTimeout(() => {
  console.log('1 timer task promise 1 then setTimeout 2');
}, 0);`
  },

  // 步骤20: 执行async1 await后续代码
  {
    description: "执行async1 await后续代码",
    explanation: "执行async1函数中await后的代码。",
    callStack: [
      { id: "async1-await", type: "micro", content: "async1 await后续代码", status: "executing" }
    ],
    macroTaskQueue: [
      { id: "timeout1", type: "macro", content: "setTimeout回调", status: "waiting" },
      { id: "timeout2", type: "macro", content: "async4中的setTimeout回调", status: "waiting" },
      { id: "timeout3", type: "macro", content: "Promise.then中的setTimeout回调", status: "waiting" }
    ],
    microTaskQueue: [
      { id: "async4-then1", type: "micro", content: "async4中的第一个then回调", status: "waiting" },
      { id: "promise2-then1", type: "micro", content: "新Promise的then回调", status: "waiting" },
      { id: "promise2-then2", type: "micro", content: "新Promise的第二个then回调", status: "waiting" },
      { id: "promise3", type: "micro", content: "最后一个Promise.then回调", status: "waiting" }
    ],
    output: "1 promise then resolve 1",
    code: `// 这是一个一阶微任务，在async2执行完之后执行
console.log('1 promise then resolve 1');`
  },

  // 继续添加更多步骤...
  // 这里只是一个示例，实际上需要根据代码执行流程添加更多步骤

  // 最后一个步骤
  {
    description: "执行完成",
    explanation: "所有任务执行完毕。",
    callStack: [],
    macroTaskQueue: [],
    microTaskQueue: [],
    code: `// 所有任务执行完毕`
  }
];
