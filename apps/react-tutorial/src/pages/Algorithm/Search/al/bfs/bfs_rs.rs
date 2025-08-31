/**
 * 广度优先搜索 (BFS) 的 Rust 实现
 *
 * BFS 是一种用于遍历或搜索树或图的算法。它从根节点开始，先访问所有相邻节点，
 * 然后再访问下一层节点，按层级顺序逐步扩展。
 *
 * 特点：
 * 1. 使用队列（先进先出）作为辅助数据结构
 * 2. 保证找到的路径是最短路径（在无权图中）
 * 3. 适合解决最短路径、层级遍历等问题
 */

use std::collections::{HashMap, HashSet, VecDeque};

// 图的邻接表表示
type Graph = HashMap<String, Vec<String>>;

/**
 * 基本的广度优先搜索实现
 */
pub fn bfs(graph: &Graph, start: &str) -> Vec<String> {
    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    let mut result = Vec::new();

    // 将起始节点加入队列和已访问集合
    queue.push_back(start.to_string());
    visited.insert(start.to_string());

    while let Some(node) = queue.pop_front() {
        result.push(node.clone());

        // 访问所有未访问的邻居节点
        if let Some(neighbors) = graph.get(&node) {
            for neighbor in neighbors {
                if !visited.contains(neighbor) {
                    visited.insert(neighbor.clone());
                    queue.push_back(neighbor.clone());
                }
            }
        }
    }

    result
}

/**
 * 使用BFS查找最短路径
 */
pub fn shortest_path(graph: &Graph, start: &str, end: &str) -> Vec<String> {
    // 如果起始节点就是目标节点，直接返回
    if start == end {
        return vec![start.to_string()];
    }

    let mut visited = HashSet::new();
    let mut queue = VecDeque::new();
    // 记录每个节点的前驱节点
    let mut prev: HashMap<String, String> = HashMap::new();

    // 将起始节点加入队列和已访问集合
    queue.push_back(start.to_string());
    visited.insert(start.to_string());

    while let Some(node) = queue.pop_front() {
        // 访问所有未访问的邻居节点
        if let Some(neighbors) = graph.get(&node) {
            for neighbor in neighbors {
                if !visited.contains(neighbor) {
                    visited.insert(neighbor.clone());
                    prev.insert(neighbor.clone(), node.clone());
                    queue.push_back(neighbor.clone());

                    // 如果找到目标节点，构建并返回路径
                    if neighbor == end {
                        return build_path(&prev, start, end);
                    }
                }
            }
        }
    }

    // 如果没有找到路径，返回空数组
    Vec::new()
}

// 辅助函数，根据前驱信息构建路径
fn build_path(prev: &HashMap<String, String>, start: &str, end: &str) -> Vec<String> {
    let mut path = Vec::new();
    let mut current = end.to_string();

    // 从终点回溯到起点
    while current != start {
        path.push(current.clone());
        current = prev.get(&current).unwrap().clone();
    }

    // 添加起点
    path.push(start.to_string());

    // 反转路径，使其从起点到终点
    path.reverse();
    path
}

/**
 * 二维网格BFS遍历
 */
pub fn grid_bfs<T: Clone>(grid: &Vec<Vec<T>>, start_row: usize, start_col: usize) -> Vec<Vec<i32>> {
    if grid.is_empty() || grid[0].is_empty() {
        return Vec::new();
    }

    let rows = grid.len();
    let cols = grid[0].len();
    let mut visited = vec![vec![false; cols]; rows];
    let mut distance = vec![vec![-1; cols]; rows];

    // 四个方向：上、右、下、左
    let directions = [(-1, 0), (0, 1), (1, 0), (0, -1)];

    // 初始化队列，存储 (row, col, distance)
    let mut queue = VecDeque::new();
    queue.push_back((start_row, start_col, 0));
    visited[start_row][start_col] = true;
    distance[start_row][start_col] = 0;

    while let Some((row, col, dist)) = queue.pop_front() {
        // 探索四个方向
        for &(dr, dc) in &directions {
            let new_row = (row as i32 + dr) as usize;
            let new_col = (col as i32 + dc) as usize;

            // 检查边界和是否已访问
            if new_row < rows && new_col < cols && !visited[new_row][new_col] {
                visited[new_row][new_col] = true;
                distance[new_row][new_col] = dist + 1;
                queue.push_back((new_row, new_col, dist + 1));
            }
        }
    }

    distance
}

