/**
 * @example
 * @desc 测试函数 - 前两次失败，第三次成功
 * @returns {Promise<string>}
 */
export function flakyAPI() {
  return new Promise((resolve, reject) => {
    const attempt = Math.floor(Math.random() * 5); // 随机数模拟失败或成功
    if (attempt < 3) {
      reject(`Failed at attempt ${attempt}`);
    } else {
      resolve(`Succeeded at attempt ${attempt}`);
    }
  });
}