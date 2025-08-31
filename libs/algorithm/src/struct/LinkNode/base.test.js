import { describe, test, expect } from "vitest";
import { LinkTable, LinkNode } from "./base";

describe("链表基础操作", () => {
  test("创建空链表", () => {
    const list = new LinkTable();
    expect(list.head).toBeNull();
    expect(list.tail).toBeNull();
    expect(list.length).toBe(0);
  });

  test("添加节点 - append", () => {
    const list = new LinkTable();
    list.append(1);
    expect(list.head.val).toBe(1);
    expect(list.tail.val).toBe(1);
    expect(list.length).toBe(1);

    list.append(2);
    expect(list.head.val).toBe(1);
    expect(list.tail.val).toBe(2);
    expect(list.length).toBe(2);
    expect(list.head.next.val).toBe(2);
  });

  test("添加节点 - prepend", () => {
    const list = new LinkTable();
    list.prepend(1);
    expect(list.head.val).toBe(1);
    expect(list.tail.val).toBe(1);
    expect(list.length).toBe(1);

    list.prepend(2);
    expect(list.head.val).toBe(2);
    expect(list.tail.val).toBe(1);
    expect(list.length).toBe(2);
    expect(list.head.next.val).toBe(1);
  });

  test("插入节点 - insert", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(3);

    // 在中间插入
    list.insert(2, 1);
    expect(list.length).toBe(3);
    expect(list.getNode(0).val).toBe(1);
    expect(list.getNode(1).val).toBe(2);
    expect(list.getNode(2).val).toBe(3);

    // 在开头插入
    list.insert(0, 0);
    expect(list.length).toBe(4);
    expect(list.head.val).toBe(0);

    // 在末尾插入
    list.insert(4, 4);
    expect(list.length).toBe(5);
    expect(list.tail.val).toBe(4);
  });

  test("删除节点 - remove", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(2);
    list.append(3);

    // 删除中间节点
    list.remove(1);
    expect(list.length).toBe(2);
    expect(list.getNode(0).val).toBe(1);
    expect(list.getNode(1).val).toBe(3);

    // 删除头节点
    list.remove(0);
    expect(list.length).toBe(1);
    expect(list.head.val).toBe(3);
    expect(list.tail.val).toBe(3);

    // 删除尾节点（也是头节点）
    list.remove(0);
    expect(list.length).toBe(0);
    expect(list.head).toBeNull();
    expect(list.tail).toBeNull();
  });

  test("查找节点 - find", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(2);
    list.append(3);

    const node = list.find(2);
    expect(node.val).toBe(2);

    const notFound = list.find(4);
    expect(notFound).toBeNull();
  });

  test("更新节点 - update", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(2);

    list.update(1, 3);
    expect(list.getNode(1).val).toBe(3);
  });

  test("清空链表 - clear", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(2);

    list.clear();
    expect(list.head).toBeNull();
    expect(list.tail).toBeNull();
    expect(list.length).toBe(0);
  });

  test("反转链表 - reverse", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(2);
    list.append(3);

    list.reverse();
    expect(list.head.val).toBe(3);
    expect(list.head.next.val).toBe(2);
    expect(list.head.next.next.val).toBe(1);
    expect(list.tail.val).toBe(1);
  });

  test("合并链表 - merge", () => {
    const list1 = new LinkTable();
    list1.append(1);
    list1.append(3);
    list1.append(5);

    const list2 = new LinkTable();
    list2.append(2);
    list2.append(4);
    list2.append(6);

    const merged = list1.merge(list2);
    expect(merged.length).toBe(6);
    expect(merged.getNode(0).val).toBe(1);
    expect(merged.getNode(1).val).toBe(2);
    expect(merged.getNode(2).val).toBe(3);
    expect(merged.getNode(3).val).toBe(4);
    expect(merged.getNode(4).val).toBe(5);
    expect(merged.getNode(5).val).toBe(6);
  });

  test("分割链表 - split", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(2);
    list.append(3);
    list.append(4);

    const newList = list.split(1);

    expect(list.length).toBe(2);
    expect(list.head.val).toBe(1);
    expect(list.tail.val).toBe(2);

    expect(newList.length).toBe(2);
    expect(newList.head.val).toBe(3);
    expect(newList.tail.val).toBe(4);
  });
});