/**
 * 使用BFS解决迷宫最短路径问题
 */
pub fn solve_maze(
    maze: &Vec<Vec<i32>>,
    start: (usize, usize),
    end: (usize, usize)
) -> Vec<(usize, usize)> {
    let rows = maze.len();
    let cols = maze[0].len();
    let mut visited = vec![vec![false; cols]; rows];

    // 四个方向：上、右、下、左
    let directions = [(-1, 0), (0, 1), (1, 0), (0, -1)];

    // 初始化队列，存储 (row, col, distance)
    let mut queue = VecDeque::new();
    queue.push_back((start.0, start.1, 0));
    visited[start.0][start.1] = true;

    // 记录每个单元格的前驱单元格
    let mut prev: HashMap<(usize, usize), (usize, usize)> = HashMap::new();

    while let Some((row, col, _)) = queue.pop_front() {
        // 如果到达终点，构建并返回路径
        if row == end.0 && col == end.1 {
            return build_maze_path(&prev, start, end);
        }

        // 探索四个方向
        for &(dr, dc) in &directions {
            let new_row = (row as i32 + dr) as usize;
            let new_col = (col as i32 + dc) as usize;

            // 检查边界、是否是通道、是否已访问
            if new_row < rows && new_col < cols && maze[new_row][new_col] == 0 && !visited[new_row][new_col] {
                visited[new_row][new_col] = true;
                queue.push_back((new_row, new_col, 0));
                prev.insert((new_row, new_col), (row, col));
            }
        }
    }

    // 如果没有找到路径，返回空数组
    Vec::new()
}

// 辅助函数，根据前驱信息构建迷宫路径
fn build_maze_path(
    prev: &HashMap<(usize, usize), (usize, usize)>,
    start: (usize, usize),
    end: (usize, usize)
) -> Vec<(usize, usize)> {
    let mut path = Vec::new();
    let mut current = end;

    // 从终点回溯到起点
    while current != start {
        path.push(current);
        current = *prev.get(&current).unwrap();
    }

    // 添加起点
    path.push(start);

    // 反转路径，使其从起点到终点
    path.reverse();
    path
}

/**
 * 单词接龙问题 - 使用BFS
 */
pub fn word_ladder(begin_word: &str, end_word: &str, word_list: &[String]) -> i32 {
    // 如果目标单词不在单词列表中，无法变换
    if !word_list.contains(&end_word.to_string()) {
        return 0;
    }

    // 创建单词集合，方便快速查找
    let mut word_set: HashSet<String> = word_list.iter().cloned().collect();

    // 如果起始单词在单词列表中，需要移除以避免重复访问
    word_set.remove(&begin_word.to_string());

    // 初始化队列，存储 (word, level)
    let mut queue = VecDeque::new();
    queue.push_back((begin_word.to_string(), 1));
    let mut visited = HashSet::new();
    visited.insert(begin_word.to_string());

    while let Some((word, level)) = queue.pop_front() {
        // 如果到达目标单词，返回变换次数
        if word == end_word {
            return level;
        }

        // 尝试变换单词的每一个字符
        for i in 0..word.len() {
            let prefix = &word[0..i];
            let suffix = &word[i+1..];

            // 尝试替换为a-z的每个字符
            for c in b'a'..=b'z' {
                let new_char = c as char;
                let new_word = format!("{}{}{}", prefix, new_char, suffix);

                // 如果新单词在单词集合中且未访问过
                if word_set.contains(&new_word) && !visited.contains(&new_word) {
                    visited.insert(new_word.clone());
                    queue.push_back((new_word.clone(), level + 1));
                    word_set.remove(&new_word); // 移除以避免重复访问
                }
            }
        }
    }

    // 如果无法变换到目标单词，返回0
    0
}
