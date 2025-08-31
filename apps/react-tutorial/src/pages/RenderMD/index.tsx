import React from 'react';
import MarkdownDemoPage from './components/MarkdownDemoPage';
import './index.less';

const RenderMDPage: React.FC = () => {
  return (
    <div className="render-md-container">
      <MarkdownDemoPage />
    </div>
  );
};

export default RenderMDPage;