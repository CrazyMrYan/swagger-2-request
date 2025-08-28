/**
 * NPM 包生成器
 * 负责生成完整的 NPM 包结构，包括源文件、配置文件、文档等
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  PackageConfig,
  PublishConfig,
  GeneratedPackage,
  GeneratedFile,
  BuildConfig,
  AdditionalFile,
  PackageValidationResult,
} from './types';
import type { ParsedSwagger, GenerationConfig } from '../types';
import { CodeGenerator } from '../core/code-generator';

export class PackageGenerator {
  private codeGenerator: CodeGenerator;

  constructor() {
    this.codeGenerator = new CodeGenerator();
  }

  /**
   * 生成完整的 NPM 包
   */
  async generatePackage(
    swagger: ParsedSwagger,
    config: PublishConfig
  ): Promise<GeneratedPackage> {
    const { outputDir, packageConfig } = config;

    // 创建包目录结构
    await this.ensureDirectoryExists(outputDir);

    // 生成源文件
    const sourceFiles = await this.generateSourceFiles(swagger, config);

    // 生成 package.json
    const packageJson = this.generatePackageJson(packageConfig, swagger);

    // 生成配置文件
    const configFiles = this.generateConfigFiles(config);

    // 生成文档文件
    const documentFiles = this.generateDocumentFiles(swagger, packageConfig);

    // 写入所有文件
    await this.writeFiles(outputDir, [
      { path: 'package.json', content: JSON.stringify(packageJson, null, 2), type: 'json' },
      ...sourceFiles,
      ...configFiles,
      ...documentFiles,
    ]);

    // 处理额外文件
    if (config.additionalFiles) {
      await this.processAdditionalFiles(outputDir, config.additionalFiles, {
        packageName: packageConfig.name,
        version: packageConfig.version,
        description: packageConfig.description,
        apiTitle: swagger.info.title,
        apiVersion: swagger.info.version,
      });
    }

    return {
      rootDir: outputDir,
      packageJson,
      sourceFiles,
      documentFiles,
      configFiles,
    };
  }

  /**
   * 生成源文件
   */
  private async generateSourceFiles(
    swagger: ParsedSwagger,
    config: PublishConfig
  ): Promise<GeneratedFile[]> {
    const generationConfig: GenerationConfig = {
      generateTypes: true,
      includeComments: true,
    };

    // 使用代码生成器生成 API 文件
    const apiFiles = this.codeGenerator.generateAPIClient(swagger, generationConfig);

    // 添加包装文件
    const wrapperFiles = this.generateWrapperFiles(swagger, config.packageConfig);

    return [...apiFiles, ...wrapperFiles];
  }

  /**
   * 生成包装文件
   */
  private generateWrapperFiles(
    swagger: ParsedSwagger,
    packageConfig: PackageConfig
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // 生成主入口文件
    files.push({
      path: 'src/index.ts',
      type: 'typescript',
      content: this.generateMainIndexFile(swagger, packageConfig),
    });

    // 生成版本信息文件
    files.push({
      path: 'src/version.ts',
      type: 'typescript',
      content: this.generateVersionFile(packageConfig, swagger),
    });

    // 生成 ESM 入口文件
    files.push({
      path: 'src/index.esm.ts',
      type: 'typescript',
      content: this.generateESMIndexFile(),
    });

    // 生成 CommonJS 入口文件
    files.push({
      path: 'src/index.cjs.ts',
      type: 'typescript',
      content: this.generateCJSIndexFile(),
    });

    return files;
  }

  /**
   * 生成主入口文件
   */
  private generateMainIndexFile(swagger: ParsedSwagger, packageConfig: PackageConfig): string {
    return `/**
 * ${packageConfig.name}
 * ${packageConfig.description}
 * 
 * API: ${swagger.info.title} v${swagger.info.version}
 * Package: v${packageConfig.version}
 * 
 * @author ${typeof packageConfig.author === 'string' ? packageConfig.author : packageConfig.author?.name || 'Unknown'}
 * @license ${packageConfig.license || 'MIT'}
 */

// 导出所有 API 函数
export * from './api';

// 导出类型定义
export * from './types';

// 导出客户端配置
export * from './client';

// 导出工具函数
export * from '../utils/api-utils';

// 导出拦截器系统
export * from '../interceptors';

// 导出版本信息
export { version, apiVersion } from './version';

// 默认导出客户端实例
export { apiClient as default } from './client';

/**
 * 创建新的 API 客户端实例
 */
export { APIClient } from './client';

/**
 * 创建带有自定义配置的客户端
 */
import { APIClient, type APIClientConfig } from './client';

export function createAPIClient(config?: APIClientConfig): APIClient {
  return new APIClient(config);
}`;
  }

  /**
   * 生成版本信息文件
   */
  private generateVersionFile(packageConfig: PackageConfig, swagger: ParsedSwagger): string {
    return `/**
 * 版本信息
 */

/** 包版本 */
export const version = '${packageConfig.version}';

/** API 版本 */
export const apiVersion = '${swagger.info.version}';

/** API 标题 */
export const apiTitle = '${swagger.info.title}';

/** 生成时间 */
export const generatedAt = '${new Date().toISOString()}';

/** 包信息 */
export const packageInfo = {
  name: '${packageConfig.name}',
  version: '${packageConfig.version}',
  description: '${packageConfig.description}',
  author: '${typeof packageConfig.author === 'string' ? packageConfig.author : packageConfig.author?.name || 'Unknown'}',
  license: '${packageConfig.license || 'MIT'}',
  generatedAt: '${new Date().toISOString()}',
  api: {
    title: '${swagger.info.title}',
    version: '${swagger.info.version}',
    description: '${swagger.info.description || ''}',
  },
} as const;`;
  }

  /**
   * 生成 ESM 入口文件
   */
  private generateESMIndexFile(): string {
    return `/**
 * ESM 入口文件
 */

export * from './index';`;
  }

  /**
   * 生成 CommonJS 入口文件
   */
  private generateCJSIndexFile(): string {
    return `/**
 * CommonJS 入口文件
 */

module.exports = require('./index');`;
  }

  /**
   * 生成 package.json
   */
  private generatePackageJson(
    packageConfig: PackageConfig,
    _swagger: ParsedSwagger
  ): any {
    const basePackageJson = {
      name: packageConfig.name,
      version: packageConfig.version,
      description: packageConfig.description,
      main: 'dist/index.cjs.js',
      module: 'dist/index.esm.js',
      types: 'dist/index.d.ts',
      exports: {
        '.': {
          import: './dist/index.esm.js',
          require: './dist/index.cjs.js',
          types: './dist/index.d.ts',
        },
        './package.json': './package.json',
      },
      files: packageConfig.files || [
        'dist/',
        'README.md',
        'CHANGELOG.md',
        'LICENSE',
      ],
      scripts: {
        build: 'tsup',
        test: 'vitest run',
        'test:watch': 'vitest',
        'type-check': 'tsc --noEmit',
        lint: 'eslint src --ext .ts,.tsx',
        'lint:fix': 'eslint src --ext .ts,.tsx --fix',
        prepublishOnly: 'npm run build && npm run test',
        ...packageConfig.scripts,
      },
      keywords: [
        'api',
        'client',
        'typescript',
        'swagger',
        'openapi',
        'rest',
        'http',
        'axios',
        ...(packageConfig.keywords || []),
      ],
      author: packageConfig.author,
      license: packageConfig.license || 'MIT',
      repository: packageConfig.repository,
      homepage: packageConfig.homepage,
      bugs: packageConfig.bugs,
      engines: {
        node: '>=16.0.0',
        npm: '>=8.0.0',
        ...packageConfig.engines,
      },
      dependencies: {
        axios: '^1.6.0',
        'lodash-es': '^4.17.21',
        ...packageConfig.dependencies,
      },
      devDependencies: {
        '@types/lodash-es': '^4.17.0',
        '@types/node': '^20.0.0',
        '@typescript-eslint/eslint-plugin': '^6.0.0',
        '@typescript-eslint/parser': '^6.0.0',
        eslint: '^8.0.0',
        tsup: '^7.2.0',
        typescript: '^5.2.0',
        vitest: '^0.34.0',
        ...packageConfig.devDependencies,
      },
      peerDependencies: packageConfig.peerDependencies,
    };

    // 如果是私有包，添加私有标识
    if (packageConfig.private) {
      basePackageJson.private = true;
    }

    // 如果指定了 NPM 注册表，添加发布配置
    if (packageConfig.registry) {
      basePackageJson.publishConfig = {
        registry: packageConfig.registry,
        access: packageConfig.access || 'public',
      };
    }

    return basePackageJson;
  }

  /**
   * 生成配置文件
   */
  private generateConfigFiles(config: PublishConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // TypeScript 配置
    files.push({
      path: 'tsconfig.json',
      type: 'json',
      content: JSON.stringify(this.generateTSConfig(), null, 2),
    });

    // tsup 构建配置
    files.push({
      path: 'tsup.config.ts',
      type: 'typescript',
      content: this.generateTsupConfig(config.buildConfig),
    });

    // ESLint 配置
    files.push({
      path: '.eslintrc.js',
      type: 'javascript',
      content: this.generateESLintConfig(),
    });

    // .gitignore
    files.push({
      path: '.gitignore',
      type: 'text',
      content: this.generateGitIgnore(),
    });

    // .npmignore
    files.push({
      path: '.npmignore',
      type: 'text',
      content: this.generateNpmIgnore(),
    });

    return files;
  }

  /**
   * 生成 TypeScript 配置
   */
  private generateTSConfig(): any {
    return {
      compilerOptions: {
        target: 'ES2020',
        module: 'ESNext',
        moduleResolution: 'node',
        lib: ['ES2020', 'DOM'],
        outDir: 'dist',
        rootDir: 'src',
        declaration: true,
        declarationMap: true,
        sourceMap: true,
        strict: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noUnusedLocals: false,
        noUnusedParameters: false,
        noImplicitReturns: true,
        noFallthroughCasesInSwitch: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts'],
    };
  }

  /**
   * 生成 tsup 配置
   */
  private generateTsupConfig(buildConfig?: BuildConfig): string {
    const config = {
      entry: buildConfig?.entry || 'src/index.ts',
      format: buildConfig?.format || ['cjs', 'esm'],
      dts: buildConfig?.generateDts !== false,
      clean: true,
      splitting: buildConfig?.splitting || false,
      minify: buildConfig?.minify || false,
      external: buildConfig?.external || ['axios', 'lodash-es'],
      outDir: 'dist',
      target: 'node16',
      ...buildConfig,
    };

    return `import { defineConfig } from 'tsup';

export default defineConfig(${JSON.stringify(config, null, 2)});`;
  }

  /**
   * 生成 ESLint 配置
   */
  private generateESLintConfig(): string {
    return `module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',
  },
  ignorePatterns: ['dist/', 'node_modules/', '*.config.js', '*.config.ts'],
};`;
  }

  /**
   * 生成 .gitignore
   */
  private generateGitIgnore(): string {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/
*.tsbuildinfo

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
*.temp

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
.coverage/

# Testing
.nyc_output/

# Cache
.cache/
.parcel-cache/
.next/
.nuxt/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity`;
  }

  /**
   * 生成 .npmignore
   */
  private generateNpmIgnore(): string {
    return `# Source files
src/
tests/
__tests__/

# Build tools
tsconfig.json
tsup.config.ts
.eslintrc.js
vitest.config.ts

# IDE
.vscode/
.idea/

# Git
.git/
.gitignore

# CI/CD
.github/
.gitlab-ci.yml
.travis.yml

# Documentation (except README)
docs/
*.md
!README.md

# Development dependencies
node_modules/
npm-debug.log*
yarn-debug.log*

# Testing
coverage/
.nyc_output/
*.test.ts
*.spec.ts

# Temporary files
*.tmp
*.temp
.cache/

# Environment
.env*`;
  }

  /**
   * 生成文档文件
   */
  private generateDocumentFiles(
    swagger: ParsedSwagger,
    packageConfig: PackageConfig
  ): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // README.md
    files.push({
      path: 'README.md',
      type: 'markdown',
      content: this.generateReadme(swagger, packageConfig),
    });

    // CHANGELOG.md
    files.push({
      path: 'CHANGELOG.md',
      type: 'markdown',
      content: this.generateChangelog(packageConfig),
    });

    // LICENSE
    if (packageConfig.license === 'MIT') {
      files.push({
        path: 'LICENSE',
        type: 'text',
        content: this.generateMITLicense(packageConfig),
      });
    }

    return files;
  }

  /**
   * 生成 README.md
   */
  private generateReadme(swagger: ParsedSwagger, packageConfig: PackageConfig): string {
    const authorName = typeof packageConfig.author === 'string' 
      ? packageConfig.author 
      : packageConfig.author?.name || 'Unknown';

    return `# ${packageConfig.name}

${packageConfig.description}

> 🤖 This package was automatically generated from [${swagger.info.title}](${swagger.servers?.[0]?.url || ''}) API documentation.

## Features

- 🎯 **Type-Safe**: Full TypeScript support with auto-generated types
- 🚀 **Modern**: Built with latest JavaScript/TypeScript features
- 🔧 **Flexible**: Configurable interceptors for auth, logging, retry, and error handling
- 📦 **Lightweight**: Minimal dependencies, tree-shakeable
- 🔄 **Smart Retry**: Built-in retry logic with exponential backoff
- 📊 **Logging**: Comprehensive request/response logging
- 🛡️ **Error Handling**: Unified error handling and transformation

## Installation

\`\`\`bash
npm install ${packageConfig.name}
\`\`\`

## Quick Start

\`\`\`typescript
import { ${swagger.paths[0]?.functionName || 'apiUsersGet'}, APIClient } from '${packageConfig.name}';

// Using generated API functions
const result = await ${swagger.paths[0]?.functionName || 'apiUsersGet'}();
console.log(result);

// Using client instance with custom configuration
const client = new APIClient({
  baseURL: 'https://your-api.com',
  preset: 'development', // or 'production'
});
\`\`\`

## Available API Functions

${swagger.paths.map(endpoint => {
  return `### \`${endpoint.functionName}\`

**${endpoint.method.toUpperCase()}** \`${endpoint.path}\`

${endpoint.description || endpoint.summary || 'No description available'}

\`\`\`typescript
import { ${endpoint.functionName} } from '${packageConfig.name}';

const result = await ${endpoint.functionName}(${this.generateFunctionExample(endpoint)});
\`\`\``;
}).join('\n\n')}

