class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map();
  }
  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);
    this.map.set(key, value); // 更新访问顺序
    return value;
  }
  put(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity)
      this.map.delete(this.map.keys().next().value); // 删除最久未使用
  }
}

function testLRUCache() {
  const cache = new LRUCache(2);
  cache.put(1, 1);
  cache.put(2, 2);
  console.log(cache.get(1)); // 返回 1
  cache.put(3, 3); // 该操作会使得关键字 2 作废
  console.log(cache.get(2)); // 返回 -1 (未找到)
}
testLRUCache()