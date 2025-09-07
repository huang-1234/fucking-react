import fs from 'fs';
import path from 'path';

/**
 * 格式化输出结果
 * @param data 要格式化的数据
 * @param format 输出格式
 * @returns 格式化后的字符串
 */
export function formatOutput(data: any, format: 'json' | 'text' = 'text'): string {
  if (format === 'json') {
    return JSON.stringify(data, null, 2);
  }

  // 文本格式输出
  if (typeof data === 'string') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => formatOutput(item, format)).join('\n');
  }

  if (typeof data === 'object' && data !== null) {
    return Object.entries(data)
      .map(([key, value]) => `${key}: ${formatOutput(value, format)}`)
      .join('\n');
  }

  return String(data);
}

/**
 * 检查路径是否存在
 * @param filePath 文件或目录路径
 * @returns 是否存在
 */
export function pathExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * 确保目录存在，如果不存在则创建
 * @param dirPath 目录路径
 */
export function ensureDir(dirPath: string): void {
  if (!pathExists(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * 保存结果到文件
 * @param data 要保存的数据
 * @param outputPath 输出文件路径
 * @param format 输出格式
 */
export function saveToFile(data: any, outputPath: string, format: 'json' | 'text' = 'json'): void {
  const content = format === 'json' ? JSON.stringify(data, null, 2) : formatOutput(data, 'text');
  const dir = path.dirname(outputPath);
  ensureDir(dir);
  fs.writeFileSync(outputPath, content, 'utf8');
}

/**
 * 获取严重程度的数字表示，用于排序
 * @param severity 严重程度字符串
 * @returns 严重程度数字
 */
export function getSeverityLevel(severity: string): number {
  const levels: Record<string, number> = {
    'critical': 4,
    'high': 3,
    'medium': 2,
    'low': 1,
    'info': 0
  };

  return levels[severity.toLowerCase()] || 0;
}

/**
 * 按严重程度对漏洞进行排序
 * @param a 漏洞A
 * @param b 漏洞B
 * @returns 排序比较值
 */
export function sortBySeverity<T extends { severity: string }>(a: T, b: T): number {
  return getSeverityLevel(b.severity) - getSeverityLevel(a.severity);
}

/**
 * 生成简单的HTML报告
 * @param title 报告标题
 * @param data 报告数据
 * @returns HTML字符串
 */
export function generateHtmlReport(title: string, data: any): string {
  // 简单的HTML报告模板
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.5; max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .critical { color: #d32f2f; }
    .high { color: #f57c00; }
    .medium { color: #fbc02d; }
    .low { color: #388e3c; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; }
    th { background-color: #f2f2f2; }
    tr:hover { background-color: #f5f5f5; }
    .timestamp { color: #666; font-size: 0.9em; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="timestamp">生成时间: ${new Date().toLocaleString('zh-CN')}</div>
  <div class="summary">
    <pre>${JSON.stringify(data, null, 2)}</pre>
  </div>
</body>
</html>
  `.trim();
}
