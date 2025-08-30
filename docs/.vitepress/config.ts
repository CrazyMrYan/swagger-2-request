import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'S2R Documentation',
  description: 'Generate TypeScript API clients from OpenAPI documents',
  base: '/s2r/',
  
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3c82f6' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/getting-started' },
      { text: '示例', link: '/example' },
      { text: '核心', link: '/api/core' },
    ],
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