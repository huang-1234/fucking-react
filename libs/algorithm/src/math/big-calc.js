function addBigNumbers(a, b) {
  // 将字符串转换为数组并反转，方便从个位开始计算
  let num1 = a.split('').reverse().map(Number);
  let num2 = b.split('').reverse().map(Number);

  let maxLength = Math.max(num1.length, num2.length);
  let result = [];
  let carry = 0;

  for (let i = 0;i < maxLength;i++) {
    // 获取当前位的数字，如果已超出数组长度则用0代替
    let digit1 = i < num1.length ? num1[i] : 0;
    let digit2 = i < num2.length ? num2[i] : 0;

    // 计算当前位的总和（包括进位）
    let sum = digit1 + digit2 + carry;

    // 计算当前位的结果和新的进位
    result.push(sum % 10);
    carry = Math.floor(sum / 10);
  }

  // 处理最高位的进位
  if (carry > 0) {
    result.push(carry);
  }

  // 将结果反转并拼接成字符串
  return result.reverse().join('');
}
/**
 * 比较两个大数的大小
 */
function compareBigNumbers(a, b) {
  // 处理符号
  if (a[0] === '-' && b[0] !== '-') return -1;
  if (a[0] !== '-' && b[0] === '-') return 1;

  // 同号情况下比较绝对值
  let absA = a[0] === '-' ? a.substring(1) : a;
  let absB = b[0] === '-' ? b.substring(1) : b;

  if (absA.length !== absB.length) {
    return absA.length > absB.length ? 1 : -1;
  }

  for (let i = 0;i < absA.length;i++) {
    if (absA[i] !== absB[i]) {
      return absA[i] > absB[i] ? 1 : -1;
    }
  }

  return 0; // 相等
}

/**
 * 带符号的大数加法
 */
function addSignedBigNumbers(a, b) {
  // 处理特殊情况
  if (a === '0') return b;
  if (b === '0') return a;

  // 两个正数
  if (a[0] !== '-' && b[0] !== '-') {
    return addBigNumbers(a, b);
  }

  // 两个负数
  if (a[0] === '-' && b[0] === '-') {
    return '-' + addBigNumbers(a.substring(1), b.substring(1));
  }

  // 异号：转换为减法
  if (a[0] === '-') {
    return subtractBigNumbers(b, a.substring(1));
  } else {
    return subtractBigNumbers(a, b.substring(1));
  }
}

/**
 * 大数减法
 */
function subtractBigNumbers(a, b) {
  // 处理特殊情况
  if (a === b) return '0';
  if (b === '0') return a;
  if (a === '0') return '-' + b;

  let comparison = compareBigNumbers(a, b);

  // 确保a的绝对值大于等于b的绝对值
  if (comparison < 0) {
    // 如果a < b，则计算-(b - a)
    return '-' + subtractBigNumbers(b, a);
  }

  let num1 = a.split('').reverse().map(Number);
  let num2 = b.split('').reverse().map(Number);

  let result = [];
  let borrow = 0;

  for (let i = 0;i < num1.length;i++) {
    let digit1 = num1[i];
    let digit2 = i < num2.length ? num2[i] : 0;

    // 处理借位
    digit1 -= borrow;
    borrow = 0;

    if (digit1 < digit2) {
      digit1 += 10;
      borrow = 1;
    }

    result.push(digit1 - digit2);
  }

  // 移除前导零
  while (result.length > 1 && result[result.length - 1] === 0) {
    result.pop();
  }

  return result.reverse().join('');
}

/**
 * 带符号的大数减法
 */
function subtractSignedBigNumbers(a, b) {
  // a - b = a + (-b)
  if (b[0] === '-') {
    return addSignedBigNumbers(a, b.substring(1));
  } else {
    return addSignedBigNumbers(a, '-' + b);
  }
}

(function () {
  console.log(addSignedBigNumbers('12345678901234567890', '-12345678901234567890'));
  console.log(addSignedBigNumbers('12345678901234567890', '-12345678901234567891'));
  console.log(subtractSignedBigNumbers('12345678901234567890', '-12345678901234567890'));
}());