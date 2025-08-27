import React, { useState, useEffect } from 'react';
import { FixedSizeList as List } from 'react-window';
import MarkdownRenderer from './MarkdownRenderer';
import type { MarkdownRendererProps } from '../types/markdown';
import styles from './VirtualizedMarkdown.module.less';

interface VirtualizedMarkdownProps extends MarkdownRendererProps {
  height?: number;
  itemHeight?: number;
  width?: number | string;
  overscanCount?: number;
}

const VirtualizedMarkdown: React.FC<VirtualizedMarkdownProps> = (props: VirtualizedMarkdownProps) => {
  const { content, height = 600, itemHeight = 50, width = '100%', overscanCount = 5, ...markdownProps } = props;
  const [lines, setLines] = useState<string[]>([]);

  // 将Markdown内容分割成行
  useEffect(() => {
    // 简单地按换行符分割
    // 对于复杂的Markdown，可能需要更智能的分割方法
    const contentLines = content.split('\n');

    // 对于非常短的内容，我们可以禁用虚拟滚动
    if (contentLines.length < 20) {
      setLines([content]);
      return;
    }

    // 将内容分组，每组大约包含3-5行
    // 这样可以减少渲染的组件数量，提高性能
    const groupSize = 3;
    const groupedLines: string[] = [];

    for (let i = 0; i < contentLines.length; i += groupSize) {
      const group = contentLines.slice(i, i + groupSize).join('\n');
      groupedLines.push(group);
    }

    setLines(groupedLines);
  }, [content]);

  // 如果内容很少，直接渲染完整内容
  if (lines.length === 1) {
    return <MarkdownRenderer content={content} {...markdownProps} />;
  }

  // 行渲染器
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className={styles.virtualRow}>
      <MarkdownRenderer
        content={lines[index]}
        {...markdownProps}
        className={`${markdownProps.className || ''} ${styles.virtualLine}`}
      />
    </div>
  );

  return (
    <div className={styles.virtualContainer}>
      <List
        height={height}
        itemCount={lines.length}
        itemSize={itemHeight}
        width={width}
        overscanCount={overscanCount}
      >
        {Row}
      </List>
    </div>
  );
};

export default React.memo(VirtualizedMarkdown);