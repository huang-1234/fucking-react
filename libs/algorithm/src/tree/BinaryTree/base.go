package treetraversal

// TreeNode 定义二叉树节点结构
type TreeNode struct {
	Value interface{}
	Left  *TreeNode
	Right *TreeNode
}

// TreeTraversal 树遍历类，实现前序、中序、后序和层序遍历
type TreeTraversal struct {
	Root *TreeNode
}

// NewTreeTraversal 创建一个新的树遍历实例
func NewTreeTraversal(root *TreeNode) *TreeTraversal {
	return &TreeTraversal{Root: root}
}

// PreOrderTraversalRecursive 前序遍历（递归）：根-左-右
func (t *TreeTraversal) PreOrderTraversalRecursive(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{node.Value}

	// 递归遍历左子树
	leftResult := t.PreOrderTraversalRecursive(node.Left)
	result = append(result, leftResult...)

	// 递归遍历右子树
	rightResult := t.PreOrderTraversalRecursive(node.Right)
	result = append(result, rightResult...)

	return result
}

// PreOrderTraversalIterative 前序遍历（迭代）：根-左-右
func (t *TreeTraversal) PreOrderTraversalIterative(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{}
	stack := []*TreeNode{node}

	for len(stack) > 0 {
		// 弹出栈顶元素
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		result = append(result, current.Value)

		// 先压入右节点，再压入左节点，这样出栈时会先处理左节点
		if current.Right != nil {
			stack = append(stack, current.Right)
		}
		if current.Left != nil {
			stack = append(stack, current.Left)
		}
	}

	return result
}

// InOrderTraversalRecursive 中序遍历（递归）：左-根-右
func (t *TreeTraversal) InOrderTraversalRecursive(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{}

	// 递归遍历左子树
	leftResult := t.InOrderTraversalRecursive(node.Left)
	result = append(result, leftResult...)

	// 访问根节点
	result = append(result, node.Value)

	// 递归遍历右子树
	rightResult := t.InOrderTraversalRecursive(node.Right)
	result = append(result, rightResult...)

	return result
}

// InOrderTraversalIterative 中序遍历（迭代）：左-根-右
func (t *TreeTraversal) InOrderTraversalIterative(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{}
	stack := []*TreeNode{}
	current := node

	for current != nil || len(stack) > 0 {
		// 遍历到最左叶子节点
		for current != nil {
			stack = append(stack, current)
			current = current.Left
		}

		// 弹出栈顶元素
		current = stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		result = append(result, current.Value)
		current = current.Right
	}

	return result
}

// PostOrderTraversalRecursive 后序遍历（递归）：左-右-根
func (t *TreeTraversal) PostOrderTraversalRecursive(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{}

	// 递归遍历左子树
	leftResult := t.PostOrderTraversalRecursive(node.Left)
	result = append(result, leftResult...)

	// 递归遍历右子树
	rightResult := t.PostOrderTraversalRecursive(node.Right)
	result = append(result, rightResult...)

	// 访问根节点
	result = append(result, node.Value)

	return result
}

// PostOrderTraversalIterative 后序遍历（迭代）：左-右-根
func (t *TreeTraversal) PostOrderTraversalIterative(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{}
	stack := []*TreeNode{node}
	var outputStack []*TreeNode

	for len(stack) > 0 {
		// 弹出栈顶元素
		current := stack[len(stack)-1]
		stack = stack[:len(stack)-1]

		outputStack = append(outputStack, current)

		// 先压入左节点，再压入右节点
		if current.Left != nil {
			stack = append(stack, current.Left)
		}
		if current.Right != nil {
			stack = append(stack, current.Right)
		}
	}

	// 从输出栈中弹出节点，顺序是左-右-根
	for i := len(outputStack) - 1; i >= 0; i-- {
		result = append(result, outputStack[i].Value)
	}

	return result
}

// LevelOrderTraversal 层序遍历（广度优先）
func (t *TreeTraversal) LevelOrderTraversal(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{}
	queue := []*TreeNode{node}

	for len(queue) > 0 {
		// 出队列
		current := queue[0]
		queue = queue[1:]

		result = append(result, current.Value)

		if current.Left != nil {
			queue = append(queue, current.Left)
		}
		if current.Right != nil {
			queue = append(queue, current.Right)
		}
	}

	return result
}

/* 示例用法
func main() {
	// 创建一个简单的二叉树
	//       1
	//      / \
	//     2   3
	//    / \
	//   4   5
	root := &TreeNode{Value: 1}
	root.Left = &TreeNode{Value: 2}
	root.Right = &TreeNode{Value: 3}
	root.Left.Left = &TreeNode{Value: 4}
	root.Left.Right = &TreeNode{Value: 5}

	traversal := NewTreeTraversal(root)

	fmt.Println("前序遍历（递归）:", traversal.PreOrderTraversalRecursive(nil))
	fmt.Println("前序遍历（迭代）:", traversal.PreOrderTraversalIterative(nil))
	fmt.Println("中序遍历（递归）:", traversal.InOrderTraversalRecursive(nil))
	fmt.Println("中序遍历（迭代）:", traversal.InOrderTraversalIterative(nil))
	fmt.Println("后序遍历（递归）:", traversal.PostOrderTraversalRecursive(nil))
	fmt.Println("后序遍历（迭代）:", traversal.PostOrderTraversalIterative(nil))
	fmt.Println("层序遍历:", traversal.LevelOrderTraversal(nil))
}
*/
