import React from 'react'
import  './index.less';

interface ImageProps {
  className?: string;
  src: string;
  alt: string;
  title?: string;
}

export const Image: React.FC<React.PropsWithChildren<ImageProps>> = ({ children, className, src, alt, title }) => {
  return (
    <div className={className}>
      <img src={src} alt={alt} title={title} />
    </div>
  )
}

export default React.memo(Image);
