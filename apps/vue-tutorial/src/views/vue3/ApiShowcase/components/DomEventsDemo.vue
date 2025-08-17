<script setup lang="ts">
import { ref } from 'vue'
import SimpleCodeEditor from '../../../../components/SimpleCodeEditor.vue';

// 状态
const message = ref('')
const count = ref(0)
const isActive = ref(false)

// 事件处理
const handleClick = (event: MouseEvent) => {
  message.value = `按钮被点击了！坐标: (${event.clientX}, ${event.clientY})`
  count.value++
}

const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    message.value = `按下了回车键！输入内容: ${(event.target as HTMLInputElement).value}`
  }
}

const toggleActive = () => {
  isActive.value = !isActive.value
}

// 代码示例
const basicEventsCode = `<!-- 基本事件处理 -->
<button @click="handleClick">点击我</button>

<script setup>
const handleClick = (event) => {
  console.log('按钮被点击了！', event)
}
</script>`

const eventModifiersCode = `<!-- 事件修饰符 -->
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

const typescriptCode = `<!-- TypeScript 类型标注 -->
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

const vModelCode = `<!-- v-model 双向绑定 -->
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
</script>

<template>
  <div class="dom-events-demo">
    <div class="demo-section">
      <h3>DOM 事件处理</h3>
      <p>Vue 3 提供了丰富的事件处理机制</p>

      <div class="event-examples">
        <div class="example-card">
          <h4>基本事件</h4>
          <div class="example-content">
            <div class="event-demo">
              <button @click="handleClick">点击我</button>
              <p v-if="message" class="event-message">{{ message }}</p>
              <p>点击次数: {{ count }}</p>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>事件修饰符</h4>
          <div class="example-content">
            <div class="event-demo">
              <p>按下回车键触发事件:</p>
              <input
                @keyup.enter="handleKeyup"
                placeholder="输入内容并按回车"
                class="event-input"
              />

              <p class="modifier-example">
                <span>阻止冒泡示例:</span>
                <div
                  class="outer-div"
                  @click="message = '外层 div 被点击了'"
                >
                  外层元素
                  <button
                    @click.stop="message = '按钮被点击了（事件不会冒泡）'"
                    class="inner-button"
                  >
                    点击我 (stop)
                  </button>
                </div>
              </p>
            </div>
          </div>
        </div>

        <div class="example-card">
          <h4>类绑定与样式</h4>
          <div class="example-content">
            <div class="event-demo">
              <button
                @click="toggleActive"
                :class="{ 'is-active': isActive }"
                class="toggle-button"
              >
                {{ isActive ? '激活状态' : '未激活状态' }}
              </button>

              <div class="style-binding">
                <p>动态样式绑定:</p>
                <div
                  :style="{
                    backgroundColor: isActive ? '#42b883' : '#ccc',
                    color: isActive ? 'white' : 'black',
                    padding: '10px',
                    borderRadius: '4px',
                    transition: 'all 0.3s'
                  }"
                >
                  样式随状态变化
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="code-section">
      <h4>代码示例</h4>

      <div class="code-tabs">
        <div class="code-tab">
          <h5>基本事件</h5>
          <SimpleCodeEditor :code="basicEventsCode" language="vue" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>事件修饰符</h5>
          <SimpleCodeEditor :code="eventModifiersCode" language="vue" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>TypeScript 支持</h5>
          <SimpleCodeEditor :code="typescriptCode" language="vue" :readOnly="true" height="200px" />
        </div>

        <div class="code-tab">
          <h5>v-model 双向绑定</h5>
          <SimpleCodeEditor :code="vModelCode" language="vue" :readOnly="true" height="200px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dom-events-demo {
  margin-bottom: 20px;
}

.demo-section {
  margin-bottom: 20px;
}

.event-examples {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.example-card {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
  box-shadow: var(--box-shadow);
}

.example-content {
  margin-top: 12px;
}

.event-demo {
  padding: 12px;
  background-color: var(--bg-color);
  border-radius: var(--border-radius-sm);
}

button {
  padding: 8px 16px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius-sm);
  cursor: pointer;
}

button:hover {
  background-color: var(--primary-color-hover);
}

.event-message {
  margin-top: 12px;
  padding: 8px;
  background-color: var(--primary-color-light);
  border-radius: var(--border-radius-sm);
}

.event-input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  margin-top: 8px;
}

.modifier-example {
  margin-top: 16px;
}

.outer-div {
  margin-top: 8px;
  padding: 16px;
  background-color: #f0f0f0;
  border-radius: var(--border-radius-sm);
  text-align: center;
  cursor: pointer;
}

.inner-button {
  margin-top: 8px;
  background-color: #ff7875;
}

.inner-button:hover {
  background-color: #ff5252;
}

.toggle-button {
  width: 100%;
  transition: all 0.3s;
}

.toggle-button.is-active {
  background-color: #389e0d;
}

.style-binding {
  margin-top: 16px;
}

.code-section {
  margin-top: 24px;
}

.code-tabs {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.code-tab {
  background-color: var(--component-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  padding: 16px;
}

h5 {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .event-examples, .code-tabs {
    grid-template-columns: 1fr;
  }
}
</style>
