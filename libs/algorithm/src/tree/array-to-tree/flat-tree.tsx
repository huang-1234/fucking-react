export interface IMenuItem {
  id: number;
  pid?: number | null; // 明确允许 null
  order?: number;
  props?: {
    title: string;
    value?: number;
    count?: number;
    color?: string;
  };
}

export interface IMenuTree extends IMenuItem {
  children?: IMenuTree[]; // 继承 IMenuItem 属性
}

/**
 * 构建树形结构（支持排序、孤儿节点处理、循环引用检测）
 * @param menus 扁平节点列表
 * @param options 配置项
 * @returns 树形结构数组
 */
export function buildTree(
  menus: IMenuItem[],
  options?: {
    orphanMode?: 'root' | 'ignore'; // 孤儿节点处理：作为根节点或忽略
    sortChildren?: boolean; // 是否按 order 排序子节点
  }
): IMenuTree[] {
  const map = new Map<number, IMenuTree>();
  const tree: IMenuTree[] = [];
  const visited = new Set<number>(); // 检测循环引用

  // 初始化节点并存入 Map
  menus.forEach(menu => {
    map.set(menu.id, { ...menu, children: [] });
  });

  // 构建树形结构
  menus.forEach(menu => {
    const node = map.get(menu.id)!;
    visited.add(node.id);

    // 处理根节点
    if (menu.pid == null || menu.pid === 0) {
      tree.push(node);
      return;
    }

    // 查找父节点
    const parent = map.get(menu.pid);
    if (parent) {
      // 循环引用检测（A→B→A）
      if (visited.has(menu.pid)) {
        console.error(`循环引用: ${parent.id} -> ${node.id}`);
        return;
      }
      parent.children!.push(node);
    } else {
      // 孤儿节点处理
      switch (options?.orphanMode) {
        case 'root':
          tree.push(node);
          break;
        case 'ignore':
          break;
        default:
          console.warn(`孤儿节点: ${node.id} (父节点 ${menu.pid} 不存在)`);
      }
    }
  });

  // 子节点排序（按 order 升序）
  if (options?.sortChildren) {
    const sortNodes = (nodes: IMenuTree[]) => {
      nodes.forEach(node => {
        if (node.children?.length) {
          node.children.sort((a, b) => (a.order || 0) - (b.order || 0));
          sortNodes(node.children); // 递归排序子树
        }
      });
    };
    sortNodes(tree);
  }

  return tree;
}