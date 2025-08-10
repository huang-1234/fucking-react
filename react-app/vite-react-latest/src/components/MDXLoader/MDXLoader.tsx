import React, { Suspense } from 'react';
import { Spin, Result } from 'antd';
import MDXProviderWrapper from '../MDXProvider';
import styles from './MDXLoader.module.less';

interface MDXLoaderProps {
  path: string;
}

/**
 * MDX动态加载器组件
 * 用于动态加载和渲染MDX内容
 */
const MDXLoader: React.FC<MDXLoaderProps> = ({ path }) => {
  // 使用React.lazy动态导入MDX文件
  const MDXContent = React.lazy(() => {
    return import(/* @vite-ignore */ path)
      .catch(err => {
        console.error(`Error loading MDX file: ${path}`, err);
        return { default: () => (
          <Result
            status="error"
            title="加载失败"
            subTitle={`无法加载文档: ${path}`}
          />
        )};
      });
  });

  return (
    <div className={styles.mdxLoaderWrapper}>
      <MDXProviderWrapper>
        <div className="mdx-content">
          <Suspense fallback={
            <div className={styles.loadingContainer}>
              <Spin tip="加载文档中..." size="large" />
            </div>
          }>
            <MDXContent />
          </Suspense>
        </div>
      </MDXProviderWrapper>
    </div>
  );
};

export default MDXLoader;