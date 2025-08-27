/**
 * NPM 包发布器类型定义
 */

/**
 * 包配置选项
 */
export interface PackageConfig {
  /** 包名称 */
  name: string;
  /** 包版本 */
  version: string;
  /** 包描述 */
  description: string;
  /** 作者信息 */
  author?: string | {
    name: string;
    email?: string;
    url?: string;
  };
  /** 许可证 */
  license?: string;
  /** 主页 URL */
  homepage?: string;
  /** 仓库信息 */
  repository?: {
    type: string;
    url: string;
  };
  /** Bug 报告 URL */
  bugs?: {
    url: string;
    email?: string;
  };
  /** 关键词 */
  keywords?: string[];
  /** 是否私有包 */
  private?: boolean;
  /** NPM 注册表 URL */
  registry?: string;
  /** 发布标签 */
  tag?: string;
  /** 访问级别 */
  access?: 'public' | 'restricted';
  /** 包含的文件 */
  files?: string[];
  /** 脚本命令 */
  scripts?: Record<string, string>;
  /** 依赖项 */
  dependencies?: Record<string, string>;
  /** 开发依赖项 */
  devDependencies?: Record<string, string>;
  /** Peer 依赖项 */
  peerDependencies?: Record<string, string>;
  /** 引擎要求 */
  engines?: Record<string, string>;
}

/**
 * 发布配置选项
 */
export interface PublishConfig {
  /** 输出目录 */
  outputDir: string;
  /** 包配置 */
  packageConfig: PackageConfig;
  /** 是否构建 */
  build?: boolean;
  /** 是否运行测试 */
  runTests?: boolean;
  /** 是否发布到 NPM */
  publish?: boolean;
  /** 是否干运行（不实际发布） */
  dryRun?: boolean;
  /** 构建配置 */
  buildConfig?: BuildConfig;
  /** 额外文件 */
  additionalFiles?: AdditionalFile[];
}

/**
 * 构建配置
 */
export interface BuildConfig {
  /** 入口文件 */
  entry: string;
  /** 输出格式 */
  format?: ('cjs' | 'esm' | 'umd')[];
  /** 是否生成声明文件 */
  generateDts?: boolean;
  /** 是否压缩 */
  minify?: boolean;
  /** 外部依赖 */
  external?: string[];
  /** 全局变量映射 */
  globals?: Record<string, string>;
  /** 是否分包 */
  splitting?: boolean;
}

/**
 * 额外文件配置
 */
export interface AdditionalFile {
  /** 源文件路径 */
  source: string;
  /** 目标路径 */
  destination: string;
  /** 是否为模板文件 */
  template?: boolean;
  /** 模板变量 */
  templateVars?: Record<string, any>;
}

/**
 * 生成的包结构
 */
export interface GeneratedPackage {
  /** 包的根目录 */
  rootDir: string;
  /** package.json 内容 */
  packageJson: any;
  /** 源文件 */
  sourceFiles: GeneratedFile[];
  /** 构建文件 */
  distFiles?: GeneratedFile[];
  /** 文档文件 */
  documentFiles: GeneratedFile[];
  /** 配置文件 */
  configFiles: GeneratedFile[];
}

/**
 * 生成的文件
 */
export interface GeneratedFile {
  /** 文件路径 */
  path: string;
  /** 文件内容 */
  content: string;
  /** 文件类型 */
  type: 'typescript' | 'javascript' | 'json' | 'markdown' | 'text';
  /** 是否为二进制文件 */
  binary?: boolean;
}

/**
 * 发布结果
 */
export interface PublishResult {
  /** 是否成功 */
  success: boolean;
  /** 包名称 */
  packageName: string;
  /** 包版本 */
  version: string;
  /** 发布的注册表 */
  registry: string;
  /** 包的 tarball URL */
  tarballUrl?: string;
  /** 错误信息 */
  error?: string;
  /** 详细日志 */
  logs: string[];
  /** 发布时间 */
  publishedAt: Date;
}

/**
 * 包验证结果
 */
export interface PackageValidationResult {
  /** 是否有效 */
  valid: boolean;
  /** 错误列表 */
  errors: string[];
  /** 警告列表 */
  warnings: string[];
  /** 包大小信息 */
  sizeInfo?: {
    /** 总大小（字节） */
    totalSize: number;
    /** 文件数量 */
    fileCount: number;
    /** 最大文件大小 */
    maxFileSize: number;
  };
}

/**
 * 模板配置
 */
export interface TemplateConfig {
  /** 模板名称 */
  name: string;
  /** 模板描述 */
  description: string;
  /** 模板变量 */
  variables: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'array';
    description: string;
    default?: any;
    required?: boolean;
  }>;
}