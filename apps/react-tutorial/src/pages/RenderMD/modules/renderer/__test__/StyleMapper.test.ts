import { describe, it, expect } from 'vitest';
import StyleMapper from '../StyleMapper';
import { ASTNodeType } from '../../../common/md';

describe('StyleMapper', () => {
  describe('getClassName', () => {
    it('should return the correct class name for node types', () => {
      const styleMapper = new StyleMapper();

      expect(styleMapper.getClassName(ASTNodeType.HEADING)).toBe('md-heading');
      expect(styleMapper.getClassName(ASTNodeType.PARAGRAPH)).toBe('md-paragraph');
      expect(styleMapper.getClassName(ASTNodeType.CODE_BLOCK)).toBe('md-code-block');
      expect(styleMapper.getClassName(ASTNodeType.BLOCKQUOTE)).toBe('md-blockquote');
    });

    it('should return a default class for unknown node types', () => {
      const styleMapper = new StyleMapper();

      // Using a non-existent node type
      expect(styleMapper.getClassName('unknown' as ASTNodeType)).toBe('md-node');
    });
  });

  describe('getStyle', () => {
    it('should return the correct style object for node types', () => {
      const styleMapper = new StyleMapper();

      const headingStyle = styleMapper.getStyle(ASTNodeType.HEADING);
      expect(headingStyle).toHaveProperty('fontWeight', 'bold');

      const paragraphStyle = styleMapper.getStyle(ASTNodeType.PARAGRAPH);
      expect(paragraphStyle).toHaveProperty('marginBottom', '16px');

      const codeBlockStyle = styleMapper.getStyle(ASTNodeType.CODE_BLOCK);
      expect(codeBlockStyle).toHaveProperty('fontFamily', 'monospace');
    });

    it('should return an empty object for unknown node types', () => {
      const styleMapper = new StyleMapper();

      // Using a non-existent node type
      expect(styleMapper.getStyle('unknown' as ASTNodeType)).toEqual({});
    });
  });

  describe('setTheme', () => {
    it('should update the theme', () => {
      const styleMapper = new StyleMapper('light');
      expect(styleMapper['theme']).toBe('light');

      styleMapper.setTheme('dark');
      expect(styleMapper['theme']).toBe('dark');
    });

    it('should update the style map based on the theme', () => {
      const styleMapper = new StyleMapper('light');
      const lightCodeBlockStyle = styleMapper.getStyle(ASTNodeType.CODE_BLOCK);

      styleMapper.setTheme('dark');
      const darkCodeBlockStyle = styleMapper.getStyle(ASTNodeType.CODE_BLOCK);

      // The styles should be different between themes
      expect(lightCodeBlockStyle).not.toEqual(darkCodeBlockStyle);
    });
  });

  describe('setStyle', () => {
    it('should set a new style for a node type', () => {
      const styleMapper = new StyleMapper();

      const customStyle = { color: 'red', fontSize: '20px' };
      styleMapper.setStyle(ASTNodeType.HEADING, customStyle);

      const headingStyle = styleMapper.getStyle(ASTNodeType.HEADING);
      expect(headingStyle).toEqual(customStyle);
    });

    it('should accept a string style', () => {
      const styleMapper = new StyleMapper();

      const customStyle = 'color: blue; font-size: 24px;';
      styleMapper.setStyle(ASTNodeType.PARAGRAPH, customStyle);

      const paragraphStyle = styleMapper.getStyle(ASTNodeType.PARAGRAPH);
      // When a string is provided, it should be converted to an object
      expect(paragraphStyle).toHaveProperty('color', 'blue');
      expect(paragraphStyle).toHaveProperty('fontSize', '24px');
    });
  });

  describe('generateCssVariables', () => {
    it('should generate CSS variables based on the current theme', () => {
      const styleMapper = new StyleMapper('light');
      const cssVars = styleMapper.generateCssVariables();

      expect(cssVars).toContain('--md-bg-color:');
      expect(cssVars).toContain('--md-text-color:');
      expect(cssVars).toContain('--md-link-color:');
    });

    it('should generate different CSS variables for different themes', () => {
      const lightStyleMapper = new StyleMapper('light');
      const lightCssVars = lightStyleMapper.generateCssVariables();

      const darkStyleMapper = new StyleMapper('dark');
      const darkCssVars = darkStyleMapper.generateCssVariables();

      expect(lightCssVars).not.toEqual(darkCssVars);
    });
  });

  describe('generateStylesheet', () => {
    it('should generate a CSS stylesheet with classes for each node type', () => {
      const styleMapper = new StyleMapper('light');
      const stylesheet = styleMapper.generateStylesheet();

      expect(stylesheet).toContain('.md-heading');
      expect(stylesheet).toContain('.md-paragraph');
      expect(stylesheet).toContain('.md-code-block');
      expect(stylesheet).toContain('.md-blockquote');
    });

    it('should include theme-specific styles', () => {
      const lightStyleMapper = new StyleMapper('light');
      const lightStylesheet = lightStyleMapper.generateStylesheet();

      const darkStyleMapper = new StyleMapper('dark');
      const darkStylesheet = darkStyleMapper.generateStylesheet();

      expect(lightStylesheet).not.toEqual(darkStylesheet);
    });
  });
});
