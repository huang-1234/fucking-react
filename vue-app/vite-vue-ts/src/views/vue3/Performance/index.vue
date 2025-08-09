<script setup lang="ts">
import CodeEditor from '@/components/CodeEditor.vue'
import { usePerformance } from './Performance'

const {
  staticHoistingCode,
  patchFlagCode,
  cacheHandlersCode,
  performanceTips,
  performanceData,
  improvements
} = usePerformance()
</script>

<template>
  <div class="performance">
    <h1>Vue3 性能优化</h1>

    <section class="example-section">
      <h2>1. 编译优化</h2>

      <div class="performance-stats">
        <div class="stat-card">
          <div class="stat-value">{{ improvements.renderTime }}%</div>
          <div class="stat-label">渲染速度提升</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ improvements.memoryUsage }}%</div>
          <div class="stat-label">内存占用减少</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ improvements.updateTime }}%</div>
          <div class="stat-label">更新性能提升</div>
        </div>
      </div>

      <div class="example-card">
        <div class="optimization-item">
          <h3>静态树提升 (Static Hoisting)</h3>
          <p>静态内容只会被创建一次，并在每次渲染时重用，减少内存占用和提高渲染性能。</p>
          <div class="code-container">
            <CodeEditor
              :code="staticHoistingCode"
              language="javascript"
              :readOnly="true"
              height="350px"
            />
          </div>
        </div>
      </div>

      <div class="example-card">
        <div class="optimization-item">
          <h3>Patch Flag (动态节点标记)</h3>
          <p>编译时标记动态内容的类型，运行时只需要关注有标记的内容，大幅提高更新性能。</p>
          <div class="code-container">
            <CodeEditor
              :code="patchFlagCode"
              language="javascript"
              :readOnly="true"
              height="350px"
            />
          </div>
        </div>
      </div>

      <div class="example-card">
        <div class="optimization-item">
          <h3>事件处理函数缓存</h3>
          <p>缓存事件处理函数，避免组件重新渲染时创建新的函数引用。</p>
          <div class="code-container">
            <CodeEditor
              :code="cacheHandlersCode"
              language="javascript"
              :readOnly="true"
              height="300px"
            />
          </div>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>2. 性能优化最佳实践</h2>

      <div class="tips-container">
        <div v-for="(tip, index) in performanceTips" :key="index" class="tip-card">
          <h3>{{ tip.title }}</h3>
          <div class="tip-code">
            <pre><code>{{ tip.code }}</code></pre>
          </div>
          <p>{{ tip.description }}</p>
        </div>
      </div>
    </section>

    <section class="example-section">
      <h2>3. Vue3 vs Vue2 性能对比</h2>

      <div class="comparison-table">
        <table>
          <thead>
            <tr>
              <th>性能指标</th>
              <th>Vue2</th>
              <th>Vue3</th>
              <th>提升</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>初始渲染时间</td>
              <td>{{ performanceData.vue2.renderTime }}ms</td>
              <td>{{ performanceData.vue3.renderTime }}ms</td>
              <td>
                <span class="improvement">{{ improvements.renderTime }}%</span>
              </td>
            </tr>
            <tr>
              <td>内存占用</td>
              <td>{{ performanceData.vue2.memoryUsage }}MB</td>
              <td>{{ performanceData.vue3.memoryUsage }}MB</td>
              <td>
                <span class="improvement">{{ improvements.memoryUsage }}%</span>
              </td>
            </tr>
            <tr>
              <td>更新性能</td>
              <td>{{ performanceData.vue2.updateTime }}ms</td>
              <td>{{ performanceData.vue3.updateTime }}ms</td>
              <td>
                <span class="improvement">{{ improvements.updateTime }}%</span>
              </td>
            </tr>
            <tr>
              <td>Tree-Shaking支持</td>
              <td>有限</td>
              <td>完全支持</td>
              <td>
                <span class="improvement">更小的包体积</span>
              </td>
            </tr>
            <tr>
              <td>SSR性能</td>
              <td>中等</td>
              <td>显著提升</td>
              <td>
                <span class="improvement">~2-3倍</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.performance {
  max-width: 900px;
  margin: 0 auto;
}

h1 {
  color: #42b883;
  margin-bottom: 2rem;
}

.example-section {
  margin-bottom: 3rem;
}

.example-section h2 {
  border-bottom: 2px solid #42b883;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.performance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: bold;
  color: #42b883;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: var(--text-color);
}

.example-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.optimization-item {
  padding: 1.5rem;
}

.optimization-item h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.optimization-item p {
  margin-bottom: 1.5rem;
}

.code-container {
  border-radius: 8px;
  overflow: hidden;
}

.tips-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background-color: var(--header-bg);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tip-card h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #42b883;
}

.tip-code {
  background-color: #2d2d2d;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  overflow-x: auto;
}

.tip-code pre {
  margin: 0;
}

.tip-code code {
  color: #f8f8f2;
  font-family: 'Fira Code', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
}

.comparison-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
}

th {
  background-color: rgba(66, 184, 131, 0.1);
  color: #42b883;
}

tr:hover {
  background-color: rgba(66, 184, 131, 0.05);
}

.improvement {
  color: #42b883;
  font-weight: bold;
}

@media (max-width: 768px) {
  .tips-container {
    grid-template-columns: 1fr;
  }
}
</style>