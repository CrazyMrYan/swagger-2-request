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
import type { GenerationConfig, S2RConfig } from '../types';

export interface GenerateOptions {
  output?: string;
  config?: string;
  clean?: boolean;
  typesOnly?: boolean;
  verbose?: boolean;
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
  async execute(source: string, options: GenerateOptions): Promise<void> {
    const spinner = ora('正在生成 API 客户端...').start();

    try {
      // 1. 加载配置
      const config = await this.loadConfig(options);
      
      if (options.verbose) {
        console.log(chalk.gray('配置：'), config);
      }

      // 2. 解析 Swagger 文档
      spinner.text = '正在解析 Swagger 文档...';
      const parsedSwagger = await this.analyzer.parseSwagger(source);
      
      if (options.verbose) {
        console.log(chalk.gray(`发现 ${parsedSwagger.paths.length} 个 API 端点`));
      }

      // 3. 清理输出目录
      if (config.generation.cleanOutput) {
        spinner.text = '正在清理输出目录...';
        await this.cleanOutputDirectory(config.generation.outputDir);
      }

      // 4. 生成代码文件
      spinner.text = '正在生成代码文件...';
      const generatedFiles = this.generator.generateAPIClient(parsedSwagger, config.generation);

      // 5. 写入文件
      spinner.text = '正在写入文件...';
      await this.writeFiles(generatedFiles, config.generation.outputDir);

      // 6. 生成工具文件
      await this.generateUtilsFile(config.generation.outputDir);

      spinner.succeed(chalk.green('✅ API 客户端生成成功！'));

      // 显示生成统计
      console.log('');
      console.log(chalk.blue('📊 生成统计：'));
      console.log(chalk.gray(`  📁 输出目录：${config.generation.outputDir}`));
      console.log(chalk.gray(`  📄 生成文件：${generatedFiles.length + 1} 个`));
      console.log(chalk.gray(`  🔧 API 端点：${parsedSwagger.paths.length} 个`));
      console.log(chalk.gray(`  📦 Schema 类型：${Object.keys(parsedSwagger.components.schemas || {}).length} 个`));

      // 显示生成的文件列表
      console.log('');
      console.log(chalk.blue('📝 生成的文件：'));
      generatedFiles.forEach(file => {
        console.log(chalk.gray(`  ✓ ${path.join(config.generation.outputDir, file.path)}`));
      });
      console.log(chalk.gray(`  ✓ ${path.join(config.generation.outputDir, 'utils.ts')}`));

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
  private async loadConfig(options: GenerateOptions): Promise<{ generation: GenerationConfig }> {
    let config: Partial<S2RConfig> = {};

    // 从配置文件加载
    if (options.config) {
      try {
        const configPath = path.resolve(options.config);
        const configContent = await fs.readFile(configPath, 'utf-8');
        
        if (configPath.endsWith('.json')) {
          config = JSON.parse(configContent);
        } else {
          // 动态导入 JS 配置文件
          const configModule = await import(configPath);
          config = configModule.default || configModule;
        }
      } catch (error) {
        console.warn(chalk.yellow(`⚠️  无法加载配置文件 ${options.config}，使用默认配置`));
      }
    }

    // 合并命令行选项
    const generation: GenerationConfig = {
      outputDir: options.output || config.generation?.outputDir || './src/api',
      typescript: config.generation?.typescript ?? true,
      functionNaming: config.generation?.functionNaming || 'pathMethod',
      includeComments: config.generation?.includeComments ?? true,
      generateTypes: options.typesOnly ? false : (config.generation?.generateTypes ?? true),
      cleanOutput: options.clean ?? (config.generation?.cleanOutput ?? false),
    };

    return { generation };
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
   * 写入文件
   */
  private async writeFiles(files: Array<{ path: string; content: string }>, outputDir: string): Promise<void> {
    // 确保输出目录存在
    await fs.mkdir(outputDir, { recursive: true });

    // 写入每个文件
    for (const file of files) {
      const filePath = path.join(outputDir, file.path);
      await fs.writeFile(filePath, file.content, 'utf-8');
    }
  }

  /**
   * 生成工具文件
   */
  private async generateUtilsFile(outputDir: string): Promise<void> {
    const utilsContent = `/**
 * 生成的 API 客户端工具函数
 */

/**
 * 根据允许的键过滤查询参数
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

  // 移除 undefined, null, 空字符串的值
  return Object.fromEntries(
    Object.entries(filtered).filter(([, value]) => {
      if (value === undefined || value === null) {
        return false;
      }
      if (typeof value === 'string' && value.trim() === '') {
        return false;
      }
      return true;
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

    const filePath = path.join(outputDir, 'utils.ts');
    await fs.writeFile(filePath, utilsContent, 'utf-8');
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
}