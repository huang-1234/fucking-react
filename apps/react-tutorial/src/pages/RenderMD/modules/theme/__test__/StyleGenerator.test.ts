import { describe, it, expect } from 'vitest';
import { StyleGenerator } from '../StyleGenerator';
import { ThemeName, type ThemeVariables } from '../ThemeDefinitions';

describe('StyleGenerator', () => {
  describe('initialization', () => {
    it('should initialize with default options', () => {
      const styleGenerator = new StyleGenerator();

      expect(styleGenerator).toBeDefined();
      expect(styleGenerator['options'].minify).toBeFalsy();
      expect(styleGenerator['options'].prefix).toBe('md');
      expect(styleGenerator['options'].includeAnimation).toBeTruthy();
      expect(styleGenerator['options'].includeResponsive).toBeTruthy();
    });

    it('should initialize with custom options', () => {
      const options = {
        minify: true,
        prefix: 'custom',
        includeAnimation: false,
        includeResponsive: false,
        customSelectors: {
          '.custom-heading': 'font-weight: bold;'
        }
      };

      const styleGenerator = new StyleGenerator(options);

      expect(styleGenerator['options'].minify).toBe(true);
      expect(styleGenerator['options'].prefix).toBe('custom');
      expect(styleGenerator['options'].includeAnimation).toBe(false);
      expect(styleGenerator['options'].includeResponsive).toBe(false);
      expect(styleGenerator['options'].customSelectors).toEqual({
        '.custom-heading': 'font-weight: bold;'
      });
    });
  });

  describe('generateStylesheet', () => {
    it('should generate a stylesheet for a theme', () => {
      const styleGenerator = new StyleGenerator();

      const theme = {
        name: ThemeName.LIGHT,
        variables: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          linkColor: '#0000ff',
          headingColor: '#000000',
          borderColor: '#cccccc',
          blockquoteColor: '#666666',
          codeBackgroundColor: '#f5f5f5',
          codeTextColor: '#000000',
          tableHeaderBackgroundColor: '#f5f5f5',
          tableBorderColor: '#cccccc',
          fontFamily: 'sans-serif',
          codeFontFamily: 'monospace',
          fontSize: '16px',
          lineHeight: '1.5',
          spacing: '16px',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
        }
      };

      const css = styleGenerator.generateStylesheet(theme);

      expect(typeof css).toBe('string');
      expect(css).toContain(':root');
      expect(css).toContain('--md-bg-color: #ffffff');
      expect(css).toContain('--md-text-color: #000000');
      expect(css).toContain('.md-heading');
      expect(css).toContain('.md-paragraph');
    });

    it('should include animations if enabled', () => {
      const styleGenerator = new StyleGenerator({
        prefix: 'md',
        includeAnimation: true
      });

      const theme = {
        name: ThemeName.LIGHT,
        variables: {} as any
      };

      const css = styleGenerator.generateStylesheet(theme);

      expect(css).toContain('@keyframes');
    });

    it('should not include animations if disabled', () => {
      const styleGenerator = new StyleGenerator({
        prefix: 'md',
        includeAnimation: false
      });

      const theme = {
        name: ThemeName.LIGHT,
        variables: {} as any
      };

      const css = styleGenerator.generateStylesheet(theme);

      expect(css).not.toContain('@keyframes');
    });

    it('should include responsive styles if enabled', () => {
      const styleGenerator = new StyleGenerator({
        prefix: 'md',
        includeResponsive: true
      });

      const theme = {
        name: ThemeName.LIGHT,
        variables: {} as any
      };

      const css = styleGenerator.generateStylesheet(theme);

      expect(css).toContain('@media');
    });

    it('should not include responsive styles if disabled', () => {
      const styleGenerator = new StyleGenerator({
        prefix: 'md',
        includeResponsive: false
      });

      const theme = {
        name: ThemeName.LIGHT,
        variables: {} as any
      };

      const css = styleGenerator.generateStylesheet(theme);

      expect(css).not.toContain('@media');
    });

    it('should include custom CSS if provided in the theme', () => {
      const styleGenerator = new StyleGenerator();

      const theme = {
        name: ThemeName.LIGHT,
        variables: {} as any,
        customCSS: '.custom-class { color: red; }'
      };

      const css = styleGenerator.generateStylesheet(theme);

      expect(css).toContain('.custom-class { color: red; }');
    });

    it('should minify CSS if minify option is enabled', () => {
      const styleGenerator = new StyleGenerator({
        prefix: 'md',
        minify: true
      });

      const theme = {
        name: ThemeName.LIGHT,
        variables: {} as any
      };

      const css = styleGenerator.generateStylesheet(theme);

      // Minified CSS should not contain unnecessary whitespace
      expect(css).not.toContain('  ');
      expect(css).not.toContain('\n');
    });
  });

  describe('generateCssVariables', () => {
    it('should generate CSS variables from theme variables', () => {
      const styleGenerator = new StyleGenerator();

      const variables = {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        linkColor: '#0000ff'
      };

      const css = styleGenerator.generateCssVariables(variables as ThemeVariables);

      expect(css).toContain('--md-bg-color: #ffffff;');
      expect(css).toContain('--md-text-color: #000000;');
      expect(css).toContain('--md-link-color: #0000ff;');
    });
  });

  describe('generateBaseStyles', () => {
    it('should generate base styles with the given prefix', () => {
      const styleGenerator = new StyleGenerator();

      const variables = {
        backgroundColor: '#ffffff',
        textColor: '#000000',
        fontFamily: 'sans-serif',
        fontSize: '16px',
        lineHeight: '1.5'
      } as ThemeVariables;

      const css = styleGenerator.generateBaseStyles('custom', variables);

      expect(css).toContain('.custom-container');
      expect(css).toContain('font-family: sans-serif');
      expect(css).toContain('font-size: 16px');
      expect(css).toContain('line-height: 1.5');
    });
  });

  describe('generateElementStyles', () => {
    it('should generate styles for all markdown elements', () => {
      const styleGenerator = new StyleGenerator();

      const variables = {
        headingColor: '#000000',
        borderColor: '#cccccc',
        blockquoteColor: '#666666',
        codeBackgroundColor: '#f5f5f5',
        spacing: '16px',
        borderRadius: '4px'
      } as ThemeVariables;

      const css = styleGenerator.generateElementStyles('custom', variables);

      expect(css).toContain('.custom-heading');
      expect(css).toContain('.custom-paragraph');
      expect(css).toContain('.custom-blockquote');
      expect(css).toContain('.custom-code-block');
      expect(css).toContain('.custom-list');
      expect(css).toContain('.custom-table');
    });
  });

  describe('generateCustomSelectorStyles', () => {
    it('should generate styles for custom selectors', () => {
      const styleGenerator = new StyleGenerator();

      const customSelectors = {
        '.custom-heading': 'font-weight: bold;',
        '.custom-paragraph': 'margin-bottom: 20px;'
      };

      const variables = {} as ThemeVariables;

      const css = styleGenerator.generateCustomSelectorStyles(customSelectors, variables);

      expect(css).toContain('.custom-heading');
      expect(css).toContain('font-weight: bold;');
      expect(css).toContain('.custom-paragraph');
      expect(css).toContain('margin-bottom: 20px;');
    });
  });

  describe('generateAnimationStyles', () => {
    it('should generate animation styles with the given prefix', () => {
      const styleGenerator = new StyleGenerator();

      const css = styleGenerator.generateAnimationStyles('custom');

      expect(css).toContain('@keyframes custom-fade-in');
      expect(css).toContain('@keyframes custom-fade-out');
      expect(css).toContain('.custom-animate-fade-in');
      expect(css).toContain('.custom-animate-fade-out');
    });
  });

  describe('generateResponsiveStyles', () => {
    it('should generate responsive styles with the given prefix', () => {
      const styleGenerator = new StyleGenerator();

      const variables = {
        fontSize: '16px',
        spacing: '16px'
      } as ThemeVariables;

      const css = styleGenerator.generateResponsiveStyles('custom', variables);

      expect(css).toContain('@media (max-width: 768px)');
      expect(css).toContain('@media (max-width: 480px)');
    });
  });

  describe('minifyCSS', () => {
    it('should minify CSS', () => {
      const styleGenerator = new StyleGenerator();

      const css = `
        .class {
          color: red;
          margin: 10px;
        }

        .another-class {
          padding: 20px;
        }
      `;

      const minified = styleGenerator.minifyCSS(css);

      expect(minified).not.toContain('\n');
      expect(minified).not.toContain('  ');
      expect(minified).toContain('.class{color:red;margin:10px}');
      expect(minified).toContain('.another-class{padding:20px}');
    });
  });
});
