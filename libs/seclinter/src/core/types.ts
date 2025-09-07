// 依赖漏洞扫描相关类型
export interface Vulnerability {
  package: string;
  version: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  info: string;
  fix: string;
}

export interface DependencyScanResult {
  vulnerabilities: Vulnerability[];
  scannedDependencies: number;
}

// HTTP 安全头审计相关类型
export interface HeaderAuditResult {
  url: string;
  headers: Record<string, string>;
  missingHeaders: string[];
  recommendations: string[];
}

// 敏感信息扫描相关类型
export interface SecretMatch {
  file: string;
  line: number;
  matchedPattern: string;
  preview: string;
}

export interface SecretScanResult {
  secretsFound: SecretMatch[];
  filesScanned: number;
}

// 扫描器通用配置类型
export interface ScannerOptions {
  verbose?: boolean;
  outputFormat?: 'json' | 'text' | 'html';
  ignorePatterns?: string[];
}
