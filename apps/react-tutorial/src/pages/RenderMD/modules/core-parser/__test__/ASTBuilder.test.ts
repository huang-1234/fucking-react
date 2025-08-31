import { describe, it, expect } from 'vitest';
import ASTBuilder from '../ASTBuilder';
import { TokenType, type Token } from '../Tokenizer';
import { ASTNodeType } from '../../../common/md';

describe('ASTBuilder', () => {
  const astBuilder = new ASTBuilder();

  describe('buildAST', () => {
    it('should create a document node with empty tokens', () => {
      const tokens: Token[] = [];
      const ast = astBuilder.buildAST(tokens);

      expect(ast).toEqual({
        type: ASTNodeType.DOCUMENT,
        children: []
      });
    });

    it('should process heading tokens correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.HEADING,
          value: 'Test Heading',
          raw: '# Test Heading',
          depth: 1
        }
      ];

      const ast = astBuilder.buildAST(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0]).toEqual({
        type: ASTNodeType.HEADING,
        content: 'Test Heading',
        level: 1
      });
    });

    it('should process paragraph tokens correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.PARAGRAPH,
          value: 'Test paragraph',
          raw: 'Test paragraph'
        }
      ];

      const ast = astBuilder.buildAST(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.PARAGRAPH);
      expect(ast.children?.[0].content).toBe('Test paragraph');
      expect(ast.children?.[0].children).toBeDefined();
    });

    it('should process code block tokens correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.CODE_BLOCK,
          value: '',
          raw: '```javascript',
          lang: 'javascript'
        },
        {
          type: TokenType.TEXT,
          value: 'const x = 10;',
          raw: 'const x = 10;'
        },
        {
          type: TokenType.NEWLINE,
          value: '\n',
          raw: '\n'
        },
        {
          type: TokenType.TEXT,
          value: 'console.log(x);',
          raw: 'console.log(x);'
        },
        {
          type: TokenType.CODE_BLOCK,
          value: '',
          raw: '```',
          lang: ''
        }
      ];

      const ast = astBuilder.buildAST(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0]).toEqual({
        type: ASTNodeType.CODE_BLOCK,
        content: 'const x = 10;\nconsole.log(x);',
        attrs: { lang: 'javascript' }
      });
    });

    it('should process blockquote tokens correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.BLOCKQUOTE,
          value: 'Test quote',
          raw: '> Test quote'
        }
      ];

      const ast = astBuilder.buildAST(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.BLOCKQUOTE);
      expect(ast.children?.[0].content).toBe('Test quote');
      expect(ast.children?.[0].children).toBeDefined();
    });

    it('should process list item tokens correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.LIST_ITEM,
          value: 'Item 1',
          raw: '- Item 1',
          depth: 0
        },
        {
          type: TokenType.LIST_ITEM,
          value: 'Item 2',
          raw: '- Item 2',
          depth: 0
        }
      ];

      const ast = astBuilder.buildAST(tokens);

      // Should create a list node with list items
      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.LIST);
      expect(ast.children?.[0].children).toHaveLength(2);
      expect(ast.children?.[0].children?.[0].type).toBe(ASTNodeType.LIST_ITEM);
      expect(ast.children?.[0].children?.[0].content).toBe('Item 1');
      expect(ast.children?.[0].children?.[1].content).toBe('Item 2');
    });

    it('should process horizontal rule tokens correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.HORIZONTAL_RULE,
          value: '',
          raw: '---'
        }
      ];

      const ast = astBuilder.buildAST(tokens);

      expect(ast.children).toHaveLength(1);
      expect(ast.children?.[0].type).toBe(ASTNodeType.CUSTOM_BLOCK);
      expect(ast.children?.[0].content).toBe('---');
    });

    it('should ignore newline tokens', () => {
      const tokens: Token[] = [
        {
          type: TokenType.NEWLINE,
          value: '\n',
          raw: '\n'
        }
      ];

      const ast = astBuilder.buildAST(tokens);

      expect(ast.children).toHaveLength(0);
    });
  });

  describe('processInlineElements', () => {
    it('should process bold text correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.PARAGRAPH,
          value: 'This is **bold** text',
          raw: 'This is **bold** text'
        }
      ];

      const ast = astBuilder.buildAST(tokens);
      const paragraphNode = ast.children?.[0];
      if(!paragraphNode) return;

      expect(paragraphNode.children).toHaveLength(3);
      expect(paragraphNode.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[0].content).toBe('This is ');
      expect(paragraphNode.children?.[1].type).toBe(ASTNodeType.STRONG);
      expect(paragraphNode.children?.[1].content).toBe('bold');
      expect(paragraphNode.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[2].content).toBe(' text');
    });

    it('should process italic text correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.PARAGRAPH,
          value: 'This is *italic* text',
          raw: 'This is *italic* text'
        }
      ];

      const ast = astBuilder.buildAST(tokens);
      const paragraphNode = ast.children?.[0];
      if (!paragraphNode) {
        expect(paragraphNode).toBeDefined();
        return;
      };
      expect(paragraphNode.children).toHaveLength(3);
      expect(paragraphNode.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[0].content).toBe('This is ');
      expect(paragraphNode.children?.[1].type).toBe(ASTNodeType.EMPH);
      expect(paragraphNode.children?.[1].content).toBe('italic');
      expect(paragraphNode.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[2].content).toBe(' text');
    });

    it('should process inline code correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.PARAGRAPH,
          value: 'This is `code` text',
          raw: 'This is `code` text'
        }
      ];

      const ast = astBuilder.buildAST(tokens);
      const paragraphNode = ast.children?.[0];
      if (!paragraphNode) {
        expect(paragraphNode).toBeDefined();
        return;
      };
      expect(paragraphNode.children).toHaveLength(3);
      expect(paragraphNode.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[0].content).toBe('This is ');
      expect(paragraphNode.children?.[1].type).toBe(ASTNodeType.INLINE_CODE);
      expect(paragraphNode.children?.[1].content).toBe('code');
      expect(paragraphNode.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[2].content).toBe(' text');
    });

    it('should process links correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.PARAGRAPH,
          value: 'This is a [link](https://example.com) text',
          raw: 'This is a [link](https://example.com) text'
        }
      ];

      const ast = astBuilder.buildAST(tokens);
      const paragraphNode = ast.children?.[0];
      if (!paragraphNode) {
        expect(paragraphNode).toBeDefined();
        return;
      };
      expect(paragraphNode.children).toHaveLength(3);
      expect(paragraphNode.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[0].content).toBe('This is a ');
      expect(paragraphNode.children?.[1].type).toBe(ASTNodeType.LINK);
      expect(paragraphNode.children?.[1].content).toBe('link');
      expect(paragraphNode.children?.[1].attrs?.href).toBe('https://example.com');
      expect(paragraphNode.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[2].content).toBe(' text');
    });

    it('should process images correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.PARAGRAPH,
          value: 'This is an ![image](https://example.com/img.jpg) text',
          raw: 'This is an ![image](https://example.com/img.jpg) text'
        }
      ];

      const ast = astBuilder.buildAST(tokens);
      const paragraphNode = ast.children?.[0];
      if (!paragraphNode) {
        expect(paragraphNode).toBeDefined();
        return;
      };
      expect(paragraphNode.children).toHaveLength(3);
      expect(paragraphNode.children?.[0].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[0].content).toBe('This is an ');
      expect(paragraphNode.children?.[1].type).toBe(ASTNodeType.IMAGE);
      expect(paragraphNode.children?.[1].attrs?.src).toBe('https://example.com/img.jpg');
      expect(paragraphNode.children?.[1].attrs?.alt).toBe('image');
      expect(paragraphNode.children?.[2].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[2].content).toBe(' text');
    });

    it('should handle multiple inline elements correctly', () => {
      const tokens: Token[] = [
        {
          type: TokenType.PARAGRAPH,
          value: '**Bold** and *italic* and `code`',
          raw: '**Bold** and *italic* and `code`'
        }
      ];

      const ast = astBuilder.buildAST(tokens);
      const paragraphNode = ast.children?.[0];
      if (!paragraphNode) {
        expect(paragraphNode).toBeDefined();
        return;
      };
      expect(paragraphNode.children).toHaveLength(5);
      expect(paragraphNode.children?.[0].type).toBe(ASTNodeType.STRONG);
      expect(paragraphNode.children?.[0].content).toBe('Bold');
      expect(paragraphNode.children?.[1].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[1].content).toBe(' and ');
      expect(paragraphNode.children?.[2].type).toBe(ASTNodeType.EMPH);
      expect(paragraphNode.children?.[2].content).toBe('italic');
      expect(paragraphNode.children?.[3].type).toBe(ASTNodeType.TEXT);
      expect(paragraphNode.children?.[3].content).toBe(' and ');
      expect(paragraphNode.children?.[4].type).toBe(ASTNodeType.INLINE_CODE);
      expect(paragraphNode.children?.[4].content).toBe('code');
    });
  });
});
