/**
 * HTML净化配置
 * 用于定义允许的HTML标签和属性，防止XSS攻击
 */

export const sanitizeSchema = {
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span', 'br',
    'b', 'strong', 'i', 'em', 'u', 'del', 'strike', 'code', 'pre',
    'a', 'img',
    'ul', 'ol', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'hr',
    'sup', 'sub',
    'details', 'summary',
    'figure', 'figcaption',
    'mark', 'abbr',
    'input' // 用于任务列表
  ],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
    input: ['type', 'checked', 'disabled'],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
    div: ['class', 'id', 'data-*'],
    span: ['class', 'id', 'data-*'],
    code: ['class', 'id'],
    pre: ['class', 'id'],
    '*': ['id', 'class', 'data-*']
  },
  protocols: {
    a: {
      href: ['http', 'https', 'mailto', 'tel', '#']
    },
    img: {
      src: ['http', 'https', 'data']
    }
  },
  allowComments: false,
  allowDoctypes: false
};

export default sanitizeSchema;