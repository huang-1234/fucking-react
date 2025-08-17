use std::collections::{VecDeque, LinkedList};
use std::rc::Rc;
use std::cell::RefCell;

/// 多叉树节点结构
#[derive(Debug, Clone)]
pub struct TreeNode<T> {
    pub value: T,
    pub children: Vec<Rc<RefCell<TreeNode<T>>>>,
}

impl<T: Clone> TreeNode<T> {
    /// 创建新节点
    pub fn new(value: T) -> Self {
        TreeNode {
            value,
            children: Vec::new(),
        }
    }
}

/// 多叉树遍历类，实现前序、中序、后序和层序遍历
pub struct MultiTreeTraversal<T: Clone> {
    root: Option<Rc<RefCell<TreeNode<T>>>>,
}

impl<T: Clone> MultiTreeTraversal<T> {
    /// 创建新的树遍历实例
    pub fn new(root: Option<Rc<RefCell<TreeNode<T>>>>) -> Self {
        MultiTreeTraversal { root }
    }

    /// 前序遍历（递归）：根-子节点
    pub fn pre_order_traversal_recursive(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let borrowed = node.borrow();

        // 访问根节点
        result.push(borrowed.value.clone());

        // 递归遍历所有子节点
        for child in &borrowed.children {
            let child_result = self.pre_order_traversal_recursive(Some(child.clone()));
            result.extend(child_result);
        }

        result
    }

    /// 前序遍历（迭代）：根-子节点
    pub fn pre_order_traversal_iterative(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let mut stack = vec![node];

        while !stack.is_empty() {
            if let Some(current) = stack.pop() {
                let borrowed = current.borrow();
                result.push(borrowed.value.clone());

                // 从右向左压入子节点，这样出栈时会从左向右处理
                for i in (0..borrowed.children.len()).rev() {
                    stack.push(borrowed.children[i].clone());
                }
            }
        }

        result
    }

    /// 后序遍历（递归）：子节点-根
    pub fn post_order_traversal_recursive(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let borrowed = node.borrow();

        // 递归遍历所有子节点
        for child in &borrowed.children {
            let child_result = self.post_order_traversal_recursive(Some(child.clone()));
            result.extend(child_result);
        }

        // 访问根节点
        result.push(borrowed.value.clone());

        result
    }

    /// 后序遍历（迭代）：子节点-根
    pub fn post_order_traversal_iterative(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let mut stack = vec![node.clone()];
        let mut output_stack = vec![];

        while !stack.is_empty() {
            if let Some(current) = stack.pop() {
                output_stack.push(current.clone());

                // 从左向右压入子节点
                let borrowed = current.borrow();
                for child in &borrowed.children {
                    stack.push(child.clone());
                }
            }
        }

        // 从输出栈中弹出节点，顺序是子节点-根
        while let Some(node) = output_stack.pop() {
            result.push(node.borrow().value.clone());
        }

        result
    }

    /// 层序遍历（递归）
    pub fn level_order_traversal_recursive(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let mut levels: Vec<Vec<T>> = Vec::new();

        // 辅助函数，递归遍历每一层
        fn traverse_level<T: Clone>(
            node: &Rc<RefCell<TreeNode<T>>>,
            level: usize,
            levels: &mut Vec<Vec<T>>
        ) {
            // 确保levels向量有足够的容量
            if levels.len() <= level {
                levels.resize_with(level + 1, Vec::new);
            }

            levels[level].push(node.borrow().value.clone());

            for child in &node.borrow().children {
                traverse_level(child, level + 1, levels);
            }
        }

        traverse_level(&node, 0, &mut levels);

        // 将所有层级的节点值合并到结果数组
        for level in levels {
            result.extend(level);
        }

        result
    }

    /// 层序遍历（迭代）
    pub fn level_order_traversal_iterative(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let mut queue = VecDeque::new();
        queue.push_back(node);

        while !queue.is_empty() {
            if let Some(current) = queue.pop_front() {
                result.push(current.borrow().value.clone());

                for child in &current.borrow().children {
                    queue.push_back(child.clone());
                }
            }
        }

        result
    }

