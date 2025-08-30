import { type ASTNode, ASTNodeType } from '../../common/md';
import { InnerPluginId } from './common';
import { type MarkdownPlugin, type PluginContext } from './PluginTypes';
import { PluginHook, PluginType } from './PluginTypes';

/**
 * 表格插件 - 处理Markdown表格语法
 */
export const TablePlugin: MarkdownPlugin = {
  id: InnerPluginId.table,
  name: InnerPluginId.table,
  type: PluginType.SYNTAX,
  priority: 5,
  hooks: {
    [PluginHook.BEFORE_PARSE]: (text: string, _context: PluginContext): string => {
      // 预处理表格语法，确保表格前后有空行
      return text.replace(/^((\|[^\n]*\|\r?\n)+)/gm, '\n$1\n');
    },
    [PluginHook.AFTER_PARSE]: (ast: ASTNode, _context: PluginContext): ASTNode => {
      // 处理表格节点
      const processTableNodes = (node: ASTNode): void => {
        if (node.type === ASTNodeType.PARAGRAPH) {
          // 检查段落是否包含表格行
          const content = node.content || '';
          const lines = content.split('\n');

          // 检查是否是表格（至少有两行，第一行是表头，第二行是分隔符）
          if (lines.length >= 2 &&
              lines[0].trim().startsWith('|') && lines[0].trim().endsWith('|') &&
              lines[1].trim().startsWith('|') && lines[1].trim().endsWith('|') &&
              lines[1].replace(/[^|]/g, '').length === lines[0].replace(/[^|]/g, '').length &&
              /^\|[\s-:]*\|$/.test(lines[1].trim())) {

            // 提取表头、分隔符和数据行
            const headerRow = lines[0].trim();
            const separatorRow = lines[1].trim();
            const dataRows = lines.slice(2).filter(line =>
              line.trim().startsWith('|') && line.trim().endsWith('|'));

            // 解析表头
            const headers = headerRow
              .slice(1, -1)
              .split('|')
              .map(cell => cell.trim());

            // 解析对齐方式
            const alignments = separatorRow
              .slice(1, -1)
              .split('|')
              .map(cell => {
                const trimmed = cell.trim();
                if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
                if (trimmed.endsWith(':')) return 'right';
                if (trimmed.startsWith(':')) return 'left';
                return 'left';
              });

            // 解析数据行
            const rows = dataRows.map(row =>
              row
                .slice(1, -1)
                .split('|')
                .map(cell => cell.trim())
            );

            // 创建表格节点
            const tableNode: ASTNode = {
              type: ASTNodeType.TABLE,
              children: [],
              attrs: {
                alignments
              }
            };

            // 添加表头行
            const headerNode: ASTNode = {
              type: ASTNodeType.TABLE_ROW,
              children: headers.map((header, index) => ({
                type: ASTNodeType.TABLE_CELL,
                content: header,
                attrs: {
                  header: true,
                  align: alignments[index] || 'left'
                }
              }))
            };
            tableNode.children?.push(headerNode);

            // 添加数据行
            rows.forEach(row => {
              const rowNode: ASTNode = {
                type: ASTNodeType.TABLE_ROW,
                children: row.map((cell, index) => ({
                  type: ASTNodeType.TABLE_CELL,
                  content: cell,
                  attrs: {
                    header: false,
                    align: alignments[index] || 'left'
                  }
                }))
              };
              tableNode.children?.push(rowNode);
            });

            // 替换原始段落节点为表格节点
            node.type = tableNode.type;
            node.children = tableNode.children;
            node.attrs = tableNode.attrs;
            node.content = '';
          }
        }

        // 递归处理子节点
        if (node.children) {
          node.children.forEach(processTableNodes);
        }
      };

      processTableNodes(ast);
      return ast;
    }
  }
};

/**
 * 任务列表插件 - 处理任务列表语法
 */
