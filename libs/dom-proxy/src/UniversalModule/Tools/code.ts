/**
 * 检测恶意代码
 * @param code 要检查的代码
 * @returns 是否包含恶意代码
 */
export const containsMaliciousCode = (code: string): boolean => {
  // 检测常见的恶意代码模式
  const maliciousPatterns = [
    /\beval\s*\(/,                    // eval()
    /new\s+Function\s*\(/,            // new Function()
    /\bdocument\.cookie\b/,           // document.cookie
    /\blocation\s*=/,                 // location=
    /\bwindow\s*\.\s*open\s*\(/,      // window.open()
    /\bnavigator\s*\.\s*userAgent\b/, // navigator.userAgent
  ];

  return maliciousPatterns.some(pattern => pattern.test(code));
};