import React from 'react'
import './index.less';


interface TabPaneProps {
  className?: string;
  tabs: string;
  alt: string;
  title?: string;
}

export const Tabs = {
  TabPane: React.memo(({ children, className, tabs, alt, title }: React.PropsWithChildren<TabPaneProps>) => {
    return (
      <div className={className}>
        <TabPane tabs={tabs} alt={alt} title={title} />
        {children}
        </div>
    )
  })
}

export interface TabsProps {
  className?: string;
  tabs: string;
  title?: string;
}


export const Tabs: React.FC<React.PropsWithChildren<TabsProps>> = ({ children, className, src, alt, title }) => {
  return (
    <div className={className}>
      <Tabs src={src} alt={alt} title={title} />
    </div>
  )
}

export default React.memo(Tabs);
