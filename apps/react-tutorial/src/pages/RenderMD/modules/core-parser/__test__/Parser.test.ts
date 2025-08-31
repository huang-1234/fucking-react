import { describe, it, expect } from 'vitest';
import MarkdownParser from '../Parser';
import { ASTNodeType } from '../../../common/md';
import { testEmpty } from './base';

describe('MarkdownParser', () => {
  const parser = new MarkdownParser();

  describe('parse', () => {
    it('should return a document node for empty input', () => {
      const ast = parser.parse('');

      expect(ast).toEqual({
        type: ASTNodeType.DOCUMENT,
        children: []
      });
    });

    it('should parse headings correctly', () => {
      const ast = parser.parse('# Heading 1\n## Heading 2');

      expect(ast.children).toHaveLength(2);
      expect(ast.children?.[0]).toEqual({
        type: ASTNodeType.HEADING,
        content: 'Heading 1',
        level: 1
      });
      expect(ast.children?.[1]).toEqual({
        type: ASTNodeType.HEADING,
        content: 'Heading 2',
        level: 2
      });
    });

    it('should parse paragraphs correctly', () => {
      const ast = parser.parse('This is paragraph 1.\n\nThis is paragraph 2.');

      expect(ast.children).toHaveLength(2);
      expect(ast.children?.[0].type).toBe(ASTNodeType.PARAGRAPH);
      expect(ast.children?.[0].content).toBe('This is paragraph 1.');
      expect(ast.children?.[1].type).toBe(ASTNodeType.PARAGRAPH);
      expect(ast.children?.[1].content).toBe('This is paragraph 2.');
    });

    it('should parse code blocks correctly', () => {
      const ast = parser.parse('```javascript\nconst x = 10;\nconsole.log(x);\n```');

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.CODE_BLOCK);
      expect(ast.children?.[0].content).toBe('const x = 10;\nconsole.log(x);\n');
      expect(ast.children?.[0].attrs?.lang).toBe('javascript');
    });

    it('should parse blockquotes correctly', () => {
      const ast = parser.parse('> This is a quote\n> And another line');

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.BLOCKQUOTE);
      expect(ast.children?.[0].children).toHaveLength(2);
      expect(ast.children?.[0].children?.[0].type).toBe(ASTNodeType.PARAGRAPH);
      expect(ast.children?.[0].children?.[0].content).toBe('This is a quote');
      expect(ast.children?.[0].children?.[1].type).toBe(ASTNodeType.PARAGRAPH);
      expect(ast.children?.[0].children?.[1].content).toBe('And another line');
    });

    it('should parse unordered lists correctly', () => {
      const ast = parser.parse('- Item 1\n- Item 2\n- Item 3');

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.LIST);
      expect(ast.children?.[0].children).toHaveLength(3);
      expect(ast.children?.[0].children?.[0].type).toBe(ASTNodeType.LIST_ITEM);
      expect(ast.children?.[0].children?.[0].content).toBe('Item 1');
      expect(ast.children?.[0].children?.[1].content).toBe('Item 2');
      expect(ast.children?.[0].children?.[2].content).toBe('Item 3');
    });

    it('should parse ordered lists correctly', () => {
      const ast = parser.parse('1. Item 1\n2. Item 2\n3. Item 3');

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.LIST);
      expect(ast.children?.[0].children).toHaveLength(3);
      expect(ast.children?.[0].children?.[0].type).toBe(ASTNodeType.LIST_ITEM);
      expect(ast.children?.[0].children?.[0].content).toBe('Item 1');
      expect(ast.children?.[0].children?.[1].content).toBe('Item 2');
      expect(ast.children?.[0].children?.[2].content).toBe('Item 3');
    });
  });

  describe('parseInlineElements', () => {
    it('should parse bold text correctly', () => {
      const ast = parser.parse('This is **bold** text.');

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children?.[0];
      if (!paragraph) {
        expect(paragraph).toBeDefined();
        return;
      };
      expect(paragraph.type).toBe(ASTNodeType.PARAGRAPH);
      expect(paragraph.children).toHaveLength(3);
      expect(paragraph.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[0].content).toBe('This is ');
      expect(paragraph.children?.[1].type).toBe(ASTNodeType.STRONG);
      expect(paragraph.children?.[1].content).toBe('bold');
      expect(paragraph.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[2].content).toBe(' text.');
    });

    it('should parse italic text correctly', () => {
      const ast = parser.parse('This is *italic* text.');

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children?.[0];
      if (!paragraph) {
        expect(paragraph).toBeDefined();
        return;
      };
      expect(paragraph.type).toBe(ASTNodeType.PARAGRAPH);
      expect(paragraph.children).toHaveLength(3);
      expect(paragraph.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[0].content).toBe('This is ');
      expect(paragraph.children?.[1].type).toBe(ASTNodeType.EMPH);
      expect(paragraph.children?.[1].content).toBe('italic');
      expect(paragraph.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[2].content).toBe(' text.');
    });

    it('should parse inline code correctly', () => {
      const ast = parser.parse('This is `code` text.');

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children?.[0];
      if (!paragraph) {
        expect(paragraph).toBeDefined();
        return;
      };
      expect(paragraph.type).toBe(ASTNodeType.PARAGRAPH);
      expect(paragraph.children).toHaveLength(3);
      expect(paragraph.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[0].content).toBe('This is ');
      expect(paragraph.children?.[1].type).toBe(ASTNodeType.INLINE_CODE);
      expect(paragraph.children?.[1].content).toBe('code');
      expect(paragraph.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[2].content).toBe(' text.');
    });

    it('should parse links correctly', () => {
      const ast = parser.parse('This is a [link](https://example.com) text.');

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children?.[0];
      if (!paragraph) {
        expect(paragraph).toBeDefined();
        return;
      };
      expect(paragraph.type).toBe(ASTNodeType.PARAGRAPH);
      expect(paragraph.children).toHaveLength(3);
      expect(paragraph.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[0].content).toBe('This is a ');
      expect(paragraph.children?.[1].type).toBe(ASTNodeType.LINK);
      expect(paragraph.children?.[1].content).toBe('link');
      expect(paragraph.children?.[1].attrs?.href).toBe('https://example.com');
      expect(paragraph.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[2].content).toBe(' text.');
    });

    it('should parse images correctly', () => {
      const ast = parser.parse('This is an ![image](https://example.com/img.jpg) text.');

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children?.[0];
      if (!paragraph) {
        expect(paragraph).toBeDefined();
        return;
      };
      expect(paragraph.type).toBe(ASTNodeType.PARAGRAPH);
      expect(paragraph.children).toHaveLength(3);
      expect(paragraph.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[0].content).toBe('This is an ');
      expect(paragraph.children?.[1].type).toBe(ASTNodeType.IMAGE);
      expect(paragraph.children?.[1].content).toBe('image');
      expect(paragraph.children?.[1].attrs?.src).toBe('https://example.com/img.jpg');
      expect(paragraph.children?.[1].attrs?.alt).toBe('image');
      expect(paragraph.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[2].content).toBe(' text.');
    });

    it('should handle multiple inline elements correctly', () => {
      const ast = parser.parse('**Bold** and *italic* and `code`');

      expect(ast.children).toHaveLength(1);
      const paragraph = ast.children?.[0];
      if (!paragraph) {
        expect(paragraph).toBeDefined();
        return;
      };
      testEmpty(paragraph);
      expect(paragraph.type).toBe(ASTNodeType.PARAGRAPH);
      expect(paragraph.children).toHaveLength(5);
      expect(paragraph.children?.[0].type).toBe(ASTNodeType.STRONG);
      expect(paragraph.children?.[0].content).toBe('Bold');
      expect(paragraph.children?.[1].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[1].content).toBe(' and ');
      expect(paragraph.children?.[2].type).toBe(ASTNodeType.EMPH);
      expect(paragraph.children?.[2].content).toBe('italic');
      expect(paragraph.children?.[3].type).toBe(ASTNodeType.TEXT);
      expect(paragraph.children?.[3].content).toBe(' and ');
      expect(paragraph.children?.[4].type).toBe(ASTNodeType.INLINE_CODE);
      expect(paragraph.children?.[4].content).toBe('code');
    });
  });
});