## Configuration

### Basic Configuration

\`\`\`typescript
import { APIClient } from '${packageConfig.name}';

const client = new APIClient({
  baseURL: 'https://api.example.com',
  timeout: 10000,
  headers: {
    'User-Agent': 'MyApp/1.0.0',
  },
});
\`\`\`

### Using Interceptors

\`\`\`typescript
import { 
  APIClient, 
  createAuthInterceptor,
  createRetryInterceptor,
  createLogInterceptors 
} from '${packageConfig.name}';

const client = new APIClient({
  baseURL: 'https://api.example.com',
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'bearer',
        token: 'your-jwt-token'
      }),
      createLogInterceptors({ logRequests: true }).request,
    ],
    response: [
      createRetryInterceptor({
        maxRetries: 3,
        delay: 1000,
        delayFactor: 2
      }),
      createLogInterceptors({ logResponses: true }).response,
    ]
  }
});
\`\`\`

### Preset Configurations

\`\`\`typescript
// Development mode - verbose logging, detailed errors
const devClient = new APIClient({ preset: 'development' });

// Production mode - minimal logging, error tracking
const prodClient = new APIClient({ preset: 'production' });

// Testing mode - fast retries, detailed logs
const testClient = new APIClient({ preset: 'testing' });

// Minimal mode - no extra features
const minimalClient = new APIClient({ preset: 'minimal' });
\`\`\`

## Authentication

### Bearer Token

\`\`\`typescript
import { globalAuthManager } from '${packageConfig.name}';

// Set globally
globalAuthManager.setBearerToken('your-jwt-token');

// Or per-client
const client = new APIClient({
  interceptors: {
    request: [
      createAuthInterceptor({
        type: 'bearer',
        token: 'your-jwt-token'
      })
    ]
  }
});
\`\`\`

### API Key

\`\`\`typescript
globalAuthManager.setApiKey('X-API-Key', 'your-api-key');
\`\`\`

### Basic Auth

\`\`\`typescript
globalAuthManager.setBasicAuth('username', 'password');
\`\`\`

## Error Handling

\`\`\`typescript
import { ${swagger.paths[0]?.functionName || 'apiUsersGet'} } from '${packageConfig.name}';

try {
  const result = await ${swagger.paths[0]?.functionName || 'apiUsersGet'}();
  console.log(result);
} catch (error) {
  if (error.code === 'NETWORK_ERROR') {
    console.error('Network issue:', error.message);
  } else if (error.status === 401) {
    console.error('Authentication required');
  } else {
    console.error('API error:', error);
  }
}
\`\`\`

## TypeScript Support

This package includes comprehensive TypeScript definitions:

\`\`\`typescript
import type { 
  APIClientConfig,
  ${swagger.components?.schemas ? Object.keys(swagger.components.schemas).join(',\n  ') : 'ApiResponse'}
} from '${packageConfig.name}';
\`\`\`

## API Information

- **API Name**: ${swagger.info.title}
- **API Version**: ${swagger.info.version}
- **Package Version**: ${packageConfig.version}
- **Generated**: ${new Date().toLocaleDateString()}

## License

${packageConfig.license || 'MIT'} © ${authorName}

## Support

${packageConfig.bugs?.url ? `Report issues: ${packageConfig.bugs.url}` : ''}
${packageConfig.repository?.url ? `Source code: ${packageConfig.repository.url}` : ''}
${packageConfig.homepage ? `Documentation: ${packageConfig.homepage}` : ''}`;
  }

  /**
   * 生成函数示例参数
   */
  private generateFunctionExample(endpoint: any): string {
    const params: string[] = [];
    
    // 路径参数
    const pathParams = endpoint.parameters?.filter((p: any) => p.in === 'path') || [];
    pathParams.forEach((param: any) => {
      if (param.schema?.type === 'string') {
        params.push(`'${param.name}-example'`);
      } else {
        params.push('123');
      }
    });

    // 查询参数
    const queryParams = endpoint.parameters?.filter((p: any) => p.in === 'query') || [];
    if (queryParams.length > 0) {
      params.push('{ /* query params */ }');
    }

    // 请求体
    if (endpoint.requestBody) {
      params.push('{ /* request data */ }');
    }

    return params.join(', ');
  }

  /**
   * 生成 CHANGELOG.md
   */
  private generateChangelog(packageConfig: PackageConfig): string {
    return `# Changelog

All notable changes to this project will be documented in this file.

## [${packageConfig.version}] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release
- Auto-generated API client from OpenAPI specification
- TypeScript support with full type definitions
- Interceptor system for auth, logging, retry, and error handling
- Multiple preset configurations for different environments
- Comprehensive documentation and examples

### Features
- 🎯 Type-safe API functions
- 🔧 Configurable interceptors
- 🔄 Smart retry mechanism
- 📊 Request/response logging
- 🛡️ Unified error handling
- 📦 Tree-shakeable exports
- 🚀 Modern ES modules support

---

This changelog is automatically generated. For more details, see the [commit history](${typeof packageConfig.repository === 'object' ? packageConfig.repository.url : ''}).`;
  }

  /**
   * 生成 MIT 许可证
   */
  private generateMITLicense(packageConfig: PackageConfig): string {
    const year = new Date().getFullYear();
    const authorName = typeof packageConfig.author === 'string' 
      ? packageConfig.author 
      : packageConfig.author?.name || 'Unknown';

    return `MIT License

Copyright (c) ${year} ${authorName}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
  }

  /**
   * 确保目录存在
   */
  private async ensureDirectoryExists(dirPath: string): Promise<void> {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  /**
   * 写入文件
   */
  private async writeFiles(
    baseDir: string,
    files: GeneratedFile[]
  ): Promise<void> {
    for (const file of files) {
      const filePath = path.join(baseDir, file.path);
      const fileDir = path.dirname(filePath);
      
      // 确保目录存在
      await this.ensureDirectoryExists(fileDir);
      
      // 写入文件
      await fs.writeFile(filePath, file.content, 'utf-8');
    }
  }

  /**
   * 处理额外文件
   */
  private async processAdditionalFiles(
    baseDir: string,
    additionalFiles: AdditionalFile[],
    templateVars: Record<string, any>
  ): Promise<void> {
    for (const file of additionalFiles) {
      try {
        let content = await fs.readFile(file.source, 'utf-8');
        
        // 如果是模板文件，处理模板变量
        if (file.template) {
          content = this.processTemplate(content, { ...templateVars, ...file.templateVars });
        }
        
        const destPath = path.join(baseDir, file.destination);
        const destDir = path.dirname(destPath);
        
        await this.ensureDirectoryExists(destDir);
        await fs.writeFile(destPath, content, 'utf-8');
      } catch (error) {
        console.warn(`Failed to process additional file ${file.source}:`, error);
      }
    }
  }

  /**
   * 处理模板变量
   */
  private processTemplate(template: string, vars: Record<string, any>): string {
    let result = template;
    
    for (const [key, value] of Object.entries(vars)) {
      const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
      result = result.replace(regex, String(value));
    }
    
    return result;
  }

  /**
   * 验证包配置
   */
  validatePackage(_packageDir: string): Promise<PackageValidationResult> {
    // 这里可以添加包验证逻辑
    // 检查必要文件、package.json 格式、依赖版本等
    return Promise.resolve({
      valid: true,
      errors: [],
      warnings: [],
    });
  }
}