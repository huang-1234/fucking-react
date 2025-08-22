/**
 * CLI工具测试
 * 测试命令行接口功能
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
// import { exec } from 'child_process';
// import { promisify } from 'util';

// 模拟依赖
vi.mock('fs', () => ({
  existsSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn()
}));

vi.mock('path', () => ({
  dirname: vi.fn()
}));

vi.mock('../src/jsxParser', () => ({
  parseJSXFile: vi.fn()
}));

// 导入被测模块
import { parseJSXFile } from '../src/jsxParser';

describe('JSX编译器CLI', () => {
  // 保存原始的process.argv和exit
  const originalArgv = process.argv;
  const originalExit = process.exit;
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;

  beforeEach(() => {
    // 模拟process.exit
    process.exit = vi.fn();

    // 模拟console.error和console.log
    console.error = vi.fn();
    console.log = vi.fn();

    // 重置所有模拟
    vi.clearAllMocks();

    // 默认模拟返回值
    fs.existsSync.mockReturnValue(true);
    path.dirname.mockReturnValue('/mock/dir');
    parseJSXFile.mockReturnValue('const App = () => React.createElement("div", null, "Hello");');
  });

  afterEach(() => {
    // 恢复原始值
    process.argv = originalArgv;
    process.exit = originalExit;
    console.error = originalConsoleError;
    console.log = originalConsoleLog;
  });

  it('应该在没有输入文件时显示用法信息并退出', async () => {
    // 设置命令行参数
    process.argv = ['node', 'cli.js'];

    // 动态导入CLI模块以触发执行
    try {
      await import('../src/cli.js');
    } catch (e) {
      // 忽略可能的错误
    }

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('用法:'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('应该在输入文件不存在时显示错误并退出', async () => {
    // 设置命令行参数
    process.argv = ['node', 'cli.js', 'nonexistent.jsx'];

    // 模拟文件不存在
    fs.existsSync.mockReturnValueOnce(false);

    // 动态导入CLI模块以触发执行
    try {
      await import('../src/cli.js');
    } catch (e) {
      // 忽略可能的错误
    }

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('错误: 文件'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('应该创建输出目录（如果不存在）', async () => {
    // 设置命令行参数
    process.argv = ['node', 'cli.js', 'input.jsx', 'output/output.js'];

    // 模拟输出目录不存在
    fs.existsSync.mockReturnValueOnce(true).mockReturnValueOnce(false);

    // 动态导入CLI模块以触发执行
    try {
      await import('../src/cli.js');
    } catch (e) {
      // 忽略可能的错误
    }

    expect(fs.mkdirSync).toHaveBeenCalledWith('/mock/dir', { recursive: true });
  });

  it('应该使用parseJSXFile转换JSX文件并写入输出文件', async () => {
    // 设置命令行参数
    process.argv = ['node', 'cli.js', 'input.jsx', 'output.js'];

    // 动态导入CLI模块以触发执行
    try {
      await import('../src/cli.js');
    } catch (e) {
      // 忽略可能的错误
    }

    expect(parseJSXFile).toHaveBeenCalledWith('input.jsx');
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'output.js',
      'const App = () => React.createElement("div", null, "Hello");',
      'utf8'
    );
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('成功将'));
  });

  it('应该在未指定输出文件时使用默认输出文件名', async () => {
    // 设置命令行参数
    process.argv = ['node', 'cli.js', 'input.jsx'];

    // 动态导入CLI模块以触发执行
    try {
      await import('../src/cli.js');
    } catch (e) {
      // 忽略可能的错误
    }

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'input.js',  // 默认输出文件名（.jsx替换为.js）
      expect.any(String),
      'utf8'
    );
  });

  it('应该处理转换过程中的错误', async () => {
    // 设置命令行参数
    process.argv = ['node', 'cli.js', 'error.jsx'];

    // 模拟parseJSXFile抛出错误
    parseJSXFile.mockImplementation(() => {
      throw new Error('转换错误');
    });

    // 动态导入CLI模块以触发执行
    try {
      await import('../src/cli.js');
    } catch (e) {
      // 忽略可能的错误
    }

    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('错误: 转换错误'));
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
