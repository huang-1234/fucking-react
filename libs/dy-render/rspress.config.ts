import { defineConfig, UserConfig } from 'rspress/config';

const config: UserConfig = defineConfig({
  // 文档根目录
  root: 'docs',
  title: '低代码渲染引擎',
  description: '基于协议驱动的低代码渲染引擎',
  themeConfig: {
    nav: [
      {
        text: '指南',
        link: '/guide/',
      },
      {
        text: '示例',
        link: '/examples/',
      },
      {
        text: 'API',
        link: '/api/',
      }
    ],
    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            {
              text: '介绍',
              link: '/guide/'
            },
            {
              text: '快速开始',
              link: '/guide/getting-started'
            },
            {
              text: '架构设计',
              link: '/guide/architecture'
            }
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            {
              text: '基础用法',
              link: '/examples/'
            },
            {
              text: 'React 集成',
              link: '/examples/react-integration'
            },
            {
              text: '沙箱渲染',
              link: '/examples/sandbox'
            },
            {
              text: '性能监控',
              link: '/examples/performance'
            }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            {
              text: '核心 API',
              link: '/api/'
            },
            {
              text: '渲染器',
              link: '/api/renderer'
            },
            {
              text: '组件映射器',
              link: '/api/component-mapper'
            },
            {
              text: '样式应用',
              link: '/api/style-applier'
            }
          ]
        }
      ]
    }
  }
});

export default config;