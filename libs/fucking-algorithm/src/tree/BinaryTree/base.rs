use std::collections::{VecDeque, LinkedList};
use std::rc::Rc;
use std::cell::RefCell;

// 定义二叉树节点结构
#[derive(Debug, Clone)]
pub struct TreeNode<T> {
    pub value: T,
    pub left: Option<Rc<RefCell<TreeNode<T>>>>,
    pub right: Option<Rc<RefCell<TreeNode<T>>>>,
}

impl<T: Clone> TreeNode<T> {
    // 创建新节点
    pub fn new(value: T) -> Self {
        TreeNode {
            value,
            left: None,
            right: None,
        }
    }
}

// 树遍历类，实现前序、中序、后序和层序遍历
pub struct TreeTraversal<T: Clone> {
    root: Option<Rc<RefCell<TreeNode<T>>>>,
}

impl<T: Clone> TreeTraversal<T> {
    // 创建新的树遍历实例
    pub fn new(root: Option<Rc<RefCell<TreeNode<T>>>>) -> Self {
        TreeTraversal { root }
    }

    // 前序遍历（递归）：根-左-右
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

        // 递归遍历左子树
        if let Some(left) = &borrowed.left {
            let left_result = self.pre_order_traversal_recursive(Some(left.clone()));
            result.extend(left_result);
        }

        // 递归遍历右子树
        if let Some(right) = &borrowed.right {
            let right_result = self.pre_order_traversal_recursive(Some(right.clone()));
            result.extend(right_result);
        }

        result
    }

    // 前序遍历（迭代）：根-左-右
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

                // 先压入右节点，再压入左节点，这样出栈时会先处理左节点
                if let Some(right) = &borrowed.right {
                    stack.push(right.clone());
                }
                if let Some(left) = &borrowed.left {
                    stack.push(left.clone());
                }
            }
        }

        result
    }

    // 中序遍历（递归）：左-根-右
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

        // 递归遍历左子树
        if let Some(left) = &borrowed.left {
            let left_result = self.in_order_traversal_recursive(Some(left.clone()));
            result.extend(left_result);
        }

        // 访问根节点
        result.push(borrowed.value.clone());

        // 递归遍历右子树
        if let Some(right) = &borrowed.right {
            let right_result = self.in_order_traversal_recursive(Some(right.clone()));
            result.extend(right_result);
        }

        result
    }

    // 中序遍历（迭代）：左-根-右
    pub fn in_order_traversal_iterative(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let mut stack = vec![];
        let mut current = Some(node);

        while current.is_some() || !stack.is_empty() {
            // 遍历到最左叶子节点
            while let Some(curr) = current {
                stack.push(curr.clone());
                current = match &curr.borrow().left {
                    Some(left) => Some(left.clone()),
                    None => None,
                };
            }

            if let Some(popped) = stack.pop() {
                result.push(popped.borrow().value.clone());

                current = match &popped.borrow().right {
                    Some(right) => Some(right.clone()),
                    None => None,
                };
            }
        }

        result
    }

    // 后序遍历（递归）：左-右-根
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

        // 递归遍历左子树
        if let Some(left) = &borrowed.left {
            let left_result = self.post_order_traversal_recursive(Some(left.clone()));
            result.extend(left_result);
        }

        // 递归遍历右子树
        if let Some(right) = &borrowed.right {
            let right_result = self.post_order_traversal_recursive(Some(right.clone()));
            result.extend(right_result);
        }

        // 访问根节点
        result.push(borrowed.value.clone());

        result
    }

    // 后序遍历（迭代）：左-右-根
    pub fn post_order_traversal_iterative(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
        let node = match node {
            Some(n) => n,
            None => match &self.root {
                Some(r) => r.clone(),
                None => return vec![],
            },
        };

        let mut result = vec![];
        let mut stack = vec![node];
        let mut output_stack = vec![];

        while !stack.is_empty() {
            if let Some(current) = stack.pop() {
                output_stack.push(current.clone());

                // 先压入左节点，再压入右节点
                if let Some(left) = &current.borrow().left {
                    stack.push(left.clone());
                }
                if let Some(right) = &current.borrow().right {
                    stack.push(right.clone());
                }
            }
        }

        // 从输出栈中弹出节点，顺序是左-右-根
        while let Some(node) = output_stack.pop() {
            result.push(node.borrow().value.clone());
        }

        result
    }

    // 层序遍历（广度优先）
    pub fn level_order_traversal(&self, node: Option<Rc<RefCell<TreeNode<T>>>>) -> Vec<T> {
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

                if let Some(left) = &current.borrow().left {
                    queue.push_back(left.clone());
                }
                if let Some(right) = &current.borrow().right {
                    queue.push_back(right.clone());
                }
            }
        }

        result
    }
}

/* 示例用法
fn main() {
    // 创建一个简单的二叉树
    //       1
    //      / \
    //     2   3
    //    / \
    //   4   5
    let root = Rc::new(RefCell::new(TreeNode::new(1)));
    let left = Rc::new(RefCell::new(TreeNode::new(2)));
    let right = Rc::new(RefCell::new(TreeNode::new(3)));
    let left_left = Rc::new(RefCell::new(TreeNode::new(4)));
    let left_right = Rc::new(RefCell::new(TreeNode::new(5)));

    root.borrow_mut().left = Some(left.clone());
    root.borrow_mut().right = Some(right.clone());
    left.borrow_mut().left = Some(left_left.clone());
    left.borrow_mut().right = Some(left_right.clone());

    let traversal = TreeTraversal::new(Some(root.clone()));

    println!("前序遍历（递归）: {:?}", traversal.pre_order_traversal_recursive(None));
    println!("前序遍历（迭代）: {:?}", traversal.pre_order_traversal_iterative(None));
    println!("中序遍历（递归）: {:?}", traversal.in_order_traversal_recursive(None));
    println!("中序遍历（迭代）: {:?}", traversal.in_order_traversal_iterative(None));
    println!("后序遍历（递归）: {:?}", traversal.post_order_traversal_recursive(None));
    println!("后序遍历（迭代）: {:?}", traversal.post_order_traversal_iterative(None));
    println!("层序遍历: {:?}", traversal.level_order_traversal(None));
}
*/
