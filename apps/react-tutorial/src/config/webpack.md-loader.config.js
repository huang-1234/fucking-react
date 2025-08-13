const path = require('path');

module.exports = {
  module: {
    rules: [
      {
        test: /\.md$/,
        use: [
          'html-loader',         // 处理 HTML 字符串
          path.resolve(__dirname, './loaders/markdown-loader.js') // 自定义 Loader
        ]
      }
    ]
  }
};
