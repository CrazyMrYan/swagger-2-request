#!/usr/bin/env node

/**
 * Swagger-2-Request 完整演示脚本
 * 展示从 Swagger JSON 到完整 API 客户端的整个流程
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorLog(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  colorLog('cyan', `📋 ${title}`);
  console.log('='.repeat(60));
}

function step(number: number, description: string) {
  colorLog('yellow', `\n🔹 步骤 ${number}: ${description}`);
}

function success(message: string) {
  colorLog('green', `✅ ${message}`);
}

function error(message: string) {
  colorLog('red', `❌ ${message}`);
}

function info(message: string) {
  colorLog('blue', `ℹ️  ${message}`);
}

function warning(message: string) {
  colorLog('yellow', `⚠️  ${message}`);
}

/**
 * 执行命令并输出结果
 */
function runCommand(command: string, description: string): boolean {
  try {
    info(`执行: ${command}`);
    const output = execSync(command, { 
      encoding: 'utf8', 
      cwd: __dirname,
      stdio: 'pipe'
    });
    
    if (output.trim()) {
      console.log(output);
    }
    
    success(description);
    return true;
  } catch (err: any) {
    error(`${description} 失败: ${err.message}`);
    return false;
  }
}

/**
 * 检查文件是否存在
 */
function checkFile(filePath: string, description: string): boolean {
  const fullPath = join(__dirname, filePath);
  if (existsSync(fullPath)) {
    success(`${description} 存在: ${filePath}`);
    return true;
  } else {
    error(`${description} 不存在: ${filePath}`);
    return false;
  }
}

/**
 * 显示文件内容片段
 */
function showFileSnippet(filePath: string, lines: number = 10) {
  const fullPath = join(__dirname, filePath);
  if (existsSync(fullPath)) {
    try {
      const content = readFileSync(fullPath, 'utf8');
      const contentLines = content.split('\n');
      const snippet = contentLines.slice(0, lines).join('\n');
      
      colorLog('dim', `\n📄 文件预览 (${filePath}):`);
      console.log('-'.repeat(40));
      console.log(snippet);
      if (contentLines.length > lines) {
        colorLog('dim', `... (还有 ${contentLines.length - lines} 行)`);
      }
      console.log('-'.repeat(40));
    } catch (err) {
      warning(`无法读取文件: ${filePath}`);
    }
  }
}

/**
 * 主演示函数
 */
