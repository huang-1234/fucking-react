import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { initVersionBridge } from './sandbox/VersionBridge'
import './index.css'
import './styles/highlight.css'
import App from './App.tsx'

// 初始化版本通信控制器
initVersionBridge();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)