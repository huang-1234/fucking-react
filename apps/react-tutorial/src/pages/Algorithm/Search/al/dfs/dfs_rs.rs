/**
 * 深度优先搜索 (DFS) 的 Rust 实现
 *
 * DFS 是一种用于遍历或搜索树或图的算法。它从根节点开始，沿着一条路径尽可能深入地探索，
 * 直到无法继续前进时回溯到上一个分叉点，然后继续探索其他路径。
 */

use std::collections::{HashMap, HashSet, VecDeque};

// 图的邻接表表示
type Graph = HashMap<String, Vec<String>>;

/**
 * 递归方式实现深度优先搜索
 */
pub fn dfs_recursive(
    graph: &Graph,
    node: &str,
    visited: &mut HashSet<String>,
    result: &mut Vec<String>
) {
    // 标记当前节点为已访问
    visited.insert(node.to_string());
    result.push(node.to_string());

    // 访问所有未访问的邻居节点
    if let Some(neighbors) = graph.get(node) {
        for neighbor in neighbors {
            if !visited.contains(neighbor) {
                dfs_recursive(graph, neighbor, visited, result);
            }
        }
    }
}

/**
 * 迭代方式实现深度优先搜索
 */
pub fn dfs_iterative(graph: &Graph, start: &str) -> Vec<String> {
    let mut visited = HashSet::new();
    let mut stack = Vec::new();
    let mut result = Vec::new();

    // 将起始节点压入栈
    stack.push(start.to_string());

    while let Some(node) = stack.pop() {
        // 如果节点未访问过，则处理它
        if !visited.contains(&node) {
            visited.insert(node.clone());
            result.push(node.clone());

            // 将所有未访问的邻居节点压入栈中（逆序，确保访问顺序与递归版本一致）
            if let Some(neighbors) = graph.get(&node) {
                for neighbor in neighbors.iter().rev() {
                    if !visited.contains(neighbor) {
                        stack.push(neighbor.clone());
                    }
                }
            }
        }
    }

    result
}

/**
 * 使用DFS检测图中是否存在环
 */
pub fn has_cycle(graph: &Graph) -> bool {
    let mut visited = HashSet::new();
    let mut rec_stack = HashSet::new(); // 当前递归栈中的节点

    // 对每个未访问的节点进行DFS
    for node in graph.keys() {
        if !visited.contains(node) {
            if is_cyclic_util(graph, node, &mut visited, &mut rec_stack) {
                return true;
            }
        }
    }

    false
}

// 辅助函数，检查从某个节点开始是否存在环
fn is_cyclic_util(
    graph: &Graph,
    node: &str,
    visited: &mut HashSet<String>,
    rec_stack: &mut HashSet<String>
) -> bool {
    // 如果节点不在已访问集合中
    if !visited.contains(node) {
        // 标记当前节点为已访问，并加入递归栈
        visited.insert(node.to_string());
        rec_stack.insert(node.to_string());

        // 递归访问所有邻居节点
        if let Some(neighbors) = graph.get(node) {
            for neighbor in neighbors {
                // 如果邻居节点未访问且从该邻居开始存在环
                if !visited.contains(neighbor) && is_cyclic_util(graph, neighbor, visited, rec_stack) {
                    return true;
                }
                // 如果邻居节点在当前递归栈中，说明存在环
                else if rec_stack.contains(neighbor) {
                    return true;
                }
            }
        }
    }

    // 回溯时从递归栈中移除当前节点
    rec_stack.remove(node);
    false
}

/**
 * 使用DFS查找图中两点之间的所有路径
 */
pub fn find_all_paths(graph: &Graph, start: &str, end: &str) -> Vec<Vec<String>> {
    let mut visited = HashSet::new();
    let mut paths = Vec::new();
    let mut path = Vec::new();

    dfs_find_paths(graph, start, end, &mut visited, &mut path, &mut paths);

    paths
}