    /// 中序遍历（递归）：对于多叉树，中序遍历的定义不如二叉树明确
    /// 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
    pub fn in_order_traversal_recursive(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let borrowed = node.borrow();

        if borrowed.children.is_empty() {
            return vec![borrowed.value.clone()];
        }

        // 访问第一个子节点
        if !borrowed.children.is_empty() {
            let first_child_result = self.in_order_traversal_recursive(Some(borrowed.children[0].clone()));
            result.extend(first_child_result);
        }

        // 访问根节点
        result.push(borrowed.value.clone());

        // 访问其余子节点
        for i in 1..borrowed.children.len() {
            let child_result = self.in_order_traversal_recursive(Some(borrowed.children[i].clone()));
            result.extend(child_result);
        }

        result
    }

    /// 中序遍历（迭代）：对于多叉树，中序遍历的定义不如二叉树明确
    /// 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
    pub fn in_order_traversal_iterative(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        #[derive(Clone)]
        struct StackItem<T: Clone> {
            node: Rc<RefCell<TreeNode<T>>>,
            visited_root: bool,
            child_index: usize,
        }

        let mut result = vec![];
        let mut stack = vec![StackItem {
            node: node.clone(),
            visited_root: false,
            child_index: 0,
        }];

        while !stack.is_empty() {
            let mut current = stack.last_mut().unwrap();
            let children_len = current.node.borrow().children.len();

            // 如果没有子节点或者已经访问完所有子节点
            if children_len == 0 || (current.visited_root && current.child_index >= children_len) {
                if !current.visited_root {
                    result.push(current.node.borrow().value.clone());
                    current.visited_root = true;
                } else {
                    stack.pop();
                }
                continue;
            }

            // 如果没有访问根节点且已经访问了第一个子节点
            if !current.visited_root && current.child_index == 1 {
                result.push(current.node.borrow().value.clone());
                current.visited_root = true;
                continue;
            }

            // 访问下一个子节点
            if current.child_index < children_len {
                let next_child = current.node.borrow().children[current.child_index].clone();
                current.child_index += 1;
                stack.push(StackItem {
                    node: next_child,
                    visited_root: false,
                    child_index: 0,
                });
            }
        }

        result
    }
}

/* 示例用法
fn main() {
    // 创建一个简单的多叉树
    //       1
    //     / | \
    //    2  3  4
    //   / \    |
    //  5   6   7
    let root = Rc::new(RefCell::new(TreeNode::new(1)));
    let node2 = Rc::new(RefCell::new(TreeNode::new(2)));
    let node3 = Rc::new(RefCell::new(TreeNode::new(3)));
    let node4 = Rc::new(RefCell::new(TreeNode::new(4)));
    let node5 = Rc::new(RefCell::new(TreeNode::new(5)));
    let node6 = Rc::new(RefCell::new(TreeNode::new(6)));
    let node7 = Rc::new(RefCell::new(TreeNode::new(7)));

    root.borrow_mut().children.push(node2.clone());
    root.borrow_mut().children.push(node3.clone());
    root.borrow_mut().children.push(node4.clone());
    node2.borrow_mut().children.push(node5.clone());
    node2.borrow_mut().children.push(node6.clone());
    node4.borrow_mut().children.push(node7.clone());

    let traversal = MultiTreeTraversal::new(Some(root.clone()));

    println!("前序遍历（递归）: {:?}", traversal.pre_order_traversal_recursive(None));
    println!("前序遍历（迭代）: {:?}", traversal.pre_order_traversal_iterative(None));
    println!("中序遍历（递归）: {:?}", traversal.in_order_traversal_recursive(None));
    println!("中序遍历（迭代）: {:?}", traversal.in_order_traversal_iterative(None));
    println!("后序遍历（递归）: {:?}", traversal.post_order_traversal_recursive(None));
    println!("后序遍历（迭代）: {:?}", traversal.post_order_traversal_iterative(None));
    println!("层序遍历（递归）: {:?}", traversal.level_order_traversal_recursive(None));
    println!("层序遍历（迭代）: {:?}", traversal.level_order_traversal_iterative(None));
}
*/
