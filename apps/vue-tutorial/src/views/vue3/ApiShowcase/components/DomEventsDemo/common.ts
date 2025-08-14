// 代码示例
export const basicEventsCode = `<!-- 基本事件处理 -->
<button @click="handleClick">点击我</button>

<script setup>
const handleClick = (event) => {
  console.log('按钮被点击了！', event)
}
</script>`

export const eventModifiersCode = `<!-- 事件修饰符 -->
<!-- 阻止默认行为 -->
<form @submit.prevent="onSubmit"></form>

<!-- 阻止事件冒泡 -->
<button @click.stop="onClick"></button>

<!-- 只触发一次 -->
<button @click.once="onClick"></button>

<!-- 按键修饰符 -->
<input @keyup.enter="onEnter" />
<input @keyup.esc="onEscape" />

<!-- 组合修饰符 -->
<div @click.self.once="onClick"></div>`

export const typescriptCode = `<!-- TypeScript 类型标注 -->
<script setup lang="ts">
// 鼠标事件
const handleClick = (event: MouseEvent) => {
  console.log(event.clientX, event.clientY)
}

// 键盘事件
const handleKeyup = (event: KeyboardEvent) => {
  console.log(event.key)
}

// 表单事件
const handleSubmit = (event: SubmitEvent) => {
  // 类型安全的事件目标
  const form = event.target as HTMLFormElement
  console.log(form.elements)
}
</script>`

export const vModelCode = `<!-- v-model 双向绑定 -->
<input v-model="text" />
<textarea v-model="message"></textarea>
<select v-model="selected">
  <option>A</option>
  <option>B</option>
</select>

<!-- 修饰符 -->
<input v-model.lazy="text" />    <!-- 在 change 事件后更新 -->
<input v-model.number="age" />   <!-- 自动转换为数字 -->
<input v-model.trim="message" /> <!-- 自动去除首尾空格 -->`
