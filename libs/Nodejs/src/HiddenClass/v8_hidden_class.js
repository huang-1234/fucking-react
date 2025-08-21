// V8隐藏类调试
function inspectHiddenClasses() {
  const obj1 = {};
  DebugPrint(obj1); // C0

  obj1.a = 1;       // C1
  obj1.b = 2;       // C2

  const obj2 = {};
  obj2.b = 2;       // C0 -> C3 (不同路径)
  obj2.a = 1;       // C3 -> C4

  // 最佳实践：
  // 1. 构造函数初始化所有属性
  // 2. 避免删除属性
  // 3. 相同属性添加顺序一致
}