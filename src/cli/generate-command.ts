/**
 * CLI Generate 命令实现
 * 实现完整的代码生成流程
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { SwaggerAnalyzer } from '../core/swagger-parser';
import { CodeGenerator } from '../core/code-generator';
import type { GenerationConfig, RuntimeConfig, S2RConfig } from '../types';

export interface GenerateOptions {
  output?: string;
  config?: string;
  clean?: boolean;
  typesOnly?: boolean;
  verbose?: boolean;
  exclude?: string | string[];
  force?: boolean;
}

export class GenerateCommand {
  private analyzer: SwaggerAnalyzer;
  private generator: CodeGenerator;

  constructor() {
    this.analyzer = new SwaggerAnalyzer();
    this.generator = new CodeGenerator();
  }

  /**
   * 执行代码生成命令
   */
  async execute(source: string | undefined, options: GenerateOptions): Promise<void> {
    const spinner = ora('正在生成 API 客户端...').start();

    try {
      // 1. 加载配置
      const config = await this.loadConfig(options);
      
      // 2. 确定 Swagger 文档源
      const swaggerSource = source || config.swagger?.source;
      if (!swaggerSource) {
        spinner.fail(chalk.red('❌ 缺少 Swagger 文档源'));
        console.error(chalk.red('请通过以下方式之一指定 Swagger 文档源：'));
        console.error(chalk.gray('  1. 命令行参数: s2r generate <source>'));
        console.error(chalk.gray('  2. 配置文件: 在 .s2r.json 中设置 swagger.source'));
        throw new Error('missing required argument \'source\'');
      }
      
      if (options.verbose) {
        console.log(chalk.gray('配置：'), config);
        console.log(chalk.gray('Swagger 源：'), swaggerSource);
      }

      // 3. 解析 Swagger 文档
      spinner.text = '正在解析 Swagger 文档...';
      const parsedSwagger = await this.analyzer.parseSwagger(swaggerSource);
      
      if (options.verbose) {
        console.log(chalk.gray(`发现 ${parsedSwagger.paths.length} 个 API 端点`));
      }

      // 4. 清理输出目录
      if (config.generation.cleanOutput) {
        spinner.text = '正在清理输出目录...';
        await this.cleanOutputDirectory(config.generation.outputDir);
      }

      // 5. 生成代码
      spinner.text = '正在生成代码...';
      const generatedFiles = this.generator.generateAPIClient(parsedSwagger, config.generation, config.runtime);

      // 6. 写入文件
      spinner.text = '正在写入文件...';
      const writtenFiles = await this.writeFiles(generatedFiles, config.generation.outputDir, config.generation);

      // 7. 生成工具文件
      await this.generateUtilsFile(config.generation.outputDir, config.generation);

      spinner.succeed(chalk.green('✅ API 客户端生成成功！'));

      // 显示生成统计
      console.log('');
      console.log(chalk.blue('📊 生成统计：'));
      console.log(chalk.gray(`  📁 输出目录：${config.generation.outputDir}`));
      console.log(chalk.gray(`  📄 生成文件：${writtenFiles.length + 1} 个`));
      console.log(chalk.gray(`  🔧 API 端点：${parsedSwagger.paths.length} 个`));
      console.log(chalk.gray(`  📦 Schema 类型：${Object.keys(parsedSwagger.components.schemas || {}).length} 个`));

      // 显示生成的文件列表
      console.log('');
      console.log(chalk.blue('📝 生成的文件：'));
      writtenFiles.forEach(file => {
        console.log(chalk.gray(`  ✓ ${path.join(config.generation.outputDir, file.path)}`));
      });
      const fileExtension = 'ts';
      console.log(chalk.gray(`  ✓ ${path.join(config.generation.outputDir, `utils.${fileExtension}`)}`));

      console.log('');
      console.log(chalk.green('🎉 代码生成完成！现在你可以导入并使用生成的 API 函数了。'));

    } catch (error) {
      spinner.fail(chalk.red('❌ 代码生成失败'));
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('错误详情：'), errorMessage);
      
      if (options.verbose && error instanceof Error && error.stack) {
        console.error(chalk.gray('堆栈信息：'));
        console.error(chalk.gray(error.stack));
      }

      throw error;
    }
  }

  /**
   * 加载配置文件
   */
  private async loadConfig(options: GenerateOptions): Promise<{ generation: GenerationConfig; runtime?: RuntimeConfig; swagger?: { source?: string; version?: string } }> {
    let config: Partial<S2RConfig> = {};

    // 确定配置文件路径
    let configPath: string | null = null;
    
    if (options.config) {
      // 使用命令行指定的配置文件
      configPath = path.resolve(options.config);
    } else {
      // 自动查找 .s2r.json 配置文件
      const defaultConfigPath = path.resolve('.s2r.json');
      if (await this.fileExists(defaultConfigPath)) {
        configPath = defaultConfigPath;
      }
    }

    // 从配置文件加载
    if (configPath) {
      try {
        if (configPath.endsWith('.json')) {
          const configContent = await fs.readFile(configPath, 'utf-8');
          config = JSON.parse(configContent);
        } else {
          // 动态导入 JS 配置文件
          const configModule = await import(configPath);
          config = configModule.default || configModule;
        }
        
        if (options.verbose) {
          console.log(chalk.blue(`📄 使用配置文件: ${configPath}`));
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  无法加载配置文件 ${configPath}，使用默认配置`));
        if (options.verbose) {
          console.error(error);
        }
      }
    }

    // 合并命令行选项
    const generation: GenerationConfig = {
      outputDir: options.output || config.generation?.outputDir || './src/api',
      functionNaming: config.generation?.functionNaming || 'pathMethod',
      includeComments: config.generation?.includeComments ?? true,
      generateTypes: options.typesOnly ? false : (config.generation?.generateTypes ?? true),
      cleanOutput: options.clean ?? (config.generation?.cleanOutput ?? false),
      excludeFiles: this.parseExcludeOption(options.exclude) ?? (config.generation?.excludeFiles ?? []),
      forceOverride: options.force ?? (config.generation?.forceOverride ?? false),
    };

    return { 
      generation,
      runtime: config.runtime,
      swagger: config.swagger 
    };
  }

  /**
   * 解析排除文件选项
   */
  private parseExcludeOption(exclude?: string | string[]): string[] | undefined {
    if (exclude === undefined) return undefined;
    if (typeof exclude === 'string') {
      return exclude.split(',').map(f => f.trim()).filter(f => f.length > 0);
    }
    if (Array.isArray(exclude)) {
      return exclude;
    }
    return [];
  }

  /**
   * 清理输出目录
   */
  private async cleanOutputDirectory(outputDir: string): Promise<void> {
    try {
      const stats = await fs.stat(outputDir);
      if (stats.isDirectory()) {
        const files = await fs.readdir(outputDir);
        
        // 只删除我们生成的文件类型
        const filesToDelete = files.filter(file => 
          file.endsWith('.ts') || file.endsWith('.js') || file.endsWith('.d.ts')
        );

        for (const file of filesToDelete) {
          await fs.unlink(path.join(outputDir, file));
        }
      }
    } catch (error) {
      // 目录不存在或无法访问，忽略错误
    }
  }

  /**
   * 检查文件是否存在
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 判断是否应该覆盖文件
   */
  private shouldOverrideFile(filePath: string, fileExists: boolean, config: GenerationConfig): boolean {
    if (!fileExists) return true; // 文件不存在，直接创建
    
    const fileName = path.basename(filePath);
    
    // 特殊处理 client 文件：如果存在且未开启强制覆盖，则跳过
    if (fileName === 'client.ts' || fileName === 'client.js') {
      if (!config.forceOverride) {
        return false; // 不覆盖 client 文件
      }
    }
    
    // 检查文件是否在排除列表中
    const isExcluded = config.excludeFiles.some(pattern => {
      // 支持简单的通配符匹配
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'));
        return regex.test(fileName) || regex.test(filePath);
      }
      return fileName === pattern || filePath.includes(pattern);
    });
    
    return !isExcluded; // 不在排除列表中的文件可以覆盖
  }

  /**
   * 写入文件
   */
  private async writeFiles(files: Array<{ path: string; content: string }>, outputDir: string, config: GenerationConfig): Promise<Array<{ path: string; content: string }>> {
    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true });

    const writtenFiles: Array<{ path: string; content: string }> = [];

    // 写入每个文件
    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      
      // 检查文件是否存在
      const fileExists = await this.fileExists(filePath);
      
      // 判断是否应该覆盖文件
      const shouldOverride = this.shouldOverrideFile(file.path, fileExists, config);
      
      if (shouldOverride) {
        await fs.writeFile(filePath, file.content, 'utf-8');
        console.log(chalk.green(`✓ ${fileExists ? '覆盖' : '创建'} ${file.path}`));
        writtenFiles.push(file);
      } else if (fileExists) {
        console.log(chalk.yellow(`⚠ 跳过已存在的文件: ${file.path}`));
      } else {
        await fs.writeFile(filePath, file.content, 'utf-8');
        console.log(chalk.green(`✓ 创建 ${file.path}`));
        writtenFiles.push(file);
      }
    }

    return writtenFiles;
  }

  /**
   * 生成工具文件
   */
  private async generateUtilsFile(outputDir: string, config: GenerationConfig): Promise<void> {
    const utilsContent = `/**
 * 生成的 API 客户端工具函数
 */

/**
 * 根据允许的键过滤查询参数，并处理数组参数
 */
export function filterQueryParams(
  params: Record<string, any>,
  allowedKeys: string[] = []
): Record<string, any> {
  if (!params || typeof params !== 'object') {
    return {};
  }

  let filtered = params;

  // 如果指定了允许的键，则只保留这些键
  if (allowedKeys.length > 0) {
    const result: Record<string, any> = {};
    allowedKeys.forEach(key => {
      if (key in params) {
        result[key] = params[key];
      }
    });
    filtered = result;
  }

  // 移除 undefined, null, 空字符串的值，并处理数组参数
  return Object.fromEntries(
    Object.entries(filtered)
      .filter(([, value]) => {
        if (value === undefined || value === null) {
          return false;
        }
        if (typeof value === 'string' && value.trim() === '') {
          return false;
        }
        if (Array.isArray(value) && value.length === 0) {
          return false;
        }
        return true;
      })
      .map(([key, value]) => {
        // 将数组参数转换为逗号分隔的字符串
        if (Array.isArray(value)) {
          return [key, value.join(',')];
        }
        return [key, value];
      })
  );
}

/**
 * 验证请求体数据
 */
export function validateRequestBody<T = any>(
  data: any,
  schema?: any
): T {
  if (!data) {
    return data;
  }

  // 基础验证 - 确保数据是有效的对象
  if (schema && schema.type === 'object' && typeof data !== 'object') {
    throw new Error('Request body must be an object');
  }

  return data;
}

/**
 * 创建请求配置
 */
export function createRequestConfig(
  method: string,
  url: string,
  options: {
    params?: Record<string, any>;
    data?: any;
    headers?: Record<string, string>;
    timeout?: number;
    signal?: AbortSignal;
  } = {}
): any {
  const config: any = {
    method: method.toUpperCase(),
    url,
    ...options,
  };

  // 过滤查询参数
  if (config.params) {
    config.params = filterQueryParams(config.params);
  }

  return config;
}

/**
 * 处理 API 错误
 */
export function handleApiError(error: any): Error {
  if (error.response) {
    // 服务器响应错误
    const message = error.response.data?.message || error.response.statusText || 'API request failed';
    const apiError = new Error(message);
    (apiError as any).status = error.response.status;
    (apiError as any).data = error.response.data;
    return apiError;
  } else if (error.request) {
    // 网络错误
    return new Error('Network error: Unable to reach the server');
  } else {
    // 其他错误
    return new Error(error.message || 'An unknown error occurred');
  }
}

/**
 * 创建查询字符串
 */
export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}
`;

    const fileExtension = 'ts';
    const filePath = path.join(outputDir, `utils.${fileExtension}`);
    await fs.writeFile(filePath, utilsContent, 'utf-8');
  }

  /**
   * 初始化配置文件
   */
  async initConfig(force: boolean = false): Promise<void> {
    const configPath = path.resolve('.s2r.json');
    
    // 检查文件是否已存在
    if (!force && await this.fileExists(configPath)) {
      console.log(chalk.yellow('⚠️  配置文件 .s2r.json 已存在，使用 --force 参数强制覆盖'));
      return;
    }
    
    const configTemplate = {
      "_comment": "S2R 配置文件 - 更多配置选项请参考: https://crazymryan.github.io/swagger-2-request/",
      
      // Swagger 文档配置
      "swagger": {
        "source": "./swagger.json",
        "version": "3.0"
      },
      
      // 代码生成配置
      "generation": {
        "outputDir": "./src/api",
        "functionNaming": "pathMethod",
        "includeComments": true,
        "generateTypes": true,
        "cleanOutput": false,
        "excludeFiles": [],
        "forceOverride": false
      },
      
      // 运行时配置
      "runtime": {
        "baseURL": "https://api.example.com",
        "timeout": 10000,
        "validateParams": true,
        "filterParams": true
      },
      
      // Mock 服务配置
      "mock": {
        "enabled": true,
        "port": 3001,
        "delay": 0,
        "enableUI": true,
        "customResponses": "./mock-responses"
      },
      
      // 拦截器配置
      "interceptors": {
        "request": {
          "enabled": true
        },
        "response": {
          "enabled": true
        }
      },
      
      // NPM 包配置
      "package": {
        "name": "@company/api-client",
        "version": "1.0.0",
        "description": "Generated API client",
        "repository": "https://github.com/company/api-client",
        "private": false,
        "publishConfig": {
          "registry": "https://registry.npmjs.org"
        }
      },
      
      // AI 文档生成配置
      "aiDocs": {
        "enabled": true,
        "format": "markdown",
        "includeExamples": true,
        "optimizeForSearch": true,
        "includeCodeExamples": true,
        "generateTOC": true,
        "language": "zh",
        "verbosity": "normal",
        "outputDir": "./docs",
        "filename": "api-docs.md"
      }
    };
    
    await fs.writeFile(configPath, JSON.stringify(configTemplate, null, 2), 'utf-8');
    console.log(chalk.green('✅ 配置文件 .s2r.json 已生成'));
    console.log(chalk.blue('📖 配置文档: https://crazymryan.github.io/swagger-2-request/'));
  }

  /**
   * 验证 Swagger 文档
   */
  async validateSwagger(source: string): Promise<boolean> {
    try {
      return await this.analyzer.validateSwagger(source);
    } catch (error) {
      return false;
    }
  }

  /**
   * 公共配置加载方法，用于其他命令
   */
  async loadConfigPublic(configPath?: string): Promise<Partial<S2RConfig>> {
    let config: Partial<S2RConfig> = {};

    // 确定配置文件路径
    let resolvedConfigPath: string | null = null;
    
    if (configPath) {
      // 使用命令行指定的配置文件
      resolvedConfigPath = path.resolve(configPath);
    } else {
      // 自动查找 .s2r.json 配置文件
      const defaultConfigPath = path.resolve('.s2r.json');
      if (await this.fileExists(defaultConfigPath)) {
        resolvedConfigPath = defaultConfigPath;
      }
    }

    // 从配置文件加载
    if (resolvedConfigPath) {
      try {
        if (resolvedConfigPath.endsWith('.json')) {
          const configContent = await fs.readFile(resolvedConfigPath, 'utf-8');
          config = JSON.parse(configContent);
        } else {
          // 动态导入 JS 配置文件
          const configModule = await import(resolvedConfigPath);
          config = configModule.default || configModule;
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  无法加载配置文件 ${resolvedConfigPath}，使用默认配置`));
      }
    }

    return config;
  }
}