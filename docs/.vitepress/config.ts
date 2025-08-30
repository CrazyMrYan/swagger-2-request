import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'S2R Documentation',
  description: 'Generate TypeScript API clients from OpenAPI documents',
  base: '/swagger-2-request/',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: '配置说明', link: '/configuration' },
      { text: '脚本使用', link: '/scripts' },
      { text: '高级功能', link: '/advanced' },
      { text: '示例', link: '/example' },
    ],
    
    sidebar: {
      '/': [
        {
          text: '指南',
          items: [
            { text: '快速开始', link: '/getting-started' },
            { text: '配置说明', link: '/configuration' },
            { text: '脚本使用', link: '/scripts' }
          ]
        },
        {
          text: '进阶',
          items: [
            { text: '高级功能', link: '/advanced' },
            { text: '完整示例', link: '/example' }
          ]
        }
      ]
    },
    socialLinks: [
        { icon: 'github', link: 'https://github.com/yanjiahui/swagger-2-request' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025 CrazyMrYan'
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