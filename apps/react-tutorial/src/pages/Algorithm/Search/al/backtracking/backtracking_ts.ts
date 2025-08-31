/**
 * 回溯算法的 TypeScript 实现
 *
 * 回溯算法是一种通过探索所有可能的解决方案来找到所有解（或特定解）的算法。
 * 它采用试错的思想，尝试分步解决问题，当发现当前方案不是正确的解时，回溯到上一步，
 * 尝试其他可能的分支。
 *
 * 回溯算法的基本思想：
 * 1. 定义解空间，包含问题的所有解
 * 2. 使用适当的策略搜索解空间
 * 3. 遇到不满足条件的情况，回溯到上一步
 */

/**
 * 全排列问题 - 生成数组的所有可能排列
 * @param nums 输入数组
 * @param callback 可选的回调函数，用于可视化
 */
export function permute<T>(
  nums: T[],
  callback?: (current: T[], used: boolean[]) => void
): T[][] {
  const result: T[][] = [];
  const used: boolean[] = Array(nums.length).fill(false);
  const path: T[] = [];

  backtrack();
  return result;

  function backtrack() {
    // 如果路径长度等于数组长度，找到一个排列
    if (path.length === nums.length) {
      result.push([...path]);
      return;
    }

    // 尝试每个未使用的元素
    for (let i = 0; i < nums.length; i++) {
      // 如果当前元素已使用，跳过
      if (used[i]) continue;

      // 选择当前元素
      used[i] = true;
      path.push(nums[i]);

      // 如果提供了回调函数，则调用它
      if (callback) {
        callback([...path], [...used]);
      }

      // 递归尝试下一个位置
      backtrack();

      // 回溯：撤销选择
      path.pop();
      used[i] = false;
    }
  }
}

/**
 * 组合问题 - 从n个数中选择k个数的所有可能组合
 * @param n 总数
 * @param k 选择的数量
 * @param callback 可选的回调函数，用于可视化
 */
export function combine(
  n: number,
  k: number,
  callback?: (current: number[]) => void
): number[][] {
  const result: number[][] = [];

  backtrack(1, []);
  return result;

  function backtrack(start: number, path: number[]) {
    // 如果路径长度等于k，找到一个组合
    if (path.length === k) {
      result.push([...path]);
      return;
    }

    // 尝试从start到n的每个数
    for (let i = start; i <= n; i++) {
      // 选择当前数
      path.push(i);

      // 如果提供了回调函数，则调用它
      if (callback) {
        callback([...path]);
      }

      // 递归尝试下一个位置，从i+1开始，避免重复
      backtrack(i + 1, path);

      // 回溯：撤销选择
      path.pop();
    }
  }
}

/**
 * 子集问题 - 生成数组的所有可能子集
 * @param nums 输入数组
 * @param callback 可选的回调函数，用于可视化
 */
export function subsets<T>(
  nums: T[],
  callback?: (current: T[]) => void
): T[][] {
  const result: T[][] = [];

  backtrack(0, []);
  return result;

  function backtrack(start: number, path: T[]) {
    // 每个路径都是一个子集
    result.push([...path]);

    // 如果提供了回调函数，则调用它
    if (callback) {
      callback([...path]);
    }

    // 尝试从start到末尾的每个数
    for (let i = start; i < nums.length; i++) {
      // 选择当前数
      path.push(nums[i]);

      // 递归尝试下一个位置，从i+1开始，避免重复
      backtrack(i + 1, path);

      // 回溯：撤销选择
      path.pop();
    }
  }
}

/**
 * N皇后问题 - 在n×n的棋盘上放置n个皇后，使得它们不能互相攻击
 * @param n 棋盘大小
 * @param callback 可选的回调函数，用于可视化
 */
export function solveNQueens(
  n: number,
  callback?: (board: string[][]) => void
): string[][] {
  const result: string[][] = [];
  const board: string[][] = Array(n).fill(0).map(() => Array(n).fill('.'));

  backtrack(0);
  return result;

  function backtrack(row: number) {
    // 如果所有行都放置了皇后，找到一个解
    if (row === n) {
      result.push(board.map(row => row.join('')));
      return;
    }

    // 尝试在当前行的每一列放置皇后
    for (let col = 0; col < n; col++) {
      // 检查当前位置是否可以放置皇后
      if (isValid(row, col)) {
        // 放置皇后
        board[row][col] = 'Q';

        // 如果提供了回调函数，则调用它
        if (callback) {
          callback(board.map(row => [...row]));
        }

        // 递归尝试下一行
        backtrack(row + 1);

        // 回溯：移除皇后
        board[row][col] = '.';
      }
    }
  }

  // 检查在board[row][col]位置放置皇后是否有效
  function isValid(row: number, col: number): boolean {
    // 检查同一列
    for (let i = 0; i < row; i++) {
      if (board[i][col] === 'Q') {
        return false;
      }
    }

    // 检查左上对角线
    for (let i = row - 1, j = col - 1; i >= 0 && j >= 0; i--, j--) {
      if (board[i][j] === 'Q') {
        return false;
      }
    }

    // 检查右上对角线
    for (let i = row - 1, j = col + 1; i >= 0 && j < n; i--, j++) {
      if (board[i][j] === 'Q') {
        return false;
      }
    }

    return true;
  }
}

