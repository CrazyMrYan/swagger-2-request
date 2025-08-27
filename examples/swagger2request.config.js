/**
 * Swagger-2-Request 配置文件示例
 * 复制此文件为 swagger2request.config.js 并根据需要修改
 */

module.exports = {
  // Swagger 源配置
  swagger: {
    source: './api-docs.json', // 支持文件路径或 URL
    version: '3.0.0'
  },

  // 代码生成配置
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod', // pathMethod | operationId
    includeComments: true,
    generateTypes: true,
    cleanOutput: true
  },

  // 运行时配置
  runtime: {
    baseURL: process.env.API_BASE_URL || 'https://api.example.com',
    timeout: 10000,
    validateParams: true,
    filterParams: true
  },

  // 拦截器配置
  interceptors: {
    request: [
      {
        name: 'auth',
        handler: './interceptors/auth.js'
      },
      {
        name: 'logger', 
        handler: './interceptors/logger.js'
      }
    ],
    response: [
      {
        name: 'errorHandler',
        handler: './interceptors/error.js'
      }
    ]
  },

  // Mock 服务配置
  mock: {
    enabled: true,
    port: 3001,
    delay: 200, // 模拟网络延迟（毫秒）
    ui: true,   // 启用 Swagger UI
    customResponses: './mock/custom-responses.json'
  },

  // NPM 包配置
  package: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'Generated API client for company APIs',
    repository: 'https://github.com/company/api-client',
    private: false,
    publishConfig: {
      registry: 'https://registry.npmjs.org' // 或私有 NPM 源
    }
  },

  // AI 友好文档配置
  aiDocs: {
    enabled: true,
    outputFormat: 'markdown', // markdown | json
    includeExamples: true,
    optimizeForSearch: true
  }
};