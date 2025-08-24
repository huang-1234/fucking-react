import React from 'react';
import CanvasPanel from '@/modules/CanvasPanel';
import RightCanvasProperties from './modules/RightCanvasProperties';
import LeftCanvasMaterials from './modules/LeftCanvasMaterials';
import HeaderCanvasToolBar from './modules/HeaderCanvasToolBar';
import ShanghaicompositeIndex from './modules/KLineGraph/ShanghaicompositeIndex';
import { Tabs } from 'antd';


function KLineGraph() {
  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <ShanghaicompositeIndex />
    </div>
  )
}

function ModuleCanvasPanel() {
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

function CanvasPanelPage() {
  return (
    <div>
      <Tabs>
        <Tabs.TabPane tab="KLineGraph" key="KLineGraph">
          <KLineGraph />
        </Tabs.TabPane>
        <Tabs.TabPane tab="CanvasPanel" key="CanvasPanel">
          <ModuleCanvasPanel />
        </Tabs.TabPane>
      </Tabs>
    </div>
  )
}

export default React.memo(CanvasPanelPage);