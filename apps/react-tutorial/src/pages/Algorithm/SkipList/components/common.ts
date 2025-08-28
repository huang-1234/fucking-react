const codeFuc = (v?: string, idx?: number) => v + '_' + idx;
type TCode = string | typeof codeFuc;
interface DemoStep {
  title: string;
  description: string;
  code?: TCode
  explanation: string;
}
export const demoSteps: DemoStep[] = [
  {
    title: '创建跳表',
    description: '初始化一个空的跳表结构',
    code: `const skipList = new SkipList<number>(16, 0.5);
console.log('跳表已创建，最大层级: 16，升级概率: 0.5');`,
    explanation: '跳表使用多层链表结构，每个节点可能出现在多个层级中。最大层级限制了跳表的高度，升级概率决定了节点出现在上层的可能性。',
  },
  {
    title: '插入第一个元素',
    description: '向跳表中插入数值 5',
    code: `const result = skipList.insert(5);
console.log('插入结果:', result.success);
console.log('当前数据:', skipList.toArray());`,
    explanation: '插入操作会随机决定新节点的层级。节点会从底层开始，根据概率决定是否升级到上一层。',
  },
  {
    title: '插入更多元素',
    description: '继续插入 3, 8, 1, 9',
    code: `[3, 8, 1, 9].forEach(value => {
  const result = skipList.insert(value);
  console.log(\`插入 \${value}: \${result.success}\`);
});
console.log('当前数据:', skipList.toArray());`,
    explanation: '跳表会自动维护数据的有序性。无论插入顺序如何，底层链表始终保持升序排列。',
  },
  {
    title: '搜索操作',
    description: '在跳表中搜索特定值',
    code: `const searchResult = skipList.search(8);
if (searchResult) {
  console.log('找到节点，值为:', searchResult.value);
} else {
  console.log('未找到节点');
}`,
    explanation: '搜索从最高层开始，水平移动直到找到最后一个小于目标值的节点，然后下降到下一层继续搜索。',
  },
  {
    title: '删除操作',
    description: '从跳表中删除元素',
    code: `const deleteResult = skipList.delete(3);
console.log('删除结果:', deleteResult.success);
console.log('删除后数据:', skipList.toArray());`,
    explanation: '删除操作需要在所有包含该节点的层级中移除对应的指针，并更新前驱节点的指针。',
  },
  {
    title: '查看层级结构',
    description: '观察跳表的多层结构',
    code: (v?: string, idx?: number) => `const levels = skipList.getLevels();
levels.forEach((level, index) => {
  const values = level.map(({node}) => node.value);
  console.log(\`第\${idx || index}层:\`, \`\${v || values.join(' -> ')}\`);
});`,
    explanation: '跳表的核心优势在于多层索引结构。上层作为下层的"快速通道"，大大减少了搜索时需要遍历的节点数量。',
  },
];