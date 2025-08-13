import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';

export default function markdownPlugin() {
  return {
    name: 'vite-markdown-plugin',
    // 转换 .md 文件为 JS 模块
    transform(code, id) {
      if (!id.endsWith('.md')) return;

      const mdParser = new MarkdownIt({
        html: true,
        highlight: (str, lang) => {
          if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(str, { language: lang }).value;
          }
          return '';
        }
      });

      const html = mdParser.render(code);
      // 导出 HTML 字符串
      return `export default ${JSON.stringify(html)}`;
    }
  };
}
