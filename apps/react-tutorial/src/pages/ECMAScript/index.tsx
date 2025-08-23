import ECMAScriptPage from './Page';
import ErrorBoundary from 'antd/es/alert/ErrorBoundary';

export default function ECMAScriptIndex() {
  return (
    <ErrorBoundary message="ECMAScriptPage 出错了" description="请检查ECMAScriptPage组件">
      <ECMAScriptPage />
    </ErrorBoundary>
  )
}
