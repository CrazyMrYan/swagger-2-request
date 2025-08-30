/**
 * Swagger-2-Request 核心类型定义
 */

import { AxiosRequestConfig, AxiosResponse } from 'axios';

// HTTP 方法类型
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// API 端点定义
export interface APIEndpoint {
  path: string;
  method: HTTPMethod;
  operationId?: string;
  functionName: string;
  parameters: Parameter[];
  responses: ResponseDefinition[];
  requestBody?: RequestBody;
  tags: string[];
  summary?: string;
  description?: string;
}

// 参数定义
export interface Parameter {
  name: string;
  in: 'query' | 'path' | 'header' | 'cookie';
  required: boolean;
  schema: any;
  description?: string;
}

// 请求体定义
export interface RequestBody {
  content: Record<string, MediaType>;
  required?: boolean;
  description?: string;
}

// 媒体类型
export interface MediaType {
  schema: any;
  example?: any;
  examples?: Record<string, any>;
}

// 响应定义
export interface ResponseDefinition {
  statusCode: string;
  description: string;
  content?: Record<string, MediaType>;
  headers?: Record<string, any>;
}

// 解析后的 Swagger 文档
export interface ParsedSwagger {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: APIEndpoint[];
  components: {
    schemas?: Record<string, any>;
    responses?: Record<string, any>;
    parameters?: Record<string, any>;
    requestBodies?: Record<string, any>;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
}

// 代码生成配置
export interface GenerationConfig {
  outputDir: string;
  typescript: boolean;
  functionNaming: 'pathMethod' | 'operationId';
  includeComments: boolean;
  generateTypes: boolean;
  cleanOutput: boolean;
  excludeFiles: string[];
  /** 是否强制覆盖所有文件，包括 client 文件 */
  forceOverride?: boolean;
}

// 运行时配置
export interface RuntimeConfig {
  baseURL?: string;
  timeout?: number;
  validateParams?: boolean;
  filterParams?: boolean;
}

// 拦截器定义
export interface RequestInterceptor {
  onRequest?(config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig>;
  onRequestError?(error: any): any;
}

export interface ResponseInterceptor {
  onResponse?(response: AxiosResponse): AxiosResponse | Promise<AxiosResponse>;
  onResponseError?(error: any): any;
}

export interface InterceptorConfig {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
}

// Mock 服务配置
export interface MockConfig {
  enabled: boolean;
  port: number;
  delay?: number;
  ui?: boolean;
  customResponses?: string;
}

// NPM 包配置
export interface PackageConfig {
  name: string;
  version: string;
  description: string;
  repository?: string;
  private?: boolean;
  publishConfig?: {
    registry?: string;
  };
}

// 主配置接口
export interface S2RConfig {
  swagger: {
    source: string;
    version?: string;
  };
  generation: GenerationConfig;
  runtime: RuntimeConfig;
  interceptors?: InterceptorConfig;
  mock?: MockConfig;
  package?: PackageConfig;
}

// 请求选项
export interface RequestOptions extends Omit<AxiosRequestConfig, 'url' | 'method' | 'data' | 'params'> {
  meta?: {
    querySchema?: Parameter[];
    bodySchema?: any;
  };
}

// 生成的包结构
export interface GeneratedPackage {
  packageJson: any;
  sourceFiles: GeneratedFile[];
  documentation: string;
  buildConfig: any;
}

// 生成的文件
export interface GeneratedFile {
  path: string;
  content: string;
  type: 'typescript' | 'javascript' | 'json' | 'markdown';
}

// AI 友好文档格式
export interface AIFriendlyDoc {
  metadata: {
    title: string;
    version: string;
    description?: string;
    baseUrl?: string;
  };
  endpoints: AIEndpoint[];
  schemas: AISchema[];
  examples: AIExample[];
  searchIndex: string[];
}

export interface AIEndpoint {
  id: string;
  method: HTTPMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  parameters: AIParameter[];
  requestBody?: AIRequestBody;
  responses: AIResponse[];
  examples: AIExample[];
  searchKeywords: string[];
}

export interface AIParameter {
  name: string;
  in: string;
  type: string;
  required: boolean;
  description?: string;
  example?: any;
}

export interface AIRequestBody {
  contentType: string;
  schema: any;
  example?: any;
  description?: string;
}

export interface AIResponse {
  statusCode: string;
  description: string;
  schema?: any;
  example?: any;
}

export interface AISchema {
  name: string;
  type: string;
  properties?: Record<string, any>;
  description?: string;
  example?: any;
}

export interface AIExample {
  title: string;
  description?: string;
  request: {
    method: HTTPMethod;
    path: string;
    headers?: Record<string, string>;
    body?: any;
  };
  response: {
    statusCode: number;
    headers?: Record<string, string>;
    body: any;
  };
}