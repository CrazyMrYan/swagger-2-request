/**
 * CLI Mock 命令实现
 * 启动 Mock 服务器，集成 Swagger UI
 */

import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs/promises';
import * as path from 'path';
import { MockServer } from '../mock-server/mock-server';
import { SwaggerAnalyzer } from '../core/swagger-parser';
import type { S2RConfig } from '../types';

export interface MockOptions {
  port?: string;
  delay?: string;
  ui?: boolean;
  config?: string;
  verbose?: boolean;
}

export class MockCommand {
  private analyzer: SwaggerAnalyzer;

  constructor() {
    this.analyzer = new SwaggerAnalyzer();
  }

  /**
   * 执行 Mock 服务器命令
   */
  async execute(source: string | undefined, options: MockOptions): Promise<void> {
    const spinner = ora('正在启动 Mock 服务器...').start();

    try {
      // 1. 获取 Swagger 源
      let swaggerSource = source;
      if (!swaggerSource) {
        // 从配置文件读取
        const config = await this.loadConfig(options.config);
        swaggerSource = config.swagger?.source;
        
        if (!swaggerSource) {
          throw new Error('缺少 Swagger 文档源。请通过命令行参数指定或在配置文件中设置 swagger.source');
        }
      }
      
      // 2. 解析选项
      const port = parseInt(options.port || '3001', 10);
      const delay = parseInt(options.delay || '0', 10);

      if (options.verbose) {
        console.log(chalk.gray('Mock 服务器配置：'));
        console.log(chalk.gray(`  源文件: ${swaggerSource}`));
        console.log(chalk.gray(`  端口: ${port}`));
        console.log(chalk.gray(`  延迟: ${delay}ms`));
        console.log(chalk.gray(`  UI: ${options.ui !== false ? '启用' : '禁用'}`));
      }

      // 创建并启动 Mock 服务器
      const mockServer = new MockServer({
        port,
        delay,
        ui: options.ui !== false,
        cors: true,
      });

      spinner.text = '正在解析 Swagger 文档...';
      await mockServer.start(swaggerSource);

      spinner.succeed(chalk.green('✅ Mock 服务器启动成功！'));

      // 显示服务信息
      console.log('');
      console.log(chalk.blue('🎭 Mock 服务器信息：'));
      console.log(chalk.gray(`  🌐 服务地址: http://localhost:${port}`));
      console.log(chalk.gray(`  📖 Swagger UI: http://localhost:${port}/docs`));
      console.log(chalk.gray(`  💚 健康检查: http://localhost:${port}/health`));
      console.log(chalk.gray(`  ℹ️  API 信息: http://localhost:${port}/api-info`));

      if (delay > 0) {
        console.log(chalk.gray(`  ⏱️  响应延迟: ${delay}ms`));
      }

      console.log('');
      console.log(chalk.green('🚀 Mock 服务器正在运行...'));
      console.log(chalk.gray('按 Ctrl+C 停止服务器'));

      // 保持进程运行
      process.on('SIGINT', () => {
        console.log('');
        console.log(chalk.yellow('🛑 正在停止 Mock 服务器...'));
        process.exit(0);
      });

    } catch (error) {
      spinner.fail(chalk.red('❌ Mock 服务器启动失败'));
      
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
  private async loadConfig(configPath?: string): Promise<Partial<S2RConfig>> {
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
}