// 辅助函数，使用DFS查找路径
fn dfs_find_paths(
    graph: &Graph,
    node: &str,
    end: &str,
    visited: &mut HashSet<String>,
    path: &mut Vec<String>,
    paths: &mut Vec<Vec<String>>
) {
    // 将当前节点加入路径和已访问集合
    visited.insert(node.to_string());
    path.push(node.to_string());

    // 如果找到目标节点，则记录路径
    if node == end {
        paths.push(path.clone());
    } else {
        // 否则继续搜索未访问的邻居节点
        if let Some(neighbors) = graph.get(node) {
            for neighbor in neighbors {
                if !visited.contains(neighbor) {
                    dfs_find_paths(graph, neighbor, end, visited, path, paths);
                }
            }
        }
    }

    // 回溯：移除当前节点
    visited.remove(node);
    path.pop();
}

/**
 * 使用DFS进行拓扑排序
 */
pub fn topological_sort(graph: &Graph) -> Vec<String> {
    let mut visited = HashSet::new();
    let mut stack = Vec::new();

    // 对每个未访问的节点进行DFS
    for node in graph.keys() {
        if !visited.contains(node) {
            topological_sort_util(graph, node, &mut visited, &mut stack);
        }
    }

    // 返回反转后的栈
    stack.into_iter().rev().collect()
}

// 辅助函数，执行拓扑排序的DFS
fn topological_sort_util(
    graph: &Graph,
    node: &str,
    visited: &mut HashSet<String>,
    stack: &mut Vec<String>
) {
    // 标记当前节点为已访问
    visited.insert(node.to_string());

    // 递归访问所有未访问的邻居节点
    if let Some(neighbors) = graph.get(node) {
        for neighbor in neighbors {
            if !visited.contains(neighbor) {
                topological_sort_util(graph, neighbor, visited, stack);
            }
        }
    }

    // 所有邻居节点处理完后，将当前节点加入栈
    stack.push(node.to_string());
}

/**
 * 二维网格DFS遍历
 */
pub fn grid_dfs<T: Clone>(
    grid: &Vec<Vec<T>>,
    row: usize,
    col: usize,
    visited: &mut Vec<Vec<bool>>
) {
    let rows = grid.len();
    let cols = grid[0].len();

    // 检查边界和是否已访问
    if row >= rows || col >= cols || visited[row][col] {
        return;
    }

    // 标记当前单元格为已访问
    visited[row][col] = true;

    // 四个方向：上、右、下、左
    let directions = [(row.wrapping_sub(1), col), (row, col + 1), (row + 1, col), (row, col.wrapping_sub(1))];

    // 递归访问四个方向的相邻单元格
    for (r, c) in directions {
        if r < rows && c < cols {
            grid_dfs(grid, r, c, visited);
        }
    }
}

/**
 * 岛屿数量问题 - 使用DFS
 */
pub fn num_islands(grid: &Vec<Vec<char>>) -> i32 {
    if grid.is_empty() || grid[0].is_empty() {
        return 0;
    }

    let rows = grid.len();
    let cols = grid[0].len();
    let mut visited = vec![vec![false; cols]; rows];
    let mut count = 0;

    for r in 0..rows {
        for c in 0..cols {
            if grid[r][c] == '1' && !visited[r][c] {
                count += 1;
                dfs_island(grid, r, c, &mut visited);
            }
        }
    }

    count
}

// 辅助函数，标记一个岛屿的所有陆地
fn dfs_island(grid: &Vec<Vec<char>>, row: usize, col: usize, visited: &mut Vec<Vec<bool>>) {
    let rows = grid.len();
    let cols = grid[0].len();

    // 检查边界和是否是陆地
    if row >= rows || col >= cols || grid[row][col] == '0' || visited[row][col] {
        return;
    }

    // 标记为已访问
    visited[row][col] = true;

    // 四个方向：上、右、下、左
    let directions = [
        (row.wrapping_sub(1), col),
        (row, col + 1),
        (row + 1, col),
        (row, col.wrapping_sub(1))
    ];

    // 递归访问四个方向的相邻单元格
    for (r, c) in directions {
        if r < rows && c < cols {
            dfs_island(grid, r, c, visited);
        }
    }
}
