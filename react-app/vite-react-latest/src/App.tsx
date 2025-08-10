import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import router from './router'
// 使用自定义代码高亮样式
import './styles/code-highlight.less'
function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <Suspense fallback={<div>加载中...</div>}>
        <RouterProvider router={router} />
      </Suspense>
    </ConfigProvider>
  )
}

export default App