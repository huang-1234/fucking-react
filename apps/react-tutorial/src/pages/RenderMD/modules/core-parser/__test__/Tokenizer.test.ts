import { describe, it, expect } from 'vitest';
import Tokenizer, { TokenType } from '../Tokenizer';

describe('Tokenizer', () => {
  const tokenizer = new Tokenizer();

  describe('tokenize', () => {
    it('should return an empty array for empty input', () => {
      const tokens = tokenizer.tokenize('');
      expect(tokens).toEqual([]);
    });

    it('should tokenize headings correctly', () => {
      const tokens = tokenizer.tokenize('# Heading 1\n## Heading 2');

      expect(tokens).toHaveLength(3); // 2 headings + 1 newline
      expect(tokens[0]).toEqual({
        type: TokenType.HEADING,
        value: 'Heading 1',
        raw: '# Heading 1',
        depth: 1
      });
      expect(tokens[1]).toEqual({
        type: TokenType.NEWLINE,
        value: '\n',
        raw: '\n'
      });
      expect(tokens[2]).toEqual({
        type: TokenType.HEADING,
        value: 'Heading 2',
        raw: '## Heading 2',
        depth: 2
      });
    });

    it('should tokenize paragraphs correctly', () => {
      const tokens = tokenizer.tokenize('This is a paragraph.');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: TokenType.PARAGRAPH,
        value: 'This is a paragraph.',
        raw: 'This is a paragraph.'
      });
    });

    it('should tokenize code blocks correctly', () => {
      const tokens = tokenizer.tokenize('```javascript\nconst x = 10;\n```');

      expect(tokens).toHaveLength(5);
      expect(tokens[0]).toEqual({
        type: TokenType.CODE_BLOCK,
        value: '',
        raw: '```javascript',
        lang: 'javascript'
      });
      expect(tokens[1]).toEqual({
        type: TokenType.NEWLINE,
        value: '\n',
        raw: '\n'
      });
      expect(tokens[2]).toEqual({
        type: TokenType.PARAGRAPH,
        value: 'const x = 10;',
        raw: 'const x = 10;'
      });
      expect(tokens[3]).toEqual({
        type: TokenType.NEWLINE,
        value: '\n',
        raw: '\n'
      });
      expect(tokens[4]).toEqual({
        type: TokenType.CODE_BLOCK,
        value: '',
        raw: '```',
        lang: ''
      });
    });

    it('should tokenize blockquotes correctly', () => {
      const tokens = tokenizer.tokenize('> This is a quote');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: TokenType.BLOCKQUOTE,
        value: 'This is a quote',
        raw: '> This is a quote'
      });
    });

    it('should tokenize unordered list items correctly', () => {
      const tokens = tokenizer.tokenize('- Item 1\n- Item 2');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({
        type: TokenType.LIST_ITEM,
        value: 'Item 1',
        raw: '- Item 1',
        depth: 0
      });
      expect(tokens[1]).toEqual({
        type: TokenType.NEWLINE,
        value: '\n',
        raw: '\n'
      });
      expect(tokens[2]).toEqual({
        type: TokenType.LIST_ITEM,
        value: 'Item 2',
        raw: '- Item 2',
        depth: 0
      });
    });

    it('should tokenize ordered list items correctly', () => {
      const tokens = tokenizer.tokenize('1. Item 1\n2. Item 2');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({
        type: TokenType.LIST_ITEM,
        value: 'Item 1',
        raw: '1. Item 1',
        depth: 0
      });
      expect(tokens[1]).toEqual({
        type: TokenType.NEWLINE,
        value: '\n',
        raw: '\n'
      });
      expect(tokens[2]).toEqual({
        type: TokenType.LIST_ITEM,
        value: 'Item 2',
        raw: '2. Item 2',
        depth: 0
      });
    });

    it('should tokenize horizontal rules correctly', () => {
      const tokens = tokenizer.tokenize('---');

      expect(tokens).toHaveLength(1);
      expect(tokens[0]).toEqual({
        type: TokenType.HORIZONTAL_RULE,
        value: '',
        raw: '---'
      });
    });
  });

  describe('tokenizeInlineElements', () => {
    it('should tokenize inline code correctly', () => {
      const tokens = tokenizer.tokenize('This is `inline code`.');

      expect(tokens).toHaveLength(3);
      expect(tokens[0]).toEqual({
        type: TokenType.PARAGRAPH,
        value: 'This is `inline code`.',
        raw: 'This is `inline code`.'
      });
      expect(tokens[1]).toEqual({
        type: TokenType.TEXT,
        value: 'This is ',
        raw: 'This is '
      });
      expect(tokens[2]).toEqual({
        type: TokenType.CODE_INLINE,
        value: 'inline code',
        raw: '`inline code`'
      });
    });

    it('should tokenize bold text correctly', () => {
      const tokens = tokenizer.tokenize('This is **bold text**.');

      expect(tokens).toContainEqual({
        type: TokenType.STRONG,
        value: 'bold text',
        raw: '**bold text**'
      });
    });

    it('should tokenize italic text correctly', () => {
      const tokens = tokenizer.tokenize('This is *italic text*.');

      expect(tokens).toContainEqual({
        type: TokenType.EMPHASIS,
        value: 'italic text',
        raw: '*italic text*'
      });
    });

    it('should tokenize links correctly', () => {
      const tokens = tokenizer.tokenize('This is a [link](https://example.com).');

      expect(tokens).toContainEqual({
        type: TokenType.LINK,
        value: 'link',
        raw: '[link](https://example.com)',
        href: 'https://example.com'
      });
    });

    it('should tokenize images correctly', () => {
      const tokens = tokenizer.tokenize('This is an ![image](https://example.com/img.jpg).');

      expect(tokens).toContainEqual({
        type: TokenType.IMAGE,
        value: '',
        raw: '![image](https://example.com/img.jpg)',
        href: 'https://example.com/img.jpg',
        alt: 'image'
      });
    });

    it('should handle multiple inline elements correctly', () => {
      const tokens = tokenizer.tokenize('**Bold** and *italic* and `code`');

      expect(tokens).toContainEqual({
        type: TokenType.STRONG,
        value: 'Bold',
        raw: '**Bold**'
      });
      expect(tokens).toContainEqual({
        type: TokenType.EMPHASIS,
        value: 'italic',
        raw: '*italic*'
      });
      expect(tokens).toContainEqual({
        type: TokenType.CODE_INLINE,
        value: 'code',
        raw: '`code`'
      });
    });
  });
});
