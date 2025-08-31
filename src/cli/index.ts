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
import { CreateCommand } from './create-command';

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
  .argument('[source]', 'Swagger document path or URL (optional if specified in config file)')
  .option('-o, --output <dir>', 'Output directory (default: ./src/api)')
  .option('-c, --config <file>', 'Configuration file path')
  .option('--clean', 'Clean output directory before generation')
  .option('--types-only', 'Generate only TypeScript types')
  .option('--exclude <files>', 'Files to exclude from overwriting (comma-separated), supports wildcards')
  .option('-f, --force', 'Force overwrite all files, including client files')
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
  .argument('[source]', 'Swagger document path or URL (optional if specified in config file)')
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

// create 命令
program
  .command('create')
  .description('Create a publishable API client project')
  .argument('<package-name>', 'NPM package name for the API client')
  .argument('<swagger-source>', 'Swagger document path or URL')
  .option('-o, --output <dir>', 'Output directory (default: ./<package-name>)')
  .option('-t, --template <type>', 'Project template: basic or full', 'basic')
  .option('-r, --registry <url>', 'NPM registry URL')
  .option('--private', 'Create as private package')
  .option('-f, --force', 'Overwrite existing directory')
  .option('--verbose', 'Enable verbose logging')
  .action(async (packageName, swaggerSource, options) => {
    try {
      const createCommand = new CreateCommand();
      await createCommand.execute(packageName, swaggerSource, options);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Project creation failed:'), errorMessage);
      process.exit(1);
    }
  });

// init 命令
program
  .command('init')
  .description('Initialize .s2r.json configuration file')
  .option('-f, --force', 'Overwrite existing configuration file')
  .action(async (options) => {
    try {
      const generateCommand = new GenerateCommand();
      await generateCommand.initConfig(options.force);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Configuration initialization failed:'), errorMessage);
      process.exit(1);
    }
  });

// validate 命令
program
  .command('validate')
  .description('Validate Swagger document')
  .argument('[source]', 'Swagger document path or URL (optional if specified in config file)')
  .option('-v, --verbose', 'Show detailed validation results')
  .option('-c, --config <file>', 'Configuration file path')
  .action(async (source, options) => {
    try {
      const generateCommand = new GenerateCommand();
      
      // 获取 Swagger 源
       let swaggerSource = source;
       if (!swaggerSource) {
         // 从配置文件读取
         const config = await generateCommand.loadConfigPublic(options.config);
         swaggerSource = config.swagger?.source;
         
         if (!swaggerSource) {
           throw new Error('缺少 Swagger 文档源。请通过命令行参数指定或在配置文件中设置 swagger.source');
         }
       }
      
      const isValid = await generateCommand.validateSwagger(swaggerSource);
      
      if (isValid) {
        console.log(chalk.green('✅ Swagger document is valid'));
        process.exit(0);
      } else {
        console.log(chalk.red('❌ Swagger document is invalid'));
        process.exit(1);
      }
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
  console.log('  $ s2r create my-api-client https://api.example.com/swagger.json');
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