#include <iostream>
#include <vector>
#include <stack>
#include <queue>

/**
 * 树节点定义
 */
template <typename T>
struct TreeNode {
    T value;
    TreeNode* left;
    TreeNode* right;

    TreeNode(T val) : value(val), left(nullptr), right(nullptr) {}
};

/**
 * 树遍历类，实现前序、中序、后序和层序遍历，每种遍历都有递归和迭代两种实现
 */
template <typename T>
class TreeTraversal {
private:
    TreeNode<T>* root;

public:
    TreeTraversal(TreeNode<T>* tree) : root(tree) {}

    /**
     * 前序遍历（递归）：根-左-右
     */
    std::vector<T> preOrderTraversalRecursive(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        // 访问根节点
        result.push_back(node->value);

        // 递归遍历左子树
        std::vector<T> leftResult = preOrderTraversalRecursive(node->left);
        result.insert(result.end(), leftResult.begin(), leftResult.end());

        // 递归遍历右子树
        std::vector<T> rightResult = preOrderTraversalRecursive(node->right);
        result.insert(result.end(), rightResult.begin(), rightResult.end());

        return result;
    }

    /**
     * 前序遍历（迭代）：根-左-右
     */
    std::vector<T> preOrderTraversalIterative(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        std::stack<TreeNode<T>*> stack;
        stack.push(node);

        while (!stack.empty()) {
            TreeNode<T>* current = stack.top();
            stack.pop();

            result.push_back(current->value);

            // 先压入右节点，再压入左节点，这样出栈时会先处理左节点
            if (current->right) {
                stack.push(current->right);
            }
            if (current->left) {
                stack.push(current->left);
            }
        }

        return result;
    }

    /**
     * 中序遍历（递归）：左-根-右
     */
    std::vector<T> inOrderTraversalRecursive(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        // 递归遍历左子树
        std::vector<T> leftResult = inOrderTraversalRecursive(node->left);
        result.insert(result.end(), leftResult.begin(), leftResult.end());

        // 访问根节点
        result.push_back(node->value);

        // 递归遍历右子树
        std::vector<T> rightResult = inOrderTraversalRecursive(node->right);
        result.insert(result.end(), rightResult.begin(), rightResult.end());

        return result;
    }

    /**
     * 中序遍历（迭代）：左-根-右
     */
    std::vector<T> inOrderTraversalIterative(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        std::stack<TreeNode<T>*> stack;
        TreeNode<T>* current = node;

        while (current != nullptr || !stack.empty()) {
            // 遍历到最左叶子节点
            while (current != nullptr) {
                stack.push(current);
                current = current->left;
            }

            current = stack.top();
            stack.pop();

            result.push_back(current->value);
            current = current->right;
        }

        return result;
    }

    /**
     * 后序遍历（递归）：左-右-根
     */
    std::vector<T> postOrderTraversalRecursive(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        // 递归遍历左子树
        std::vector<T> leftResult = postOrderTraversalRecursive(node->left);
        result.insert(result.end(), leftResult.begin(), leftResult.end());

        // 递归遍历右子树
        std::vector<T> rightResult = postOrderTraversalRecursive(node->right);
        result.insert(result.end(), rightResult.begin(), rightResult.end());

        // 访问根节点
        result.push_back(node->value);

        return result;
    }

    /**
     * 后序遍历（迭代）：左-右-根
     */
    std::vector<T> postOrderTraversalIterative(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        std::stack<TreeNode<T>*> stack;
        std::stack<TreeNode<T>*> outputStack;

        stack.push(node);

        while (!stack.empty()) {
            TreeNode<T>* current = stack.top();
            stack.pop();
            outputStack.push(current);

            // 先压入左节点，再压入右节点
            if (current->left) {
                stack.push(current->left);
            }
            if (current->right) {
                stack.push(current->right);
            }
        }

        // 从输出栈中弹出节点，顺序是左-右-根
        while (!outputStack.empty()) {
            result.push_back(outputStack.top()->value);
            outputStack.pop();
        }

        return result;
    }

    /**
     * 层序遍历（广度优先）
     */
    std::vector<T> levelOrderTraversal(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        std::queue<TreeNode<T>*> queue;
        queue.push(node);

        while (!queue.empty()) {
            TreeNode<T>* current = queue.front();
            queue.pop();

            result.push_back(current->value);

            if (current->left) {
                queue.push(current->left);
            }
            if (current->right) {
                queue.push(current->right);
            }
        }

        return result;
    }
};

// 示例用法
/*
int main() {
    // 创建一个简单的二叉树
    //       1
    //      / \
    //     2   3
    //    / \
    //   4   5
    TreeNode<int>* root = new TreeNode<int>(1);
    root->left = new TreeNode<int>(2);
    root->right = new TreeNode<int>(3);
    root->left->left = new TreeNode<int>(4);
    root->left->right = new TreeNode<int>(5);

    TreeTraversal<int> traversal(root);

    // 前序遍历
    std::vector<int> preOrderResult = traversal.preOrderTraversalRecursive();
    std::cout << "前序遍历（递归）: ";
    for (int val : preOrderResult) {
        std::cout << val << " ";
    }
    std::cout << std::endl;

    // 释放内存
    // 这里应该有适当的内存清理代码

    return 0;
}
*/
