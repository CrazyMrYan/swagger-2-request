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

// 版本信息 - 从 package.json 读取
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let version = '0.1.0'; // 默认版本
try {
  const packageJsonPath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  version = packageJson.version;
} catch (error) {
  // 如果读取失败，使用默认版本
  console.warn('Warning: Could not read version from package.json, using default version');
}

export const VERSION = version;

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