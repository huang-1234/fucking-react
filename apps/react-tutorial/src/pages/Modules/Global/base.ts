// 在node环境下，模拟使用浏览器下的全局对象window
export const fakeWindow = Object.create(globalThis);