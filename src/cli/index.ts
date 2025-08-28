#!/usr/bin/env node

/**
 * Swagger-2-Request CLI 工具
 * 支持代码生成、Mock 服务、NPM 发布等功能
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { VERSION } from '../index';
import { GenerateCommand } from './generate-command';
import { MockCommand } from './mock-command';
import { PublishCommand } from './publish-command';
import { AIDocsCommand } from './ai-docs-command';

const program = new Command();

// 设置基础信息
program
  .name('s2r')
  .description('Generate TypeScript API clients from Swagger/OpenAPI documents')
  .version(VERSION);

// generate 命令
program
  .command('generate')
  .alias('gen')
  .description('Generate TypeScript API client from Swagger document')
  .argument('<source>', 'Swagger document path or URL')
  .option('-o, --output <dir>', 'Output directory', './src/api')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--clean', 'Clean output directory before generation')
  .option('--types-only', 'Generate only TypeScript types')
  .option('--verbose', 'Enable verbose logging')
  .action(async (source, options) => {
    try {
      const generateCommand = new GenerateCommand();
      await generateCommand.execute(source, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Generation failed:'), errorMessage);
      process.exit(1);
    }
  });

// mock 命令
program
  .command('mock')
  .description('Start mock server from Swagger document')
  .argument('<source>', 'Swagger document path or URL')
  .option('-p, --port <number>', 'Server port', '3001')
  .option('-d, --delay <number>', 'Response delay in ms', '0')
  .option('--no-ui', 'Disable Swagger UI')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--verbose', 'Enable verbose logging')
  .action(async (source, options) => {
    try {
      const mockCommand = new MockCommand();
      await mockCommand.execute(source, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Mock server failed:'), errorMessage);
      process.exit(1);
    }
  });

// publish 命令
const publishCommand = new PublishCommand();
program.addCommand(publishCommand.createCommand());

// ai-docs 命令
const aiDocsCommand = new AIDocsCommand();
program.addCommand(aiDocsCommand.createCommand());



// validate 命令
program
  .command('validate')
  .description('Validate Swagger document')
  .argument('<source>', 'Swagger document path or URL')
  .option('-v, --verbose', 'Show detailed validation results')
  .action(async (source, _options) => {
    try {
      console.log(chalk.blue('✅ Validating Swagger document...'));
      console.log(chalk.gray(`Source: ${source}`));
      
      // TODO: 实现验证逻辑
      console.log(chalk.red('⚠️  Validate command not implemented yet'));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Validation failed:'), errorMessage);
      process.exit(1);
    }
  });

// 显示帮助信息
program.on('--help', () => {
  console.log('');
  console.log('Examples:');
  console.log('  $ s2r generate ./swagger.json -o ./src/api');
  console.log('  $ s2r mock https://api.example.com/swagger.json -p 3001');
  console.log('  $ s2r publish ./swagger.json -n @company/api-client');
  console.log('  $ s2r ai-docs ./swagger.json -o ./docs/api-ai.md');
  console.log('');
  console.log('For more information, visit: https://s2r.dev');
});

// 解析命令行参数
program.parse(process.argv);

// 如果没有提供任何命令，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}