export const TaskListPlugin: MarkdownPlugin = {
  id: InnerPluginId.taskList,
  name: InnerPluginId.taskList,
  type: PluginType.SYNTAX,
  priority: 6,
  hooks: {
    [PluginHook.AFTER_PARSE]: (ast: ASTNode, _context: PluginContext): ASTNode => {
      // 处理任务列表项
      const processTaskListItems = (node: ASTNode): void => {
        if (node.type === ASTNodeType.LIST_ITEM) {
          const content = node.content || '';
          // 匹配任务列表项格式: [x] 或 [ ]
          const taskMatch = content.match(/^\s*\[([ xX])\]\s*(.*)/);

          if (taskMatch) {
            const checked = taskMatch[1].toLowerCase() === 'x';
            const text = taskMatch[2];

            // 更新节点属性
            node.attrs = {
              ...(node.attrs || {}),
              task: true,
              checked
            };
            node.content = text;
          }
        }

        // 递归处理子节点
        if (node.children) {
          node.children.forEach(processTaskListItems);
        }
      };

      processTaskListItems(ast);
      return ast;
    }
  }
};

/**
 * 目录插件 - 生成文档目录
 */
export const TableOfContentsPlugin: MarkdownPlugin = {
  id: InnerPluginId.tableOfContents,
  name: InnerPluginId.tableOfContents,
  type: PluginType.EXTENSION,
  priority: 3,
  hooks: {
    [PluginHook.AFTER_PARSE]: (ast: ASTNode, _context: PluginContext): ASTNode => {
      // 收集文档中的所有标题
      const headings: Array<{id: string; level: number; text: string}> = [];
      const collectHeadings = (node: ASTNode): void => {
        if (node.type === ASTNodeType.HEADING) {
          const level = node.attrs?.level || 1;
          const text = node.content || '';
          const id = text
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]/g, '');

          headings.push({ id, level, text });

          // 为标题添加ID，以便锚点链接
          node.attrs = {
            ...(node.attrs || {}),
            id
          };
        }

        // 递归处理子节点
        if (node.children) {
          node.children.forEach(collectHeadings);
        }
      };

      collectHeadings(ast);

      // 查找TOC标记并替换为目录
      const processTocMarker = (node: ASTNode): boolean => {
        if (node.type === ASTNodeType.PARAGRAPH &&
            (node.content === '[TOC]' || node.content === '[[TOC]]')) {

          // 创建目录节点
          const tocNode: ASTNode = {
            type: ASTNodeType.CUSTOM_BLOCK,
            attrs: { type: 'toc' },
            children: []
          };

          // 生成目录项
          let currentLevel = 0;
          let currentList: ASTNode | null = null;
          let listStack: ASTNode[] = [];

          headings.forEach(heading => {
            // 创建列表项
            const listItemNode: ASTNode = {
              type: ASTNodeType.LIST_ITEM,
              children: [{
                type: ASTNodeType.PARAGRAPH,
                children: [{
                  type: ASTNodeType.LINK,
                  attrs: { href: `#${heading.id}` },
                  content: heading.text
                }]
              }]
            };

            // 处理嵌套级别
            if (heading.level > currentLevel) {
              // 创建新的嵌套列表
              const newList: ASTNode = {
                type: ASTNodeType.LIST,
                attrs: { ordered: false },
                children: [listItemNode]
              };

              if (currentList) {
                // 将新列表添加到当前列表项的最后一个子项
                const lastItem = currentList.children?.[currentList.children.length - 1];
                if (lastItem) {
                  if (!lastItem.children) {
                    lastItem.children = [];
                  }
                  lastItem.children.push(newList);
                  listStack.push(currentList);
                }
              } else {
                // 这是第一个列表
                tocNode.children = [newList];
              }

              currentList = newList;
              currentLevel = heading.level;
            } else if (heading.level < currentLevel) {
              // 回到上一级列表
              while (heading.level < currentLevel && listStack.length > 0) {
                currentList = listStack.pop() || null;
                currentLevel--;
              }

              // 添加到当前列表
              if (currentList && currentList.children) {
                currentList.children.push(listItemNode);
              }
            } else {
              // 同级，直接添加到当前列表
              if (currentList && currentList.children) {
                currentList.children.push(listItemNode);
              }
            }
          });

          // 替换原始节点
          node.type = tocNode.type;
          node.attrs = tocNode.attrs;
          node.children = tocNode.children;
          node.content = '';

          return true;
        }

        return false;
      };

      // 查找并处理TOC标记
      const findAndReplaceToc = (node: ASTNode): void => {
        if (processTocMarker(node)) {
          return;
        }

        // 递归处理子节点
        if (node.children) {
          node.children.forEach(findAndReplaceToc);
        }
      };

      findAndReplaceToc(ast);
      return ast;
    }
  }
};

/**
 * 脚注插件 - 处理脚注语法
 */
