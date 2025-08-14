以下是精心设计的10道异步编程Promise相关题目，涵盖核心概念、执行顺序、链式调用、并发控制等关键知识点，包含详细解析和代码示例：

---

### 🔵 **1. Promise基础执行顺序**
**题目**：
```javascript
console.log('start');
const promise = new Promise(resolve => {
  console.log(1);
  resolve(2);
  console.log(3);
});
promise.then(console.log);
console.log('end');
```
**答案**：
`start → 1 → 3 → end → 2`
**解析**：
- `new Promise` 的 executor 函数同步执行（输出1、3）
- `then` 回调作为微任务，在同步代码执行后触发（输出2）

---

### 🔵 **2. 微任务 vs 宏任务**
**题目**：
```javascript
setTimeout(() => console.log(1));
Promise.resolve().then(() => console.log(2));
console.log(3);
```
**答案**：
`3 → 2 → 1`
**解析**：
- 同步代码优先执行（输出3）
- 微任务（Promise.then）先于宏任务（setTimeout）执行

---

### 🔵 **3. Promise状态不可变**
**题目**：
```javascript
const p = new Promise((resolve, reject) => {
  resolve(1);
  reject('error');
  resolve(2);
});
p.then(console.log).catch(console.error);
```
**答案**：
`1`
**解析**：
- Promise 状态一旦变为 `fulfilled` 或 `rejected` 即不可更改

---

### 🔵 **4. 值穿透（非函数参数）**
**题目**：
```javascript
Promise.resolve(1)
  .then(2)
  .then(Promise.resolve(3))
  .then(console.log);
```
**答案**：
`1`
**解析**：
- `then(2)` 和 `then(Promise.resolve(3))` 参数非函数，发生值穿透（直接传递前值）

---

### 🔵 **5. 链式调用与错误处理**
**题目**：
```javascript
Promise.resolve()
  .then(() => { throw new Error('err1'); })
  .catch(() => console.log('caught'))
  .then(() => { throw new Error('err2'); })
  .catch(console.error);
```
**答案**：
`caught → Error: err2`
**解析**：
- 第一个 `catch` 捕获 `err1` 后返回新 Promise，后续继续执行
- 第二个 `catch` 捕获 `err2`

---

### 🔵 **6. Promise.all 并发控制**
**题目**：
```javascript
const p1 = Promise.resolve(1);
const p2 = Promise.reject(2);
const p3 = Promise.resolve(3);
Promise.all([p1, p2, p3])
  .then(console.log)
  .catch(console.error);
```
**答案**：
`2`
**解析**：
- `Promise.all` 任一 Promise 失败即整体失败，返回首个拒绝原因

---

### 🔵 **7. Promise.race 竞速**
**题目**：
```javascript
const slow = new Promise(r => setTimeout(() => r('slow'), 200));
const fast = new Promise(r => setTimeout(() => r('fast'), 100));
Promise.race([slow, fast]).then(console.log);
```
**答案**：
`fast`
**解析**：
- `Promise.race` 返回最先完成的 Promise 结果

---

### 🔵 **8. async/await 与执行顺序**
**题目**：
```javascript
async function test() {
  console.log(1);
  await console.log(2);
  console.log(3);
}
test();
console.log(4);
```
**答案**：
`1 → 2 → 4 → 3`
**解析**：
- `await` 后的表达式同步执行（输出2），但后续代码作为微任务执行（输出3）

---

### 🔵 **9. 循环中的异步处理**
**题目**：
```javascript
async function process(arr) {
  for (const item of arr) {
    await new Promise(r => setTimeout(r, 100));
    console.log(item);
  }
}
process([1, 2, 3]);
```
**答案**：
每隔100ms依次输出：`1 → 2 → 3`
**解析**：
- `for` 循环内的 `await` 使异步操作顺序执行

---

### 🔵 **10. 手动实现 Promise.all**
**题目**：
```javascript
function promiseAll(promises) {
  // 补全代码
}
```
**参考答案**：
```javascript
function promiseAll(promises) {
  return new Promise((resolve, reject) => {
    let count = 0;
    const results = [];
    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(res => {
          results[i] = res;
          if (++count === promises.length) resolve(results);
        })
        .catch(reject);
    });
  });
}
```
**解析**：
- 用计数器跟踪完成数量
- 按索引存储结果保证顺序

---

### 💎 **总结**
1. **执行模型**：同步 > 微任务 > 宏任务
2. **状态规则**：状态不可变、值穿透机制
3. **链式调用**：错误冒泡与恢复逻辑
4. **并发控制**：`all`（全成功）/`race`（竞速）
5. **async/await**：语法糖本质（Generator + 自动执行器）

> 建议动手实现 `Promise` 核心方法（如 `allSettled`、`any`）加深理解。完整题目解析可参考 https://bfe.dev 或相关技术博客。