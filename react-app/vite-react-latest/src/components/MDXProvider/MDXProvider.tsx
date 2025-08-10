import React from 'react';
import { MDXProvider } from '@mdx-js/react';
import MDXComponents from '../MDXComponents';

interface MDXProviderWrapperProps {
  children: React.ReactNode;
}

/**
 * MDX提供者包装组件
 * 为MDX内容提供自定义组件
 */
const MDXProviderWrapper: React.FC<MDXProviderWrapperProps> = ({ children }) => {
  return (
    <MDXProvider components={MDXComponents}>
      {children}
    </MDXProvider>
  );
};

export default MDXProviderWrapper;