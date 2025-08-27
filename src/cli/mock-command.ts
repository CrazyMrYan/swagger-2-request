/**
 * CLI Mock 命令实现
 * 启动 Mock 服务器，集成 Swagger UI
 */

import chalk from 'chalk';
import ora from 'ora';
import { MockServer } from '../mock-server/mock-server';

export interface MockOptions {
  port?: string;
  delay?: string;
  ui?: boolean;
  config?: string;
  verbose?: boolean;
}

export class MockCommand {
  /**
   * 执行 Mock 服务器命令
   */
  async execute(source: string, options: MockOptions): Promise<void> {
    const spinner = ora('正在启动 Mock 服务器...').start();

    try {
      // 解析选项
      const port = parseInt(options.port || '3001', 10);
      const delay = parseInt(options.delay || '0', 10);

      if (options.verbose) {
        console.log(chalk.gray('Mock 服务器配置：'));
        console.log(chalk.gray(`  源文件: ${source}`));
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
      await mockServer.start(source);

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
}