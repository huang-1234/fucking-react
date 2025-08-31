import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExtensionsModule } from '../index';
import SyntaxHighlighter from '../SyntaxHighlighter';
import MathRenderer from '../MathRenderer';
import DiagramRenderer from '../DiagramRenderer';

// Mock the dependencies
vi.mock('../SyntaxHighlighter');
vi.mock('../MathRenderer');
vi.mock('../DiagramRenderer');

describe('ExtensionsModule', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Mock the createPlugin method for each renderer
    (SyntaxHighlighter as unknown as vi.Mock).mockImplementation(() => ({
      createPlugin: () => ({ name: 'syntaxHighlighter' })
    }));

    (MathRenderer as unknown as jest.Mock).mockImplementation(() => ({
      createPlugin: () => ({ name: 'mathRenderer' })
    }));

    (DiagramRenderer as unknown as jest.Mock).mockImplementation(() => ({
      createPlugin: () => ({ name: 'diagramRenderer' })
    }));
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const extensionsModule = new ExtensionsModule();

      expect(extensionsModule).toBeDefined();
      expect(SyntaxHighlighter).toHaveBeenCalled();
      expect(MathRenderer).toHaveBeenCalled();
      expect(DiagramRenderer).toHaveBeenCalled();
    });

    it('should initialize with custom options', () => {
      const options = {
        syntaxHighlighter: {
          theme: 'dark',
          showLineNumbers: false,
          enabled: true
        },
        mathRenderer: {
          engine: 'mathjax' as const,
          enabled: true
        },
        diagramRenderer: {
          theme: 'dark',
          enabled: false
        }
      };

      const extensionsModule = new ExtensionsModule(options);

      expect(SyntaxHighlighter).toHaveBeenCalledWith(options.syntaxHighlighter);
      expect(MathRenderer).toHaveBeenCalledWith(options.mathRenderer);
      expect(DiagramRenderer).not.toHaveBeenCalled(); // Should not be initialized if disabled
    });

    it('should not initialize disabled extensions', () => {
      const options = {
        syntaxHighlighter: { enabled: false },
        mathRenderer: { enabled: false },
        diagramRenderer: { enabled: false }
      };

      const extensionsModule = new ExtensionsModule(options);

      expect(SyntaxHighlighter).not.toHaveBeenCalled();
      expect(MathRenderer).not.toHaveBeenCalled();
      expect(DiagramRenderer).not.toHaveBeenCalled();
    });
  });

  describe('getPlugins', () => {
    it('should return plugins from all enabled extensions', () => {
      const extensionsModule = new ExtensionsModule();
      const plugins = extensionsModule.getPlugins();

      expect(plugins).toHaveLength(3);
      expect(plugins[0]).toEqual({ name: 'syntaxHighlighter' });
      expect(plugins[1]).toEqual({ name: 'mathRenderer' });
      expect(plugins[2]).toEqual({ name: 'diagramRenderer' });
    });

    it('should return only plugins from enabled extensions', () => {
      const options = {
        syntaxHighlighter: { enabled: true },
        mathRenderer: { enabled: false },
        diagramRenderer: { enabled: true }
      };

      const extensionsModule = new ExtensionsModule(options);
      const plugins = extensionsModule.getPlugins();

      expect(plugins).toHaveLength(2);
      expect(plugins[0]).toEqual({ name: 'syntaxHighlighter' });
      expect(plugins[1]).toEqual({ name: 'diagramRenderer' });
    });

    it('should return an empty array if no extensions are enabled', () => {
      const options = {
        syntaxHighlighter: { enabled: false },
        mathRenderer: { enabled: false },
        diagramRenderer: { enabled: false }
      };

      const extensionsModule = new ExtensionsModule(options);
      const plugins = extensionsModule.getPlugins();

      expect(plugins).toHaveLength(0);
    });
  });

  describe('getSyntaxHighlighter', () => {
    it('should return the syntax highlighter instance if enabled', () => {
      const extensionsModule = new ExtensionsModule();
      const syntaxHighlighter = extensionsModule.getSyntaxHighlighter();

      expect(syntaxHighlighter).toBeDefined();
    });

    it('should return null if the syntax highlighter is disabled', () => {
      const options = {
        syntaxHighlighter: { enabled: false }
      };

      const extensionsModule = new ExtensionsModule(options);
      const syntaxHighlighter = extensionsModule.getSyntaxHighlighter();

      expect(syntaxHighlighter).toBeNull();
    });
  });

  describe('getMathRenderer', () => {
    it('should return the math renderer instance if enabled', () => {
      const extensionsModule = new ExtensionsModule();
      const mathRenderer = extensionsModule.getMathRenderer();

      expect(mathRenderer).toBeDefined();
    });

    it('should return null if the math renderer is disabled', () => {
      const options = {
        mathRenderer: { enabled: false }
      };

      const extensionsModule = new ExtensionsModule(options);
      const mathRenderer = extensionsModule.getMathRenderer();

      expect(mathRenderer).toBeNull();
    });
  });

  describe('getDiagramRenderer', () => {
    it('should return the diagram renderer instance if enabled', () => {
      const extensionsModule = new ExtensionsModule();
      const diagramRenderer = extensionsModule.getDiagramRenderer();

      expect(diagramRenderer).toBeDefined();
    });

    it('should return null if the diagram renderer is disabled', () => {
      const options = {
        diagramRenderer: { enabled: false }
      };

      const extensionsModule = new ExtensionsModule(options);
      const diagramRenderer = extensionsModule.getDiagramRenderer();

      expect(diagramRenderer).toBeNull();
    });
  });

  describe('updateOptions', () => {
    it('should update options and reinitialize extensions', () => {
      const extensionsModule = new ExtensionsModule();

      // Reset mock calls
      vi.resetAllMocks();

      const newOptions = {
        syntaxHighlighter: {
          theme: 'dark',
          showLineNumbers: false
        },
        mathRenderer: {
          engine: 'mathjax' as const
        },
        diagramRenderer: {
          theme: 'dark',
          enabled: false
        }
      };

      extensionsModule.updateOptions(newOptions);

      expect(SyntaxHighlighter).toHaveBeenCalledWith(newOptions.syntaxHighlighter);
      expect(MathRenderer).toHaveBeenCalledWith(newOptions.mathRenderer);
      expect(DiagramRenderer).not.toHaveBeenCalled(); // Should not be initialized if disabled
    });

    it('should disable extensions if enabled is set to false', () => {
      const extensionsModule = new ExtensionsModule();

      // Reset mock calls
      vi.resetAllMocks();

      const newOptions = {
        syntaxHighlighter: { enabled: false },
        mathRenderer: { enabled: false }
      };

      extensionsModule.updateOptions(newOptions);

      expect(extensionsModule.getSyntaxHighlighter()).toBeNull();
      expect(extensionsModule.getMathRenderer()).toBeNull();
    });

    it('should enable extensions if enabled is set to true', () => {
      const options = {
        syntaxHighlighter: { enabled: false },
        mathRenderer: { enabled: false }
      };

      const extensionsModule = new ExtensionsModule(options);

      // Reset mock calls
      vi.resetAllMocks();

      const newOptions = {
        syntaxHighlighter: { enabled: true },
        mathRenderer: { enabled: true }
      };

      extensionsModule.updateOptions(newOptions);

      expect(SyntaxHighlighter).toHaveBeenCalled();
      expect(MathRenderer).toHaveBeenCalled();
    });
  });

  describe('generateStyles', () => {
    it('should generate CSS styles for extensions', () => {
      const extensionsModule = new ExtensionsModule();
      const styles = extensionsModule.generateStyles();

      expect(typeof styles).toBe('string');
      expect(styles).toContain('.syntax-highlighter');
      expect(styles).toContain('.math');
      expect(styles).toContain('.diagram');
    });
  });
});
