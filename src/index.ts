/**
 * Swagger-2-Request - 主入口文件
 * 从 Swagger/OpenAPI 文档生成 TypeScript API 客户端
 */

export * from './types';
export * from './core/swagger-parser';
export * from './core/code-generator';
export * from './core/naming-strategy';
export * from './utils/parameter-filter';
export * from './mock-server/mock-server';

// 版本信息
export const VERSION = '0.1.0';

// 默认配置
export const DEFAULT_CONFIG = {
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod' as const,
    includeComments: true,
    generateTypes: true,
    cleanOutput: true,
  },
  runtime: {
    timeout: 10000,
    validateParams: true,
    filterParams: true,
  },
  mock: {
    enabled: false,
    port: 3001,
    delay: 0,
    ui: true,
  },
};