import React, { useState, useEffect, useMemo, useCallback } from 'react';
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

/**
 * 优化的Markdown分块逻辑 - 按语义块分割
 * @param content Markdown内容
 */
const optimizeChunks = (content: string): string[] => {
  // 如果内容很小，直接返回整个内容
  if (content.length < 2000) {
    return [content];
  }

  const blocks = [];
  let currentBlock = '';
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 检测新块的开始（标题、列表、代码块等）
    if (
      /^#{1,6}\s/.test(line) || // 标题
      /^[-*+]\s/.test(line) ||  // 无序列表
      /^>\s/.test(line) ||      // 引用
      /^```/.test(line) ||      // 代码块开始
      /^---/.test(line) ||      // 水平线
      /^\|.+\|/.test(line) ||   // 表格行
      /^\s*\d+\.\s/.test(line)  // 有序列表
    ) {
      if (currentBlock) {
        blocks.push(currentBlock);
        currentBlock = '';
      }
    }

    // 添加当前行到当前块
    currentBlock += line + '\n';

    // 代码块结束也是一个分割点
    if (line.trim() === '```' && currentBlock) {
      blocks.push(currentBlock);
      currentBlock = '';
      continue;
    }

    // 空行后面可能是段落分隔
    if (line.trim() === '' && i < lines.length - 1 && lines[i+1].trim() !== '') {
      if (currentBlock.trim()) {
        blocks.push(currentBlock);
        currentBlock = '';
      }
    }

    // 确保最后一块也被添加
    if (i === lines.length - 1 && currentBlock.trim()) {
      blocks.push(currentBlock);
    }
  }

  // 合并太小的块，避免过度分割
  const mergedBlocks = [];
  let tempBlock = '';
  const minBlockSize = 500; // 最小块大小（字符数）

  for (const block of blocks) {
    if (tempBlock.length + block.length < minBlockSize) {
      tempBlock += block;
    } else {
      if (tempBlock) {
        mergedBlocks.push(tempBlock);
      }
      tempBlock = block;
    }
  }

  if (tempBlock) {
    mergedBlocks.push(tempBlock);
  }

  return mergedBlocks.length > 0 ? mergedBlocks : [content];
};

const VirtualizedMarkdown: React.FC<VirtualizedMarkdownProps> = (props: VirtualizedMarkdownProps) => {
  const { content, height = 600, itemHeight = 150, width = '100%', overscanCount = 10, ...markdownProps } = props;
  const [blocks, setBlocks] = useState<string[]>([]);
  const [blockHeights, setBlockHeights] = useState<number[]>([]);
  const [estimatedHeight, setEstimatedHeight] = useState<number>(itemHeight);

  // 使用优化的分块逻辑
  useEffect(() => {
    const optimizedBlocks = optimizeChunks(content);
    setBlocks(optimizedBlocks);

    // 根据块数量和内容估算每个块的高度
    const heights = optimizedBlocks.map(block => {
      // 估算高度：每行约24px，每个标题额外+16px
      const lineCount = block.split('\n').length;
      const headingCount = (block.match(/^#{1,6}\s/gm) || []).length;
      return Math.max(itemHeight, lineCount * 24 + headingCount * 16);
    });

    setBlockHeights(heights);

    // 计算平均估计高度
    if (heights.length > 0) {
      setEstimatedHeight(heights.reduce((sum, h) => sum + h, 0) / heights.length);
    }
  }, [content, itemHeight]);

  // 如果内容很少，直接渲染完整内容
  if (blocks.length === 1) {
    return <MarkdownRenderer content={content} {...markdownProps} />;
  }

  // 行渲染器 - 使用useCallback优化
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={{...style, height: blockHeights[index] || estimatedHeight}} className={styles.virtualRow}>
      <MarkdownRenderer
        content={blocks[index]}
        {...markdownProps}
        className={`${markdownProps.className || ''} ${styles.virtualLine}`}
      />
    </div>
  ), [blocks, blockHeights, estimatedHeight, markdownProps]);

  // 使用动态高度的列表
  return (
    <div className={styles.virtualContainer}>
      <List
        height={height}
        itemCount={blocks.length}
        itemSize={(index) => blockHeights[index] || estimatedHeight}
        width={width}
        overscanCount={overscanCount}
      >
        {Row}
      </List>
    </div>
  );
};

export default React.memo(VirtualizedMarkdown);