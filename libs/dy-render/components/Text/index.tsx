import React from 'react'
import  './index.less';

interface TextProps {
  className?: string;
  text: string;
}

export const Text: React.FC<React.PropsWithChildren<TextProps>> = (props: TextProps) => {
  const { className, text } = props;
  return (
    <span className={className}>
      {text}
    </span>
  )
}

export default React.memo(Text);
