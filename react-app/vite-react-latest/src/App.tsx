import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import router from './router'
import './App.css'

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