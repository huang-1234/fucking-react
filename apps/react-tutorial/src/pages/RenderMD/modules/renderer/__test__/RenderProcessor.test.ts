import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RenderProcessor, OutputFormat, type RenderOptions } from '../index';
import HtmlRenderer from '../HtmlRenderer';
import CustomRenderer from '../CustomRenderer';
import StyleMapper from '../StyleMapper';
import { ASTNodeType } from '../../../common/md';

// Mock the dependencies
vi.mock('../HtmlRenderer');
vi.mock('../CustomRenderer');
vi.mock('../StyleMapper');

describe('RenderProcessor', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default options', () => {
      const processor = new RenderProcessor();

      expect(processor).toBeDefined();
      expect(HtmlRenderer).toHaveBeenCalledTimes(1);
      expect(CustomRenderer).toHaveBeenCalledTimes(1);
      expect(StyleMapper).toHaveBeenCalledTimes(1);
    });

    it('should initialize with custom options', () => {
      const options = {
        format: OutputFormat.HTML,
        theme: 'dark',
        sanitize: true,
        linkTarget: '_self',
        components: { h1: 'CustomHeading' }
      };

      const processor = new RenderProcessor(options as RenderOptions);
      expect(processor).toBeDefined();
      expect(HtmlRenderer).toHaveBeenCalledTimes(1);
      expect(CustomRenderer).toHaveBeenCalledTimes(1);
      expect(StyleMapper).toHaveBeenCalledTimes(1);

      expect(HtmlRenderer).toHaveBeenCalledWith({ sanitize: true, linkTarget: '_self' });
      expect(CustomRenderer).toHaveBeenCalledWith({
        sanitize: true,
        linkTarget: '_self',
        components: { h1: 'CustomHeading' }
      });
      expect(StyleMapper).toHaveBeenCalledWith('dark');
    });
  });

  describe('render', () => {
    it('should use HtmlRenderer for HTML output format', () => {
      // Setup mock implementation
      const mockHtml = '<div>Test</div>';
      const mockRender = vi.fn().mockReturnValue(mockHtml);
      (HtmlRenderer as unknown as jest.Mock).mockImplementation(() => ({
        render: mockRender
      }));

      const processor = new RenderProcessor({ format: OutputFormat.HTML });
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [{
          type: ASTNodeType.PARAGRAPH,
          content: 'Test'
        }]
      };

      const result = processor.render(ast);

      expect(mockRender).toHaveBeenCalledWith(ast);
      expect(result).toBe(mockHtml);
    });

    it('should use CustomRenderer for REACT output format', () => {
      // Setup mock implementation
      const mockReactElement = { type: 'div', props: { children: 'Test' } };
      const mockRender = vi.fn().mockReturnValue(mockReactElement);
      (CustomRenderer as unknown as jest.Mock).mockImplementation(() => ({
        render: mockRender
      }));

      const processor = new RenderProcessor({ format: OutputFormat.REACT });
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [{
          type: ASTNodeType.PARAGRAPH,
          content: 'Test'
        }]
      };

      const result = processor.render(ast);

      expect(mockRender).toHaveBeenCalledWith(ast);
      expect(result).toBe(mockReactElement);
    });

    it('should extract text for TEXT output format', () => {
      const processor = new RenderProcessor({ format: OutputFormat.TEXT });
      const ast = {
        type: ASTNodeType.DOCUMENT,
        children: [{
          type: ASTNodeType.PARAGRAPH,
          content: 'Test paragraph'
        }, {
          type: ASTNodeType.HEADING,
          content: 'Test heading',
          level: 1
        }]
      };

      const result = processor.render(ast);

      expect(result).toBe('Test paragraph\nTest heading');
    });
  });

  describe('updateOptions', () => {
    it('should update options and reinitialize renderers', () => {
      const processor = new RenderProcessor();

      // Reset mock calls
      vi.resetAllMocks();

      processor.updateOptions({
        format: OutputFormat.HTML,
        theme: 'dark',
        sanitize: true,
        linkTarget: '_self'
      });

      expect(HtmlRenderer).toHaveBeenCalledWith({ sanitize: true, linkTarget: '_self' });
      expect(CustomRenderer).toHaveBeenCalledWith({ sanitize: true, linkTarget: '_self' });
      expect(StyleMapper).toHaveBeenCalledWith('dark');
    });
  });

  describe('getStyleMapper', () => {
    it('should return the style mapper instance', () => {
      const mockStyleMapper = {};
      (StyleMapper as unknown as jest.Mock).mockImplementation(() => mockStyleMapper);

      const processor = new RenderProcessor();
      const result = processor.getStyleMapper();

      expect(result).toBe(mockStyleMapper);
    });
  });

  describe('getCssVariables', () => {
    it('should call generateCssVariables on the style mapper', () => {
      const mockCssVars = '--md-bg-color: white;';
      const mockGenerateCssVariables = vi.fn().mockReturnValue(mockCssVars);

      (StyleMapper as unknown as jest.Mock).mockImplementation(() => ({
        generateCssVariables: mockGenerateCssVariables
      }));

      const processor = new RenderProcessor();
      const result = processor.getCssVariables();

      expect(mockGenerateCssVariables).toHaveBeenCalled();
      expect(result).toBe(mockCssVars);
    });
  });

  describe('getStylesheet', () => {
    it('should call generateStylesheet on the style mapper', () => {
      const mockStylesheet = '.md-heading { font-weight: bold; }';
      const mockGenerateStylesheet = vi.fn().mockReturnValue(mockStylesheet);

      (StyleMapper as unknown as jest.Mock).mockImplementation(() => ({
        generateStylesheet: mockGenerateStylesheet
      }));

      const processor = new RenderProcessor();
      const result = processor.getStylesheet();

      expect(mockGenerateStylesheet).toHaveBeenCalled();
      expect(result).toBe(mockStylesheet);
    });
  });
});
