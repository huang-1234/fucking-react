

type LikeLinkNode = LinkNode | null | undefined;

class LinkNode {
  val: number;
  next: LikeLinkNode;
  constructor(val: number, next: LikeLinkNode = undefined) {
    this.val = val === undefined ? 0 : val;
    this.next = next === undefined ? null : next;
  }
}
/**
 * @desc 链表数据结构，支持单向链表，双向链表，循环链表
 * @param {LinkNode} head
 * @param {LinkNode} tail
 * @param {number} length
 * @param {boolean} isCircular
 * @param {boolean} isDoubly
 * @param {boolean} isSingly
 * // base method
 * @method append
 * @method prepend
 * @method insert
 * @method remove
 * @method find
 * @method update
 * @method clear
 * @method reverse
 * @method sort
 * @method merge
 * @method split
 * @method print
 * // advance method
 * @method removeNthFromEnd
 * @method hasCycle
 * @method detectCycle
 * @method isPalindrome
 * @method getIntersectionNode
 */
class LinkTableClass {
  head: LikeLinkNode;
  tail: LikeLinkNode;
  length: number;
  isCircular: boolean;
  isDoubly: boolean;
  isSingly: boolean;
  constructor(head: LinkNode | null = null, tail: LinkNode | null = null, length = 0, isCircular = false, isDoubly = false, isSingly = true) {
    this.head = head || new LinkNode(0);
    this.tail = tail || new LinkNode(0);
    this.length = length;
    this.isCircular = isCircular;
    this.isDoubly = isDoubly;
    this.isSingly = isSingly;
  }
  static fromArray(arr: number[], isCircular = false): LinkTableClass {
    if (arr.length === 0) {
      return new LinkTableClass();
    }
    console.log('fromArray', isCircular);
    const linkTable = new LinkTableClass();
    for (const val of arr) {
      linkTable.append(val);
    }
    return linkTable;
  }
  /**
   * @desc 在链表末尾添加一个节点
   * @param {number} val
   * @returns {boolean}
   */
  append(val: number): boolean {
    const newNode = new LinkNode(val);
    if (this.head === null) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      this.tail = newNode;
    }

