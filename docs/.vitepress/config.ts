import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'S2R Documentation',
  description: 'Generate TypeScript API clients from Swagger/OpenAPI 2.0-3.1 documents',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/guide/getting-started' },
      { text: 'API 参考', link: '/api/core' },
      { text: '示例', link: '/examples/basic-usage' },
      { text: '高级功能', link: '/advanced/interceptors' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '安装配置', link: '/guide/installation' },
            { text: '基本用法', link: '/guide/basic-usage' },
            { text: '配置文件', link: '/guide/configuration' },
            { text: 'CLI 命令', link: '/guide/cli-commands' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '核心模块', link: '/api/core' },
            { text: '代码生成器', link: '/api/code-generator' },
            { text: 'Swagger 解析器', link: '/api/swagger-parser' },
            { text: '类型定义', link: '/api/types' },
            { text: '工具函数', link: '/api/utils' },
          ]
        }
      ],
      '/examples/': [
        {
          text: '示例',
          items: [
            { text: '基础使用', link: '/examples/basic-usage' },
            { text: '完整项目', link: '/examples/full-project' },
            { text: 'Mock 服务器', link: '/examples/mock-server' },
            { text: 'NPM 包发布', link: '/examples/npm-publishing' },
          ]
        }
      ],
      '/advanced/': [
        {
          text: '高级功能',
          items: [
            { text: '拦截器系统', link: '/advanced/interceptors' },
            { text: '认证管理', link: '/advanced/authentication' },
            { text: '错误处理', link: '/advanced/error-handling' },
            { text: '重试机制', link: '/advanced/retry-logic' },
            { text: 'AI 文档转换', link: '/advanced/ai-docs' },
            { text: '自定义模板', link: '/advanced/custom-templates' },
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/CrazyMrYan/s2r' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 S2R Team'
    },

    search: {
      provider: 'local'
    },

    outline: {
      level: [2, 3],
      label: '页面导航'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium'
      }
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    lineNumbers: true
  }
})