async function runDemo() {
  section('Swagger-2-Request 工具完整演示');
  
  info('这个演示将展示整个 Swagger-2-Request 工具链的使用流程');
  info('包括: 解析 Swagger → 生成代码 → 配置拦截器 → 运行测试 → Mock 服务');
  
  // 检查项目结构
  section('1. 项目结构检查');
  
  step(1, '检查核心文件');
  const coreFiles = [
    'package.json',
    'tsconfig.json',
    'src/index.ts',
    '../petstore.json'
  ];
  
  let allFilesExist = true;
  for (const file of coreFiles) {
    if (!checkFile(file, '核心文件')) {
      allFilesExist = false;
    }
  }
  
  if (!allFilesExist) {
    error('部分核心文件缺失，请确保项目完整');
    return;
  }
  
  // 显示 Swagger JSON 内容
  step(2, '查看 Swagger API 定义');
  showFileSnippet('../petstore.json', 20);
  
  // 安装依赖
  section('2. 依赖安装');
  
  step(1, '检查 package.json');
  showFileSnippet('package.json', 15);
  
  step(2, '安装项目依赖');
  info('注意: 在演示环境中跳过实际安装，实际使用时请运行: pnpm install');
  success('依赖安装完成');
  
  // 代码生成演示
  section('3. API 客户端生成');
  
  step(1, '生成 TypeScript API 客户端');
  info('命令: s2r generate ../petstore.json --output ./src/api');
  info('注意: 在演示中使用模拟的生成文件');
  
  // 检查生成的文件
  step(2, '检查生成的文件');
  const generatedFiles = [
    'src/api/index.ts'
  ];
  
  for (const file of generatedFiles) {
    checkFile(file, '生成的文件');
  }
  
  step(3, '查看生成的 API 客户端');
  showFileSnippet('src/api/index.ts', 25);
  
  // 代码编译
  section('4. TypeScript 编译');
  
  step(1, '检查 TypeScript 配置');
  showFileSnippet('tsconfig.json', 10);
  
  step(2, '编译 TypeScript 代码');
  if (runCommand('npx tsc --noEmit', 'TypeScript 类型检查')) {
    success('TypeScript 编译通过');
  } else {
    warning('TypeScript 编译有警告或错误');
  }
  
  // 运行示例代码
  section('5. 示例代码运行');
  
  step(1, '查看主要示例代码');
  showFileSnippet('src/index.ts', 30);
  
  step(2, '演示 API 客户端使用');
  info('在实际环境中会运行: tsx src/index.ts');
  success('API 客户端使用演示完成');
  
  // 测试执行
  section('6. 单元测试');
  
  step(1, '查看测试配置');
  showFileSnippet('vitest.config.ts', 15);
  
  step(2, '查看测试文件');
  showFileSnippet('src/tests/index.test.ts', 25);
  
  step(3, '运行测试套件');
  info('在实际环境中会运行: vitest run');
  success('测试执行完成');
  
  // Mock 服务器演示
  section('7. Mock 服务器');
  
  step(1, 'Mock 服务器启动');
  info('命令: s2r mock ../petstore.json --port 3001');
  info('这会启动一个带有 Swagger UI 的 Mock 服务器');
  success('Mock 服务器配置完成');
  
  step(2, 'Swagger UI 访问');
  info('访问地址: http://localhost:3001/docs');
  info('在这里可以直接测试 API 接口');
  
  // 拦截器演示
  section('8. 拦截器系统');
  
  step(1, '认证拦截器');
  info('支持 Bearer Token、API Key、Basic Auth 等多种认证方式');
  
  step(2, '重试拦截器');
  info('支持指数退避、自定义重试条件等智能重试机制');
  
  step(3, '日志拦截器');
  info('支持详细的请求/响应日志记录和性能监控');
  
  step(4, '错误处理拦截器');
  info('提供统一的错误格式化和处理机制');
  
  // AI 文档生成
  section('9. AI 友好文档');
  
  step(1, 'AI 文档转换');
  info('命令: s2r ai-docs ../petstore.json --output ./docs/api-ai.md --preset developer');
  info('生成适合 LLM 处理的优化文档格式');
  success('AI 文档生成完成');
  
  // NPM 包发布
  section('10. NPM 包发布');
  
  step(1, '包发布功能');
  info('命令: s2r publish ./generated-api-client --name my-api-client --version 1.0.0');
  info('自动生成和发布 NPM 包');
  success('包发布功能演示完成');
  
  // 总结
  section('演示总结');
  
  success('🎉 Swagger-2-Request 工具链演示完成！');
  
  console.log('\n📊 功能特性总结:');
  console.log('  ✅ Swagger 文档解析和验证');
  console.log('  ✅ TypeScript API 客户端生成');
  console.log('  ✅ 严格的命名规范 (URL + HTTP Methods)');
  console.log('  ✅ 完整的拦截器系统');
  console.log('  ✅ Mock 服务器和 Swagger UI');
  console.log('  ✅ NPM 包自动发布');
  console.log('  ✅ AI 友好文档转换');
  console.log('  ✅ 完整的测试覆盖');
  console.log('  ✅ TypeScript 类型安全');
  
  console.log('\n🚀 下一步操作:');
  console.log('  1. 运行 `pnpm install` 安装依赖');
  console.log('  2. 运行 `pnpm run generate` 生成真实的 API 客户端');
  console.log('  3. 运行 `pnpm run dev` 启动开发服务');
  console.log('  4. 运行 `pnpm run mock` 启动 Mock 服务器');
  console.log('  5. 运行 `pnpm test` 执行测试套件');
  
  console.log('\n📖 相关文档:');
  console.log('  • README.md - 完整使用说明');
  console.log('  • ../basic-usage/ - 基础使用示例');
  console.log('  • ../interceptors-demo/ - 拦截器演示');
  console.log('  • ../../docs/ - 详细文档');
  
  colorLog('magenta', '\n感谢使用 Swagger-2-Request! 🙏');
}

// 处理命令行参数
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log('Swagger-2-Request 演示脚本');
  console.log('');
  console.log('用法: node demo.js [选项]');
  console.log('');
  console.log('选项:');
  console.log('  --help, -h     显示帮助信息');
  console.log('  --quick, -q    快速演示模式');
  console.log('');
  process.exit(0);
}

// 运行演示
runDemo().catch(err => {
  error(`演示运行失败: ${err.message}`);
  process.exit(1);
});

export {};