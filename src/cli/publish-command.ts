/**
 * CLI 发布命令
 * 支持生成和发布 NPM 包
 */

import { Command } from 'commander';
import * as fs from 'fs/promises';
import chalk from 'chalk';
import ora from 'ora';
import { SwaggerAnalyzer } from '../core/swagger-parser';
import { 
  PackagePublisher, 
  packageNameUtils, 
  versionUtils,
  publishPresets,
  defaultPackageConfig,
  type PublishConfig,
  type PackageConfig 
} from '../publisher';

export class PublishCommand {
  private analyzer: SwaggerAnalyzer;
  private publisher: PackagePublisher;

  constructor() {
    this.analyzer = new SwaggerAnalyzer();
    this.publisher = new PackagePublisher();
  }

  /**
   * 创建发布命令
   */
  createCommand(): Command {
    const command = new Command('publish');

    command
      .description('生成并发布 NPM 包')
      .argument('<swagger>', 'Swagger JSON 文件路径或 URL')
      .option('-o, --output <dir>', '输出目录', './package')
      .option('-n, --name <name>', '包名称')
      .option('-v, --version <version>', '包版本', '1.0.0')
      .option('-d, --description <desc>', '包描述')
      .option('-a, --author <author>', '作者信息')
      .option('-l, --license <license>', '许可证', 'MIT')
      .option('-r, --registry <url>', 'NPM 注册表 URL')
      .option('-t, --tag <tag>', '发布标签', 'latest')
      .option('--access <level>', '访问级别', 'public')
      .option('--preset <preset>', '预设配置', 'development')
      .option('--no-build', '跳过构建步骤')
      .option('--no-test', '跳过测试步骤')
      .option('--no-publish', '仅生成包，不发布')
      .option('--dry-run', '干运行模式')
      .option('--private', '私有包')
      .option('--config <file>', '配置文件路径')
      .option('--preview', '仅预览包信息')
      .action(async (swaggerPath, options) => {
        await this.handlePublish(swaggerPath, options);
      });

    return command;
  }

  /**
   * 处理发布命令
   */
  private async handlePublish(swaggerPath: string, options: any): Promise<void> {
    const spinner = ora('开始处理发布请求...').start();

    try {
      // 1. 解析 Swagger 文档
      spinner.text = '解析 Swagger 文档...';
      const swagger = await this.analyzer.parseSwagger(swaggerPath);
      spinner.succeed('✅ Swagger 文档解析成功');

      // 2. 构建配置
      const config = await this.buildPublishConfig(swagger, options);
      
      // 3. 如果是预览模式
      if (options.preview) {
        await this.showPreview(swagger, config);
        return;
      }

      // 4. 开始发布流程
      spinner.start('开始发布流程...');
      const result = await this.publisher.publishPackage(swagger, config);

      // 5. 显示结果
      if (result.success) {
        console.log(chalk.green('\\n🎉 包发布成功！\\n'));
        this.displaySuccessInfo(result);
      } else {
        console.log(chalk.red('\\n❌ 包发布失败！\\n'));
        console.error(chalk.red(result.error));
      }

      // 显示详细日志
      if (result.logs.length > 0) {
        console.log(chalk.gray('\\n📋 详细日志:'));
        result.logs.forEach(log => console.log(chalk.gray(`  ${log}`)));
      }

    } catch (error: any) {
      spinner.fail(`❌ 发布失败: ${error.message}`);
      console.error(chalk.red(error.stack));
    }
  }

