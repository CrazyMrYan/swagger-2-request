/**
 * 发布配置文件
 * 用于自定义发布行为和设置
 */

export default {
  // 基本包信息
  package: {
    // 包名（如果不指定，将从swagger.info.title生成）
    name: '@yjh1102/swagger-2-request',
    
    // 版本号（如果不指定，将自动递增）
    version: '0.1.0',
    
    // 包描述
    description: 'Generate TypeScript API clients from Swagger/OpenAPI documents with built-in axios, mock server, and AI-friendly documentation',
    
    // 作者信息
    author: {
      name: 'CrazyMrYan',
      email: 'crazymryan@gmail.com',
      url: 'https://github.com/CrazyMrYan/swagger-2-request'
    },
    
    // 许可证
    license: 'MIT',
    
    // 主页
    homepage: 'https://github.com/CrazyMrYan/swagger-2-request',
    
    // 仓库信息
    repository: {
      type: 'git',
      url: 'https://github.com/CrazyMrYan/swagger-2-request'
    },
    
    // 关键词
    keywords: [
      'swagger',
      'openapi',
      'typescript',
      'api-client',
      'code-generator',
      'mock-server',
      'axios'
    ],
    
    // NPM注册表设置
    registry: 'https://registry.npmjs.org',
    
    // 发布标签
    tag: 'latest',
    
    // 访问级别
    access: 'public',
    
    // 是否为私有包
    private: false
  },
  
  // 发布流程配置
  publish: {
    // 是否在发布前运行构建
    build: true,
    
    // 是否在发布前运行测试
    runTests: true,
    
    // 是否实际发布到NPM
    publish: true,
    
    // 干运行模式
    dryRun: false,
    
    // 发布前的钩子命令
    prePublishHooks: [
      'pnpm run lint',
      'pnpm run typecheck'
    ],
    
    // 发布后的钩子命令
    postPublishHooks: [
      // 'echo "Package published successfully"'
    ]
  },
  
  // 版本管理配置
  version: {
    // 默认版本类型
    defaultType: 'patch',
    
    // 版本标签前缀
    tagPrefix: 'v',
    
    // 是否自动创建Git标签
    createGitTag: true,
    
    // 是否自动推送Git标签
    pushGitTag: true,
    
    // 提交消息模板
    commitMessage: 'chore: bump version to {{version}}'
  },
  
  // 预设配置
  presets: {
    // 开发环境预设
    development: {
      build: true,
      runTests: true,
      publish: false,
      dryRun: true
    },
    
    // 测试环境预设
    testing: {
      build: true,
      runTests: true,
      publish: true,
      dryRun: true,
      tag: 'beta'
    },
    
    // 生产环境预设
    production: {
      build: true,
      runTests: true,
      publish: true,
      dryRun: false,
      tag: 'latest'
    },
    
    // Beta预设
    beta: {
      build: true,
      runTests: true,
      publish: true,
      dryRun: false,
      tag: 'beta'
    },
    
    // Alpha预设
    alpha: {
      build: true,
      runTests: true,
      publish: true,
      dryRun: false,
      tag: 'alpha'
    }
  },
  
  // 文件包含/排除配置
  files: {
    // 包含的文件和目录
    include: [
      'dist',
      'templates',
      'README.md',
      'LICENSE',
      'package.json'
    ],
    
    // 排除的文件和目录
    exclude: [
      'src',
      'tests',
      'scripts',
      '.git',
      '.github',
      'node_modules',
      '*.test.*',
      '*.spec.*',
      'coverage',
      '.coverage',
      '.nyc_output',
      '.env*',
      'tsconfig.json',
      'vitest.config.ts',
      'tsup.config.ts'
    ]
  },
  
  // 注册表配置
  registries: {
    // NPM官方注册表
    npm: 'https://registry.npmjs.org',
    
    // 私有注册表示例
    private: 'https://npm.your-company.com',
    
    // 测试注册表
    test: 'http://localhost:4873'
  },
  
  // 通知配置
  notifications: {
    // 是否启用通知
    enabled: false,
    
    // 通知方式
    methods: {
      // 邮件通知
      email: {
        enabled: false,
        recipients: ['team@example.com']
      },
      
      // Webhook通知
      webhook: {
        enabled: false,
        url: 'https://hooks.slack.com/your-webhook-url'
      }
    }
  }
};