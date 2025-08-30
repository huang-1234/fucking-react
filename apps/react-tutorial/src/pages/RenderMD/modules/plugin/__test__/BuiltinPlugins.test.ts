import { describe, it, expect } from 'vitest';
import { TablePlugin, TaskListPlugin, TableOfContentsPlugin, FootnotePlugin } from '../BuiltinPlugins';
import { PluginHook, PluginType } from '../PluginTypes';
import { ASTNodeType } from '../../../common/md';

describe('BuiltinPlugins', () => {
  describe('TablePlugin', () => {
    it('should have the correct structure', () => {
      expect(TablePlugin.name).toBe('table');
      expect(TablePlugin.type).toBe(PluginType.SYNTAX);
      expect(TablePlugin.hooks).toBeDefined();
      expect(typeof TablePlugin.hooks[PluginHook.BEFORE_PARSE]).toBe('function');
      expect(typeof TablePlugin.hooks[PluginHook.AFTER_PARSE]).toBe('function');
    });

    it('should preprocess table syntax in BEFORE_PARSE hook', () => {
      const hook = TablePlugin.hooks[PluginHook.BEFORE_PARSE];
      const input = '|Header 1|Header 2|\n|--------|--------|\n|Cell 1|Cell 2|';
      const output = hook(input, {});

      // Should add newlines around the table
      expect(output).toBe('\n|Header 1|Header 2|\n|--------|--------|\n|Cell 1|Cell 2|\n');
    });

    it('should transform paragraphs to tables in AFTER_PARSE hook', () => {
      const hook = TablePlugin.hooks[PluginHook.AFTER_PARSE];

      // Create a simple AST with a paragraph that contains table syntax
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            content: '|Header 1|Header 2|\n|--------|--------|\n|Cell 1|Cell 2|'
          }
        ]
      };

      const result = hook(ast, {});

      // The paragraph should be transformed to a table
      expect(result.children[0].type).toBe(ASTNodeType.TABLE);
      expect(result.children[0].children).toBeDefined();
      expect(result.children[0].children.length).toBe(2); // Header row + data row
    });
  });

  describe('TaskListPlugin', () => {
    it('should have the correct structure', () => {
      expect(TaskListPlugin.name).toBe('taskList');
      expect(TaskListPlugin.type).toBe(PluginType.SYNTAX);
      expect(TaskListPlugin.hooks).toBeDefined();
      expect(typeof TaskListPlugin.hooks[PluginHook.AFTER_PARSE]).toBe('function');
    });

    it('should transform list items to task list items in AFTER_PARSE hook', () => {
      const hook = TaskListPlugin.hooks[PluginHook.AFTER_PARSE];

      // Create a simple AST with list items
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.LIST,
            children: [
              {
                type: ASTNodeType.LIST_ITEM,
                content: '[ ] Task 1'
              },
              {
                type: ASTNodeType.LIST_ITEM,
                content: '[x] Task 2'
              }
            ]
          }
        ]
      };

      const result = hook(ast, {});

      // The list items should be transformed to task list items
      expect(result.children[0].children[0].attrs.task).toBe(true);
      expect(result.children[0].children[0].attrs.checked).toBe(false);
      expect(result.children[0].children[0].content).toBe('Task 1');

      expect(result.children[0].children[1].attrs.task).toBe(true);
      expect(result.children[0].children[1].attrs.checked).toBe(true);
      expect(result.children[0].children[1].content).toBe('Task 2');
    });
  });

  describe('TableOfContentsPlugin', () => {
    it('should have the correct structure', () => {
      expect(TableOfContentsPlugin.name).toBe('tableOfContents');
      expect(TableOfContentsPlugin.type).toBe(PluginType.EXTENSION);
      expect(TableOfContentsPlugin.hooks).toBeDefined();
      expect(typeof TableOfContentsPlugin.hooks[PluginHook.AFTER_PARSE]).toBe('function');
    });

    it('should collect headings and replace TOC marker in AFTER_PARSE hook', () => {
      const hook = TableOfContentsPlugin.hooks[PluginHook.AFTER_PARSE];

      // Create a simple AST with headings and TOC marker
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.HEADING,
            content: 'Heading 1',
            level: 1
          },
          {
            type: ASTNodeType.PARAGRAPH,
            content: '[TOC]'
          },
          {
            type: ASTNodeType.HEADING,
            content: 'Heading 2',
            level: 2
          }
        ]
      };

      const result = hook(ast, {});

      // The TOC marker should be replaced with a custom block
      expect(result.children[1].type).toBe(ASTNodeType.CUSTOM_BLOCK);
      expect(result.children[1].attrs.type).toBe('toc');
      expect(result.children[1].children).toBeDefined();

      // The headings should have IDs
      expect(result.children[0].attrs.id).toBeDefined();
      expect(result.children[2].attrs.id).toBeDefined();
    });
  });

  describe('FootnotePlugin', () => {
    it('should have the correct structure', () => {
      expect(FootnotePlugin.name).toBe('footnote');
      expect(FootnotePlugin.type).toBe(PluginType.SYNTAX);
      expect(FootnotePlugin.hooks).toBeDefined();
      expect(typeof FootnotePlugin.hooks[PluginHook.BEFORE_PARSE]).toBe('function');
      expect(typeof FootnotePlugin.hooks[PluginHook.AFTER_PARSE]).toBe('function');
    });

    it('should preprocess footnote definitions in BEFORE_PARSE hook', () => {
      const hook = FootnotePlugin.hooks[PluginHook.BEFORE_PARSE];
      const input = 'Text with a footnote[^1].\n[^1]: Footnote content';
      const output = hook(input, {});

      // Should add newlines around footnote definitions
      expect(output).toContain('\n[^1]: Footnote content\n');
    });

    it('should process footnotes in AFTER_PARSE hook', () => {
      const hook = FootnotePlugin.hooks[PluginHook.AFTER_PARSE];

      // Create a simple AST with footnote reference and definition
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            content: 'Text with a footnote[^1].'
          },
          {
            type: ASTNodeType.PARAGRAPH,
            content: '[^1]: Footnote content'
          }
        ]
      };

      const result = hook(ast, {});

      // The footnote definition should be removed and a footnote section should be added
      expect(result.children.length).toBe(2);
      expect(result.children[0].type).toBe(ASTNodeType.PARAGRAPH);
      expect(result.children[1].type).toBe(ASTNodeType.CUSTOM_BLOCK);
      expect(result.children[1].attrs.type).toBe('footnotes');
    });
  });
});
