import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeManager } from '../ThemeManager';
import { ThemeName } from '../ThemeDefinitions';
import * as ThemeDefinitions from '../ThemeDefinitions';

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  // Mock the DOM methods
  const mockAppendChild = vi.fn();
  const mockRemoveChild = vi.fn();
  const mockQuerySelector = vi.fn(() => ({
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild
  }));

  const mockCreateElement = vi.fn(() => ({
    setAttribute: vi.fn(),
    id: '',
    textContent: ''
  }));

  beforeEach(() => {
    vi.resetAllMocks();

    // Mock document methods
    global.document = {
      ...global.document,
      querySelector: mockQuerySelector,
      createElement: mockCreateElement,
      documentElement: {
        setAttribute: vi.fn()
      }
    } as any;

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn()
    };

    // Mock window.matchMedia
    global.window = {
      ...global.window,
      matchMedia: vi.fn().mockReturnValue({
        matches: false
      })
    } as any;

    themeManager = new ThemeManager();
  });

  describe('initialization', () => {
    it('should initialize with the default theme if no theme is provided', () => {
      expect(themeManager['currentTheme'].name).toBe(ThemeName.LIGHT);
    });

    it('should initialize with the provided theme', () => {
      themeManager = new ThemeManager(ThemeName.DARK);
      expect(themeManager['currentTheme'].name).toBe(ThemeName.DARK);
    });

    it('should initialize with the stored theme if available', () => {
      (global.localStorage.getItem as jest.Mock).mockReturnValue(ThemeName.SEPIA);

      themeManager = new ThemeManager();

      expect(global.localStorage.getItem).toHaveBeenCalledWith('md-theme');
      expect(themeManager['currentTheme'].name).toBe(ThemeName.SEPIA);
    });

    it('should initialize with the preferred color scheme if no stored theme', () => {
      (global.localStorage.getItem as jest.Mock).mockReturnValue(null);
      (global.window.matchMedia as jest.Mock).mockReturnValue({
        matches: true // Prefer dark mode
      });

      themeManager = new ThemeManager();

      expect(global.window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
      expect(themeManager['currentTheme'].name).toBe(ThemeName.DARK);
    });

    it('should register the default themes', () => {
      expect(themeManager['themes'].size).toBeGreaterThan(0);
      expect(themeManager['themes'].has(ThemeName.LIGHT)).toBe(true);
      expect(themeManager['themes'].has(ThemeName.DARK)).toBe(true);
      expect(themeManager['themes'].has(ThemeName.SEPIA)).toBe(true);
    });
  });

  describe('registerTheme', () => {
    it('should register a new theme', () => {
      const customTheme = {
        name: 'custom',
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

      const result = themeManager.registerTheme(customTheme);

      expect(result).toBe(true);
      expect(themeManager['themes'].has('custom')).toBe(true);
      expect(themeManager['themes'].get('custom')).toBe(customTheme);
    });

    it('should not register a theme with an existing name', () => {
      const existingTheme = {
        name: ThemeName.LIGHT,
        variables: {} as any
      };

      const result = themeManager.registerTheme(existingTheme);

      expect(result).toBe(false);
    });
  });

  describe('getTheme', () => {
    it('should return the theme with the specified name', () => {
      const theme = themeManager.getTheme(ThemeName.DARK);

      expect(theme).toBeDefined();
      expect(theme?.name).toBe(ThemeName.DARK);
    });

    it('should return undefined for a non-existent theme', () => {
      const theme = themeManager.getTheme('non-existent');

      expect(theme).toBeUndefined();
    });
  });

  describe('getCurrentTheme', () => {
    it('should return the current theme', () => {
      const theme = themeManager.getCurrentTheme();

      expect(theme).toBeDefined();
      expect(theme).toBe(themeManager['currentTheme']);
    });
  });

  describe('getAllThemes', () => {
    it('should return all registered themes', () => {
      const themes = themeManager.getAllThemes();

      expect(themes).toBeDefined();
      expect(themes).toBe(themeManager['themes']);
      expect(themes.size).toBeGreaterThan(0);
    });
  });

  describe('setTheme', () => {
    it('should set the current theme', () => {
      const result = themeManager.setTheme(ThemeName.DARK);

      expect(result).toBe(true);
      expect(themeManager['currentTheme'].name).toBe(ThemeName.DARK);
    });

    it('should not set a non-existent theme', () => {
      const result = themeManager.setTheme('non-existent');

      expect(result).toBe(false);
      expect(themeManager['currentTheme'].name).not.toBe('non-existent');
    });

    it('should save the theme preference', () => {
      themeManager.setTheme(ThemeName.DARK);

      expect(global.localStorage.setItem).toHaveBeenCalledWith('md-theme', ThemeName.DARK);
    });

    it('should apply the theme', () => {
      const applyThemeSpy = vi.spyOn(themeManager, 'applyTheme');

      themeManager.setTheme(ThemeName.DARK);

      expect(applyThemeSpy).toHaveBeenCalled();
    });

    it('should notify listeners', () => {
      const listener = vi.fn();
      themeManager.addListener(listener);

      themeManager.setTheme(ThemeName.DARK);

      expect(listener).toHaveBeenCalledWith(themeManager['currentTheme']);
    });
  });

  describe('createCustomTheme', () => {
    it('should create a custom theme', () => {
      // Spy on the getDefaultTheme function
      const getDefaultThemeSpy = vi.spyOn(ThemeDefinitions, 'getDefaultTheme').mockReturnValue({
        name: ThemeName.LIGHT,
        variables: {
          backgroundColor: '#ffffff',
          textColor: '#000000',
          // ... other variables
        } as any
      });

      const result = themeManager.createCustomTheme('custom', {
        backgroundColor: '#f0f0f0',
        textColor: '#333333'
      });

      expect(result).toBe(true);
      expect(themeManager['themes'].has('custom')).toBe(true);

      const customTheme = themeManager['themes'].get('custom');
      expect(customTheme?.name).toBe('custom');
      expect(customTheme?.variables.backgroundColor).toBe('#f0f0f0');
      expect(customTheme?.variables.textColor).toBe('#333333');
    });

    it('should not create a theme with an existing name', () => {
      const result = themeManager.createCustomTheme(ThemeName.LIGHT, {});

      expect(result).toBe(false);
    });
  });

  describe('applyTheme', () => {
    it('should create a style element if it does not exist', () => {
      mockQuerySelector.mockReturnValueOnce(null);

      themeManager.applyTheme();

      expect(global.document.createElement).toHaveBeenCalledWith('style');
      expect(mockAppendChild).toHaveBeenCalled();
    });

    it('should update the existing style element if it exists', () => {
      const mockStyleElement = {
        textContent: ''
      };

      mockQuerySelector.mockReturnValueOnce(mockStyleElement);

      themeManager.applyTheme();

      expect(global.document.createElement).not.toHaveBeenCalled();
      expect(mockStyleElement.textContent).toBeTruthy();
    });

    it('should set the data-theme attribute on the document element', () => {
      themeManager.applyTheme();

      expect(global.document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', themeManager['currentTheme'].name);
    });
  });

  describe('generateThemeCSS', () => {
    it('should generate CSS for the current theme', () => {
      const css = themeManager.generateThemeCSS();

      expect(typeof css).toBe('string');
      expect(css).toContain(':root');
      expect(css).toContain('--md-bg-color');
      expect(css).toContain('--md-text-color');
    });
  });

  describe('addListener and removeListener', () => {
    it('should add a listener', () => {
      const listener = vi.fn();

      themeManager.addListener(listener);

      expect(themeManager['listeners']).toContain(listener);
    });

    it('should remove a listener', () => {
      const listener = vi.fn();

      themeManager.addListener(listener);
      themeManager.removeListener(listener);

      expect(themeManager['listeners']).not.toContain(listener);
    });
  });

  describe('notifyListeners', () => {
    it('should notify all listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();

      themeManager.addListener(listener1);
      themeManager.addListener(listener2);

      themeManager['notifyListeners']();

      expect(listener1).toHaveBeenCalledWith(themeManager['currentTheme']);
      expect(listener2).toHaveBeenCalledWith(themeManager['currentTheme']);
    });

    it('should handle errors in listeners', () => {
      const listener = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      themeManager.addListener(listener);
      themeManager['notifyListeners']();

      expect(listener).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('detectPreferredTheme', () => {
    it('should detect dark mode preference', () => {
      (global.window.matchMedia as jest.Mock).mockReturnValue({
        matches: true
      });

      const theme = themeManager['detectPreferredTheme']();

      expect(theme).toBe(ThemeName.DARK);
    });

    it('should default to light mode if no preference', () => {
      (global.window.matchMedia as jest.Mock).mockReturnValue({
        matches: false
      });

      const theme = themeManager['detectPreferredTheme']();

      expect(theme).toBe(ThemeName.LIGHT);
    });
  });

  describe('savePreference', () => {
    it('should save the theme preference to localStorage', () => {
      themeManager['savePreference'](ThemeName.DARK);

      expect(global.localStorage.setItem).toHaveBeenCalledWith('md-theme', ThemeName.DARK);
    });
  });

  describe('loadPreference', () => {
    it('should load the theme preference from localStorage', () => {
      (global.localStorage.getItem as jest.Mock).mockReturnValue(ThemeName.SEPIA);

      const theme = themeManager['loadPreference']();

      expect(global.localStorage.getItem).toHaveBeenCalledWith('md-theme');
      expect(theme).toBe(ThemeName.SEPIA);
    });

    it('should return null if no preference is stored', () => {
      (global.localStorage.getItem as jest.Mock).mockReturnValue(null);

      const theme = themeManager['loadPreference']();

      expect(theme).toBeNull();
    });
  });
});
