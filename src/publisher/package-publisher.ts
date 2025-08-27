/**
 * NPM 包发布器
 * 负责构建、测试和发布 NPM 包到指定的注册表
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { spawn } from 'child_process';
import type {
  PublishConfig,
  PublishResult,
  PackageValidationResult,
  GeneratedPackage,
} from './types';
import { PackageGenerator } from './package-generator';

export class PackagePublisher {
  private packageGenerator: PackageGenerator;

  constructor() {
    this.packageGenerator = new PackageGenerator();
  }

  /**
   * 发布包到 NPM
   */
  async publishPackage(
    swagger: any,
    config: PublishConfig
  ): Promise<PublishResult> {
    const startTime = Date.now();
    const logs: string[] = [];
    
    try {
      logs.push(`📦 开始发布包: ${config.packageConfig.name}@${config.packageConfig.version}`);
      
      // 1. 生成包
      logs.push('🔧 生成包结构...');
      const generatedPackage = await this.packageGenerator.generatePackage(swagger, config);
      logs.push(`✅ 包生成完成: ${generatedPackage.rootDir}`);

      // 2. 验证包
      logs.push('🔍 验证包配置...');
      const validation = await this.validatePackage(generatedPackage);
      if (!validation.valid) {
        throw new Error(`包验证失败: ${validation.errors.join(', ')}`);
      }
      logs.push('✅ 包验证通过');

      // 3. 安装依赖
      logs.push('📥 安装依赖...');
      await this.installDependencies(generatedPackage.rootDir);
      logs.push('✅ 依赖安装完成');

      // 4. 构建包
      if (config.build !== false) {
        logs.push('🏗️ 构建包...');
        await this.buildPackage(generatedPackage.rootDir);
        logs.push('✅ 包构建完成');
      }

      // 5. 运行测试
      if (config.runTests) {
        logs.push('🧪 运行测试...');
        await this.runTests(generatedPackage.rootDir);
        logs.push('✅ 测试通过');
      }

      // 6. 发布到 NPM
      let tarballUrl: string | undefined;
      if (config.publish !== false) {
        logs.push('🚀 发布到 NPM...');
        tarballUrl = await this.publishToNpm(
          generatedPackage.rootDir,
          config.packageConfig,
          config.dryRun || false
        );
        logs.push(`✅ 发布成功: ${tarballUrl || 'N/A'}`);
      }

      const duration = Date.now() - startTime;
      logs.push(`🎉 发布完成，耗时: ${duration}ms`);

      return {
        success: true,
        packageName: config.packageConfig.name,
        version: config.packageConfig.version,
        registry: config.packageConfig.registry || 'https://registry.npmjs.org',
        tarballUrl,
        logs,
        publishedAt: new Date(),
      };

    } catch (error: any) {
      logs.push(`❌ 发布失败: ${error.message}`);
      
      return {
        success: false,
        packageName: config.packageConfig.name,
        version: config.packageConfig.version,
        registry: config.packageConfig.registry || 'https://registry.npmjs.org',
        error: error.message,
        logs,
        publishedAt: new Date(),
      };
    }
  }

  /**
   * 验证包
   */
  private async validatePackage(generatedPackage: GeneratedPackage): Promise<PackageValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // 检查 package.json
      const packageJsonPath = path.join(generatedPackage.rootDir, 'package.json');
      const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      // 必需字段验证
      if (!packageJson.name) errors.push('package.json 缺少 name 字段');
      if (!packageJson.version) errors.push('package.json 缺少 version 字段');
      if (!packageJson.description) warnings.push('package.json 缺少 description 字段');

      // 版本格式验证
      if (packageJson.version && !/^\d+\.\d+\.\d+/.test(packageJson.version)) {
        errors.push('版本号格式不正确，应该遵循 semver 规范');
      }

      // 入口文件验证
      if (packageJson.main && !await this.fileExists(path.join(generatedPackage.rootDir, packageJson.main))) {
        warnings.push(`主入口文件不存在: ${packageJson.main}`);
      }

      // 检查必要文件
      const requiredFiles = ['README.md', 'package.json'];
      for (const file of requiredFiles) {
        if (!await this.fileExists(path.join(generatedPackage.rootDir, file))) {
          errors.push(`缺少必要文件: ${file}`);
        }
      }

      // 计算包大小
      const sizeInfo = await this.calculatePackageSize(generatedPackage.rootDir);
      
      // 检查包大小
      if (sizeInfo.totalSize > 50 * 1024 * 1024) { // 50MB
        warnings.push(`包大小较大: ${Math.round(sizeInfo.totalSize / 1024 / 1024)}MB`);
      }

      return {
        valid: errors.length === 0,
        errors,
        warnings,
        sizeInfo,
      };

    } catch (error: any) {
      return {
        valid: false,
        errors: [`验证过程出错: ${error.message}`],
        warnings,
      };
    }
  }

  /**
   * 安装依赖
   */
  private async installDependencies(packageDir: string): Promise<void> {
    await this.executeCommand('npm install', packageDir);
  }

  /**
   * 构建包
   */
  private async buildPackage(packageDir: string): Promise<void> {
    // 首先检查是否有构建脚本
    const packageJsonPath = path.join(packageDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    if (packageJson.scripts?.build) {
      await this.executeCommand('npm run build', packageDir);
    } else {
      // 如果没有构建脚本，直接使用 tsup
      await this.executeCommand('npx tsup', packageDir);
    }
  }

  /**
   * 运行测试
   */
  private async runTests(packageDir: string): Promise<void> {
    const packageJsonPath = path.join(packageDir, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    
    if (packageJson.scripts?.test) {
      try {
        await this.executeCommand('npm test', packageDir);
      } catch (error) {
        // 如果测试失败，但没有测试文件，则忽略错误
        const testDir = path.join(packageDir, 'test');
        const testsDir = path.join(packageDir, 'tests');
        const hasTests = await this.fileExists(testDir) || await this.fileExists(testsDir);
        
        if (hasTests) {
          throw error; // 有测试文件但测试失败，抛出错误
        }
        
        console.warn('⚠️ 没有找到测试文件，跳过测试步骤');
      }
    } else {
      console.warn('⚠️ 没有配置测试脚本，跳过测试步骤');
    }
  }

  /**
   * 发布到 NPM
   */
  private async publishToNpm(
    packageDir: string,
    packageConfig: any,
    dryRun: boolean = false
  ): Promise<string | undefined> {
    const commands: string[] = [];
    
    // 设置注册表
    if (packageConfig.registry) {
      commands.push(`npm config set registry ${packageConfig.registry}`);
    }

    // 构建发布命令
    let publishCommand = 'npm publish';
    
    if (packageConfig.tag) {
      publishCommand += ` --tag ${packageConfig.tag}`;
    }
    
    if (packageConfig.access) {
      publishCommand += ` --access ${packageConfig.access}`;
    }
    
    if (dryRun) {
      publishCommand += ' --dry-run';
    }

    commands.push(publishCommand);

    // 执行命令
    for (const command of commands) {
      const output = await this.executeCommand(command, packageDir);
      
      // 从输出中提取 tarball URL
      if (output.includes('+ ') && output.includes('.tgz')) {
        const lines = output.split('\n');
        for (const line of lines) {
          if (line.includes('+ ') && line.includes('.tgz')) {
            const match = line.match(/https?:\/\/[^\s]+\.tgz/);
            if (match) {
              return match[0];
            }
          }
        }
      }
    }

    return undefined;
  }

  /**
   * 执行命令
   */
  private async executeCommand(command: string, cwd: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        cwd,
        stdio: 'pipe',
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`命令执行失败 (${code}): ${command}\n${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`命令执行出错: ${command}\n${error.message}`));
      });
    });
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
   * 计算包大小
   */
  private async calculatePackageSize(packageDir: string): Promise<{
    totalSize: number;
    fileCount: number;
    maxFileSize: number;
  }> {
    let totalSize = 0;
    let fileCount = 0;
    let maxFileSize = 0;

    const calculateDir = async (dir: string): Promise<void> => {
      try {
        const files = await fs.readdir(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const stats = await fs.stat(filePath);
          
          if (stats.isDirectory()) {
            // 跳过 node_modules 和其他不需要的目录
            if (!['node_modules', '.git', '.cache', 'coverage'].includes(file)) {
              await calculateDir(filePath);
            }
          } else {
            totalSize += stats.size;
            fileCount++;
            maxFileSize = Math.max(maxFileSize, stats.size);
          }
        }
      } catch (error) {
        // 忽略访问错误
      }
    };

    await calculateDir(packageDir);

    return {
      totalSize,
      fileCount,
      maxFileSize,
    };
  }

  /**
   * 创建包的预览
   */
  async createPackagePreview(
    swagger: any,
    config: PublishConfig
  ): Promise<{
    packageJson: any;
    files: string[];
    estimatedSize: string;
  }> {
    // 生成临时包以获取预览信息
    const tempDir = path.join(process.cwd(), '.tmp', `preview-${Date.now()}`);
    
    try {
      const generatedPackage = await this.packageGenerator.generatePackage(swagger, {
        ...config,
        outputDir: tempDir,
      });

      const files = await this.listAllFiles(tempDir);
      const sizeInfo = await this.calculatePackageSize(tempDir);
      
      return {
        packageJson: generatedPackage.packageJson,
        files,
        estimatedSize: this.formatSize(sizeInfo.totalSize),
      };

    } finally {
      // 清理临时目录
      try {
        await fs.rm(tempDir, { recursive: true, force: true });
      } catch {
        // 忽略清理错误
      }
    }
  }

  /**
   * 列出所有文件
   */
  private async listAllFiles(dir: string, basePath: string = ''): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const itemPath = path.join(dir, item);
        const relativePath = basePath ? path.join(basePath, item) : item;
        const stats = await fs.stat(itemPath);
        
        if (stats.isDirectory()) {
          if (!['node_modules', '.git'].includes(item)) {
            files.push(...await this.listAllFiles(itemPath, relativePath));
          }
        } else {
          files.push(relativePath);
        }
      }
    } catch {
      // 忽略错误
    }
    
    return files;
  }

  /**
   * 格式化文件大小
   */
  private formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}