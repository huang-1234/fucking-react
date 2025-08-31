import { describe, it, expect, vi, beforeEach } from 'vitest';
import DiagramRenderer from '../DiagramRenderer';
import { PluginHook, PluginType } from '../../plugin';
import { ASTNodeType } from '../../../common/md';
import { InnerPluginId } from '../../plugin/common';

describe('DiagramRenderer', () => {
  let diagramRenderer: DiagramRenderer;

  beforeEach(() => {
    diagramRenderer = new DiagramRenderer();
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      expect(diagramRenderer).toBeDefined();
      expect(diagramRenderer['options'].theme).toBe('default');
      expect(diagramRenderer['options'].maxWidth).toBe('100%');
      expect(diagramRenderer['options'].responsiveWidth).toBe(true);
      expect(diagramRenderer['options'].supportedTypes).toEqual(['mermaid', 'plantuml', 'vega', 'echarts']);
      expect(diagramRenderer['options'].defaultType).toBe('mermaid');
    });

    it('should initialize with custom options', () => {
      const customOptions = {
        theme: 'dark',
        maxWidth: '80%',
        responsiveWidth: false,
        supportedTypes: ['mermaid', 'plantuml'],
        defaultType: 'plantuml'
      };

      diagramRenderer = new DiagramRenderer(customOptions);

      expect(diagramRenderer['options'].theme).toBe('dark');
      expect(diagramRenderer['options'].maxWidth).toBe('80%');
      expect(diagramRenderer['options'].responsiveWidth).toBe(false);
      expect(diagramRenderer['options'].supportedTypes).toEqual(['mermaid', 'plantuml']);
      expect(diagramRenderer['options'].defaultType).toBe('plantuml');
    });
  });

  describe('initialize', () => {
    it('should initialize renderers for supported types', async () => {
      await diagramRenderer.initialize();

      expect(diagramRenderer['renderers'].size).toBe(2);
      expect(diagramRenderer['renderers'].has('mermaid')).toBe(true);
      expect(diagramRenderer['renderers'].has('plantuml')).toBe(true);
      expect(typeof diagramRenderer['renderers'].get('mermaid').render).toBe('function');
      expect(typeof diagramRenderer['renderers'].get('plantuml').render).toBe('function');
    });
  });

  describe('render', () => {
    it('should render a diagram of the specified type', async () => {
      await diagramRenderer.initialize();

      const code = 'graph TD; A-->B;';
      const result = await diagramRenderer.render(code, 'mermaid');

      expect(result).toContain('mermaid-diagram');
      expect(result).toContain(diagramRenderer['escapeHtml'](code));
    });

    it('should use the default type if not specified', async () => {
      await diagramRenderer.initialize();

      // Spy on the mockMermaidRender method
      const mockRenderSpy = vi.spyOn(diagramRenderer as any, 'mockMermaidRender');

      const code = 'graph TD; A-->B;';
      await diagramRenderer.render(code);

      expect(mockRenderSpy).toHaveBeenCalledWith(code);
    });

    it('should handle unsupported diagram types', async () => {
      await diagramRenderer.initialize();

      const code = 'some code';
      const result = await diagramRenderer.render(code, 'unsupported-type');

      expect(result).toContain('diagram-error');
      expect(result).toContain(diagramRenderer['escapeHtml'](code));
    });

    it('should handle rendering errors', async () => {
      await diagramRenderer.initialize();

      // Mock a renderer that throws an error
      diagramRenderer['renderers'].set('mermaid', {
        render: () => {
          throw new Error('Rendering error');
        }
      });

      const code = 'graph TD; A-->B;';
      const result = await diagramRenderer.render(code, 'mermaid');

      expect(result).toContain('diagram-error');
      expect(result).toContain(diagramRenderer['escapeHtml'](code));
    });
  });

  describe('createPlugin', () => {
    it('should create a plugin with the correct structure', () => {
      const plugin = diagramRenderer.createPlugin();

      expect(plugin.id).toBe(InnerPluginId.diagramRenderer);
      expect(plugin.name).toBe(InnerPluginId.diagramRenderer);
      expect(plugin.type).toBe(PluginType.SYNTAX);
      expect(plugin.priority).toBe(9);
      expect(plugin.hooks).toBeDefined();
      expect(typeof plugin.hooks[PluginHook.RENDER_NODE]).toBe('function');
    });

    describe('RENDER_NODE hook', () => {
      it('should render code blocks with supported languages', async () => {
        const plugin = diagramRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.RENDER_NODE];

        // Mock the render method
        diagramRenderer.render = vi.fn().mockResolvedValue('rendered diagram');

        const node = {
          type: ASTNodeType.CODE_BLOCK,
          content: 'graph TD; A-->B;',
          attrs: { language: 'mermaid' }
        };

        const result = await hook(node, {});

        expect(diagramRenderer.render).toHaveBeenCalledWith('graph TD; A-->B;', 'mermaid');
        expect(result).toBe('<div class="diagram diagram-mermaid" style="max-width:100%">rendered diagram</div>');
      });

      it('should ignore code blocks with unsupported languages', async () => {
        const plugin = diagramRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.RENDER_NODE];

        const node = {
          type: ASTNodeType.CODE_BLOCK,
          content: 'console.log("Hello");',
          attrs: { language: 'javascript' }
        };

        const result = await hook(node, {});

        expect(result).toBeUndefined();
      });

      it('should handle rendering errors', async () => {
        const plugin = diagramRenderer.createPlugin();
        const hook = plugin.hooks[PluginHook.RENDER_NODE];

        // Mock the render method to throw an error
        diagramRenderer.render = vi.fn().mockRejectedValue(new Error('Rendering error'));

        const node = {
          type: ASTNodeType.CODE_BLOCK,
          content: 'graph TD; A-->B;',
          attrs: { language: 'mermaid' }
        };

        const result = await hook(node, {});

        expect(result).toContain('diagram-error');
        expect(result).toContain(diagramRenderer['escapeHtml']('graph TD; A-->B;'));
      });

      it('should return undefined for other node types', async () => {
        const plugin = diagramRenderer.createPlugin();
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

  describe('mockMermaidRender', () => {
    it('should render a Mermaid diagram', () => {
      const code = 'graph TD; A-->B;';
      const result = diagramRenderer['mockMermaidRender'](code);

      expect(result).toContain('mermaid-diagram');
      expect(result).toContain('diagram-container');
      expect(result).toContain('mermaid');
      expect(result).toContain(diagramRenderer['escapeHtml'](code));
    });
  });

  describe('mockPlantUMLRender', () => {
    it('should render a PlantUML diagram', () => {
      const code = '@startuml\nclass A\nclass B\nA --> B\n@enduml';
      const result = diagramRenderer['mockPlantUMLRender'](code);

      expect(result).toContain('plantuml-diagram');
      expect(result).toContain('diagram-container');
      expect(result).toContain('plantuml');
      expect(result).toContain(diagramRenderer['escapeHtml'](code));
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      const text = '<div>Hello & "World" \'!</div>';
      const result = diagramRenderer['escapeHtml'](text);

      expect(result).toBe('&lt;div&gt;Hello &amp; &quot;World&quot; &#39;!&lt;/div&gt;');
    });
  });
});
