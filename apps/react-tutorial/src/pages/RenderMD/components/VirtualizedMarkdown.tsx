import React, { useState, useEffect, useMemo } from 'react';
import { produce } from 'immer';
import { performanceMonitor } from '../tools/performance';
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

  // 优化内容分块逻辑
  const optimizeChunks = useMemo(() => {
    performanceMonitor.start('optimize_chunks');

    // 按Markdown语义块分割，而不是简单按行
    const lines = content.split('\n');
    const blocks: string[] = [];

    // 使用immer来构建块数组，避免频繁的数组拷贝
    const result = produce(blocks, draft => {
      let currentBlock = '';

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 检测新块的开始（标题、列表、代码块等）
        if (
          /^#{1,6}\s/.test(line) || // 标题
          /^[-*+]\s/.test(line) ||  // 无序列表
          /^>\s/.test(line) ||      // 引用
          /^```/.test(line) ||      // 代码块
          line.trim() === ''        // 空行作为段落分隔
        ) {
          if (currentBlock) {
            draft.push(currentBlock);
            currentBlock = '';
          }
        }

        currentBlock += line + '\n';

        // 确保最后一块也被添加
        if (i === lines.length - 1 && currentBlock) {
          draft.push(currentBlock);
        }
      }
    });

    performanceMonitor.end('optimize_chunks');
    return result;
  }, [content]);

  // 将Markdown内容分割成语义块
  useEffect(() => {
    performanceMonitor.start('content_chunking');

    // 对于非常短的内容，我们可以禁用虚拟滚动
    if (content.length < 5000) {
      setLines([content]);
    } else {
      // 使用优化的分块逻辑
      setLines(optimizeChunks);
    }

    performanceMonitor.end('content_chunking');
  }, [content, optimizeChunks]);

  // 创建行渲染器组件 - 移到条件判断之前
  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className={styles.virtualRow}>
      <MarkdownRenderer
        content={lines[index]}
        {...markdownProps}
        className={`${markdownProps.className || ''} ${styles.virtualLine}`}
      />
    </div>
  );

  // 如果内容很少，直接渲染完整内容
  if (lines.length === 1) {
    return <MarkdownRenderer content={content} {...markdownProps} />;
  }

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