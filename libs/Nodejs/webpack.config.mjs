import path from 'path';
import { fileURLToPath } from 'url';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { WebpackPropsToFormilyPlugin } from './src/plugins/props-to-schema/webpack-plugin-props-to-formily.mjs';

// 获取 __dirname 等效值
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
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
              remarkPlugins: [await import('remark-gfm').then(m => m.default)],
              rehypePlugins: [await import('rehype-highlight').then(m => m.default)],
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
    new WebpackPropsToFormilyPlugin(),
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
    port: 3000,
    hot: true,
    historyApiFallback: true,
  },
};
