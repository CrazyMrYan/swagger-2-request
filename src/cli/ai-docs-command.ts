/**
 * CLI AI 文档转换命令
 * 支持将 Swagger 文档转换为 AI 友好格式
 */

import { Command } from 'commander';
import * as fs from 'fs/promises';
import * as path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { SwaggerAnalyzer } from '../core/swagger-parser';
import { 
  AIDocConverter, 
  aiDocPresets, 
  defaultAIDocConfig,
  AIDocSearcher,
  AIDocAnalyzer,
  type AIDocConfig 
} from '../ai-docs';

export class AIDocsCommand {
  private analyzer: SwaggerAnalyzer;
  private converter: AIDocConverter;

  constructor() {
    this.analyzer = new SwaggerAnalyzer();
    this.converter = new AIDocConverter();
  }

  /**
   * 创建 AI 文档命令
   */
  createCommand(): Command {
    const command = new Command('ai-docs');

    command
      .description('转换 Swagger 为 AI 友好文档格式')
      .argument('<swagger>', 'Swagger JSON 文件路径或 URL')
      .option('-o, --output <file>', '输出文件路径', './docs/api-ai.md')
      .option('-f, --format <format>', '输出格式 (markdown|json|yaml)', 'markdown')
      .option('-p, --preset <preset>', '预设配置 (developer|reference|training|preview)', 'developer')
      .option('--no-examples', '不包含使用示例')
      .option('--no-code', '不包含代码示例')
      .option('--no-toc', '不生成目录')
      .option('--lang <lang>', '文档语言 (zh|en)', 'zh')
      .option('--verbosity <level>', '详细程度 (minimal|normal|detailed)', 'normal')
      .option('--analyze', '分析文档质量和覆盖率')
      .option('--search <query>', '搜索特定内容')
      .option('--config <file>', '配置文件路径')
      .action(async (swaggerPath, options) => {
        await this.handleAIDocsGeneration(swaggerPath, options);
      });

    return command;
  }

  /**
   * 处理 AI 文档生成
   */
  private async handleAIDocsGeneration(swaggerPath: string, options: any): Promise<void> {
    const spinner = ora('开始处理 AI 文档转换...').start();

    try {
      // 1. 解析 Swagger 文档
      spinner.text = '解析 Swagger 文档...';
      const swagger = await this.analyzer.parseSwagger(swaggerPath);
      spinner.succeed('✅ Swagger 文档解析成功');

      // 2. 构建配置
      const config = await this.buildAIDocConfig(options);
      
      // 3. 如果是搜索模式
      if (options.search) {
        await this.handleSearch(swagger, options.search);
        return;
      }

      // 4. 如果是分析模式
      if (options.analyze) {
        await this.handleAnalysis(swagger);
        return;
      }

      // 5. 生成 AI 友好文档
      spinner.start('生成 AI 友好文档...');
      const result = await this.converter.generateAIDoc(swagger, config);
      spinner.succeed('✅ AI 文档生成成功');

      // 6. 保存文档
      await this.saveDocument(result, options.output);

      // 7. 显示结果
      this.displayResults(result, options.output);

    } catch (error: any) {
      spinner.fail(`❌ AI 文档转换失败: ${error.message}`);
      console.error(chalk.red(error.stack));
    }
  }

  /**
   * 构建 AI 文档配置
   */
  private async buildAIDocConfig(options: any): Promise<AIDocConfig> {
    let config: AIDocConfig = { ...defaultAIDocConfig };

    // 从配置文件读取
    if (options.config) {
      try {
        const configContent = await fs.readFile(options.config, 'utf-8');
        const fileConfig = JSON.parse(configContent);
        config = { ...config, ...fileConfig.aiDocs };
      } catch (error) {
        console.warn(chalk.yellow(`⚠️ 无法读取配置文件: ${options.config}`));
      }
    }

    // 应用预设配置
    if (options.preset && aiDocPresets[options.preset as keyof typeof aiDocPresets]) {
      const presetConfig = aiDocPresets[options.preset as keyof typeof aiDocPresets];
      config = { ...config, ...presetConfig };
    }

    // 应用命令行选项
    if (options.format) config.format = options.format;
    if (options.examples === false) config.includeExamples = false;
    if (options.code === false) config.includeCodeExamples = false;
    if (options.toc === false) config.generateTOC = false;
    if (options.lang) config.language = options.lang;
    if (options.verbosity) config.verbosity = options.verbosity;

    return config;
  }

