import { describe, it, expect } from 'vitest';
import HtmlRenderer from '../HtmlRenderer';
import { ASTNodeType } from '../../../common/md';

describe('HtmlRenderer', () => {
  describe('render', () => {
    it('should render an empty document', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: []
      };

      const html = renderer.render(ast);
      expect(html).toBe('');
    });

    it('should render headings correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.HEADING,
            content: 'Heading 1',
            level: 1
          },
          {
            type: ASTNodeType.HEADING,
            content: 'Heading 2',
            level: 2
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toContain('<h1 id="heading-heading-1">Heading 1</h1>');
      expect(html).toContain('<h2 id="heading-heading-2">Heading 2</h2>');
    });

    it('should render paragraphs correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            content: 'This is a paragraph.'
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<p>This is a paragraph.</p>');
    });

    it('should render code blocks correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.CODE_BLOCK,
            content: 'const x = 10;',
            attrs: { lang: 'javascript' }
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<pre><code class="language-javascript">const x = 10;</code></pre>');
    });

    it('should render blockquotes correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.BLOCKQUOTE,
            children: [
              {
                type: ASTNodeType.PARAGRAPH,
                content: 'This is a quote.'
              }
            ]
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<blockquote><p>This is a quote.</p></blockquote>');
    });

    it('should render lists correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.LIST,
            children: [
              {
                type: ASTNodeType.LIST_ITEM,
                content: 'Item 1'
              },
              {
                type: ASTNodeType.LIST_ITEM,
                content: 'Item 2'
              }
            ]
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<ul><li>Item 1</li><li>Item 2</li></ul>');
    });

    it('should render inline elements correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            children: [
              {
                type: ASTNodeType.TEXT,
                content: 'This is '
              },
              {
                type: ASTNodeType.STRONG,
                content: 'bold'
              },
              {
                type: ASTNodeType.TEXT,
                content: ' and '
              },
              {
                type: ASTNodeType.EMPH,
                content: 'italic'
              },
              {
                type: ASTNodeType.TEXT,
                content: ' and '
              },
              {
                type: ASTNodeType.INLINE_CODE,
                content: 'code'
              }
            ]
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<p>This is <strong>bold</strong> and <em>italic</em> and <code>code</code></p>');
    });

    it('should render links correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            children: [
              {
                type: ASTNodeType.LINK,
                content: 'Example',
                attrs: { href: 'https://example.com' }
              }
            ]
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<p><a href="https://example.com" target="_blank" rel="noopener noreferrer">Example</a></p>');
    });

    it('should render images correctly', () => {
      const renderer = new HtmlRenderer();
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            children: [
              {
                type: ASTNodeType.IMAGE,
                attrs: {
                  src: 'https://example.com/image.jpg',
                  alt: 'Example Image'
                }
              }
            ]
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<p><img src="https://example.com/image.jpg" alt="Example Image"></p>');
    });

    it('should sanitize URLs', () => {
      const renderer = new HtmlRenderer({ sanitize: true });
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            children: [
              {
                type: ASTNodeType.LINK,
                content: 'Malicious',
                attrs: { href: 'javascript:alert("XSS")' }
              }
            ]
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<p><a href="#" target="_blank" rel="noopener noreferrer">Malicious</a></p>');
    });

    it('should handle custom link targets', () => {
      const renderer = new HtmlRenderer({ linkTarget: '_self' });
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [
          {
            type: ASTNodeType.PARAGRAPH,
            children: [
              {
                type: ASTNodeType.LINK,
                content: 'Example',
                attrs: { href: 'https://example.com' }
              }
            ]
          }
        ]
      };

      const html = renderer.render(ast);
      expect(html).toBe('<p><a href="https://example.com" target="_self" rel="noopener noreferrer">Example</a></p>');
    });
  });
});
