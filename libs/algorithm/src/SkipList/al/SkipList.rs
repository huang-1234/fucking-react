use rand::Rng;
use std::cmp::Ordering;
use std::fmt::Debug;
use std::ptr;

/// 跳表节点结构
#[derive(Debug)]
pub struct SkipListNode<T> {
    pub value: T,
    pub level: usize,
    pub next: Vec<*mut SkipListNode<T>>,
}

impl<T> SkipListNode<T> {
    /// 创建新节点
    pub fn new(value: T, level: usize) -> Self {
        SkipListNode {
            value,
            level,
            next: vec![ptr::null_mut(); level],
        }
    }
}

/// 跳表结构
pub struct SkipList<T> {
    max_level: usize,
    head: *mut SkipListNode<T>,
    level: usize,
    probability: f32,
    size: usize,
}

impl<T: Ord + Clone + Debug> SkipList<T> {
    /// 创建新的跳表
    pub fn new(max_level: usize, probability: f32) -> Self {
        // 创建头节点，使用默认值
        let head_value = unsafe { std::mem::zeroed() };
        let head = Box::into_raw(Box::new(SkipListNode::new(head_value, max_level)));
        
        SkipList {
            max_level,
            head,
            level: 0,
            probability,
            size: 0,
        }
    }

    /// 生成随机层级
    fn random_level(&self) -> usize {
        let mut level = 1;
        let mut rng = rand::thread_rng();
        
        while rng.gen::<f32>() < self.probability && level < self.max_level {
            level += 1;
        }
        
        level
    }

    /// 查找节点
    pub fn search(&self, value: &T) -> Option<*mut SkipListNode<T>> {
        unsafe {
            let mut current = self.head;
            
            // 从最高层开始向下搜索
            for i in (0..=self.level).rev() {
                while !(*current).next[i].is_null() 
                    && (*(*current).next[i]).value < *value {
                    current = (*current).next[i];
                }
            }
            
            // 移动到下一个节点
            current = (*current).next[0];
            
            // 检查是否找到目标值
            if !current.is_null() && (*current).value == *value {
                Some(current)
            } else {
                None
            }
        }
    }

    /// 插入节点
    pub fn insert(&mut self, value: T) -> bool {
        unsafe {
            let mut update = vec![ptr::null_mut(); self.max_level];
            let mut current = self.head;
            
            // 从最高层开始查找插入位置
            for i in (0..=self.level).rev() {
                while !(*current).next[i].is_null() 
                    && (*(*current).next[i]).value < value {
                    current = (*current).next[i];
                }
                update[i] = current;
            }
            
            // 移动到下一个节点
            current = (*current).next[0];
            
            // 如果值已存在，不插入
            if !current.is_null() && (*current).value == value {
                return false;
            }
            
            // 生成新节点的层级
            let new_level = self.random_level();
            
            // 如果新层级超过当前最大层级，更新相关数组
            if new_level > self.level {
                for i in (self.level + 1)..new_level {
                    update[i] = self.head;
                }
                self.level = new_level - 1;
            }
            
            // 创建新节点
            let new_node = Box::into_raw(Box::new(SkipListNode::new(value, new_level)));
            
            // 更新指针
            for i in 0..new_level {
                (*new_node).next[i] = (*update[i]).next[i];
                (*update[i]).next[i] = new_node;
            }
            
            self.size += 1;
            true
        }
    }

    /// 删除节点
    pub fn delete(&mut self, value: &T) -> bool {
        unsafe {
            let mut update = vec![ptr::null_mut(); self.max_level];
            let mut current = self.head;
            
            // 从最高层开始查找删除位置
            for i in (0..=self.level).rev() {
                while !(*current).next[i].is_null() 
                    && (*(*current).next[i]).value < *value {
                    current = (*current).next[i];
                }
                update[i] = current;
            }
            
            // 移动到目标节点
            current = (*current).next[0];
            
            // 如果找到目标节点
            if !current.is_null() && (*current).value == *value {
                // 更新所有层级的指针
                for i in 0..(*current).level {
                    (*update[i]).next[i] = (*current).next[i];
                }
                
                // 释放节点内存
                let _ = Box::from_raw(current);
                
                // 更新跳表的最大层级
                while self.level > 0 && (*self.head).next[self.level].is_null() {
                    self.level -= 1;
                }
                
                self.size -= 1;
                true
            } else {
                false
            }
        }
    }

