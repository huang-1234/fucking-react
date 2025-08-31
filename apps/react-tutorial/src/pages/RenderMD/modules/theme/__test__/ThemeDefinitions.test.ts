import { describe, it, expect, vi } from 'vitest';
import { ThemeName, getDefaultTheme, getThemeByName } from '../ThemeDefinitions';

describe('ThemeDefinitions', () => {
  describe('ThemeName enum', () => {
    it('should have the expected values', () => {
      expect(ThemeName.LIGHT).toBe('light');
      expect(ThemeName.DARK).toBe('dark');
      expect(ThemeName.SEPIA).toBe('sepia');
      expect(ThemeName.CUSTOM).toBe('custom');
    });
  });

  describe('getDefaultTheme', () => {
    it('should return a theme with the expected structure', () => {
      const theme = getDefaultTheme();

      expect(theme).toBeDefined();
      expect(theme.name).toBe(ThemeName.LIGHT);
      expect(theme.variables).toBeDefined();

      // Check that all required variables are present
      expect(theme.variables.backgroundColor).toBeDefined();
      expect(theme.variables.textColor).toBeDefined();
      expect(theme.variables.linkColor).toBeDefined();
      expect(theme.variables.headingColor).toBeDefined();
      expect(theme.variables.borderColor).toBeDefined();
      expect(theme.variables.blockquoteColor).toBeDefined();
      expect(theme.variables.codeBackgroundColor).toBeDefined();
      expect(theme.variables.codeTextColor).toBeDefined();
      expect(theme.variables.tableHeaderBackgroundColor).toBeDefined();
      expect(theme.variables.tableBorderColor).toBeDefined();
      expect(theme.variables.fontFamily).toBeDefined();
      expect(theme.variables.codeFontFamily).toBeDefined();
      expect(theme.variables.fontSize).toBeDefined();
      expect(theme.variables.lineHeight).toBeDefined();
      expect(theme.variables.spacing).toBeDefined();
      expect(theme.variables.borderRadius).toBeDefined();
      expect(theme.variables.boxShadow).toBeDefined();
    });
  });

  describe('getThemeByName', () => {
    it('should return the light theme when "light" is specified', () => {
      const theme = getThemeByName(ThemeName.LIGHT);

      expect(theme).toBeDefined();
      expect(theme.name).toBe(ThemeName.LIGHT);
      expect(theme.variables.backgroundColor).toBe('#ffffff');
    });

    it('should return the dark theme when "dark" is specified', () => {
      const theme = getThemeByName(ThemeName.DARK);

      expect(theme).toBeDefined();
      expect(theme.name).toBe(ThemeName.DARK);
      expect(theme.variables.backgroundColor).toBe('#1e1e1e');
    });

    it('should return the sepia theme when "sepia" is specified', () => {
      const theme = getThemeByName(ThemeName.SEPIA);

      expect(theme).toBeDefined();
      expect(theme.name).toBe(ThemeName.SEPIA);
      expect(theme.variables.backgroundColor).toBe('#f8f1e3');
    });

    it('should return the default theme for unknown theme names', () => {
      const theme = getThemeByName('unknown');

      expect(theme).toBeDefined();
      expect(theme.name).toBe(ThemeName.LIGHT);
    });

    it('should handle case-insensitive theme names', () => {
      const theme = getThemeByName('Dark');

      expect(theme).toBeDefined();
      expect(theme.name).toBe(ThemeName.DARK);
    });
  });
});
