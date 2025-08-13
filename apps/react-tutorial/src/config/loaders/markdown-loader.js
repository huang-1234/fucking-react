import { marked } from 'marked';
import hljs from 'highlight.js';

// 配置 marked（启用代码高亮）
marked.setOptions({
  highlight: (code, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlightAuto(code, [lang]).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

export default function(source) {
  const html = marked.parse(source);
  // 返回 JS 模块，避免直接返回 HTML 字符串
  return `export default ${JSON.stringify(html)}`;
}
