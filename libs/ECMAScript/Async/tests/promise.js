async function async1() {
  console.log('async1 start')
  await async2()
  console.log('async1 end')
}
async function async2() {
  console.log('async2 start')
  return new Promise((resolve) => {
    console.log('async2: promise1')
    resolve()
  }).then(function () {
    console.log('async2: promise2')
  })
}
console.log('script start')
setTimeout(function () {
  console.log('setTimeout')
}, 0)
async1()
new Promise((resolve) => {
  console.log('promise1')
  resolve()
}).then(function () {
  console.log('promise2')
})
console.log('script end')

// 错误答案
// script start script end  async1 start promise1 async2 promise2 async1 end setTimeout


// 正确答案
//
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