describe("链表高级操作", () => {
  test("删除倒数第n个节点 - removeNthFromEnd", () => {
    const list = new LinkTable();
    list.append(1);
    list.append(2);
    list.append(3);
    list.append(4);
    list.append(5);

    // 删除倒数第2个节点（值为4）
    list.removeNthFromEnd(2);
    expect(list.length).toBe(4);
    expect(list.getNode(0).val).toBe(1);
    expect(list.getNode(1).val).toBe(2);
    expect(list.getNode(2).val).toBe(3);
    expect(list.getNode(3).val).toBe(5);

    // 删除倒数第4个节点（值为1）
    list.removeNthFromEnd(4);
    expect(list.length).toBe(3);
    expect(list.head.val).toBe(2);
  });

  test("回文链表检测 - isPalindrome", () => {
    // 偶数长度回文
    const list1 = new LinkTable();
    list1.append(1);
    list1.append(2);
    list1.append(2);
    list1.append(1);
    expect(list1.isPalindrome()).toBe(true);

    // 奇数长度回文
    const list2 = new LinkTable();
    list2.append(1);
    list2.append(2);
    list2.append(3);
    list2.append(2);
    list2.append(1);
    expect(list2.isPalindrome()).toBe(true);

    // 非回文
    const list3 = new LinkTable();
    list3.append(1);
    list3.append(2);
    list3.append(3);
    expect(list3.isPalindrome()).toBe(false);
  });

  test("环形链表检测 - hasCycle", () => {
    // 无环链表
    const list1 = new LinkTable();
    list1.append(1);
    list1.append(2);
    list1.append(3);
    expect(list1.hasCycle()).toBe(false);

    // 有环链表（手动创建环）
    const list2 = new LinkTable();
    list2.append(1);
    list2.append(2);
    list2.append(3);
    list2.tail.next = list2.head.next; // 创建环：3->2
    expect(list2.hasCycle()).toBe(true);
  });

  test("环形链表检测 - detectCycle", () => {
    // 无环链表
    const list1 = new LinkTable();
    list1.append(1);
    list1.append(2);
    list1.append(3);
    expect(list1.detectCycle()).toBeNull();

    // 有环链表（手动创建环）
    const list2 = new LinkTable();
    list2.append(1);
    list2.append(2);
    list2.append(3);
    const cycleNode = list2.head.next; // 节点2
    list2.tail.next = cycleNode; // 创建环：3->2
    expect(list2.detectCycle()).toBe(cycleNode);
  });

  test("链表交点检测 - getIntersectionNode", () => {
    // 创建公共部分
    const commonNode = new LinkNode(8);
    commonNode.next = new LinkNode(4);
    commonNode.next.next = new LinkNode(5);

    // 创建链表A: 4->1->8->4->5
    const headA = new LinkNode(4);
    headA.next = new LinkNode(1);
    headA.next.next = commonNode;

    // 创建链表B: 5->6->1->8->4->5
    const headB = new LinkNode(5);
    headB.next = new LinkNode(6);
    headB.next.next = new LinkNode(1);
    headB.next.next.next = commonNode;

    const list = new LinkTable();
    const intersection = list.getIntersectionNode(headA, headB);
    expect(intersection).toBe(commonNode);
  });
});

describe("循环链表操作", () => {
  test("创建循环链表", () => {
    const list = new LinkTable(null, null, 0, true);
    list.append(1);
    list.append(2);
    list.append(3);

    // 检查是否形成循环
    expect(list.tail.next).toBe(list.head);
  });

  test("循环链表的操作", () => {
    const list = new LinkTable(null, null, 0, true);
    list.append(1);
    list.append(2);
    list.append(3);

    // 删除节点后检查循环
    list.remove(1); // 删除2
    expect(list.length).toBe(2);
    expect(list.tail.next).toBe(list.head);

    // 反转链表后检查循环
    list.reverse();
    expect(list.head.val).toBe(3);
    expect(list.tail.val).toBe(1);
    expect(list.tail.next).toBe(list.head);
  });
});

describe("边界条件", () => {
  test("空链表操作", () => {
    const list = new LinkTable();
    expect(list.remove(0)).toBe(false);
    expect(list.isPalindrome()).toBe(true);
    expect(list.hasCycle()).toBe(false);
    expect(list.reverse()).toBe(list);
  });

  test("单节点链表操作", () => {
    const list = new LinkTable();
    list.append(1);

    // 删除唯一节点
    list.remove(0);
    expect(list.head).toBeNull();
    expect(list.tail).toBeNull();
    expect(list.length).toBe(0);

    // 重新添加节点后反转
    list.append(1);
    list.reverse();
    expect(list.head.val).toBe(1);
    expect(list.tail.val).toBe(1);
  });

  test("无效索引操作", () => {
    const list = new LinkTable();
    list.append(1);

    expect(list.remove(-1)).toBe(false);
    expect(list.remove(1)).toBe(false);
    expect(list.getNode(-1)).toBeNull();
    expect(list.getNode(1)).toBeNull();
    expect(list.update(-1, 0)).toBe(false);
    expect(list.update(1, 0)).toBe(false);
  });
});
