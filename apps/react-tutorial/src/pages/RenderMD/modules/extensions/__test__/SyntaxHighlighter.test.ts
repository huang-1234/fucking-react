import { describe, it, expect, vi, beforeEach } from 'vitest';
import SyntaxHighlighter from '../SyntaxHighlighter';
import { PluginHook, PluginType } from '../../plugin';
import { ASTNodeType } from '../../../common/md';
import { InnerPluginId } from '../../plugin/common';

describe('SyntaxHighlighter', () => {
  let syntaxHighlighter: SyntaxHighlighter;

  beforeEach(() => {
    syntaxHighlighter = new SyntaxHighlighter();
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      expect(syntaxHighlighter).toBeDefined();
      expect(syntaxHighlighter['options'].theme).toBe('github');
      expect(syntaxHighlighter['options'].showLineNumbers).toBe(true);
      expect(syntaxHighlighter['options'].highlightLines).toBe(true);
      expect(syntaxHighlighter['options'].tabSize).toBe(2);
      expect(syntaxHighlighter['options'].languages).toContain('javascript');
      expect(syntaxHighlighter['options'].defaultLanguage).toBe('text');
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        theme: 'dracula',
        showLineNumbers: false,
        highlightLines: false,
        tabSize: 4,
        languages: ['python', 'ruby'],
        defaultLanguage: 'python'
      };

      syntaxHighlighter = new SyntaxHighlighter(customOptions);

      expect(syntaxHighlighter['options'].theme).toBe('dracula');
      expect(syntaxHighlighter['options'].showLineNumbers).toBe(false);
      expect(syntaxHighlighter['options'].highlightLines).toBe(false);
      expect(syntaxHighlighter['options'].tabSize).toBe(4);
      expect(syntaxHighlighter['options'].languages).toEqual(['python', 'ruby']);
      expect(syntaxHighlighter['options'].defaultLanguage).toBe('python');
    });
  });

  describe('initialize', () => {
    it('should initialize the highlighter', async () => {
      await syntaxHighlighter.initialize();

      expect(syntaxHighlighter['highlighter']).toBeDefined();
      expect(typeof syntaxHighlighter['highlighter'].highlight).toBe('function');
      expect(typeof syntaxHighlighter['highlighter'].getLanguage).toBe('function');
    });
  });

  describe('highlight', () => {
    it('should highlight code', async () => {
      const code = 'const x = 10;';
      const result = await syntaxHighlighter.highlight(code, 'javascript');

      expect(result).toContain('const');
      expect(result).toContain('x');
      expect(result).toContain('10');
    });

    it('should use the default language if the specified language is not supported', async () => {
      const mockHighlight = vi.fn().mockReturnValue('highlighted code');
      const mockGetLanguage = vi.fn().mockReturnValue(false);

      syntaxHighlighter['highlighter'] = {
        highlight: mockHighlight,
        getLanguage: mockGetLanguage
      };

      await syntaxHighlighter.highlight('code', 'unsupported-language');

      expect(mockGetLanguage).toHaveBeenCalledWith('unsupported-language');
      expect(mockHighlight).toHaveBeenCalledWith('code', 'text');
    });

    it('should add line numbers if showLineNumbers is true', async () => {
      syntaxHighlighter['options'].showLineNumbers = true;

      const code = 'line 1\nline 2\nline 3';
      const result = await syntaxHighlighter.highlight(code, 'text');

      expect(result).toContain('line-numbers');
      expect(result).toContain('line-number');
      expect(result).toContain('code-line');
    });

    it('should handle errors gracefully', async () => {
      const mockHighlight = vi.fn().mockImplementation(() => {
        throw new Error('Highlighting error');
      });

      syntaxHighlighter['highlighter'] = {
        highlight: mockHighlight,
        getLanguage: () => true
      };

      const result = await syntaxHighlighter.highlight('code', 'javascript');

      expect(result).toBe('code');
    });
  });

  describe('createPlugin', () => {
    it('should create a plugin with the correct structure', () => {
      const plugin = syntaxHighlighter.createPlugin();

      expect(plugin.id).toBe(InnerPluginId.syntaxHighlighter);
      expect(plugin.name).toBe(InnerPluginId.syntaxHighlighter);
      expect(plugin.type).toBe(PluginType.SYNTAX);
      expect(plugin.priority).toBe(10);
      expect(plugin.hooks).toBeDefined();
      expect(typeof plugin.hooks[PluginHook.RENDER_NODE]).toBe('function');
    });

    it('should handle code blocks in the RENDER_NODE hook', async () => {
      const plugin = syntaxHighlighter.createPlugin();
      const hook = plugin.hooks[PluginHook.RENDER_NODE];

      // Mock the highlight method
      syntaxHighlighter.highlight = vi.fn().mockResolvedValue('highlighted code');

      const codeBlockNode = {
        type: ASTNodeType.CODE_BLOCK,
        content: 'const x = 10;',
        attrs: { language: 'javascript' }
      };

      const result = await hook(codeBlockNode, {});

      expect(syntaxHighlighter.highlight).toHaveBeenCalledWith('const x = 10;', 'javascript');
      expect(result).toBe('<pre class="language-javascript"><code>highlighted code</code></pre>');
    });

    it('should handle inline code in the RENDER_NODE hook', async () => {
      const plugin = syntaxHighlighter.createPlugin();
      const hook = plugin.hooks[PluginHook.RENDER_NODE];

      // Mock the escapeHtml method
      syntaxHighlighter['escapeHtml'] = vi.fn().mockReturnValue('escaped code');

      const inlineCodeNode = {
        type: ASTNodeType.INLINE_CODE,
        content: 'const x = 10;'
      };

      const result = await hook(inlineCodeNode, {});

      expect(syntaxHighlighter['escapeHtml']).toHaveBeenCalledWith('const x = 10;');
      expect(result).toBe('<code class="inline-code">escaped code</code>');
    });

    it('should return undefined for other node types', async () => {
      const plugin = syntaxHighlighter.createPlugin();
      const hook = plugin.hooks[PluginHook.RENDER_NODE];

      const paragraphNode = {
        type: ASTNodeType.PARAGRAPH,
        content: 'This is a paragraph.'
      };

      const result = await hook(paragraphNode, {});

      expect(result).toBeUndefined();
    });
  });

  describe('wrapWithLineNumbers', () => {
    it('should wrap HTML with line numbers', () => {
      syntaxHighlighter['options'].showLineNumbers = true;

      const html = 'line 1\nline 2\nline 3';
      const result = syntaxHighlighter['wrapWithLineNumbers'](html, 'text');

      expect(result).toContain('<div class="code-container">');
      expect(result).toContain('<div class="line-numbers">');
      expect(result).toContain('<span class="line-number">1</span>');
      expect(result).toContain('<span class="line-number">2</span>');
      expect(result).toContain('<span class="line-number">3</span>');
      expect(result).toContain('<div class="code-content">');
      expect(result).toContain('<div class="code-line">line 1</div>');
      expect(result).toContain('<div class="code-line">line 2</div>');
      expect(result).toContain('<div class="code-line">line 3</div>');
    });

    it('should return the original HTML if showLineNumbers is false', () => {
      syntaxHighlighter['options'].showLineNumbers = false;

      const html = 'line 1\nline 2\nline 3';
      const result = syntaxHighlighter['wrapWithLineNumbers'](html, 'text');

      expect(result).toBe(html);
    });
  });

  describe('mockHighlight', () => {
    it('should highlight code with simple syntax highlighting', () => {
      const code = 'const x = 10; // comment';
      const result = syntaxHighlighter['mockHighlight'](code, 'javascript');

      expect(result).toContain('<span class="hljs-keyword">const</span>');
      expect(result).toContain('<span class="hljs-comment">// comment</span>');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const text = '<div>Hello & "World" \'!</div>';
      const result = syntaxHighlighter['escapeHtml'](text);

      expect(result).toBe('&lt;div&gt;Hello &amp; &quot;World&quot; &#39;!&lt;/div&gt;');
    });
  });
});