/**
 * 数独求解器
 * @param board 9x9数独板
 * @param callback 可选的回调函数，用于可视化
 */
export function solveSudoku(
  board: string[][],
  callback?: (board: string[][]) => void
): boolean {
  // 找到一个空位置
  const emptyCell = findEmptyCell();

  // 如果没有空位置，数独已解决
  if (!emptyCell) {
    return true;
  }

  const [row, col] = emptyCell;

  // 尝试填入1-9
  for (let num = 1; num <= 9; num++) {
    const numStr = num.toString();

    // 检查当前数字是否可以放置
    if (isValid(row, col, numStr)) {
      // 放置数字
      board[row][col] = numStr;

      // 如果提供了回调函数，则调用它
      if (callback) {
        callback(board.map(row => [...row]));
      }

      // 递归尝试解决剩余部分
      if (solveSudoku(board, callback)) {
        return true;
      }

      // 回溯：移除数字
      board[row][col] = '.';
    }
  }

  // 无解
  return false;

  // 找到一个空位置
  function findEmptyCell(): [number, number] | null {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === '.') {
          return [i, j];
        }
      }
    }
    return null;
  }

  // 检查在board[row][col]位置放置数字num是否有效
  function isValid(row: number, col: number, num: string): boolean {
    // 检查同一行
    for (let j = 0; j < 9; j++) {
      if (board[row][j] === num) {
        return false;
      }
    }

    // 检查同一列
    for (let i = 0; i < 9; i++) {
      if (board[i][col] === num) {
        return false;
      }
    }

    // 检查3x3方格
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[boxRow + i][boxCol + j] === num) {
          return false;
        }
      }
    }

    return true;
  }
}

/**
 * 分割回文串 - 将字符串分割成回文子串的所有可能方案
 * @param s 输入字符串
 * @param callback 可选的回调函数，用于可视化
 */
export function partition(
  s: string,
  callback?: (current: string[], index: number) => void
): string[][] {
  const result: string[][] = [];

  backtrack(0, []);
  return result;

  function backtrack(start: number, path: string[]) {
    // 如果已处理完整个字符串，找到一个分割方案
    if (start === s.length) {
      result.push([...path]);
      return;
    }

    // 尝试从start开始的每个子串
    for (let end = start; end < s.length; end++) {
      // 如果当前子串是回文串
      if (isPalindrome(s, start, end)) {
        // 选择当前子串
        const substr = s.substring(start, end + 1);
        path.push(substr);

        // 如果提供了回调函数，则调用它
        if (callback) {
          callback([...path], end + 1);
        }

        // 递归尝试下一个子串，从end+1开始
        backtrack(end + 1, path);

        // 回溯：撤销选择
        path.pop();
      }
    }
  }

  // 检查字符串s从start到end的子串是否是回文串
  function isPalindrome(s: string, start: number, end: number): boolean {
    while (start < end) {
      if (s[start] !== s[end]) {
        return false;
      }
      start++;
      end--;
    }
    return true;
  }
}

/**
 * 电话号码的字母组合
 * @param digits 输入的数字字符串
 * @param callback 可选的回调函数，用于可视化
 */
export function letterCombinations(
  digits: string,
  callback?: (current: string) => void
): string[] {
  if (digits.length === 0) {
    return [];
  }

  // 数字到字母的映射
  const phoneMap: { [key: string]: string } = {
    '2': 'abc',
    '3': 'def',
    '4': 'ghi',
    '5': 'jkl',
    '6': 'mno',
    '7': 'pqrs',
    '8': 'tuv',
    '9': 'wxyz'
  };

  const result: string[] = [];

  backtrack(0, '');
  return result;

  function backtrack(index: number, path: string) {
    // 如果已处理完所有数字，找到一个组合
    if (index === digits.length) {
      result.push(path);
      return;
    }

    // 获取当前数字对应的字母
    const letters = phoneMap[digits[index]];

    // 尝试每个字母
    for (let i = 0; i < letters.length; i++) {
      // 选择当前字母
      const newPath = path + letters[i];

      // 如果提供了回调函数，则调用它
      if (callback) {
        callback(newPath);
      }

      // 递归尝试下一个数字
      backtrack(index + 1, newPath);

      // 不需要显式回溯，因为字符串是不可变的
    }
  }
}
