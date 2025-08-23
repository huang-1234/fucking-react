// 定义链表节点类型
export interface LinkNode {
  val: number;
  next: LinkNode | null;
}

// 定义链表类型
export interface LinkTableType {
  head: LinkNode | null;
  tail: LinkNode | null;
  length: number;
  isCircular: boolean;
  isDoubly: boolean;
  isSingly: boolean;
}

// 创建一个节点
const createNode = (val: number): LinkNode => {
  return {
    val,
    next: null,
  };
};
// 链表类的实现
export class LinkTable {
  head: LinkNode | null;
  tail: LinkNode | null;
  length: number;
  isCircular: boolean;
  isDoubly: boolean;
  isSingly: boolean;

  constructor(
    head = null,
    tail = null,
    length = 0,
    isCircular = false,
    isDoubly = false,
    isSingly = true
  ) {
    this.head = head;
    this.tail = tail;
    this.length = length;
    this.isCircular = isCircular;
    this.isDoubly = isDoubly;
    this.isSingly = isSingly;
  }

  // 在链表末尾添加节点
  append(val: number) {
    const newNode = createNode(val);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      if (this.tail) {
        this.tail.next = newNode;
        this.tail = newNode;
      }
    }

    // 处理循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    this.length++;
    return true;
  }

  // 在链表头部添加节点
  prepend(val: number) {
    const newNode = createNode(val);

    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head = newNode;
    }

    // 处理循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    this.length++;
    return true;
  }

  // 在指定位置插入节点
  insert(val: number, index: number) {
    if (index < 0 || index > this.length) {
      return false;
    }

    if (index === 0) {
      return this.prepend(val);
    }

    if (index === this.length) {
      return this.append(val);
    }

    const newNode = createNode(val);
    const prev = this.getNode(index - 1);

    if (prev) {
      newNode.next = prev.next;
      prev.next = newNode;
    }

    this.length++;
    return true;
  }

  // 删除指定位置的节点
  remove(index: number) {
    if (index < 0 || index >= this.length) {
      return false;
    }

    let current = this.head;
    let prev = null;

    if (index === 0) {
      if (current) {
        this.head = current.next;
        if (this.length === 1) {
          this.tail = null;
        }
      }
    } else {
      prev = this.getNode(index - 1);
      if (prev && prev.next) {
        current = prev.next;
        prev.next = current.next;

        if (current === this.tail) {
          this.tail = prev;
        }
      }
    }

    // 处理循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    this.length--;
    return true;
  }

  // 获取指定位置的节点
  getNode(index: number) {
    if (index < 0 || index >= this.length) {
      return null;
    }

    let current = this.head;
    for (let i = 0; i < index; i++) {
      if (current) {
        current = current.next;
      }
    }
    return current;
  }

  // 反转链表
  reverse() {
    if (!this.head || !this.head.next) {
      return this;
    }

    let prev = null;
    let current = this.head;
    let next = null;

    // 保存原来的尾节点引用
    this.tail = this.head;

    // 处理循环链表，暂时断开循环
    if (this.isCircular && this.tail) {
      this.tail.next = null;
    }

    let count = 0;
    while (current !== null && count < this.length) {
      next = current.next;
      current.next = prev;
      prev = current;
      current = next!;
      count++;
    }

    this.head = prev;

    // 重新连接循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    return this;
  }

  // 判断链表是否为回文
  isPalindrome() {
    if (!this.head) return true;

    // 处理循环链表，暂时断开循环
    let isCyclic = false;
    if (this.isCircular && this.tail && this.tail.next === this.head) {
      this.tail.next = null;
      isCyclic = true;
    }

    // 快慢指针找中点
    let slow: LinkNode | null = this.head;
    let fast: LinkNode | null = this.head;

    while (fast && fast.next) {
      slow = slow!.next;
      fast = fast.next.next;
    }

    // 反转后半部分
    let prev = null;
    let curr = slow;

    while (curr) {
      const next = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next!;
    }

    // 比较前后半部分
    let left = this.head;
    let right = prev;
    let isPalindrome = true;

    while (right) {
      if (left.val !== right.val) {
        isPalindrome = false;
        break;
      }
      left = left.next as LinkNode;
      right = right.next;
    }

    // 恢复链表结构（反转回来）
    prev = null;
    curr = prev;

    while (curr) {
      const _next: any = curr.next;
      curr.next = prev;
      prev = curr;
      curr = _next;
    }

    // 恢复循环链表
    if (isCyclic && this.tail) {
      this.tail.next = this.head;
    }

    return isPalindrome;
  }

  // 判断链表是否有环
  hasCycle() {
    if (!this.head || !this.head.next) {
      return false;
    }

    let fast = this.head;
    let slow = this.head;

    while (fast !== null && fast.next !== null) {
      fast = fast.next.next as LinkNode;
      slow = slow.next as LinkNode;

      if (fast === slow) {
        return true;
      }
    }

    return false;
  }

  // 清空链表
  clear() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  // 获取链表的状态
  getState(): LinkTableType {
    return {
      head: this.head,
      tail: this.tail,
      length: this.length,
      isCircular: this.isCircular,
      isDoubly: this.isDoubly,
      isSingly: this.isSingly
    };
  }

  // 从数组创建链表
  static fromArray(arr: number[], isCircular = false): LinkTable {
    const list = new LinkTable(null, null, 0, isCircular);
    arr.forEach(val => list.append(val));
    return list;
  }
}
