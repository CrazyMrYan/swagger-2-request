/**
 * NPM 包发布器模块主入口
 * 提供完整的包生成和发布功能
 */

// 核心类型
export type {
  PackageConfig,
  PublishConfig,
  PublishResult,
  GeneratedPackage,
  GeneratedFile,
  BuildConfig,
  AdditionalFile,
  PackageValidationResult,
  TemplateConfig,
} from './types';

// 主要类
export { PackageGenerator } from './package-generator';
export { PackagePublisher } from './package-publisher';

// 便利函数
import { PackageGenerator } from './package-generator';
import { PackagePublisher } from './package-publisher';
import type { PackageConfig, PublishConfig } from './types';

/**
 * 创建包生成器实例
 */
export function createPackageGenerator(): PackageGenerator {
  return new PackageGenerator();
}

/**
 * 创建包发布器实例
 */
export function createPackagePublisher(): PackagePublisher {
  return new PackagePublisher();
}

/**
 * 便利函数：一键生成包
 */
export async function generatePackage(
  swagger: any,
  config: PublishConfig
) {
  const generator = new PackageGenerator();
  return generator.generatePackage(swagger, config);
}

/**
 * 便利函数：一键发布包
 */
export async function publishPackage(
  swagger: any,
  config: PublishConfig
) {
  const publisher = new PackagePublisher();
  return publisher.publishPackage(swagger, config);
}

/**
 * 便利函数：创建包预览
 */
export async function createPackagePreview(
  swagger: any,
  config: PublishConfig
) {
  const publisher = new PackagePublisher();
  return publisher.createPackagePreview(swagger, config);
}

/**
 * 默认包配置
 */
export const defaultPackageConfig: Partial<PackageConfig> = {
  version: '1.0.0',
  license: 'MIT',
  private: false,
  access: 'public',
  files: [
    'dist/',
    'README.md',
    'CHANGELOG.md',
    'LICENSE',
  ],
  scripts: {
    build: 'tsup',
    test: 'vitest run',
    'test:watch': 'vitest',
    'type-check': 'tsc --noEmit',
    lint: 'eslint src --ext .ts,.tsx',
    'lint:fix': 'eslint src --ext .ts,.tsx --fix',
    prepublishOnly: 'npm run build && npm run test',
  },
  engines: {
    node: '>=16.0.0',
    npm: '>=8.0.0',
  },
  dependencies: {
    axios: '^1.6.0',
    'lodash-es': '^4.17.21',
  },
  devDependencies: {
    '@types/lodash-es': '^4.17.0',
    '@types/node': '^20.0.0',
    '@typescript-eslint/eslint-plugin': '^6.0.0',
    '@typescript-eslint/parser': '^6.0.0',
    eslint: '^8.0.0',
    tsup: '^7.2.0',
    typescript: '^5.2.0',
    vitest: '^0.34.0',
  },
};

/**
 * 默认构建配置
 */
// eslint-disable-next-line no-undef
export const defaultBuildConfig: BuildConfig = {
  entry: 'src/index.ts',
  format: ['cjs', 'esm'],
  generateDts: true,
  minify: false,
  external: ['axios', 'lodash-es'],
  splitting: false,
};

/**
 * 预设发布配置
 */
export const publishPresets = {
  /**
   * 开发预设 - 用于快速测试
   */
  development: {
    build: true,
    runTests: false,
    publish: false,
    dryRun: true,
  },

  /**
   * 测试预设 - 包含完整的构建和测试
   */
  testing: {
    build: true,
    runTests: true,
    publish: false,
    dryRun: true,
  },

  /**
   * 生产预设 - 完整的发布流程
   */
  production: {
    build: true,
    runTests: true,
    publish: true,
    dryRun: false,
  },

  /**
   * 快速预设 - 仅构建和发布
   */
  quick: {
    build: true,
    runTests: false,
    publish: true,
    dryRun: false,
  },
} satisfies Record<string, Partial<PublishConfig>>;

/**
 * 常用包名生成器
 */
export const packageNameUtils = {
  /**
   * 根据 API 信息生成包名
   */
  generateFromAPI: (apiTitle: string, prefix?: string): string => {
    const cleanTitle = apiTitle
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    return prefix ? `${prefix}-${cleanTitle}` : cleanTitle;
  },

  /**
   * 根据域名生成包名
   */
  generateFromDomain: (domain: string, apiName?: string): string => {
    const cleanDomain = domain
      .replace(/^https?:\/\//, '')
      .replace(/[^a-z0-9.-]/g, '')
      .split('.')
      .reverse()
      .join('-');
    
    return apiName 
      ? `${cleanDomain}-${apiName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`
      : cleanDomain;
  },

  /**
   * 验证包名是否有效
   */
  isValidPackageName: (name: string): boolean => {
    // NPM 包名规则
    const npmNameRegex = /^[@a-z0-9][@a-z0-9._-]*$/;
    return npmNameRegex.test(name) && name.length <= 214;
  },
};

/**
 * 版本管理工具
 */
export const versionUtils = {
  /**
   * 增加版本号
   */
  bump: (version: string, type: 'major' | 'minor' | 'patch'): string => {
    const parts = version.split('.').map(Number);
    
    switch (type) {
      case 'major':
        return `${parts[0] + 1}.0.0`;
      case 'minor':
        return `${parts[0]}.${parts[1] + 1}.0`;
      case 'patch':
        return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
      default:
        return version;
    }
  },

  /**
   * 验证版本号格式
   */
  isValidVersion: (version: string): boolean => {
    const semverRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.-]+)?(\+[a-zA-Z0-9.-]+)?$/;
    return semverRegex.test(version);
  },

  /**
   * 比较版本号
   */
  compare: (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);
    
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1;
      if (parts1[i] < parts2[i]) return -1;
    }
    
    return 0;
  },
};