    /// 获取所有节点值（有序）
    pub fn to_vec(&self) -> Vec<T> {
        unsafe {
            let mut result = Vec::new();
            let mut current = (*self.head).next[0];
            
            while !current.is_null() {
                result.push((*current).value.clone());
                current = (*current).next[0];
            }
            
            result
        }
    }

    /// 获取跳表大小
    pub fn size(&self) -> usize {
        self.size
    }

    /// 获取当前最大层级
    pub fn current_level(&self) -> usize {
        self.level
    }

    /// 获取最大层级限制
    pub fn max_level(&self) -> usize {
        self.max_level
    }

    /// 检查跳表是否为空
    pub fn is_empty(&self) -> bool {
        self.size == 0
    }

    /// 清空跳表
    pub fn clear(&mut self) {
        unsafe {
            // 释放所有节点
            let mut current = (*self.head).next[0];
            while !current.is_null() {
                let next = (*current).next[0];
                let _ = Box::from_raw(current);
                current = next;
            }
            
            // 重置头节点指针
            for i in 0..self.max_level {
                (*self.head).next[i] = ptr::null_mut();
            }
            
            self.level = 0;
            self.size = 0;
        }
    }

    /// 获取层级信息（用于可视化）
    pub fn get_levels(&self) -> Vec<Vec<T>> {
        unsafe {
            let mut levels = Vec::new();
            
            for level in (0..=self.level).rev() {
                let mut level_nodes = Vec::new();
                let mut current = (*self.head).next[level];
                
                while !current.is_null() {
                    level_nodes.push((*current).value.clone());
                    current = (*current).next[level];
                }
                
                levels.push(level_nodes);
            }
            
            levels
        }
    }

    /// 范围查询
    pub fn range_query(&self, start: &T, end: &T) -> Vec<T> {
        unsafe {
            let mut result = Vec::new();
            let mut current = self.head;
            
            // 找到起始位置
            for i in (0..=self.level).rev() {
                while !(*current).next[i].is_null() 
                    && (*(*current).next[i]).value < *start {
                    current = (*current).next[i];
                }
            }
            
            current = (*current).next[0];
            
            // 收集范围内的值
            while !current.is_null() && (*current).value <= *end {
                result.push((*current).value.clone());
                current = (*current).next[0];
            }
            
            result
        }
    }
}

impl<T: Ord + Clone + Debug> Drop for SkipList<T> {
    fn drop(&mut self) {
        self.clear();
        unsafe {
            let _ = Box::from_raw(self.head);
        }
    }
}

// 测试模块
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_skip_list_basic_operations() {
        let mut skip_list = SkipList::new(16, 0.5);
        
        // 测试插入
        assert!(skip_list.insert(5));
        assert!(skip_list.insert(3));
        assert!(skip_list.insert(8));
        assert!(skip_list.insert(1));
        
        // 测试重复插入
        assert!(!skip_list.insert(5));
        
        // 测试大小
        assert_eq!(skip_list.size(), 4);
        
        // 测试查找
        assert!(skip_list.search(&5).is_some());
        assert!(skip_list.search(&10).is_none());
        
        // 测试有序输出
        let values = skip_list.to_vec();
        assert_eq!(values, vec![1, 3, 5, 8]);
        
        // 测试删除
        assert!(skip_list.delete(&3));
        assert!(!skip_list.delete(&10));
        assert_eq!(skip_list.size(), 3);
        
        // 测试范围查询
        let range_result = skip_list.range_query(&1, &8);
        assert_eq!(range_result, vec![1, 5, 8]);
    }
}