export const FootnotePlugin: MarkdownPlugin = {
  id: InnerPluginId.footnote,
  name: InnerPluginId.footnote,
  type: PluginType.SYNTAX,
  priority: 4,
  hooks: {
    [PluginHook.BEFORE_PARSE]: (text: string, _context: PluginContext): string => {
      // 预处理脚注定义，确保它们在单独的段落中
      return text.replace(/^\[\^(\w+)\]:\s*(.*?)$/gm, '\n[^$1]: $2\n');
    },
    [PluginHook.AFTER_PARSE]: (ast: ASTNode, _context: PluginContext): ASTNode => {
      // 收集脚注定义
      const footnotes = new Map<string, string>();

      const collectFootnotes = (node: ASTNode): boolean => {
        if (node.type === ASTNodeType.PARAGRAPH) {
          const content = node.content || '';
          const match = content.match(/^\[\^(\w+)\]:\s*(.*?)$/);

          if (match) {
            const id = match[1];
            const text = match[2];
            footnotes.set(id, text);
            return true; // 标记为脚注定义，稍后会移除
          }
        }

        return false;
      };

      // 处理脚注引用
      const processFootnoteReferences = (node: ASTNode): void => {
        if (node.type === ASTNodeType.TEXT || node.type === ASTNodeType.PARAGRAPH) {
          const content = node.content || '';

          // 查找脚注引用 [^id]
          if (content.includes('[^')) {
            const regex = /\[\^(\w+)\]/g;
            let match;
            let lastIndex = 0;
            const parts: ASTNode[] = [];

            while ((match = regex.exec(content)) !== null) {
              // 添加前面的文本
              if (match.index > lastIndex) {
                parts.push({
                  type: ASTNodeType.TEXT,
                  content: content.substring(lastIndex, match.index)
                });
              }

              // 添加脚注引用
              const id = match[1];
              parts.push({
                type: ASTNodeType.CUSTOM_INLINE,
                attrs: {
                  type: 'footnote-ref',
                  id
                },
                content: id
              });

              lastIndex = regex.lastIndex;
            }

            // 添加剩余文本
            if (lastIndex < content.length) {
              parts.push({
                type: ASTNodeType.TEXT,
                content: content.substring(lastIndex)
              });
            }

            // 如果有拆分，替换当前节点的子节点
            if (parts.length > 0) {
              if (node.type === ASTNodeType.PARAGRAPH) {
                node.children = parts;
                node.content = '';
              } else {
                // 文本节点被拆分，需要替换
                const parentNode = node.parent;
                if (parentNode && parentNode.children) {
                  const index = parentNode.children.indexOf(node);
                  if (index !== -1) {
                    parentNode.children.splice(index, 1, ...parts);
                  }
                }
              }
            }
          }
        }

        // 递归处理子节点
        if (node.children) {
          [...node.children].forEach(processFootnoteReferences);
        }
      };

      // 移除脚注定义节点
      const removeFootnoteDefinitions = (node: ASTNode): void => {
        if (node.children) {
          node.children = node.children.filter(child => {
            const isFootnoteDef = collectFootnotes(child);
            if (!isFootnoteDef) {
              removeFootnoteDefinitions(child);
              return true;
            }
            return false;
          });
        }
      };

      // 添加脚注部分
      const addFootnoteSection = (ast: ASTNode): void => {
        if (footnotes.size > 0) {
          // 创建脚注部分
          const footnoteSection: ASTNode = {
            type: ASTNodeType.CUSTOM_BLOCK,
            attrs: { type: 'footnotes' },
            children: []
          };

          // 添加每个脚注
          Array.from(footnotes.entries()).forEach(([id, text]) => {
            const footnoteNode: ASTNode = {
              type: ASTNodeType.CUSTOM_BLOCK,
              attrs: {
                type: 'footnote',
                id
              },
              children: [{
                type: ASTNodeType.PARAGRAPH,
                content: text
              }]
            };

            footnoteSection.children?.push(footnoteNode);
          });

          // 添加到文档末尾
          if (!ast.children) {
            ast.children = [];
          }
          ast.children.push(footnoteSection);
        }
      };

      // 执行处理
      removeFootnoteDefinitions(ast);
      processFootnoteReferences(ast);
      addFootnoteSection(ast);

      return ast;
    }
  }
};

export default {
  TablePlugin,
  TaskListPlugin,
  TableOfContentsPlugin,
  FootnotePlugin
};