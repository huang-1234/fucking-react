#include <iostream>
#include <vector>
#include <stack>
#include <queue>
#include <functional>

/**
 * 多叉树节点定义
 */
template <typename T>
struct TreeNode {
    T value;
    std::vector<TreeNode*> children;

    TreeNode(T val) : value(val) {}
};

/**
 * 多叉树遍历类，实现前序、中序、后序和层序遍历，每种遍历都有递归和迭代两种实现
 */
template <typename T>
class MultiTreeTraversal {
private:
    TreeNode<T>* root;

public:
    MultiTreeTraversal(TreeNode<T>* tree) : root(tree) {}

    /**
     * 前序遍历（递归）：根-子节点
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

        // 递归遍历所有子节点
        for (TreeNode<T>* child : node->children) {
            std::vector<T> childResult = preOrderTraversalRecursive(child);
            result.insert(result.end(), childResult.begin(), childResult.end());
        }

        return result;
    }

    /**
     * 前序遍历（迭代）：根-子节点
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

            // 从右向左压入子节点，这样出栈时会从左向右处理
            for (int i = current->children.size() - 1; i >= 0; i--) {
                stack.push(current->children[i]);
            }
        }

        return result;
    }

    /**
     * 后序遍历（递归）：子节点-根
     */
    std::vector<T> postOrderTraversalRecursive(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        // 递归遍历所有子节点
        for (TreeNode<T>* child : node->children) {
            std::vector<T> childResult = postOrderTraversalRecursive(child);
            result.insert(result.end(), childResult.begin(), childResult.end());
        }

        // 访问根节点
        result.push_back(node->value);

        return result;
    }

    /**
     * 后序遍历（迭代）：子节点-根
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

            // 从左向右压入子节点
            for (TreeNode<T>* child : current->children) {
                stack.push(child);
            }
        }

        // 从输出栈中弹出节点，顺序是子节点-根
        while (!outputStack.empty()) {
            result.push_back(outputStack.top()->value);
            outputStack.pop();
        }

        return result;
    }

    /**
     * 层序遍历（递归）
     */
    std::vector<T> levelOrderTraversalRecursive(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        std::vector<std::vector<T>> levels;

        // 辅助函数，递归遍历每一层
        std::function<void(TreeNode<T>*, int)> traverseLevel = [&](TreeNode<T>* node, int level) {
            if (levels.size() <= level) {
                levels.resize(level + 1);
            }

            levels[level].push_back(node->value);

            for (TreeNode<T>* child : node->children) {
                traverseLevel(child, level + 1);
            }
        };

        traverseLevel(node, 0);

        // 将所有层级的节点值合并到结果数组
        for (const auto& level : levels) {
            result.insert(result.end(), level.begin(), level.end());
        }

        return result;
    }

    /**
     * 层序遍历（迭代）
     */
    std::vector<T> levelOrderTraversalIterative(TreeNode<T>* node = nullptr) {
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

            // 将所有子节点加入队列
            for (TreeNode<T>* child : current->children) {
                queue.push(child);
            }
        }

        return result;
    }

    /**
     * 中序遍历（递归）：对于多叉树，中序遍历的定义不如二叉树明确
     * 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
     */
    std::vector<T> inOrderTraversalRecursive(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        if (node->children.empty()) {
            result.push_back(node->value);
            return result;
        }

        // 访问第一个子节点
        if (!node->children.empty()) {
            std::vector<T> firstChildResult = inOrderTraversalRecursive(node->children[0]);
            result.insert(result.end(), firstChildResult.begin(), firstChildResult.end());
        }

        // 访问根节点
        result.push_back(node->value);

        // 访问其余子节点
        for (size_t i = 1; i < node->children.size(); i++) {
            std::vector<T> childResult = inOrderTraversalRecursive(node->children[i]);
            result.insert(result.end(), childResult.begin(), childResult.end());
        }

        return result;
    }

    /**
     * 中序遍历（迭代）：对于多叉树，中序遍历的定义不如二叉树明确
     * 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
     */
    std::vector<T> inOrderTraversalIterative(TreeNode<T>* node = nullptr) {
        if (node == nullptr) {
            node = root;
        }

        std::vector<T> result;
        if (node == nullptr) {
            return result;
        }

        struct StackItem {
            TreeNode<T>* node;
            bool visitedRoot;
            size_t childIndex;

            StackItem(TreeNode<T>* n) : node(n), visitedRoot(false), childIndex(0) {}
        };

        std::stack<StackItem> stack;
        stack.push(StackItem(node));

        while (!stack.empty()) {
            StackItem& current = stack.top();

            // 如果没有子节点或者已经访问完所有子节点
            if (current.node->children.empty() ||
                (current.visitedRoot && current.childIndex >= current.node->children.size())) {
                if (!current.visitedRoot) {
                    result.push_back(current.node->value);
                    current.visitedRoot = true;
                } else {
                    stack.pop();
                }
                continue;
            }

            // 如果没有访问根节点且已经访问了第一个子节点
            if (!current.visitedRoot && current.childIndex == 1) {
                result.push_back(current.node->value);
                current.visitedRoot = true;
                continue;
            }

            // 访问下一个子节点
            if (current.childIndex < current.node->children.size()) {
                TreeNode<T>* nextChild = current.node->children[current.childIndex++];
                stack.push(StackItem(nextChild));
            }
        }

        return result;
    }
};

// 示例用法
/*
int main() {
    // 创建一个简单的多叉树
    //       1
    //     / | \
    //    2  3  4
    //   / \    |
    //  5   6   7
    TreeNode<int>* root = new TreeNode<int>(1);
    TreeNode<int>* node2 = new TreeNode<int>(2);
    TreeNode<int>* node3 = new TreeNode<int>(3);
    TreeNode<int>* node4 = new TreeNode<int>(4);
    TreeNode<int>* node5 = new TreeNode<int>(5);
    TreeNode<int>* node6 = new TreeNode<int>(6);
    TreeNode<int>* node7 = new TreeNode<int>(7);

    root->children.push_back(node2);
    root->children.push_back(node3);
    root->children.push_back(node4);
    node2->children.push_back(node5);
    node2->children.push_back(node6);
    node4->children.push_back(node7);

    MultiTreeTraversal<int> traversal(root);

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
