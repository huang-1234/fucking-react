## Vue 响应式 API 深度解析：用法与原理对比

### 一、核心 API 对比

| **API**          | **适用场景**                     | **响应深度**       | **返回值类型**       | **原理实现**                                                                 |
|------------------|-------------------------------|-------------------|--------------------|----------------------------------------------------------------------------|
| **ref**          | 基本类型/对象引用                  | 深响应             | RefImpl 对象       | 通过 `.value` 的 getter/setter 触发依赖收集/更新                             |
| **reactive**     | 复杂对象/数组                    | 深响应             | Proxy 对象         | Proxy 代理整个对象，深度监听嵌套属性                                        |
| **shallowRef**   | 大型对象（性能敏感场景）            | 浅响应（仅 .value） | RefImpl 对象       | 仅监听 `.value` 的替换，不追踪内部属性变化                                   |
| **shallowReactive** | 只需要顶层响应的对象              | 浅响应（仅第一层）   | Proxy 对象         | 仅代理对象的第一层属性                                                     |
| **toRef**        | 将 reactive 属性转为独立 ref      | 保持源响应链         | 特殊 Ref 对象       | 创建链接到源对象属性的引用，不新建响应式                                      |
| **toRefs**       | 解构 reactive 对象保持响应性      | 保持源响应链         | 普通对象（含 ref）   | 将 reactive 对象的每个属性转换为 ref                                        |
| **computed**     | 派生状态                         | 依赖决定            | ComputedRefImpl    | 基于 effect 的懒求值，依赖变化时才重新计算                                   |

---

### 二、原理深度剖析

#### 1. **ref 实现机制**
```typescript
class RefImpl {
  constructor(value) {
    this._value = isObject(value) ? reactive(value) : value
    this.dep = new Set()
  }

  get value() {
    trackEffects(this.dep) // 依赖收集
    return this._value
  }

  set value(newVal) {
    this._value = newVal
    triggerEffects(this.dep) // 触发更新
  }
}
```

#### 2. **reactive 的 Proxy 代理**
```typescript
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      track(target, key) // 收集依赖
      return Reflect.get(target, key)
    },
    set(target, key, value) {
      Reflect.set(target, key, value)
      trigger(target, key) // 触发更新
    }
  })
}
```

#### 3. **computed 懒求值优化**
```typescript
class ComputedRefImpl {
  constructor(getter) {
    this._dirty = true // 脏检查标志
    this.effect = effect(getter, {
      lazy: true,
      scheduler: () => {
        this._dirty = true
        triggerEffects(this.dep) // 依赖更新时标记脏数据
      }
    })
  }

  get value() {
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
    }
    return this._value
  }
}
```

---

### 三、使用场景最佳实践

#### 1. **基础类型值 → ref**
```typescript
const count = ref(0)
const increment = () => count.value++
```

#### 2. **复杂对象 → reactive**
```typescript
const user = reactive({
  name: 'Alice',
  profile: { age: 30 } // 嵌套对象自动深度响应
})
```

#### 3. **大型对象优化 → shallowRef**
```typescript
const heavyData = shallowRef({ /* 10,000+ 条数据 */ })
// 需要完全替换时才更新视图
heavyData.value = { ...heavyData.value, key: 'updated' }
```

#### 4. **组件解构 → toRefs**
```typescript
const state = reactive({ x: 0, y: 0 })
return { ...toRefs(state) } // 模板中直接使用 x/y 保持响应
```

#### 5. **属性链接 → toRef**
```typescript
const props = defineProps({ title: String })
const titleRef = toRef(props, 'title') // 保持与prop的响应链接
```

---

### 四、响应式原理核心图

```
  [数据变更] → [Proxy/Ref setter]
        ↓
  [触发 trigger] → [调度器 queueJob]
        ↓
  [异步更新队列] → [组件重新渲染]
        ↑
  [render 执行] → [触发 getter] → [收集依赖]
```

---

### 五、特殊场景处理

#### 1. **数组响应性陷阱**
```typescript
// 错误：直接赋值索引不会触发更新
const arr = reactive([1, 2])
arr[0] = 3 // ❌ 不触发更新

// 正确：使用变异方法
arr.splice(0, 1, 3) // ✅ 触发更新
```

#### 2. **响应性丢失问题**
```typescript
// 问题：解构导致响应性丢失
const { x } = reactive({ x: 1 })

// 解决方案：
const state = reactive({ x: 1 })
const { x } = toRefs(state)
```

#### 3. **循环引用处理**
```typescript
const circular = reactive({ self: null })
circular.self = circular // ✅ Vue 自动处理循环引用
```

---

### 六、性能优化指南

1. **大型数据集** → 使用 `shallowRef/shallowReactive`
2. **频繁更新场景** → 使用 `computed` 缓存结果
3. **无渲染组件** → 使用 `markRaw` 跳过代理
4. **批量更新** → 使用 `nextTick` 合并变更

```typescript
import { nextTick } from 'vue'

const update = () => {
  state.a = 1
  state.b = 2
  // Vue 自动批处理
  nextTick(() => {
    // DOM 已更新
  })
}
```

通过理解这些 API 的设计差异和底层原理，开发者可以根据具体场景选择最合适的响应式工具，在保证功能的同时优化性能表现。