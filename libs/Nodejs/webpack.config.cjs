const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const remarkGfm = require('remark-gfm');
const rehypeHighlight = require('rehype-highlight');

// 导入插件
const { WebpackPropsToFormilyPlugin } = require('./src/plugins/props-to-schema/webpack-plugin-props-to-formily.ts');

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.cjs', '.mjs', '.json', '.mts'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@plugins': path.resolve(__dirname, 'src/plugins') // 示例别名[2](@ref)
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
        options: {
          transpileOnly: true,
          configFile: 'tsconfig.app.json',
          compilerOptions: {
            jsx: 'react-jsx'
          }
        } // 开发环境加速
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
                additionalData: '@import "./src/styles/variables.less";',
              },
            },
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      {
        test: /\.mdx?$/,
        use: [
          'babel-loader',
          {
            loader: '@mdx-js/loader',
            options: {
              remarkPlugins: [remarkGfm],
              rehypePlugins: [rehypeHighlight],
              providerImportSource: '@mdx-js/react',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      inject: true,
      scriptLoading: 'defer',
    }),
    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
    }),
    // 添加 Props 转 Formily Schema 插件
    new WebpackPropsToFormilyPlugin({
      include: ['src/plugins/props-to-schema/demos/*.{tsx,jsx}'],
      outputDir: 'src/plugins/props-to-schema/demos',
      outputFileName: 'formily-schemas.json',
      debug: true
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3001,
    hot: true,
    historyApiFallback: true,
  },
};
