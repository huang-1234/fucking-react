// 创建一个假的全局对象，用于沙箱环境
export const fakeWindow = {
  setTimeout,
  clearTimeout,
  console
};