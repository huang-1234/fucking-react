import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { SecretMatch, SecretScanResult } from './types';

export class SecretScanner {
  private patterns = {
    apiKey: /\b(?:api[_-]?key|secret)[\s:=]['"]?([a-z0-9]{32,})['"]?/gi,
    jwt: /\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\b/gi,
    awsKey: /\b(AKIA[0-9A-Z]{16})\b/g,
    privateKey: /-----BEGIN [A-Z ]+ PRIVATE KEY-----[^-]+-----END [A-Z ]+ PRIVATE KEY-----/gs,
    password: /\b(?:password|passwd|pwd)[\s:=]['"]([^'"]{8,})['"]|\b(?:password|passwd|pwd)[\s:=]([^'"]{8,})\b/gi,
    githubToken: /\b(gh[ps]_[a-zA-Z0-9]{36,})\b/g,
    googleApiKey: /\b(AIza[0-9A-Za-z-_]{35})\b/g,
    slackToken: /\b(xox[pboa]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})\b/g
  };

  private ignorePatterns: RegExp[] = [
    /node_modules/,
    /\.git\//,
    /\.vscode\//,
    /dist\//,
    /build\//,
    /\.DS_Store/
  ];
  /**
   * 扫描项目目录，查找可能泄露的敏感信息
   * @param projectPath 项目路径
   * @param customIgnorePatterns 自定义忽略模式
   * @returns 扫描结果
   */

  async scan(projectPath: string, customIgnorePatterns?: string[]): Promise<SecretScanResult> {
    const secrets: SecretMatch[] = [];
    let filesScanned = 0;

    // 添加自定义忽略模式
    if (customIgnorePatterns) {
      this.addIgnorePatterns(customIgnorePatterns);
    }

    // 递归遍历目录的函数
    const walkDir = (dir: string) => {
      try {
        const items = readdirSync(dir);
        for (const item of items) {
          const fullPath = join(dir, item);

          // 检查是否应该忽略此路径
          if (this.shouldIgnore(fullPath)) {
            continue;
          }

          if (statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
          } else {
            // 检查文件扩展名，只扫描文本文件
            if (this.isScannableFile(fullPath)) {
              filesScanned++;
              try {
                const content = readFileSync(fullPath, 'utf8');
                this.checkFileContent(content, fullPath, secrets);
              } catch (error) {
                // 忽略无法读取的文件
                console.error(`无法读取文件 ${fullPath}: ${(error as Error).message}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`无法读取目录 ${dir}: ${(error as Error).message}`);
      }
    };

    walkDir(projectPath);
    return { secretsFound: secrets, filesScanned };
  }

  /**
   * 检查文件是否可扫描
   * @param filePath 文件路径
   * @returns 是否可扫描
   */
  private isScannableFile(filePath: string): boolean {
    const scannableExts = [
      '.js', '.jsx', '.ts', '.tsx',
      '.json', '.env', '.txt', '.yaml', '.yml',
      '.html', '.css', '.scss', '.less',
      '.md', '.vue', '.config', '.xml'
    ];
    return scannableExts.some(ext => filePath.toLowerCase().endsWith(ext));
  }

  /**
   * 检查文件是否应该忽略
   * @param path 文件路径
   * @returns 是否应该忽略
   */
  private shouldIgnore(path: string): boolean {
    return this.ignorePatterns.some(pattern => pattern.test(path));
  }

  /**
   * 添加忽略模式
   * @param patterns 忽略模式
   */
  private addIgnorePatterns(patterns: string[]): void {
    for (const pattern of patterns) {
      try {
        // 将glob模式转换为正则表达式
        const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.');
        this.ignorePatterns.push(new RegExp(regexPattern));
      } catch (error) {
        console.error(`无效的忽略模式 ${pattern}: ${(error as Error).message}`);
      }
    }
  }

  /**
   * 检查文件内容
   * @param content 文件内容
   * @param filePath 文件路径
   * @param secrets 敏感信息
   */
  private checkFileContent(content: string, filePath: string, secrets: SecretMatch[]): void {
    const lines = content.split('\n');

    for (const [key, pattern] of Object.entries(this.patterns)) {
      // 重置正则表达式的lastIndex
      pattern.lastIndex = 0;

      // 对整个文件内容进行匹配
      let match;
      while ((match = pattern.exec(content)) !== null) {
        // 计算匹配位置所在的行号
        const contentBeforeMatch = content.substring(0, match.index);
        const lineNumber = contentBeforeMatch.split('\n').length;

        // 获取匹配行的内容作为预览
        const lineContent = lines[lineNumber - 1];

        secrets.push({
          file: filePath,
          line: lineNumber,
          matchedPattern: key,
          preview: this.sanitizePreview(lineContent, match[0])
        });
      }
    }
  }

  /**
   * 创建预览，但隐藏实际的敏感信息
   * @param line 行内容
   * @param match 匹配内容
   * @returns 预览
   */
  private sanitizePreview(line: string, match: string): string {
    // 创建预览，但隐藏实际的敏感信息
    const maxPreviewLength = 100;
    const truncatedLine = line.length > maxPreviewLength
      ? line.substring(0, maxPreviewLength) + '...'
      : line;

    // 用星号替换实际的敏感信息
    return truncatedLine.replace(match, match.substring(0, 4) + '****' + match.substring(-4));
  }
}
