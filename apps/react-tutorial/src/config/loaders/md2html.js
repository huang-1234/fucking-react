// vite-plugin-markdown.js
import MarkdownIt from 'markdown-it';

export default function markdownPlugin() {
  const md = new MarkdownIt();
  return {
    name: 'vite-plugin-markdown',
    // 转换指定类型文件
    transform(code, id) {
      if (!id.endsWith('.md')) return;
      const html = md.render(code);
      return `export default ${JSON.stringify(html)};`; // 转换为 JS 模块
    }
  };
}