  /**
   * 处理搜索功能
   */
  private async handleSearch(swagger: any, query: string): Promise<void> {
    console.log(chalk.cyan('🔍 搜索 API 端点...\n'));

    // 转换为 AI 格式
    const aiDoc = this.converter.convertToAIFormat(swagger);
    const searcher = new AIDocSearcher(aiDoc);

    // 执行搜索
    const results = searcher.fullTextSearch(query);

    if (results.length === 0) {
      console.log(chalk.yellow('❌ 没有找到匹配的端点'));
      return;
    }

    console.log(chalk.green(`✅ 找到 ${results.length} 个匹配的端点:\n`));

    results.forEach((endpoint, index) => {
      console.log(chalk.bold(`${index + 1}. ${endpoint.method} ${endpoint.path}`));
      if (endpoint.summary) {
        console.log(chalk.gray(`   ${endpoint.summary}`));
      }
      if (endpoint.tags.length > 0) {
        console.log(chalk.blue(`   标签: ${endpoint.tags.join(', ')}`));
      }
      console.log(chalk.green(`   函数: ${endpoint.functionName}()`));
      console.log('');
    });
  }

  /**
   * 处理分析功能
   */
  private async handleAnalysis(swagger: any): Promise<void> {
    console.log(chalk.cyan('📊 分析 API 文档...\n'));

    // 转换为 AI 格式
    const aiDoc = this.converter.convertToAIFormat(swagger);
    const analyzer = new AIDocAnalyzer(aiDoc);

    // 执行分析
    const coverage = analyzer.analyzeCoverage();
    const quality = analyzer.analyzeQuality();

    // 显示覆盖率分析
    console.log(chalk.bold('📈 API 覆盖率分析:'));
    console.log('');
    console.log('HTTP 方法分布:');
    Object.entries(coverage.methodCoverage).forEach(([method, percentage]) => {
      const bar = '█'.repeat(Math.round(percentage / 5));
      console.log(`  ${method.padEnd(6)}: ${bar} ${percentage.toFixed(1)}%`);
    });

    console.log('');
    console.log('复杂度分布:');
    Object.entries(coverage.complexityCoverage).forEach(([complexity, count]) => {
      console.log(`  ${complexity.padEnd(8)}: ${count} 个端点`);
    });

    // 显示质量分析
    console.log('');
    console.log(chalk.bold('🎯 文档质量分析:'));
    console.log('');
    console.log(`总体评分: ${chalk.green(quality.score.toFixed(0))}/100`);

    if (quality.strengths.length > 0) {
      console.log('');
      console.log(chalk.green('✅ 优点:'));
      quality.strengths.forEach(strength => {
        console.log(`  • ${strength}`);
      });
    }

    if (quality.issues.length > 0) {
      console.log('');
      console.log(chalk.yellow('⚠️  改进建议:'));
      quality.issues.forEach(issue => {
        console.log(`  • ${issue}`);
      });
    }

    if (coverage.recommendations.length > 0) {
      console.log('');
      console.log(chalk.blue('💡 API 设计建议:'));
      coverage.recommendations.forEach(rec => {
        console.log(`  • ${rec}`);
      });
    }

    // 显示统计信息
    console.log('');
    console.log(chalk.bold('📊 详细统计:'));
    console.log(`  总端点数: ${aiDoc.statistics.totalEndpoints}`);
    console.log(`  平均参数数: ${aiDoc.statistics.averageParameters.toFixed(1)}`);
    console.log(`  最常用标签: ${aiDoc.statistics.mostUsedTags.slice(0, 3).join(', ')}`);
  }

  /**
   * 保存文档
   */
  private async saveDocument(result: any, outputPath: string): Promise<void> {
    // 确保输出目录存在
    const outputDir = path.dirname(outputPath);
    await fs.mkdir(outputDir, { recursive: true });

    // 写入文件
    await fs.writeFile(outputPath, result.content, 'utf-8');
  }

  /**
   * 显示结果
   */
  private displayResults(result: any, outputPath: string): void {
    console.log(chalk.cyan('\n📄 AI 文档生成完成!\n'));

    console.log(chalk.bold('📊 生成统计:'));
    console.log(`  格式: ${chalk.green(result.format.toUpperCase())}`);
    console.log(`  文件大小: ${chalk.yellow(this.formatFileSize(result.stats.size))}`);
    console.log(`  处理端点: ${chalk.blue(result.stats.processedEndpoints)} 个`);
    console.log(`  生成耗时: ${chalk.magenta(result.stats.generationTime)}ms`);
    console.log(`  输出文件: ${chalk.green(outputPath)}`);

    console.log(chalk.bold('\n🎯 特性支持:'));
    console.log('  ✅ AI 优化格式');
    console.log('  ✅ 智能搜索索引');
    console.log('  ✅ 代码示例生成');
    console.log('  ✅ 复杂度分析');
    console.log('  ✅ 多语言支持');

    console.log(chalk.bold('\n📖 使用建议:'));
    console.log('  • 使用 --search 参数搜索特定 API');
    console.log('  • 使用 --analyze 参数分析文档质量');
    console.log('  • 尝试不同的 --preset 预设配置');
    console.log('  • 文档已优化，适合 AI 模型训练和检索');
  }

  /**
   * 格式化文件大小
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }
}