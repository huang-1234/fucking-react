import React from 'react';
import './index.less';

interface FlexboxProps {
  children: React.ReactNode;
  className?: string;
  direction: 'row' | 'column';
  justify: 'start' | 'end' | 'center' | 'space-between' | 'space-around';
  align: 'start' | 'end' | 'center' | 'space-between' | 'space-around';
  wrap: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap: number;
}
const Flexbox: React.FC<React.PropsWithChildren<FlexboxProps>> = ({ children, className, direction, justify, align, wrap, gap }: FlexboxProps) => {
  return <div className={className} style={{
    display: 'flex',
    flexDirection: direction,
    justifyContent: justify,
    alignItems: align,
    flexWrap: wrap,
    gap: gap,
  }}>{children}</div>;
};

export default React.memo(Flexbox);