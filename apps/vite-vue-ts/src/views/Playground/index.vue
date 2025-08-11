<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SimpleCodeEditor from '../../components/SimpleCodeEditor.vue'
import { usePlayground, createPreviewHtml, compileVueCode } from './Playground'
import {
  Typography,
  Card,
  Button,
  Divider,
  Space,
  Row,
  Col,
  Spin,
  Empty,
  Tabs,
  Alert,
  Badge,
  List
} from 'ant-design-vue'

const { Title, Paragraph, Text } = Typography
const { TabPane } = Tabs

// 使用hooks获取状态
const {
  vueCode,
  previewLoading,
  consoleOutput,
  activeTab
} = usePlayground()

// 沙箱iframe引用
const sandboxFrame = ref<HTMLIFrameElement | null>(null)

// 运行代码
function runCode() {
  previewLoading.value = true
  consoleOutput.value = []
  activeTab.value = '1' // 切换到预览选项卡

  try {
    // 创建预览HTML
    const html = createPreviewHtml(vueCode.value)

    // 更新iframe内容
    if (sandboxFrame.value) {
      const frameDoc = sandboxFrame.value.contentDocument || sandboxFrame.value.contentWindow?.document

      if (frameDoc) {
        frameDoc.open()
        frameDoc.write(html)
        frameDoc.close()

        // 添加控制台输出捕获
        if (sandboxFrame.value.contentWindow) {
          setupConsoleCapture(sandboxFrame.value.contentWindow)
        }
      }
    }
  } catch (error) {
    consoleOutput.value.push(`错误: ${error instanceof Error ? error.message : String(error)}`)
    activeTab.value = '2' // 如果有错误，切换到控制台选项卡
  } finally {
    previewLoading.value = false
  }
}

// 设置控制台输出捕获
function setupConsoleCapture(window: Window) {
  const messageHandler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'console') {
      const { method, args } = event.data
      const prefix = method === 'error' ? '🔴 ' : method === 'warn' ? '🟠 ' : '📘 '
      consoleOutput.value.push(`${prefix} ${args.join(' ')}`)

      // 如果是错误，自动切换到控制台选项卡
      if (method === 'error') {
        activeTab.value = '2'
      }
    }
  }

  // 移除旧的事件监听器
  window.removeEventListener('message', messageHandler)

  // 添加新的事件监听器
  window.addEventListener('message', messageHandler)
}

// 获取控制台项目的类型
function getConsoleItemType(log: string): 'success' | 'warning' | 'error' | 'processing' {
  if (log.startsWith('🔴')) return 'error'
  if (log.startsWith('🟠')) return 'warning'
  return 'processing'
}

// 组件挂载时运行代码
onMounted(() => {
  setTimeout(() => {
    runCode()
  }, 500)
})
</script>

<template>
  <div class="playground">
    <Typography>
      <Title :level="2">Vue3 交互式编辑器</Title>
      <Paragraph>
        在这里你可以编写、运行和测试Vue3代码，实时查看效果和控制台输出。
      </Paragraph>
    </Typography>

    <Divider />

    <Row :gutter="[16, 16]">
      <Col :xs="24" :lg="12">
        <Card title="代码编辑器" class="editor-card">
          <SimpleCodeEditor
            v-model:code="vueCode"
            language="vue"
            height="500px"
            @run="runCode"
          />
          <div class="editor-actions">
            <Button
              type="primary"
              size="large"
              @click="runCode"
            >
              运行代码
            </Button>
          </div>
        </Card>
      </Col>

      <Col :xs="24" :lg="12">
        <Card class="preview-card">
          <Tabs v-model:activeKey="activeTab" class="preview-tabs">
            <TabPane key="1" tab="预览">
              <div class="preview-container" :class="{ loading: previewLoading }">
                <iframe
                  ref="sandboxFrame"
                  class="preview-frame"
                  sandbox="allow-scripts allow-same-origin"
                  title="Vue Preview"
                ></iframe>

                <Spin
                  v-if="previewLoading"
                  tip="加载中..."
                  class="loading-spinner"
                />
              </div>
            </TabPane>

            <TabPane key="2" tab="控制台">
              <div class="console-container">
                <List
                  v-if="consoleOutput.length > 0"
                  class="console-list"
                  :dataSource="consoleOutput"
                  size="small"
                  bordered
                >
                  <template #renderItem="{ item }">
                    <List.Item>
                      <Badge
                        :status="getConsoleItemType(item)"
                        :text="item"
                        class="console-item"
                      />
                    </List.Item>
                  </template>
                </List>

                <Empty
                  v-else
                  description="暂无控制台输出"
                  :image="Empty.PRESENTED_IMAGE_SIMPLE"
                />
              </div>
            </TabPane>
          </Tabs>
        </Card>
      </Col>
    </Row>

    <Divider />

    <Alert
      message="提示"
      description="在代码中可以使用Vue3的所有核心API，如ref、reactive、computed、watch等。目前不支持导入外部模块，请使用CDN引入所需的库。"
      type="info"
      showIcon
    />
  </div>
</template>

<style scoped>
.playground {
  width: 100%;
}

.editor-card, .preview-card {
  height: 100%;
  border-radius: var(--border-radius-md);
}

.editor-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.preview-container {
  position: relative;
  height: 500px;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  overflow: hidden;
  background-color: white;
}

.preview-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.loading-spinner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
}

.console-container {
  height: 500px;
  overflow-y: auto;
  background-color: #f5f5f5;
  border-radius: var(--border-radius-sm);
  padding: 8px;
}

.console-list {
  background-color: #f5f5f5;
}

.console-item {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

:deep(.ant-typography) {
  margin-bottom: 0;
}

:deep(.ant-card-head) {
  min-height: 40px;
}

:deep(.ant-card-head-title) {
  padding: 8px 0;
}

:deep(.ant-tabs-tab) {
  padding: 8px 16px;
}

:deep(.ant-empty) {
  margin: 64px 0;
}

/* 暗黑模式适配 */
:deep([data-theme='dark']) {
  .preview-container {
    background-color: #1f1f1f;
    border-color: #303030;
  }

  .loading-spinner {
    background-color: rgba(0, 0, 0, 0.6);
  }

  .console-container, .console-list {
    background-color: #141414;
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  :deep(.ant-card-body) {
    padding: 12px;
  }

  .preview-container, .console-container {
    height: 400px;
  }
}
</style>