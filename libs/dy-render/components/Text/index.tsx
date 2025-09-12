import React from 'react'
import  './index.less';

interface TextProps {
  children: React.ReactNode;
  className?: string;
  text: string;
}

export const Text: React.FC<TextProps> = (props: TextProps) => {
  const { className, text, children } = props;
  return (
    <div className={className}>
      <span>{text}</span>
      {children}
    </div>
  )
}

export default React.memo(Text);
