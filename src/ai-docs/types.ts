/**
 * AI 友好文档转换器类型定义
 * 为大语言模型优化的文档格式
 */

/**
 * AI 友好的端点信息
 */
export interface AIEndpoint {
  /** 唯一标识符 */
  id: string;
  /** HTTP 方法 */
  method: string;
  /** API 路径 */
  path: string;
  /** 生成的函数名 */
  functionName: string;
  /** 端点摘要 */
  summary?: string;
  /** 详细描述 */
  description?: string;
  /** 标签分类 */
  tags: string[];
  /** 参数信息 */
  parameters: AIParameter[];
  /** 请求体信息 */
  requestBody?: AIRequestBody;
  /** 响应信息 */
  responses: AIResponse[];
  /** 使用示例 */
  examples: AIExample[];
  /** 搜索关键词 */
  searchKeywords: string[];
  /** 复杂度等级 */
  complexity: 'simple' | 'medium' | 'complex';
  /** 是否已弃用 */
  deprecated?: boolean;
}

/**
 * AI 友好的参数信息
 */
export interface AIParameter {
  /** 参数名称 */
  name: string;
  /** 参数位置 */
  in: 'query' | 'path' | 'header' | 'cookie';
  /** 参数类型 */
  type: string;
  /** 是否必需 */
  required: boolean;
  /** 参数描述 */
  description?: string;
  /** 默认值 */
  defaultValue?: any;
  /** 示例值 */
  example?: any;
  /** 枚举值 */
  enum?: any[];
  /** 验证规则 */
  validation?: {
    minLength?: number;
    maxLength?: number;
    minimum?: number;
    maximum?: number;
    pattern?: string;
  };
}

/**
 * AI 友好的请求体信息
 */
export interface AIRequestBody {
  /** 内容类型 */
  contentType: string;
  /** 数据类型 */
  type: string;
  /** 描述 */
  description?: string;
  /** 是否必需 */
  required: boolean;
  /** Schema 信息 */
  schema?: AISchema;
  /** 示例数据 */
  example?: any;
}

/**
 * AI 友好的响应信息
 */
export interface AIResponse {
  /** 状态码 */
  statusCode: string;
  /** 状态描述 */
  description: string;
  /** 内容类型 */
  contentType?: string;
  /** 数据类型 */
  type?: string;
  /** Schema 信息 */
  schema?: AISchema;
  /** 示例数据 */
  example?: any;
}

/**
 * AI 友好的 Schema 信息
 */
export interface AISchema {
  /** 类型名称 */
  name?: string;
  /** 数据类型 */
  type: string;
  /** 描述 */
  description?: string;
  /** 属性列表 */
  properties?: Record<string, AISchemaProperty>;
  /** 必需字段 */
  required?: string[];
  /** 数组项类型 */
  items?: AISchema;
  /** 示例值 */
  example?: any;
}

/**
 * AI 友好的 Schema 属性
 */
export interface AISchemaProperty {
  /** 属性类型 */
  type: string;
  /** 属性描述 */
  description?: string;
  /** 示例值 */
  example?: any;
  /** 枚举值 */
  enum?: any[];
  /** 嵌套 Schema */
  properties?: Record<string, AISchemaProperty>;
  /** 数组项类型 */
  items?: AISchemaProperty;
}

/**
 * AI 友好的使用示例
 */
export interface AIExample {
  /** 示例名称 */
  name: string;
  /** 示例描述 */
  description: string;
  /** 请求示例 */
  request?: {
    parameters?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
  };
  /** 响应示例 */
  response?: {
    status: number;
    body?: any;
    headers?: Record<string, string>;
  };
  /** 代码示例 */
  code?: {
    javascript?: string;
    typescript?: string;
    curl?: string;
  };
}

/**
 * AI 友好的完整文档
 */
export interface AIFriendlyDoc {
  /** 元数据信息 */
  metadata: AIMetadata;
  /** 端点列表 */
  endpoints: AIEndpoint[];
  /** Schema 定义 */
  schemas: Record<string, AISchema>;
  /** 全局示例 */
  examples: AIExample[];
  /** 搜索索引 */
  searchIndex: AISearchIndex;
  /** 标签分组 */
  tagGroups: Record<string, AIEndpoint[]>;
  /** 统计信息 */
  statistics: AIStatistics;
}

/**
 * AI 文档元数据
 */
export interface AIMetadata {
  /** API 标题 */
  title: string;
  /** API 版本 */
  version: string;
  /** API 描述 */
  description?: string;
  /** 服务器信息 */
  servers: string[];
  /** 联系信息 */
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  /** 许可证信息 */
  license?: {
    name: string;
    url?: string;
  };
  /** 生成时间 */
  generatedAt: string;
  /** 生成器信息 */
  generator: {
    name: string;
    version: string;
  };
}

/**
 * AI 搜索索引
 */
export interface AISearchIndex {
  /** 关键词映射 */
  keywords: Record<string, string[]>; // keyword -> endpoint IDs
  /** 标签映射 */
  tags: Record<string, string[]>; // tag -> endpoint IDs
  /** 路径映射 */
  paths: Record<string, string>; // path -> endpoint ID
  /** 方法映射 */
  methods: Record<string, string[]>; // method -> endpoint IDs
  /** 全文搜索索引 */
  fullText: AIFullTextIndex[];
}

/**
 * 全文搜索索引项
 */
export interface AIFullTextIndex {
  /** 端点 ID */
  endpointId: string;
  /** 搜索文本 */
  text: string;
  /** 权重分数 */
  weight: number;
  /** 文本类型 */
  type: 'title' | 'description' | 'parameter' | 'response';
}

/**
 * AI 文档统计信息
 */
export interface AIStatistics {
  /** 端点总数 */
  totalEndpoints: number;
  /** 方法分布 */
  methodDistribution: Record<string, number>;
  /** 标签分布 */
  tagDistribution: Record<string, number>;
  /** 复杂度分布 */
  complexityDistribution: Record<string, number>;
  /** 平均参数数量 */
  averageParameters: number;
  /** 最复杂的端点 */
  mostComplexEndpoint?: string;
  /** 最常用的标签 */
  mostUsedTags: string[];
}

/**
 * AI 文档转换配置
 */
export interface AIDocConfig {
  /** 输出格式 */
  format: 'markdown' | 'json' | 'yaml';
  /** 是否包含示例 */
  includeExamples: boolean;
  /** 是否优化搜索 */
  optimizeForSearch: boolean;
  /** 是否包含代码示例 */
  includeCodeExamples: boolean;
  /** 是否生成目录 */
  generateTOC: boolean;
  /** 自定义模板 */
  customTemplate?: string;
  /** 语言设置 */
  language: 'zh' | 'en';
  /** 详细程度 */
  verbosity: 'minimal' | 'normal' | 'detailed';
}

/**
 * AI 文档生成结果
 */
export interface AIDocResult {
  /** 生成的文档内容 */
  content: string;
  /** 文档格式 */
  format: string;
  /** 文件扩展名 */
  extension: string;
  /** 元数据 */
  metadata: AIMetadata;
  /** 生成统计 */
  stats: {
    /** 生成时间（毫秒） */
    generationTime: number;
    /** 文档大小（字节） */
    size: number;
    /** 处理的端点数量 */
    processedEndpoints: number;
  };
}