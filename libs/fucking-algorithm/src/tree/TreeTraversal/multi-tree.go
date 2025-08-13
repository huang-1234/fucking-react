package treetraversal

// TreeNode 定义多叉树节点结构
type TreeNode struct {
	Value    interface{}
	Children []*TreeNode
}

// NewTreeNode 创建一个新的树节点
func NewTreeNode(value interface{}) *TreeNode {
	return &TreeNode{
		Value:    value,
		Children: []*TreeNode{},
	}
}

// MultiTreeTraversal 多叉树遍历类，实现前序、中序、后序和层序遍历
type MultiTreeTraversal struct {
	Root *TreeNode
}

// NewMultiTreeTraversal 创建一个新的多叉树遍历实例
func NewMultiTreeTraversal(root *TreeNode) *MultiTreeTraversal {
	return &MultiTreeTraversal{Root: root}
}

// PreOrderTraversalRecursive 前序遍历（递归）：根-子节点
func (t *MultiTreeTraversal) PreOrderTraversalRecursive(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	// 访问根节点
	result := []interface{}{node.Value}

	// 递归遍历所有子节点
	for _, child := range node.Children {
		childResult := t.PreOrderTraversalRecursive(child)
		result = append(result, childResult...)
	}

	return result
}

// PreOrderTraversalIterative 前序遍历（迭代）：根-子节点
func (t *MultiTreeTraversal) PreOrderTraversalIterative(node *TreeNode) []interface{} {
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

		// 从右向左压入子节点，这样出栈时会从左向右处理
		for i := len(current.Children) - 1; i >= 0; i-- {
			stack = append(stack, current.Children[i])
		}
	}

	return result
}

// PostOrderTraversalRecursive 后序遍历（递归）：子节点-根
func (t *MultiTreeTraversal) PostOrderTraversalRecursive(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	result := []interface{}{}

	// 递归遍历所有子节点
	for _, child := range node.Children {
		childResult := t.PostOrderTraversalRecursive(child)
		result = append(result, childResult...)
	}

	// 访问根节点
	result = append(result, node.Value)

	return result
}

// PostOrderTraversalIterative 后序遍历（迭代）：子节点-根
func (t *MultiTreeTraversal) PostOrderTraversalIterative(node *TreeNode) []interface{} {
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

		// 从左向右压入子节点
		for _, child := range current.Children {
			stack = append(stack, child)
		}
	}

	// 从输出栈中弹出节点，顺序是子节点-根
	for i := len(outputStack) - 1; i >= 0; i-- {
		result = append(result, outputStack[i].Value)
	}

	return result
}

// LevelOrderTraversalRecursive 层序遍历（递归）
func (t *MultiTreeTraversal) LevelOrderTraversalRecursive(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	var levels [][]interface{}

	// 辅助函数，递归遍历每一层
	var traverseLevel func(node *TreeNode, level int)
	traverseLevel = func(node *TreeNode, level int) {
		// 确保levels切片有足够的容量
		for len(levels) <= level {
			levels = append(levels, []interface{}{})
		}

		levels[level] = append(levels[level], node.Value)

		for _, child := range node.Children {
			traverseLevel(child, level+1)
		}
	}

	traverseLevel(node, 0)

	// 将所有层级的节点值合并到结果数组
	result := []interface{}{}
	for _, level := range levels {
		result = append(result, level...)
	}

	return result
}

// LevelOrderTraversalIterative 层序遍历（迭代）
func (t *MultiTreeTraversal) LevelOrderTraversalIterative(node *TreeNode) []interface{} {
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

		// 将所有子节点加入队列
		for _, child := range current.Children {
			queue = append(queue, child)
		}
	}

	return result
}

// InOrderTraversalRecursive 中序遍历（递归）：对于多叉树，中序遍历的定义不如二叉树明确
// 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
func (t *MultiTreeTraversal) InOrderTraversalRecursive(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	if len(node.Children) == 0 {
		return []interface{}{node.Value}
	}

	result := []interface{}{}

	// 访问第一个子节点
	if len(node.Children) > 0 {
		firstChildResult := t.InOrderTraversalRecursive(node.Children[0])
		result = append(result, firstChildResult...)
	}

	// 访问根节点
	result = append(result, node.Value)

	// 访问其余子节点
	for i := 1; i < len(node.Children); i++ {
		childResult := t.InOrderTraversalRecursive(node.Children[i])
		result = append(result, childResult...)
	}

	return result
}

// InOrderTraversalIterative 中序遍历（迭代）：对于多叉树，中序遍历的定义不如二叉树明确
// 这里采用访问第一个子节点，然后访问根节点，然后访问其余子节点的方式
func (t *MultiTreeTraversal) InOrderTraversalIterative(node *TreeNode) []interface{} {
	if node == nil {
		node = t.Root
	}

	if node == nil {
		return []interface{}{}
	}

	type stackItem struct {
		node        *TreeNode
		visitedRoot bool
		childIndex  int
	}

	result := []interface{}{}
	stack := []stackItem{{node: node, visitedRoot: false, childIndex: 0}}

	for len(stack) > 0 {
		current := &stack[len(stack)-1]

		// 如果没有子节点或者已经访问完所有子节点
		if len(current.node.Children) == 0 ||
			(current.visitedRoot && current.childIndex >= len(current.node.Children)) {
			if !current.visitedRoot {
				result = append(result, current.node.Value)
				current.visitedRoot = true
			} else {
				stack = stack[:len(stack)-1]
			}
			continue
		}

		// 如果没有访问根节点且已经访问了第一个子节点
		if !current.visitedRoot && current.childIndex == 1 {
			result = append(result, current.node.Value)
			current.visitedRoot = true
			continue
		}

		// 访问下一个子节点
		if current.childIndex < len(current.node.Children) {
			nextChild := current.node.Children[current.childIndex]
			current.childIndex++
			stack = append(stack, stackItem{node: nextChild, visitedRoot: false, childIndex: 0})
		}
	}

	return result
}

/* 示例用法
func main() {
	// 创建一个简单的多叉树
	//       1
	//     / | \
	//    2  3  4
	//   / \    |
	//  5   6   7
	root := NewTreeNode(1)
	node2 := NewTreeNode(2)
	node3 := NewTreeNode(3)
	node4 := NewTreeNode(4)
	node5 := NewTreeNode(5)
	node6 := NewTreeNode(6)
	node7 := NewTreeNode(7)

	root.Children = append(root.Children, node2)
	root.Children = append(root.Children, node3)
	root.Children = append(root.Children, node4)
	node2.Children = append(node2.Children, node5)
	node2.Children = append(node2.Children, node6)
	node4.Children = append(node4.Children, node7)

	traversal := NewMultiTreeTraversal(root)

	fmt.Println("前序遍历（递归）:", traversal.PreOrderTraversalRecursive(nil))
	fmt.Println("前序遍历（迭代）:", traversal.PreOrderTraversalIterative(nil))
	fmt.Println("中序遍历（递归）:", traversal.InOrderTraversalRecursive(nil))
	fmt.Println("中序遍历（迭代）:", traversal.InOrderTraversalIterative(nil))
	fmt.Println("后序遍历（递归）:", traversal.PostOrderTraversalRecursive(nil))
	fmt.Println("后序遍历（迭代）:", traversal.PostOrderTraversalIterative(nil))
	fmt.Println("层序遍历（递归）:", traversal.LevelOrderTraversalRecursive(nil))
	fmt.Println("层序遍历（迭代）:", traversal.LevelOrderTraversalIterative(nil))
}
*/
