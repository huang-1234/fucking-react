import React from 'react';
import CanvasPanel from '@/modules/CanvasPanel';
import RightCanvasProperties from './modules/RightCanvasProperties';
import LeftCanvasMaterials from './modules/LeftCanvasMaterials';
import HeaderCanvasToolBar from './modules/HeaderCanvasToolBar';

function CanvasPanelPage() {

  return (
    <div>
      {/* Header Tools 工具栏 */}
      <HeaderCanvasToolBar />
      {/* 画布面板 */}
      <div className="canvas-panel-container">
        {/* 画布左侧物料 */}
        <LeftCanvasMaterials />
        {/* 画布 */}
        <CanvasPanel />
        {/* 画布右侧属性 */}
        <RightCanvasProperties />
      </div>
    </div>
  )
}

export default React.memo(CanvasPanelPage);