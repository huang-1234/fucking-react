export const sanitizeSchema = {
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'em', 'strong', 'code', 'pre',
    'blockquote', 'ul', 'ol', 'li', 'a',
    'img', 'table', 'thead', 'tbody', 'tr',
    'th', 'td', 'hr', 'br', 'span', 'div',
    'del', 'input'
  ],
  attributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    input: ['type', 'checked', 'disabled'],
    '*': ['className', 'id', 'style']
  },
  protocols: {
    href: ['http', 'https', 'mailto', 'tel', '#'],
    src: ['http', 'https', 'data']
  }
};
