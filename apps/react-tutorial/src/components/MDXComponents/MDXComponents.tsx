import React from 'react';
import { Typography, Alert, Divider } from 'antd';
import CodePreview from '../CodePreview';
import styles from './MDXComponents.module.less';

const { Title, Paragraph, Text, Link } = Typography;

/**
 * MDX自定义组件映射
 * 用于覆盖MDX默认渲染的HTML元素
 */
const MDXComponents = {
  // 标题组件
  h1: (props: any) => <Title level={1} className={styles.mdxHeading1} {...props} />,
  h2: (props: any) => <Title level={2} className={styles.mdxHeading2} {...props} />,
  h3: (props: any) => <Title level={3} className={styles.mdxHeading3} {...props} />,
  h4: (props: any) => <Title level={4} className={styles.mdxHeading4} {...props} />,
  h5: (props: any) => <Title level={5} className={styles.mdxHeading5} {...props} />,

  // 段落和文本
  p: (props: any) => <Paragraph className={styles.mdxParagraph} {...props} />,
  strong: (props: any) => <Text strong className={styles.mdxStrong} {...props} />,
  em: (props: any) => <Text italic className={styles.mdxEmphasis} {...props} />,

  // 链接
  a: (props: any) => <Link className={styles.mdxLink} target="_blank" {...props} />,

  // 列表
  ul: (props: any) => <ul className={styles.mdxUnorderedList} {...props} />,
  ol: (props: any) => <ol className={styles.mdxOrderedList} {...props} />,
  li: (props: any) => <li className={styles.mdxListItem} {...props} />,

  // 代码
  code: ({ className, children, ...props }: any) => {
    const match = /language-(\w+)/.exec(className || '');
    return match ? (
      <CodePreview lang={match[1]} {...props}>
        {String(children).trim()}
      </CodePreview>
    ) : (
      <code className={styles.mdxInlineCode} {...props}>
        {children}
      </code>
    );
  },
  pre: (props: any) => <div className={styles.mdxPreBlock} {...props} />,

  // 引用
  blockquote: (props: any) => (
    <Alert
      className={styles.mdxBlockquote}
      type="info"
      icon={null}
      banner
      {...props}
    />
  ),

  // 分割线
  hr: () => <Divider className={styles.mdxDivider} />,

  // 表格
  table: (props: any) => <table className={styles.mdxTable} {...props} />,
  thead: (props: any) => <thead className={styles.mdxTableHead} {...props} />,
  tbody: (props: any) => <tbody className={styles.mdxTableBody} {...props} />,
  tr: (props: any) => <tr className={styles.mdxTableRow} {...props} />,
  th: (props: any) => <th className={styles.mdxTableHeader} {...props} />,
  td: (props: any) => <td className={styles.mdxTableCell} {...props} />,
};

export default MDXComponents;