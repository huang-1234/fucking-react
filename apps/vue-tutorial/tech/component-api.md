以下是为 Vue 3 API 设计的结构化技术文档，采用可视化分类方式组织，便于快速查阅和使用：

### Vue 3 核心 API 技术文档

#### 一、组件声明 API
```typescript
// 1. defineComponent (TypeScript 支持)
import { defineComponent, PropType } from 'vue';

interface Book {
  title: string;
  year: number;
}

export default defineComponent({
  props: {
    book: {
      type: Object as PropType<Book>,
      required: true
    },
    callback: Function as PropType<(id: number) => void>
  },
  emits: {
    addBook: (payload: { bookName: string }) => true
  }
});

// 2. Composition API 声明
<script setup lang="ts">
const props = defineProps<{ title: string }>()
const emit = defineEmits<{ (e: 'update', id: number): void }>()
</script>
```

#### 二、响应式 API
| API | 功能 | 示例 |
|-----|------|------|
| `ref()` | 基础类型响应式 | `const count = ref(0)` |
| `reactive()` | 对象响应式 | `const state = reactive({ count: 0 })` |
| `computed()` | 计算属性 |
```typescript
const double = computed(() => count.value * 2)
// 可写计算属性
const writable = computed({
  get: () => count.value,
  set: (val) => { count.value = val }
})
```

#### 三、生命周期钩子
```typescript
import { onMounted, onUpdated } from 'vue'

// Composition API
setup() {
  onMounted(() => console.log('mounted'))
  onUpdated(() => console.log('updated'))
}

// Options API
export default {
  mounted() { /* ... */ },
  updated() { /* ... */ }
}
```

#### 四、监听 API
```typescript
// 1. watch 单一源
watch(count, (newVal) => console.log(newVal))

// 2. watch 多个源
watch([count, name], ([newCount, newName]) => {/* ... */})

// 3. watchEffect (自动依赖收集)
watchEffect(() => console.log(count.value + name.value))
```

#### 五、DOM 事件处理
```typescript
// 1. 模板事件
<button @click="handleClick">Click</button>

// 2. 事件类型标注
const handleClick = (event: MouseEvent) => {
  console.log((event.target as HTMLButtonElement).value)
}

// 3. 事件修饰符
<input @keyup.enter="submit">
```

#### 六、依赖注入
```typescript
// 1. Provide
import { provide } from 'vue'
provide('theme', 'dark')

// 2. Inject
import { inject } from 'vue'
const theme = inject('theme', 'light' /* 默认值 */)
```

#### 七、全局属性扩展
```typescript
// 1. 声明扩展
declare module 'vue' {
  interface ComponentCustomProperties {
    $translate: (key: string) => string
  }
}

// 2. 使用
export default {
  mounted() {
    console.log(this.$translate('hello'))
  }
}
```

#### 八、内置组件
```vue
<!-- 1. Transition -->
<Transition name="fade">
  <p v-if="show">Fade Transition</p>
</Transition>

<!-- 2. KeepAlive -->
<KeepAlive include="ComponentA">
  <component :is="currentComponent"></component>
</KeepAlive>
```

#### 九、自定义指令
```typescript
// 1. 全局指令
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

// 2. 局部指令
export default {
  directives: {
    highlight: {
      beforeMount(el) {
        el.style.backgroundColor = 'yellow'
      }
    }
  }
}
```

### 使用建议：
1. **TypeScript 优先**：使用 `<script setup lang="ts">` 语法获得最佳类型推断
2. **API 选择原则**：
   - 组件逻辑使用 Composition API
   - 简单场景可用 Options API
   - TypeScript 项目优先用 Composition API
3. **性能优化**：
   - 大数据集使用 `shallowRef/shallowReactive`
   - 频繁更新使用 `computed` 替代方法调用
   - 避免在模板中使用复杂表达式

> 提示：在 VSCode 中安装 https://marketplace.visualstudio.com/items?itemName=Vue.volar 可获得完整的类型支持

该文档采用分类式结构组织，每部分包含：
- 核心 API 签名
- 类型标注最佳实践
- 组合式/选项式对比
- 实际使用示例
- 特殊场景处理方案

通过这种结构化设计，开发者可以快速定位所需 API 的使用方式，并直接复制适配代码片段到项目中。