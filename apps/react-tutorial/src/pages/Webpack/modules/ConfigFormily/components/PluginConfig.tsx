import React from 'react';
import { createSchemaField } from '@formily/react';
import {
  Form,
  FormItem,
  FormLayout,
  Select,
  ArrayCollapse,
} from '@formily/antd-v5';
import { pluginConfigSchema } from '../schemas/pluginConfig';
import { MonacoInput } from './MonacoInput';

// 创建SchemaField组件
const SchemaField = createSchemaField({
  components: {
    FormItem,
    FormLayout,
    Select,
    ArrayCollapse,
    MonacoInput,
  },
  scope: {
    pluginDefaults: {
      HtmlWebpackPlugin: {
        template: './public/index.html',
        filename: 'index.html',
        inject: true,
      },
      MiniCssExtractPlugin: {
        filename: '[name].[contenthash].css',
        chunkFilename: '[id].[contenthash].css',
      },
      CleanWebpackPlugin: {},
      CopyWebpackPlugin: {
        patterns: [
          { from: 'public', to: '' }
        ],
      },
      DefinePlugin: {
        'process.env.NODE_ENV': '"production"',
      },
      ProvidePlugin: {
        React: 'react',
      },
      HotModuleReplacementPlugin: {},
      TerserPlugin: {
        parallel: true,
        terserOptions: {
          compress: {
            drop_console: true,
          },
        },
      },
      CompressionPlugin: {
        algorithm: 'gzip',
        test: /\.(js|css|html|svg)$/,
      },
      BundleAnalyzerPlugin: {
        analyzerMode: 'static',
        openAnalyzer: false,
      },
      DotenvPlugin: {
        path: '.env',
      },
      WebpackManifestPlugin: {
        fileName: 'manifest.json',
      },
    },
  },
});

const PluginConfig: React.FC = () => {
  return (
    <Form layout="vertical">
      <SchemaField schema={pluginConfigSchema} />
    </Form>
  );
};

export default React.memo(PluginConfig);