import React from 'react'
import  './index.less';

interface ViewProps {
  className?: string;
  children: React.ReactNode;
}

export const View: React.FC<React.PropsWithChildren<ViewProps>> = (props: ViewProps) => {
  const { className, children } = props;
  const style = {
    width: '100%',
    height: '100%',
  }
  return (
    <div className={className} style={style}>
      {children}
    </div>
  )
}

export default React.memo(View);
