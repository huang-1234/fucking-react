import { describe, it, expect, vi, beforeEach } from 'vitest';
import MathRenderer from '../MathRenderer';
import { PluginHook, PluginType } from '../../plugin';
import { ASTNodeType } from '../../../common/md';
import { InnerPluginId } from '../../plugin/common';

describe('MathRenderer', () => {
  let mathRenderer: MathRenderer;

  beforeEach(() => {
    mathRenderer = new MathRenderer();
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      expect(mathRenderer).toBeDefined();
      expect(mathRenderer['options'].engine).toBe('katex');
      expect(mathRenderer['options'].delimiters.inline).toEqual(['$', '$']);
      expect(mathRenderer['options'].delimiters.block).toEqual(['$$', '$$']);
      expect(mathRenderer['options'].throwOnError).toBe(false);
      expect(mathRenderer['options'].output).toBe('html');
      expect(mathRenderer['options'].displayMode).toBe(true);
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        engine: 'mathjax' as const,
        delimiters: {
          inline: ['\\(', '\\)'],
          block: ['\\[', '\\]']
        },
        throwOnError: true,
        output: 'mathml' as const,
        displayMode: false
      };

      mathRenderer = new MathRenderer(customOptions);

      expect(mathRenderer['options'].engine).toBe('mathjax');
      expect(mathRenderer['options'].delimiters.inline).toEqual(['\\(', '\\)']);
      expect(mathRenderer['options'].delimiters.block).toEqual(['\\[', '\\]']);
      expect(mathRenderer['options'].throwOnError).toBe(true);
      expect(mathRenderer['options'].output).toBe('mathml');
      expect(mathRenderer['options'].displayMode).toBe(false);
    });
  });

  describe('initialize', () => {
    it('should initialize the renderer', async () => {
      await mathRenderer.initialize();

      expect(mathRenderer['renderer']).toBeDefined();
      expect(typeof mathRenderer['renderer'].render).toBe('function');
    });
  });

  describe('render', () => {
    it('should render a formula', async () => {
      const formula = 'E = mc^2';
      const result = await mathRenderer.render(formula);

      expect(result).toContain(formula);
      expect(result).toContain('math-display');
    });

    it('should handle display mode', async () => {
      const formula = 'E = mc^2';

      const inlineResult = await mathRenderer.render(formula, false);
      expect(inlineResult).toContain('math-inline');

      const displayResult = await mathRenderer.render(formula, true);
      expect(displayResult).toContain('math-display');
    });

    it('should handle errors gracefully', async () => {
      const mockRender = vi.fn().mockImplementation(() => {
        throw new Error('Rendering error');
      });

      mathRenderer['renderer'] = {
        render: mockRender
      };

      const result = await mathRenderer.render('\\frac{1}{0}');

      expect(result).toContain('math-error');
      expect(result).toContain('\\frac{1}{0}');
    });

    it('should throw errors if throwOnError is true', async () => {
      mathRenderer['options'].throwOnError = true;

      const mockRender = vi.fn().mockImplementation(() => {
        throw new Error('Rendering error');
      });

      mathRenderer['renderer'] = {
        render: mockRender
      };

      await expect(mathRenderer.render('\\frac{1}{0}')).rejects.toThrow('Rendering error');
    });
  });

  describe('createPlugin', () => {
    it('should create a plugin with the correct structure', () => {
      const plugin = mathRenderer.createPlugin();

      expect(plugin.id).toBe(InnerPluginId.mathRenderer);
      expect(plugin.name).toBe(InnerPluginId.mathRenderer);
      expect(plugin.type).toBe(PluginType.SYNTAX);
      expect(plugin.priority).toBe(8);
      expect(plugin.hooks).toBeDefined();
      expect(typeof plugin.hooks[PluginHook.BEFORE_PARSE]).toBe('function');
      expect(typeof plugin.hooks[PluginHook.AFTER_PARSE]).toBe('function');
      expect(typeof plugin.hooks[PluginHook.RENDER_NODE]).toBe('function');
    });

    describe('BEFORE_PARSE hook', () => {
      it('should convert block math to special tags', () => {
        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.BEFORE_PARSE];

        const text = 'Before\n$$E = mc^2$$\nAfter';
        const result = hook(text, {});

        expect(result).toContain('<math-block>E = mc^2</math-block>');
      });

      it('should convert inline math to special tags', () => {
        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.BEFORE_PARSE];

        const text = 'Before $E = mc^2$ after';
        const result = hook(text, {});

        expect(result).toContain('<math-inline>E = mc^2</math-inline>');
      });

      it('should handle custom delimiters', () => {
        mathRenderer['options'].delimiters = {
          inline: ['\\(', '\\)'],
          block: ['\\[', '\\]']
        };

        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.BEFORE_PARSE];

        const text = 'Before\\(E = mc^2\\)after\n\\[F = ma\\]';
        const result = hook(text, {});

        expect(result).toContain('<math-inline>E = mc^2</math-inline>');
        expect(result).toContain('<math-block>F = ma</math-block>');
      });
    });

    describe('AFTER_PARSE hook', () => {
      it('should process block math nodes', () => {
        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.AFTER_PARSE];

        const ast = {
          type: ASTNodeType.DOCUMENT,
          children: [
            {
              type: ASTNodeType.PARAGRAPH,
              content: '<math-block>E = mc^2</math-block>'
            }
          ]
        };

        const result = hook(ast, {});

        expect(result.children[0].type).toBe(ASTNodeType.CUSTOM_BLOCK);
        expect(result.children[0].attrs.type).toBe('math-block');
        expect(result.children[0].content).toBe('E = mc^2');
      });

      it('should process inline math nodes', () => {
        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.AFTER_PARSE];

        const ast = {
          type: ASTNodeType.DOCUMENT,
          children: [
            {
              type: ASTNodeType.PARAGRAPH,
              content: 'Before <math-inline>E = mc^2</math-inline> after'
            }
          ]
        };

        const result = hook(ast, {});

        expect(result.children[0].children).toBeDefined();
        expect(result.children[0].children.length).toBe(3);
        expect(result.children[0].children[0].type).toBe(ASTNodeType.TEXT);
        expect(result.children[0].children[0].content).toBe('Before ');
        expect(result.children[0].children[1].type).toBe(ASTNodeType.CUSTOM_INLINE);
        expect(result.children[0].children[1].attrs.type).toBe('math-inline');
        expect(result.children[0].children[1].content).toBe('E = mc^2');
        expect(result.children[0].children[2].type).toBe(ASTNodeType.TEXT);
        expect(result.children[0].children[2].content).toBe(' after');
      });
    });

    describe('RENDER_NODE hook', () => {
      it('should render block math nodes', async () => {
        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.RENDER_NODE];

        // Mock the render method
        mathRenderer.render = vi.fn().mockResolvedValue('rendered formula');

        const node = {
          type: ASTNodeType.CUSTOM_BLOCK,
          attrs: { type: 'math-block' },
          content: 'E = mc^2'
        };

        const result = await hook(node, {});

        expect(mathRenderer.render).toHaveBeenCalledWith('E = mc^2', true);
        expect(result).toBe('<div class="math math-block">rendered formula</div>');
      });

      it('should render inline math nodes', async () => {
        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.RENDER_NODE];

        // Mock the render method
        mathRenderer.render = vi.fn().mockResolvedValue('rendered formula');

        const node = {
          type: ASTNodeType.CUSTOM_BLOCK,
          attrs: { type: 'math-inline' },
          content: 'E = mc^2'
        };

        const result = await hook(node, {});

        expect(mathRenderer.render).toHaveBeenCalledWith('E = mc^2', false);
        expect(result).toBe('<span class="math math-inline">rendered formula</span>');
      });

      it('should return undefined for other node types', async () => {
        const plugin = mathRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.RENDER_NODE];

        const node = {
          type: ASTNodeType.PARAGRAPH,
          content: 'This is a paragraph.'
        };

        const result = await hook(node, {});

        expect(result).toBeUndefined();
      });
    });
  });

  describe('mockRender', () => {
    it('should render a formula with the appropriate class', () => {
      const formula = 'E = mc^2';

      const inlineResult = mathRenderer['mockRender'](formula, false);
      expect(inlineResult).toContain('math-inline');
      expect(inlineResult).toContain(mathRenderer['escapeHtml'](formula));

      const displayResult = mathRenderer['mockRender'](formula, true);
      expect(displayResult).toContain('math-display');
      expect(displayResult).toContain(mathRenderer['escapeHtml'](formula));
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const text = '<div>Hello & "World" \'!</div>';
      const result = mathRenderer['escapeHtml'](text);

      expect(result).toBe('&lt;div&gt;Hello &amp; &quot;World&quot; &#39;!&lt;/div&gt;');
    });
  });

  describe('escapeRegExp', () => {
    it('should escape regular expression special characters', () => {
      const text = '.*+?^${}()|[]\\';
      const result = mathRenderer['escapeRegExp'](text);

      expect(result).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });
  });
});
