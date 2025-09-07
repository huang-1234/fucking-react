/**
 * SecLinter XSS Detector Plugin
 * 检测代码中潜在的XSS漏洞
 */
import {
  PluginInterface,
  PluginMeta,
  Sandbox,
  PluginHelpers,
  ScanResult
} from 'seclinter';

/**
 * 插件元数据
 */
export const meta: PluginMeta = {
  name: 'seclinter-plugin-xss-detector',
  version: '1.0.0',
  description: 'Detects potential XSS vulnerabilities in web applications',
  target: 'xss',
  tags: ['security', 'xss', 'injection'],
  permissions: ['fs:read']
};

/**
 * 危险函数和属性列表
 */
const DANGEROUS_FUNCTIONS = [
  'innerHTML',
  'outerHTML',
  'document.write',
  'document.writeln',
  'eval',
  'setTimeout',
  'setInterval',
  'new Function',
  'execScript',
  'dangerouslySetInnerHTML',
  'insertAdjacentHTML'
];

/**
 * 危险的DOM源
 */
const DANGEROUS_SOURCES = [
  'location',
  'location.href',
  'location.search',
  'location.hash',
  'document.URL',
  'document.documentURI',
  'document.referrer',
  'window.name',
  'document.cookie',
  'localStorage',
  'sessionStorage'
];

/**
 * XSS检测器插件
 */
class XssDetectorPlugin implements PluginInterface {
  private helpers: PluginHelpers;
  private sandbox: Sandbox;

  /**
   * 初始化插件
   * @param sandbox 沙箱环境
   * @param helpers 插件助手工具
   */
  async init(sandbox: Sandbox, helpers?: PluginHelpers): Promise<void> {
    this.sandbox = sandbox;
    this.helpers = helpers || {} as PluginHelpers;

    this.helpers.logger?.info('XSS Detector plugin initialized');
  }

  /**
   * 执行扫描
   * @param projectPath 项目路径
   * @param options 扫描选项
   * @returns 扫描结果
   */
  async scan(projectPath: string, options?: Record<string, any>): Promise<ScanResult[]> {
    const results: ScanResult[] = [];

    try {
      // 获取JavaScript和HTML文件列表
      const jsFiles = await this.findFiles(projectPath, ['.js', '.jsx', '.ts', '.tsx']);
      const htmlFiles = await this.findFiles(projectPath, ['.html', '.htm']);

      // 扫描JavaScript文件
      for (const file of jsFiles) {
        const content = await this.helpers.fs.readFile(file);
        const jsResults = await this.scanJavaScript(content, file);
        results.push(...jsResults);
      }

      // 扫描HTML文件
      for (const file of htmlFiles) {
        const content = await this.helpers.fs.readFile(file);
        const htmlResults = await this.scanHtml(content, file);
        results.push(...htmlResults);
      }

      return results;
    } catch (error) {
      this.helpers.logger?.error(`XSS Detector error: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * 查找匹配的文件
   * @param dir 目录
   * @param extensions 扩展名列表
   * @returns 文件路径列表
   */
  private async findFiles(dir: string, extensions: string[]): Promise<string[]> {
    // 这里应该实现文件查找逻辑，但由于我们依赖helpers提供的功能，
    // 这里只是一个简化的示例，实际应该使用glob或递归查找
    return [];
  }

  /**
   * 扫描JavaScript代码
   * @param content 代码内容
   * @param file 文件路径
   * @returns 扫描结果
   */
  private async scanJavaScript(content: string, file: string): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const lines = content.split('\n');

    // 检查每一行代码
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // 检查危险函数
      for (const func of DANGEROUS_FUNCTIONS) {
        if (line.includes(func)) {
          // 检查是否同时包含危险源
          const hasDangerousSource = DANGEROUS_SOURCES.some(source => line.includes(source));

          if (hasDangerousSource) {
            results.push({
              ruleId: 'xss-dangerous-function-with-user-input',
              plugin: meta.name,
              level: 'high',
              file,
              line: lineNumber,
              message: `Potential XSS vulnerability: ${func} with user input`,
              suggestion: `Avoid using ${func} with user-controlled data. Use safe alternatives or sanitize input.`
            });
          } else {
            results.push({
              ruleId: 'xss-dangerous-function',
              plugin: meta.name,
              level: 'medium',
              file,
              line: lineNumber,
              message: `Potential XSS risk: ${func} usage detected`,
              suggestion: `Consider using safer alternatives to ${func}.`
            });
          }
        }
      }

      // 检查未转义的变量插值（例如React中的dangerouslySetInnerHTML）
      if (line.includes('dangerouslySetInnerHTML') && line.includes('__html')) {
        results.push({
          ruleId: 'xss-react-dangerous-html',
          plugin: meta.name,
          level: 'medium',
          file,
          line: lineNumber,
          message: 'Potential XSS vulnerability: dangerouslySetInnerHTML usage',
          suggestion: 'Use a HTML sanitizer library before setting HTML content.'
        });
      }

      // 检查URL构造
      if ((line.includes('href=') || line.includes('src=')) &&
          line.match(/['"]\s*\+\s*[a-zA-Z0-9_$]/)) {
        results.push({
          ruleId: 'xss-url-injection',
          plugin: meta.name,
          level: 'medium',
          file,
          line: lineNumber,
          message: 'Potential XSS through URL attribute injection',
          suggestion: 'Validate and sanitize URL values before using them in href or src attributes.'
        });
      }
    }

    return results;
  }

  /**
   * 扫描HTML代码
   * @param content 代码内容
   * @param file 文件路径
   * @returns 扫描结果
   */
  private async scanHtml(content: string, file: string): Promise<ScanResult[]> {
    const results: ScanResult[] = [];
    const lines = content.split('\n');

    // 检查每一行代码
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNumber = i + 1;

      // 检查内联JavaScript
      if (line.includes('<script>') || line.includes('javascript:')) {
        results.push({
          ruleId: 'xss-inline-script',
          plugin: meta.name,
          level: 'low',
          file,
          line: lineNumber,
          message: 'Inline JavaScript detected',
          suggestion: 'Consider using external JavaScript files with proper CSP policies.'
        });
      }

      // 检查事件处理程序
      const eventHandlers = [
        'onclick', 'onload', 'onmouseover', 'onerror', 'onmouseout',
        'onkeydown', 'onkeyup', 'onkeypress', 'onchange', 'onfocus', 'onblur'
      ];

      for (const handler of eventHandlers) {
        if (line.includes(handler + '=')) {
          results.push({
            ruleId: 'xss-event-handler',
            plugin: meta.name,
            level: 'low',
            file,
            line: lineNumber,
            message: `Event handler (${handler}) detected`,
            suggestion: 'Consider using unobtrusive JavaScript instead of inline event handlers.'
          });
        }
      }

      // 检查不安全的表单操作
      if (line.includes('<form') && !line.includes('autocomplete="off"')) {
        results.push({
          ruleId: 'xss-form-autocomplete',
          plugin: meta.name,
          level: 'info',
          file,
          line: lineNumber,
          message: 'Form without autocomplete="off"',
          suggestion: 'Consider adding autocomplete="off" for sensitive forms.'
        });
      }
    }

    return results;
  }

  /**
   * 清理资源
   */
  async cleanup(): Promise<void> {
    // 清理资源
  }
}

export default new XssDetectorPlugin();
