#!/usr/bin/env node

/**
 * NPM 发布脚本
 * 支持版本管理、构建、测试和发布功能
 * 
 * 使用方式：
 * node scripts/publish.js [options]
 * 
 * 选项：
 * --dry-run    干运行模式，不实际发布
 * --patch      发布补丁版本 (x.x.1)
 * --minor      发布次版本 (x.1.x)
 * --major      发布主版本 (1.x.x)
 * --version    指定版本号
 * --tag        发布标签 (默认: latest)
 * --registry   指定注册表
 * --skip-tests 跳过测试
 * --skip-build 跳过构建
 * --beta       发布Beta版本
 * --alpha      发布Alpha版本
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// ANSI 颜色代码
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m'
};

// 日志函数
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  step: (msg) => console.log(`${colors.cyan}🔄${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.magenta}📦 ${msg}${colors.reset}\n`)
};

// 执行命令函数
function execCommand(command, options = {}) {
  const { cwd = projectRoot, silent = false } = options;
  
  if (!silent) {
    log.step(`执行: ${command}`);
  }
  
  try {
    const result = execSync(command, {
      cwd,
      encoding: 'utf-8',
      stdio: silent ? 'pipe' : 'inherit'
    });
    return result;
  } catch (error) {
    log.error(`命令执行失败: ${command}`);
    log.error(error.message);
    process.exit(1);
  }
}

// 读取 package.json
function readPackageJson() {
  const packagePath = path.join(projectRoot, 'package.json');
  return JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
}

// 写入 package.json
function writePackageJson(packageData) {
  const packagePath = path.join(projectRoot, 'package.json');
  fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2) + '\n');
}

// 版本号操作
function updateVersion(currentVersion, type, customVersion) {
  if (customVersion) {
    return customVersion;
  }
  
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return currentVersion;
  }
}

// 添加预发布后缀
function addPrerelease(version, type) {
  if (type === 'beta') {
    return version.includes('-beta') ? version : `${version}-beta.1`;
  }
  if (type === 'alpha') {
    return version.includes('-alpha') ? version : `${version}-alpha.1`;
  }
  return version;
}

// 检查工作目录状态
function checkWorkingDirectory() {
  log.step('检查工作目录状态...');
  
  try {
    const status = execCommand('git status --porcelain', { silent: true });
    if (status.trim()) {
      log.warning('工作目录有未提交的更改:');
      console.log(status);
      
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      return new Promise((resolve) => {
        readline.question('是否继续发布? (y/N): ', (answer) => {
          readline.close();
          if (answer.toLowerCase() !== 'y') {
            log.error('发布已取消');
            process.exit(1);
          }
          resolve();
        });
      });
    }
    log.success('工作目录干净');
  } catch (error) {
    log.warning('无法检查Git状态，可能不是Git仓库');
  }
}

// 运行测试
function runTests() {
  log.step('运行测试...');
  try {
    execCommand('pnpm test');
    log.success('测试通过');
  } catch (error) {
    log.error('测试失败');
    throw error;
  }
}

// 构建项目
function buildProject() {
  log.step('构建项目...');
  try {
    execCommand('pnpm build');
    log.success('构建完成');
  } catch (error) {
    log.error('构建失败');
    throw error;
  }
}

// 发布到 NPM
function publishToNpm(options) {
  const { tag = 'latest', registry, dryRun = false } = options;
  
  let command = 'npm publish --no-git-checks --access=public';
  
  if (tag !== 'latest') {
    command += ` --tag ${tag}`;
  }
  
  if (registry) {
    command += ` --registry ${registry}`;
  }
  
  if (dryRun) {
    command += ' --dry-run';
    log.step('执行干运行发布...');
  } else {
    log.step('发布到 NPM...');
  }
  
  try {
    execCommand(command);
    if (dryRun) {
      log.success('干运行发布完成');
    } else {
      log.success('发布成功');
    }
  } catch (error) {
    log.error('发布失败');
    throw error;
  }
}

// 创建 Git 标签
function createGitTag(version) {
  log.step(`创建 Git 标签 v${version}...`);
  try {
    execCommand(`git tag v${version}`);
    execCommand('git push origin --tags');
    log.success('Git 标签创建成功');
  } catch (error) {
    log.warning('Git 标签创建失败，但不影响发布');
  }
}

// 显示发布信息
function showPublishInfo(packageData, options) {
  const { tag = 'latest', registry = 'https://registry.npmjs.org' } = options;
  
  console.log(`\n${colors.bright}${colors.green}🎉 发布成功！${colors.reset}\n`);
  console.log(`📦 包名: ${colors.cyan}${packageData.name}${colors.reset}`);
  console.log(`🏷️  版本: ${colors.cyan}${packageData.version}${colors.reset}`);
  console.log(`🏪 注册表: ${colors.cyan}${registry}${colors.reset}`);
  console.log(`🔖 标签: ${colors.cyan}${tag}${colors.reset}`);
  console.log(`📅 发布时间: ${colors.cyan}${new Date().toLocaleString()}${colors.reset}`);
  
  console.log(`\n${colors.bright}安装命令:${colors.reset}`);
  console.log(`${colors.yellow}npm install ${packageData.name}${colors.reset}`);
  console.log(`${colors.yellow}pnpm add ${packageData.name}${colors.reset}`);
  console.log(`${colors.yellow}yarn add ${packageData.name}${colors.reset}`);
  
  console.log(`\n${colors.bright}NPM 页面:${colors.reset}`);
  console.log(`${colors.blue}https://www.npmjs.com/package/${packageData.name}${colors.reset}`);
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dryRun: false,
    skipTests: false,
    skipBuild: false,
    versionType: null,
    customVersion: null,
    tag: 'latest',
    registry: null
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--dry-run':
        options.dryRun = true;
        break;
      case '--patch':
        options.versionType = 'patch';
        break;
      case '--minor':
        options.versionType = 'minor';
        break;
      case '--major':
        options.versionType = 'major';
        break;
      case '--version':
        options.customVersion = args[++i];
        break;
      case '--tag':
        options.tag = args[++i];
        break;
      case '--registry':
        options.registry = args[++i];
        break;
      case '--skip-tests':
        options.skipTests = true;
        break;
      case '--skip-build':
        options.skipBuild = true;
        break;
      case '--beta':
        options.prerelease = 'beta';
        if (!options.versionType) options.versionType = 'patch';
        break;
      case '--alpha':
        options.prerelease = 'alpha';
        if (!options.versionType) options.versionType = 'patch';
        break;
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
      default:
        if (arg.startsWith('--')) {
          log.error(`未知选项: ${arg}`);
          process.exit(1);
        }
    }
  }
  
  return options;
}

// 显示帮助信息
function showHelp() {
  console.log(`
${colors.bright}NPM 发布脚本${colors.reset}

${colors.bright}使用方式:${colors.reset}
  node scripts/publish.js [options]

${colors.bright}选项:${colors.reset}
  --dry-run       干运行模式，不实际发布
  --patch         发布补丁版本 (x.x.1)
  --minor         发布次版本 (x.1.x) 
  --major         发布主版本 (1.x.x)
  --version <ver> 指定版本号
  --tag <tag>     发布标签 (默认: latest)
  --registry <url> 指定注册表
  --skip-tests    跳过测试
  --skip-build    跳过构建
  --beta          发布Beta版本
  --alpha         发布Alpha版本
  --help, -h      显示帮助信息

${colors.bright}示例:${colors.reset}
  node scripts/publish.js --patch
  node scripts/publish.js --version 1.2.3
  node scripts/publish.js --beta --minor
  node scripts/publish.js --dry-run --patch
  `);
}

// 主函数
async function main() {
  try {
    log.title('开始发布流程');
    
    const options = parseArgs();
    
    // 如果没有指定版本类型，默认为patch
    if (!options.versionType && !options.customVersion) {
      options.versionType = 'patch';
    }
    
    // 读取当前包信息
    const packageData = readPackageJson();
    const currentVersion = packageData.version;
    
    log.info(`当前版本: ${currentVersion}`);
    
    // 计算新版本号
    let newVersion = updateVersion(currentVersion, options.versionType, options.customVersion);
    
    // 添加预发布后缀
    if (options.prerelease) {
      newVersion = addPrerelease(newVersion, options.prerelease);
      options.tag = options.prerelease;
    }
    
    log.info(`目标版本: ${newVersion}`);
    
    if (options.dryRun) {
      log.warning('干运行模式已启用');
    }
    
    // 检查工作目录
    await checkWorkingDirectory();
    
    // 更新版本号
    if (!options.dryRun) {
      packageData.version = newVersion;
      writePackageJson(packageData);
      log.success(`版本号已更新为: ${newVersion}`);
    }
    
    // 运行测试
    if (!options.skipTests) {
      runTests();
    } else {
      log.warning('跳过测试');
    }
    
    // 构建项目
    if (!options.skipBuild) {
      buildProject();
    } else {
      log.warning('跳过构建');
    }
    
    // 发布到 NPM
    publishToNpm({
      tag: options.tag,
      registry: options.registry,
      dryRun: options.dryRun
    });
    
    // 创建 Git 标签（仅非干运行模式）
    if (!options.dryRun) {
      createGitTag(newVersion);
    }
    
    // 显示发布信息
    if (!options.dryRun) {
      showPublishInfo(packageData, options);
    } else {
      log.info('干运行完成，实际未进行发布');
    }
    
  } catch (error) {
    log.error(`发布失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  log.error(`未处理的错误: ${error.message}`);
  process.exit(1);
});