  /**
   * 构建发布配置
   */
  private async buildPublishConfig(swagger: any, options: any): Promise<PublishConfig> {
    let packageConfig: PackageConfig = { ...defaultPackageConfig } as PackageConfig;

    // 从配置文件读取
    if (options.config) {
      try {
        const configContent = await fs.readFile(options.config, 'utf-8');
        const fileConfig = JSON.parse(configContent);
        packageConfig = { ...packageConfig, ...fileConfig.package };
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ 无法读取配置文件: ${options.config}`));
      }
    }

    // 生成包名（如果未指定）
    const packageName = options.name || 
      packageConfig.name || 
      packageNameUtils.generateFromAPI(swagger.info.title);

    // 验证包名
    if (!packageNameUtils.isValidPackageName(packageName)) {
      throw new Error(`无效的包名: ${packageName}`);
    }

    // 验证版本号
    const version = options.version || packageConfig.version || '1.0.0';
    if (!versionUtils.isValidVersion(version)) {
      throw new Error(`无效的版本号: ${version}`);
    }

    // 构建完整的包配置
    const finalPackageConfig: PackageConfig = {
      ...packageConfig,
      name: packageName,
      version,
      description: options.description || packageConfig.description || swagger.info.description || `API client for ${swagger.info.title}`,
      author: options.author || packageConfig.author,
      license: options.license || packageConfig.license || 'MIT',
      registry: options.registry || packageConfig.registry,
      tag: options.tag || packageConfig.tag || 'latest',
      access: options.access || packageConfig.access || 'public',
      private: options.private || packageConfig.private || false,
    };

    // 应用预设配置
    const preset = options.preset || 'development';
    const presetConfig = publishPresets[preset as keyof typeof publishPresets] || {};

    // 构建发布配置
    const publishConfig: PublishConfig = {
      outputDir: options.output,
      packageConfig: finalPackageConfig,
      build: options.build !== false && presetConfig.build !== false,
      runTests: options.test !== false && presetConfig.runTests !== false,
      publish: options.publish !== false && presetConfig.publish !== false,
      dryRun: options.dryRun || presetConfig.dryRun || false,
      ...presetConfig,
    };

    return publishConfig;
  }

  /**
   * 显示包预览
   */
  private async showPreview(swagger: any, config: PublishConfig): Promise<void> {
    const spinner = ora('生成包预览...').start();

    try {
      const preview = await this.publisher.createPackagePreview(swagger, config);
      spinner.succeed('✅ 包预览生成完成');

      console.log(chalk.cyan('\\n📦 包预览信息:\\n'));
      
      // 基本信息
      console.log(chalk.bold('基本信息:'));
      console.log(`  名称: ${chalk.green(preview.packageJson.name)}`);
      console.log(`  版本: ${chalk.green(preview.packageJson.version)}`);
      console.log(`  描述: ${preview.packageJson.description}`);
      console.log(`  作者: ${preview.packageJson.author || 'N/A'}`);
      console.log(`  许可证: ${preview.packageJson.license}`);
      console.log(`  预估大小: ${chalk.yellow(preview.estimatedSize)}`);

      // 依赖信息
      console.log(chalk.bold('\\n依赖信息:'));
      if (preview.packageJson.dependencies) {
        Object.entries(preview.packageJson.dependencies).forEach(([name, version]) => {
          console.log(`  ${name}: ${version}`);
        });
      }

      // 文件列表
      console.log(chalk.bold('\\n包含文件:'));
      preview.files.slice(0, 10).forEach(file => {
        console.log(`  ${file}`);
      });
      if (preview.files.length > 10) {
        console.log(`  ... 还有 ${preview.files.length - 10} 个文件`);
      }

      // 脚本命令
      console.log(chalk.bold('\\n可用脚本:'));
      if (preview.packageJson.scripts) {
        Object.entries(preview.packageJson.scripts).forEach(([name, command]) => {
          console.log(`  ${chalk.cyan(name)}: ${command}`);
        });
      }

    } catch (error: any) {
      spinner.fail(`❌ 预览生成失败: ${error.message}`);
      throw error;
    }
  }

  /**
   * 显示成功信息
   */
  private displaySuccessInfo(result: any): void {
    console.log(chalk.bold('📊 发布信息:'));
    console.log(`  包名: ${chalk.green(result.packageName)}`);
    console.log(`  版本: ${chalk.green(result.version)}`);
    console.log(`  注册表: ${result.registry}`);
    console.log(`  发布时间: ${result.publishedAt.toLocaleString()}`);
    
    if (result.tarballUrl) {
      console.log(`  下载地址: ${chalk.blue(result.tarballUrl)}`);
    }

    console.log(chalk.bold('\\n📝 使用说明:'));
    console.log(`  安装: ${chalk.cyan(`npm install ${result.packageName}`)}`);
    console.log(`  导入: ${chalk.cyan(`import { apiClient } from '${result.packageName}'`)}`);

    console.log(chalk.bold('\\n🔗 有用链接:'));
    console.log(`  NPM 页面: ${chalk.blue(`https://www.npmjs.com/package/${result.packageName}`)}`);
  }
}