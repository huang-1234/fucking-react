/**
 * 回溯算法的 Rust 实现
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
 */
pub fn permute<T: Clone>(nums: &[T]) -> Vec<Vec<T>> {
    let mut result = Vec::new();
    let mut used = vec![false; nums.len()];
    let mut path = Vec::new();

    backtrack(nums, &mut used, &mut path, &mut result);

    result
}

fn backtrack<T: Clone>(
    nums: &[T],
    used: &mut Vec<bool>,
    path: &mut Vec<T>,
    result: &mut Vec<Vec<T>>
) {
    // 如果路径长度等于数组长度，找到一个排列
    if path.len() == nums.len() {
        result.push(path.clone());
        return;
    }

    // 尝试每个未使用的元素
    for i in 0..nums.len() {
        // 如果当前元素已使用，跳过
        if used[i] {
            continue;
        }

        // 选择当前元素
        used[i] = true;
        path.push(nums[i].clone());

        // 递归尝试下一个位置
        backtrack(nums, used, path, result);

        // 回溯：撤销选择
        path.pop();
        used[i] = false;
    }
}

/**
 * 组合问题 - 从n个数中选择k个数的所有可能组合
 */
pub fn combine(n: i32, k: i32) -> Vec<Vec<i32>> {
    let mut result = Vec::new();
    let mut path = Vec::new();

    backtrack_combine(n, k, 1, &mut path, &mut result);

    result
}

fn backtrack_combine(
    n: i32,
    k: i32,
    start: i32,
    path: &mut Vec<i32>,
    result: &mut Vec<Vec<i32>>
) {
    // 如果路径长度等于k，找到一个组合
    if path.len() == k as usize {
        result.push(path.clone());
        return;
    }

    // 尝试从start到n的每个数
    for i in start..=n {
        // 选择当前数
        path.push(i);

        // 递归尝试下一个位置，从i+1开始，避免重复
        backtrack_combine(n, k, i + 1, path, result);

        // 回溯：撤销选择
        path.pop();
    }
}

/**
 * 子集问题 - 生成数组的所有可能子集
 */
pub fn subsets<T: Clone>(nums: &[T]) -> Vec<Vec<T>> {
    let mut result = Vec::new();
    let mut path = Vec::new();

    backtrack_subsets(nums, 0, &mut path, &mut result);

    result
}

fn backtrack_subsets<T: Clone>(
    nums: &[T],
    start: usize,
    path: &mut Vec<T>,
    result: &mut Vec<Vec<T>>
) {
    // 每个路径都是一个子集
    result.push(path.clone());

    // 尝试从start到末尾的每个数
    for i in start..nums.len() {
        // 选择当前数
        path.push(nums[i].clone());

        // 递归尝试下一个位置，从i+1开始，避免重复
        backtrack_subsets(nums, i + 1, path, result);

        // 回溯：撤销选择
        path.pop();
    }
}

/**
 * N皇后问题 - 在n×n的棋盘上放置n个皇后，使得它们不能互相攻击
 */
pub fn solve_n_queens(n: i32) -> Vec<Vec<String>> {
    let n = n as usize;
    let mut result = Vec::new();
    let mut board = vec![vec!['.'; n]; n];

    backtrack_n_queens(&mut board, 0, &mut result);

    result
}

fn backtrack_n_queens(
    board: &mut Vec<Vec<char>>,
    row: usize,
    result: &mut Vec<Vec<String>>
) {
    let n = board.len();

    // 如果所有行都放置了皇后，找到一个解
    if row == n {
        let solution = board.iter()
            .map(|row| row.iter().collect::<String>())
            .collect();
        result.push(solution);
        return;
    }

    // 尝试在当前行的每一列放置皇后
    for col in 0..n {
        // 检查当前位置是否可以放置皇后
        if is_valid(board, row, col) {
            // 放置皇后
            board[row][col] = 'Q';

            // 递归尝试下一行
            backtrack_n_queens(board, row + 1, result);

            // 回溯：移除皇后
            board[row][col] = '.';
        }
    }
}

// 检查在board[row][col]位置放置皇后是否有效
fn is_valid(board: &Vec<Vec<char>>, row: usize, col: usize) -> bool {
    let n = board.len();

    // 检查同一列
    for i in 0..row {
        if board[i][col] == 'Q' {
            return false;
        }
    }

    // 检查左上对角线
    let mut i = row;
    let mut j = col;
    while i > 0 && j > 0 {
        i -= 1;
        j -= 1;
        if board[i][j] == 'Q' {
            return false;
        }
    }

    // 检查右上对角线
    let mut i = row;
    let mut j = col;
    while i > 0 && j < n - 1 {
        i -= 1;
        j += 1;
        if board[i][j] == 'Q' {
            return false;
        }
    }

    true
}