    // 处理循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    this.length++;
    return true;
  }
  /**
   * @desc 在链表头部添加一个节点
   * @param {number} val
   * @returns {boolean}
   */
  prepend(val: number): boolean {
    const newNode = new LinkNode(val);
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
  /**
   * @desc 在指定位置插入一个节点
   * @param {number} val
   * @param {number} index
   * @returns {boolean}
   */
  insert(val: number, index: number): boolean {
    if (index < 0 || index > this.length) {
      return false;
    }

    if (index === 0) {
      return this.prepend(val);
    }

    if (index === this.length) {
      return this.append(val);
    }

    const newNode = new LinkNode(val);
    const prev = this.getNode(index - 1);
    newNode.next = prev!.next;
    prev!.next = newNode;

    this.length++;
    return true;
  }
  /**
   * @desc 删除指定位置的节点
   * @param {number} index
   * @returns {boolean}
   */
  remove(index: number): boolean {
    if (index < 0 || index >= this.length) {
      return false;
    }

    let current = this.head;
    let prev = null;

    if (index === 0) {
      this.head = current!.next as LinkNode;
      if (this.length === 1) {
        this.tail = null;
      }
    } else {
      prev = this.getNode(index - 1);
      current = prev!.next as LinkNode;
      prev!.next = current!.next as LinkNode;

      if (current === this.tail) {
        this.tail = prev;
      }
    }

    // 处理循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    this.length--;
    return true;
  }
  /**
   * @desc 查找指定值的节点
   * @param {number} val
   * @returns {LinkNode}
   */
  find(val: number): LinkNode {
    let current = this.head;
    let count = 0;

    while (current !== null && count <= this.length) {
      if (current.val === val) {
        return current;
      }
      current = current.next as LinkNode;
      count++; // 防止循环链表无限循环
    }
    return null;
  }
  /**
   * @desc 更新指定位置的节点值
   * @param {number} index
   * @param {number} val
   * @returns {boolean}
   */
  update(index: number, val: number): boolean {
    if (index < 0 || index >= this.length) {
      return false;
    }
    const node = this.getNode(index);
    node!.val = val;
    return true;
  }
  /**
   * @desc 清空链表
   * @returns {void}
   */
  clear(): void {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
  /**
   * @desc 反转链表
   * @returns {LinkTable}
   */
  reverse(): LinkTable {
    if (!this.head || !this.head.next) {
      return this;
    }

    let prev = null;
    let current: LinkNode | null = this.head;
    let next = null;

    // 保存原来的尾节点引用
    this.tail = this.head;

    // 处理循环链表，暂时断开循环
    if (this.isCircular && this.tail) {
      this.tail.next = null;
    }

    let count = 0;
    while (current !== null && count < this.length) {
      next = current!.next;
      current!.next = prev;
      prev = current;
      current = next;
      count++;
    }

    this.head = prev;

    // 重新连接循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    return this;
  }
  /**
   * @desc 合并两个链表
   * @param {LinkTable} other
   * @returns {LinkTable}
   */
  merge(other: LinkTableClass): LinkTableClass {
    const result = new LinkTableClass(
      null,
      null,
      0,
      this.isCircular,
      this.isDoubly,
      this.isSingly
    );

    const mergedHead = this.mergeTwoLists(this.head!, other.head!);
    result.head = mergedHead;

    // 更新尾节点和长度
    let current = mergedHead;
    let length = 0;
    while (current !== null) {
      length++;
      if (current.next === null) {
        result.tail = current;
      }
      current = current!.next;
    }
    result.length = length;

    // 处理循环链表
    if (result.isCircular && result.tail) {
      result.tail.next = result.head;
    }

    return result;
  }
  /**
   * @desc 分割链表
   * @param {number} index
   * @returns {LinkTable}
   */
  split(index: number): LinkTable {
    if (index < 0 || index >= this.length) {
      return false;
    }

    // 处理循环链表，暂时断开循环
    if (this.isCircular && this.tail) {
      this.tail.next = null;
    }

    const node = this.getNode(index);
    const newTable = new LinkTableClass(
      node!.next!,
      this.tail,
      this.length - index - 1,
      this.isCircular,
      this.isDoubly,
      this.isSingly
    );

    node.next = null;
    this.tail = node;
    this.length = index + 1;

    // 重新连接循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    // 处理新链表的循环
    if (newTable.isCircular && newTable.tail) {
      newTable.tail.next = newTable.head;
    }

    return newTable;
  }
  /**
   * @desc 打印链表
   * @returns {void}
   */
  print(): void {
    let current = this.head;
    let count = 0;
    const values = [];

    while (current !== null && count < this.length) {
      values.push(current.val);
      current = current.next;
      count++; // 防止循环链表无限循环
    }

    console.log(values.join(' -> '));
  }
  /**
   * @desc 获取指定位置的节点
   * @param {number} index
   * @returns {LinkNode}
   */
  getNode(index: number): LinkNode {
    if (index < 0 || index >= this.length) {
      return null;
    }

    let current = this.head;
    for (let i = 0; i < index; i++) {
      current = current.next;
    }
    return current;
  }
  /**
   * @desc 删除倒数第n个节点
   * @param {number} n
   * @returns {boolean}
   */
  removeNthFromEnd(n: number): boolean {
    if (n <= 0 || n > this.length) {
      return false;
    }

    let dummy = new LinkNode(0, this.head);
    let fast = dummy;
    let slow = dummy;

    // 快指针先走n+1步
    for (let i = 0; i <= n; i++) {
      if (!fast) return false;
      fast = fast.next;
    }

    // 快慢指针一起走
    while (fast) {
      fast = fast.next;
      slow = slow.next;
    }

    // 删除目标节点
    slow.next = slow.next.next;

    // 更新头节点和尾节点
    this.head = dummy.next;

    // 如果删除的是尾节点，更新tail指针
    if (slow.next === null) {
      this.tail = slow;
    }

    // 处理循环链表
    if (this.isCircular && this.tail) {
      this.tail.next = this.head;
    }

    this.length--;
    return true;
  }
  /**
   * @desc 合并两个链表
   * @param {LinkNode} l1
   * @param {LinkNode} l2
   * @returns {LinkNode}
   */
  mergeTwoLists(l1: LinkNode, l2: LinkNode): LinkNode {
    let prehead = new LinkNode();
    let prev = prehead;

    while (l1 !== null && l2 !== null) {
      if (l1.val <= l2.val) {
        prev.next = l1;
        l1 = l1.next;
      } else {
        prev.next = l2;
        l2 = l2.next;
      }
      prev = prev.next;
    }

    prev.next = l1 === null ? l2 : l1;
    return prehead.next;
  }
  /**
   * @desc 判断链表是否有环
   * @returns {boolean}
   */
  hasCycle(): boolean {
    if (!this.head || !this.head.next) {
      return false;
    }

    let fast = this.head;
    let slow = this.head;

    while (fast !== null && fast.next !== null) {
      fast = fast.next.next;
      slow = slow.next;

      if (fast === slow) {
        return true;
      }
    }

    return false;
  }
  /**
   * @desc 检测链表是否有环，并返回入环节点
   * @returns {LinkNode|null}
   */
  detectCycle(): LinkNode | null {
    if (!this.head || !this.head.next) {
      return null;
    }

    let fast: LinkNode | null = this.head;
    let slow: LinkNode | null = this.head;
    let hasCycle = false;

    while (fast !== null && fast.next !== null) {
      fast = fast.next.next;
      slow = slow?.next;

      if (fast === slow) {
        hasCycle = true;
        break;
      }
    }

    if (!hasCycle) {
      return null;
    }

    // 找到入环点
    slow = this.head;
    while (slow !== fast) {
      slow = slow.next;
      fast = fast.next;
    }

    return slow;
  }
  /**
   * @desc 判断链表是否为回文
   * @returns {boolean}
   */
  isPalindrome(): boolean {
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
    let prev: LinkNode | null = null;
    let curr: LinkNode | null = slow;

    while (curr) {
      const next: LinkNode | null = curr.next;
      curr.next = prev;
      prev = curr;
      curr = next;
    }

    // 比较前后半部分
    let left: LinkNode | null = this.head;
    let right = prev;
    let isPalindrome = true;

    while (right) {
      if (left?.val !== right.val) {
        isPalindrome = false;
        break;
      }
      left = left.next;
      right = right.next;
    }

    // 恢复链表结构（反转回来）
    /**
     * @TODO: 这里需要优化，因为prev是null，所以curr.next是undefined，所以需要优化
     */
    prev = null;
    curr = prev;

    while (curr) {
      const _next: LinkNode | null = curr.next;
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
  /**
   * @desc 获取两个链表的交点
   * @param {LinkNode} headA
   * @param {LinkNode} headB
   * @returns {LinkNode | null}
   */
  getIntersectionNode(headA: LinkNode, headB: LinkNode): LinkNode | null {
    if (!headA || !headB) return null;

    let pA: LinkNode | null = headA;
    let pB: LinkNode | null = headB;

    while (pA !== pB) {
      pA = pA === null ? headB : pA.next;
      pB = pB === null ? headA : pB.next;
    }

    return pA; // 如果没有交点，pA最终会是null
  }
  getState() {
    return {
      head: this.head,
      tail: this.tail,
      length: this.length,
      isCircular: this.isCircular,
      isDoubly: this.isDoubly,
      isSingly: this.isSingly
    };
  }
}

  export { LinkNode, LinkTableClass };