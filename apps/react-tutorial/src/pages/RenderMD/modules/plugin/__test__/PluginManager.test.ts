import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PluginManager } from '../PluginManager';
import { PluginHook, PluginType, type MarkdownPlugin } from '../PluginTypes';
import { ASTNodeType } from '../../../common/md';
import { InnerPluginId } from '../common';

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    pluginManager = new PluginManager();
  });

  describe('register', () => {
    it('should register a plugin and return its ID', () => {
      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {
          [PluginHook.BEFORE_PARSE]: (text: string) => text
        }
      };

      const id = pluginManager.register(plugin);

      expect(id).toBe('test-plugin');
      expect(pluginManager.getPlugin('test-plugin')).toBe(plugin);
    });

    it('should generate an ID if not provided', () => {
      const plugin = {
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      const id = pluginManager.register(plugin as MarkdownPlugin);

      expect(id).toBeTruthy();
      expect(typeof id).toBe('string');
      expect(id.startsWith('plugin_')).toBe(true);
    });

    it('should register hooks for the plugin', () => {
      const beforeParseHook = vi.fn((text) => text);
      const afterParseHook = vi.fn((ast) => ast);

      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {
          [PluginHook.BEFORE_PARSE]: beforeParseHook,
          [PluginHook.AFTER_PARSE]: afterParseHook
        }
      };

      pluginManager.register(plugin);

      // We can't directly test the hookMap as it's private, but we can test the behavior
      // through the executeHook method
      const text = 'Test text';
      pluginManager.executeHook(PluginHook.BEFORE_PARSE, text, {});

      expect(beforeParseHook).toHaveBeenCalledWith(text, expect.any(Object));
    });

    it('should call the plugin init method if provided', () => {
      const initFn = vi.fn();

      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {},
        init: initFn
      };

      pluginManager.register(plugin);

      expect(initFn).toHaveBeenCalledWith(expect.any(Object));
    });

    it('should merge options with context', () => {
      const initFn = vi.fn();

      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {},
        init: initFn
      };

      const options = { testOption: 'value' };
      pluginManager.register(plugin, options);

      expect(initFn).toHaveBeenCalledWith(expect.objectContaining({
        options: expect.objectContaining({ testOption: 'value' })
      }));
    });
  });

  describe('unregister', () => {
    it('should unregister a plugin by ID', () => {
      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      pluginManager.register(plugin);
      const result = pluginManager.unregister('test-plugin');

      expect(result).toBe(true);
      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
    });

    it('should call the plugin destroy method if provided', () => {
      const destroyFn = vi.fn();

      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {},
        destroy: destroyFn
      };

      pluginManager.register(plugin);
      pluginManager.unregister('test-plugin');

      expect(destroyFn).toHaveBeenCalled();
    });

    it('should return false if the plugin is not found', () => {
      const result = pluginManager.unregister('non-existent-plugin');

      expect(result).toBe(false);
    });
  });

  describe('unregisterAll', () => {
    it('should unregister all plugins', () => {
      const plugin1 = {
        id: 'plugin1',
        name: 'Plugin 1',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      const plugin2 = {
        id: 'plugin2',
        name: 'Plugin 2',
        type: PluginType.RENDERER,
        hooks: {}
      };

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);

      pluginManager.unregisterAll();

      expect(pluginManager.getPlugin('plugin1')).toBeUndefined();
      expect(pluginManager.getPlugin('plugin2')).toBeUndefined();
    });
  });

  describe('getPlugin', () => {
    it('should return the plugin by ID', () => {
      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      pluginManager.register(plugin);

      expect(pluginManager.getPlugin('test-plugin')).toBe(plugin);
    });

    it('should return undefined if the plugin is not found', () => {
      expect(pluginManager.getPlugin('non-existent-plugin')).toBeUndefined();
    });
  });

  describe('getAllPlugins', () => {
    it('should return all registered plugins', () => {
      const plugin1 = {
        id: 'plugin1',
        name: 'Plugin 1',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      const plugin2 = {
        id: 'plugin2',
        name: 'Plugin 2',
        type: PluginType.RENDERER,
        hooks: {}
      };

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);

      const plugins = pluginManager.getAllPlugins();

      expect(plugins.size).toBe(2);
      expect(plugins.get('plugin1')).toBe(plugin1);
      expect(plugins.get('plugin2')).toBe(plugin2);
    });
  });

  describe('getPluginsByType', () => {
    it('should return plugins of the specified type', () => {
      const plugin1 = {
        id: 'plugin1',
        name: 'Plugin 1',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      const plugin2 = {
        id: 'plugin2',
        name: 'Plugin 2',
        type: PluginType.RENDERER,
        hooks: {}
      };

      const plugin3 = {
        id: 'plugin3',
        name: 'Plugin 3',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);
      pluginManager.register(plugin3);

      const syntaxPlugins = pluginManager.getPluginsByType(PluginType.SYNTAX);

      expect(syntaxPlugins.length).toBe(2);
      expect(syntaxPlugins).toContain(plugin1);
      expect(syntaxPlugins).toContain(plugin3);
      expect(syntaxPlugins).not.toContain(plugin2);
    });
  });

  describe('executeHook', () => {
    it('should execute hooks in priority order', async () => {
      const order: number[] = [];

      const plugin1 = {
        id: 'plugin1',
        name: 'Plugin 1',
        type: PluginType.SYNTAX,
        priority: 2,
        hooks: {
          [PluginHook.BEFORE_PARSE]: (text: string) => {
            order.push(1);
            return text + ' plugin1';
          }
        }
      };

      const plugin2 = {
        id: 'plugin2',
        name: 'Plugin 2',
        type: PluginType.SYNTAX,
        priority: 1,
        hooks: {
          [PluginHook.BEFORE_PARSE]: (text: string) => {
            order.push(2);
            return text + ' plugin2';
          }
        }
      };

      pluginManager.register(plugin1);
      pluginManager.register(plugin2);

      const result = await pluginManager.executeHook(PluginHook.BEFORE_PARSE, 'test', {});

      // Plugin2 has higher priority (lower number), so it should run first
      expect(order).toEqual([2, 1]);
      expect(result).toBe('test plugin2 plugin1');
    });

    it('should pass context to hooks', async () => {
      const hook = vi.fn((text, context) => text);

      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {
          [PluginHook.BEFORE_PARSE]: hook
        }
      };

      pluginManager.register(plugin);

      const context = { testKey: 'testValue' };
      await pluginManager.executeHook(PluginHook.BEFORE_PARSE, 'test', context);

      expect(hook).toHaveBeenCalledWith('test', expect.objectContaining({
        testKey: 'testValue'
      }));
    });

    it('should handle async hooks', async () => {
      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {
          [PluginHook.BEFORE_PARSE]: async (text: string) => {
            return new Promise<string>(resolve => {
              setTimeout(() => resolve(text + ' async'), 10);
            });
          }
        }
      };

      pluginManager.register(plugin);

      const result = await pluginManager.executeHook(PluginHook.BEFORE_PARSE, 'test', {});

      expect(result).toBe('test async');
    });

    it('should return the original data if no hooks are registered', async () => {
      const result = await pluginManager.executeHook(PluginHook.BEFORE_PARSE, 'test', {});

      expect(result).toBe('test');
    });

    it('should handle errors in hooks', async () => {
      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {
          [PluginHook.BEFORE_PARSE]: () => {
            throw new Error('Hook error');
          }
        }
      };

      pluginManager.register(plugin);

      // The error should be caught and logged, but not propagated
      const result = await pluginManager.executeHook(PluginHook.BEFORE_PARSE, 'test', {});

      expect(result).toBe('test');
    });
  });

  describe('setContext', () => {
    it('should update the context', () => {
      const hook = vi.fn((text, context) => text);

      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {
          [PluginHook.BEFORE_PARSE]: hook
        }
      };

      pluginManager.register(plugin);

      pluginManager.setContext({ globalKey: 'globalValue' });
      pluginManager.executeHook(PluginHook.BEFORE_PARSE, 'test', {});

      expect(hook).toHaveBeenCalledWith('test', expect.objectContaining({
        globalKey: 'globalValue'
      }));
    });
  });

  describe('clear', () => {
    it('should clear all plugins and hooks', () => {
      const plugin = {
        id: 'test-plugin',
        name: 'Test Plugin',
        type: PluginType.SYNTAX,
        hooks: {}
      };

      pluginManager.register(plugin);
      pluginManager.clear();

      expect(pluginManager.getPlugin('test-plugin')).toBeUndefined();
      expect(pluginManager.getAllPlugins().size).toBe(0);
    });
  });
});