/**
 * 数独求解器
 */
pub fn solve_sudoku(board: &mut Vec<Vec<char>>) -> bool {
    // 找到一个空位置
    if let Some((row, col)) = find_empty_cell(board) {
        // 尝试填入1-9
        for num in '1'..='9' {
            // 检查当前数字是否可以放置
            if is_valid_sudoku(board, row, col, num) {
                // 放置数字
                board[row][col] = num;

                // 递归尝试解决剩余部分
                if solve_sudoku(board) {
                    return true;
                }

                // 回溯：移除数字
                board[row][col] = '.';
            }
        }

        // 无解
        false
    } else {
        // 没有空位置，数独已解决
        true
    }
}

// 找到一个空位置
fn find_empty_cell(board: &Vec<Vec<char>>) -> Option<(usize, usize)> {
    for i in 0..9 {
        for j in 0..9 {
            if board[i][j] == '.' {
                return Some((i, j));
            }
        }
    }
    None
}

// 检查在board[row][col]位置放置数字num是否有效
fn is_valid_sudoku(board: &Vec<Vec<char>>, row: usize, col: usize, num: char) -> bool {
    // 检查同一行
    for j in 0..9 {
        if board[row][j] == num {
            return false;
        }
    }

    // 检查同一列
    for i in 0..9 {
        if board[i][col] == num {
            return false;
        }
    }

    // 检查3x3方格
    let box_row = (row / 3) * 3;
    let box_col = (col / 3) * 3;
    for i in 0..3 {
        for j in 0..3 {
            if board[box_row + i][box_col + j] == num {
                return false;
            }
        }
    }

    true
}

/**
 * 分割回文串 - 将字符串分割成回文子串的所有可能方案
 */
pub fn partition(s: &str) -> Vec<Vec<String>> {
    let mut result = Vec::new();
    let mut path = Vec::new();

    backtrack_partition(s, 0, &mut path, &mut result);

    result
}

fn backtrack_partition(
    s: &str,
    start: usize,
    path: &mut Vec<String>,
    result: &mut Vec<Vec<String>>
) {
    // 如果已处理完整个字符串，找到一个分割方案
    if start == s.len() {
        result.push(path.clone());
        return;
    }

    // 尝试从start开始的每个子串
    for end in start..s.len() {
        // 如果当前子串是回文串
        if is_palindrome(s, start, end) {
            // 选择当前子串
            let substr = &s[start..=end];
            path.push(substr.to_string());

            // 递归尝试下一个子串，从end+1开始
            backtrack_partition(s, end + 1, path, result);

            // 回溯：撤销选择
            path.pop();
        }
    }
}

// 检查字符串s从start到end的子串是否是回文串
fn is_palindrome(s: &str, start: usize, end: usize) -> bool {
    let chars: Vec<char> = s.chars().collect();
    let mut i = start;
    let mut j = end;

    while i < j {
        if chars[i] != chars[j] {
            return false;
        }
        i += 1;
        j -= 1;
    }

    true
}

/**
 * 电话号码的字母组合
 */
pub fn letter_combinations(digits: &str) -> Vec<String> {
    if digits.is_empty() {
        return Vec::new();
    }

    // 数字到字母的映射
    let phone_map: Vec<&str> = vec![
        "", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"
    ];

    let mut result = Vec::new();
    let mut path = String::new();

    backtrack_letter_combinations(digits, 0, &phone_map, &mut path, &mut result);

    result
}

fn backtrack_letter_combinations(
    digits: &str,
    index: usize,
    phone_map: &Vec<&str>,
    path: &mut String,
    result: &mut Vec<String>
) {
    // 如果已处理完所有数字，找到一个组合
    if index == digits.len() {
        result.push(path.clone());
        return;
    }

    // 获取当前数字对应的字母
    let digit = digits.chars().nth(index).unwrap().to_digit(10).unwrap() as usize;
    let letters = phone_map[digit];

    // 尝试每个字母
    for c in letters.chars() {
        // 选择当前字母
        path.push(c);

        // 递归尝试下一个数字
        backtrack_letter_combinations(digits, index + 1, phone_map, path, result);

        // 回溯：撤销选择
        path.pop();
    }
}
