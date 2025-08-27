/**
 * 代码生成器
 * 生成 TypeScript 类型定义和 API 函数，遵循 API 函数命名规范
 */

import { NamingStrategy } from './naming-strategy';
import type {
  ParsedSwagger,
  APIEndpoint,
  Parameter,
  GeneratedFile,
  GenerationConfig,
} from '../types';

export class CodeGenerator {
  private namingStrategy: NamingStrategy;

  constructor() {
    this.namingStrategy = new NamingStrategy();
  }

  /**
   * 生成完整的 API 客户端代码
   */
  generateAPIClient(swagger: ParsedSwagger, config: GenerationConfig): GeneratedFile[] {
    const files: GeneratedFile[] = [];

    // 生成类型定义文件
    if (config.generateTypes) {
      files.push(this.generateTypesFile(swagger));
    }

    // 生成 API 函数文件
    files.push(this.generateAPIFunctionsFile(swagger, config));

    // 生成客户端配置文件
    files.push(this.generateClientConfigFile(swagger));

    // 生成主入口文件
    files.push(this.generateIndexFile(swagger, config));

    return files;
  }

  /**
   * 生成类型定义文件
   */
  private generateTypesFile(swagger: ParsedSwagger): GeneratedFile {
    const lines: string[] = [];
    
    // 文件头注释
    if (swagger.info.description) {
      lines.push('/**');
      lines.push(` * ${swagger.info.title}`);
      lines.push(` * ${swagger.info.description}`);
      lines.push(` * Version: ${swagger.info.version}`);
      lines.push(' */');
      lines.push('');
    }

    // 基础类型
    lines.push('// ============= Base Types =============');
    lines.push('');
    lines.push('/** HTTP 方法类型 */');
    lines.push("export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';");
    lines.push('');
    lines.push('/** 请求选项 */');
    lines.push('export interface RequestOptions {');
    lines.push('  headers?: Record<string, string>;');
    lines.push('  timeout?: number;');
    lines.push('  signal?: AbortSignal;');
    lines.push('}');
    lines.push('');
    lines.push('/** API 响应包装 */');
    lines.push('export interface ApiResponse<T> {');
    lines.push('  data: T;');
    lines.push('  status: number;');
    lines.push('  statusText: string;');
    lines.push('  headers: Record<string, string>;');
    lines.push('}');
    lines.push('');

    // 生成 Schema 类型
    if (swagger.components.schemas) {
      lines.push('// ============= API Schema Types =============');
      lines.push('');
      
      Object.entries(swagger.components.schemas).forEach(([name, schema]) => {
        lines.push(...this.generateSchemaTypeLines(name, schema));
        lines.push('');
      });
    }

    // 生成请求参数类型
    lines.push('// ============= Request Parameter Types =============');
    lines.push('');
    
    swagger.paths.forEach(endpoint => {
      const queryParams = endpoint.parameters.filter(p => p.in === 'query');
      if (queryParams.length > 0) {
        const typeName = this.namingStrategy.generateParameterTypeName(
          endpoint.path,
          endpoint.method,
          'Params'
        );
        lines.push(...this.generateParameterTypeLines(typeName, queryParams));
        lines.push('');
      }

      // 请求体类型
      if (endpoint.requestBody) {
        const typeName = this.namingStrategy.generateParameterTypeName(
          endpoint.path,
          endpoint.method,
          'Request'
        );
        lines.push(...this.generateRequestBodyTypeLines(typeName, endpoint.requestBody));
        lines.push('');
      }

      // 响应类型
      const successResponse = endpoint.responses.find(r => r.statusCode === '200' || r.statusCode === '201');
      if (successResponse) {
        const typeName = this.namingStrategy.generateParameterTypeName(
          endpoint.path,
          endpoint.method,
          'Response'
        );
        lines.push(...this.generateResponseTypeLines(typeName, successResponse));
        lines.push('');
      }
    });

    return {
      path: 'types.ts',
      content: lines.join('\n'),
      type: 'typescript',
    };
  }

  /**
   * 生成 Schema 类型行
   */
  private generateSchemaTypeLines(name: string, schema: any): string[] {
    const lines: string[] = [];
    
    if (schema.type === 'object') {
      if (schema.description) {
        lines.push(`/** ${schema.description} */`);
      }
      lines.push(`export interface ${name} {`);
      
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([propName, propSchema]: [string, any]) => {
          const isRequired = schema.required?.includes(propName);
          const optional = isRequired ? '' : '?';
          const type = this.getTypeScriptType(propSchema);
          
          if (propSchema.description) {
            lines.push(`  /** ${propSchema.description} */`);
          }
          lines.push(`  ${propName}${optional}: ${type};`);
        });
      }
      
      lines.push('}');
    } else if (schema.enum) {
      lines.push(`export enum ${name} {`);
      schema.enum.forEach((value: any) => {
        lines.push(`  ${JSON.stringify(value)} = ${JSON.stringify(value)},`);
      });
      lines.push('}');
    } else {
      lines.push(`export type ${name} = ${this.getTypeScriptType(schema)};`);
    }
    
    return lines;
  }

  /**
   * 生成参数类型行
   */
  private generateParameterTypeLines(typeName: string, parameters: Parameter[]): string[] {
    const lines: string[] = [];
    lines.push(`export interface ${typeName} {`);

    parameters.forEach(param => {
      const optional = param.required ? '' : '?';
      const type = this.getTypeScriptType(param.schema);
      
      if (param.description) {
        lines.push(`  /** ${param.description} */`);
      }
      lines.push(`  ${param.name}${optional}: ${type};`);
    });

    lines.push('}');
    return lines;
  }

  /**
   * 生成请求体类型行
   */
  private generateRequestBodyTypeLines(typeName: string, requestBody: any): string[] {
    const jsonContent = requestBody.content?.['application/json'];
    if (jsonContent?.schema) {
      const type = this.getTypeScriptType(jsonContent.schema);
      return [`export type ${typeName} = ${type};`];
    }
    return [`export type ${typeName} = any;`];
  }

  /**
   * 生成响应类型行
   */
  private generateResponseTypeLines(typeName: string, response: any): string[] {
    const jsonContent = response.content?.['application/json'];
    if (jsonContent?.schema) {
      const type = this.getTypeScriptType(jsonContent.schema);
      return [`export type ${typeName} = ${type};`];
    }
    return [`export type ${typeName} = any;`];
  }

  /**
   * 将 JSON Schema 转换为 TypeScript 类型
   */
  private getTypeScriptType(schema: any): string {
    if (!schema) return 'any';

    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return refName || 'any';
    }

    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return schema.enum.map((v: any) => JSON.stringify(v)).join(' | ');
        }
        return 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        if (schema.items) {
          return `Array<${this.getTypeScriptType(schema.items)}>`;
        }
        return 'Array<any>';
      case 'object':
        if (schema.properties) {
          const props = Object.entries(schema.properties)
            .map(([key, propSchema]: [string, any]) => {
              const optional = schema.required?.includes(key) ? '' : '?';
              return `${key}${optional}: ${this.getTypeScriptType(propSchema)}`;
            })
            .join('; ');
          return `{ ${props} }`;
        }
        return 'Record<string, any>';
      default:
        return 'any';
    }
  }

  /**
   * 生成 API 函数文件
   */
  private generateAPIFunctionsFile(swagger: ParsedSwagger, config: GenerationConfig): GeneratedFile {
    const lines: string[] = [];

    // 导入语句
    lines.push("import { apiClient } from './client';");
    lines.push("import { filterQueryParams, validateRequestBody, createRequestConfig } from '../utils/api-utils';");
    if (config.generateTypes) {
      lines.push("import type * as Types from './types';");
    }
    lines.push('');

    // 生成每个 API 函数
    swagger.paths.forEach(endpoint => {
      lines.push(...this.generateAPIFunctionLines(endpoint, config));
      lines.push('');
    });

    return {
      path: 'api.ts',
      content: lines.join('\n'),
      type: 'typescript',
    };
  }

  /**
   * 生成单个 API 函数行
   */
  private generateAPIFunctionLines(endpoint: APIEndpoint, config: GenerationConfig): string[] {
    const lines: string[] = [];

    // 函数注释
    if (config.includeComments) {
      lines.push('/**');
      if (endpoint.summary) {
        lines.push(` * ${endpoint.summary}`);
      }
      if (endpoint.description) {
        lines.push(` * ${endpoint.description}`);
      }
      lines.push(` * ${endpoint.method} ${endpoint.path}`);
      if (endpoint.tags.length > 0) {
        lines.push(` * @tags ${endpoint.tags.join(', ')}`);
      }
      lines.push(' */');
    }

    // 函数签名
    const functionParams = this.generateFunctionParameters(endpoint);
    const returnType = this.generateReturnType(endpoint);
    lines.push(`export async function ${endpoint.functionName}(${functionParams}): Promise<${returnType}> {`);

    // 函数体
    lines.push(...this.generateFunctionBodyLines(endpoint));

    lines.push('}');
    return lines;
  }

  /**
   * 生成函数参数
   */
  private generateFunctionParameters(endpoint: APIEndpoint): string {
    const params: string[] = [];

    // 路径参数
    const pathParams = endpoint.parameters.filter(p => p.in === 'path');
    pathParams.forEach(param => {
      const type = this.getTypeScriptType(param.schema);
      params.push(`${param.name}: ${type}`);
    });

    // 查询参数
    const queryParams = endpoint.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      const paramTypeName = this.namingStrategy.generateParameterTypeName(
        endpoint.path,
        endpoint.method,
        'Params'
      );
      params.push(`params?: Types.${paramTypeName}`);
    }

    // 请求体
    if (endpoint.requestBody) {
      const requestTypeName = this.namingStrategy.generateParameterTypeName(
        endpoint.path,
        endpoint.method,
        'Request'
      );
      const required = endpoint.requestBody.required ? '' : '?';
      params.push(`data${required}: Types.${requestTypeName}`);
    }

    // 选项参数
    params.push('options?: Types.RequestOptions');

    return params.join(', ');
  }

  /**
   * 生成返回类型
   */
  private generateReturnType(endpoint: APIEndpoint): string {
    const successResponse = endpoint.responses.find(r => r.statusCode === '200' || r.statusCode === '201');
    if (successResponse) {
      const responseTypeName = this.namingStrategy.generateParameterTypeName(
        endpoint.path,
        endpoint.method,
        'Response'
      );
      return `Types.${responseTypeName}`;
    }
    return 'any';
  }

  /**
   * 生成函数体行
   */
  private generateFunctionBodyLines(endpoint: APIEndpoint): string[] {
    const lines: string[] = [];

    // 构建 URL
    const pathParams = endpoint.parameters.filter(p => p.in === 'path');
    if (pathParams.length > 0) {
      let urlTemplate = endpoint.path;
      pathParams.forEach(param => {
        urlTemplate = urlTemplate.replace(`{${param.name}}`, `\${${param.name}}`);
      });
      lines.push(`  const url = \`${urlTemplate}\`;`);
    } else {
      lines.push(`  const url = '${endpoint.path}';`);
    }

    // 构建配置
    lines.push('');
    lines.push('  const config = {');
    lines.push(`    method: '${endpoint.method}' as const,`);
    lines.push('    url,');

    // 查询参数
    const queryParams = endpoint.parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      lines.push('    params: params ? filterQueryParams(params, []) : undefined,');
    }

    // 请求体
    if (endpoint.requestBody) {
      lines.push('    data,');
    }

    lines.push('    ...options,');
    lines.push('  };');

    // 执行请求
    lines.push('');
    lines.push('  const response = await apiClient.request(config);');
    lines.push('  return response.data;');

    return lines;
  }

  /**
   * 生成客户端配置文件
   */
  private generateClientConfigFile(swagger: ParsedSwagger): GeneratedFile {
    const baseURL = swagger.servers.length > 0 ? swagger.servers[0].url : '';
    
    const lines: string[] = [
      '/**',
      ` * API 客户端配置`,
      ` * Generated for: ${swagger.info.title} v${swagger.info.version}`,
      ' * 支持拦截器系统、认证、重试等高级功能',
      ' */',
      '',
      "import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';",
      "import { InterceptorManager, InterceptorConfig, interceptorPresets } from '../interceptors';",
      '',
      '/** API 客户端配置选项 */',
      'export interface APIClientConfig {',
      '  /** API 基础 URL */',
      '  baseURL?: string;',
      '  /** 请求超时时间（毫秒） */',
      '  timeout?: number;',
      '  /** 默认请求头 */',
      '  headers?: Record<string, string>;',
      '  /** 拦截器配置 */',
      '  interceptors?: InterceptorConfig;',
      '  /** 使用预设拦截器配置 */',
      '  preset?: "development" | "production" | "testing" | "minimal";',
      '  /** 是否启用默认错误处理 */',
      '  enableDefaultErrorHandling?: boolean;',
      '}',
      '',
      '/** API 客户端类 */',
      'export class APIClient {',
      '  private instance: AxiosInstance;',
      '  private interceptorManager: InterceptorManager;',
      '',
      '  constructor(config: APIClientConfig = {}) {',
      '    // 创建 Axios 实例',
      '    this.instance = axios.create({',
      `      baseURL: config.baseURL || '${baseURL}',`,
      '      timeout: config.timeout || 10000,',
      '      headers: {',
      "        'Content-Type': 'application/json',",
      "        'User-Agent': 'Generated-API-Client/1.0.0',",
      '        ...config.headers,',
      '      },',
      '    });',
      '',
      '    // 创建拦截器管理器',
      '    this.interceptorManager = new InterceptorManager(this.instance);',
      '',
      '    // 应用拦截器配置',
      '    this.setupInterceptors(config);',
      '  }',
      '',
      '  /**',
      '   * 设置拦截器',
      '   */',
      '  private setupInterceptors(config: APIClientConfig): void {',
      '    let interceptorConfig: InterceptorConfig | undefined;',
      '',
      '    // 使用预设配置',
      '    if (config.preset) {',
      '      interceptorConfig = interceptorPresets[config.preset];',
      '    }',
      '',
      '    // 使用自定义配置',
      '    if (config.interceptors) {',
      '      interceptorConfig = config.interceptors;',
      '    }',
      '',
      '    // 注册拦截器',
      '    if (interceptorConfig) {',
      '      this.interceptorManager.register(interceptorConfig);',
      '    }',
      '  }',
      '',
      '  /**',
      '   * 发送请求',
      '   */',
      '  async request<T = any>(config: AxiosRequestConfig): Promise<{ data: T; status: number; statusText: string; headers: any }> {',
      '    const response = await this.instance.request<T>(config);',
      '    return {',
      '      data: response.data,',
      '      status: response.status,',
      '      statusText: response.statusText,',
      '      headers: response.headers,',
      '    };',
      '  }',
      '',
      '  /**',
      '   * 获取 Axios 实例',
      '   */',
      '  getInstance(): AxiosInstance {',
      '    return this.instance;',
      '  }',
      '',
      '  /**',
      '   * 获取拦截器管理器',
      '   */',
      '  getInterceptorManager(): InterceptorManager {',
      '    return this.interceptorManager;',
      '  }',
      '',
      '  /**',
      '   * 设置请求头',
      '   */',
      '  setHeader(name: string, value: string): void {',
      '    this.instance.defaults.headers.common[name] = value;',
      '  }',
      '',
      '  /**',
      '   * 移除请求头',
      '   */',
      '  removeHeader(name: string): void {',
      '    delete this.instance.defaults.headers.common[name];',
      '  }',
      '',
      '  /**',
      '   * 设置基础 URL',
      '   */',
      '  setBaseURL(baseURL: string): void {',
      '    this.instance.defaults.baseURL = baseURL;',
      '  }',
      '',
      '  /**',
      '   * 设置超时时间',
      '   */',
      '  setTimeout(timeout: number): void {',
      '    this.instance.defaults.timeout = timeout;',
      '  }',
      '}',
      '',
      '/** 默认 API 客户端实例 */',
      'export const apiClient = new APIClient({',
      '  preset: process.env.NODE_ENV === "development" ? "development" : "production",',
      '});'
    ];

    return {
      path: 'client.ts',
      content: lines.join('\n'),
      type: 'typescript',
    };
  }

  /**
   * 生成主入口文件
   */
  private generateIndexFile(swagger: ParsedSwagger, config: GenerationConfig): GeneratedFile {
    const lines: string[] = [
      '/**',
      ` * ${swagger.info.title} API Client`,
      ` * ${swagger.info.description || ''}`,
      ' * ',
      ` * Version: ${swagger.info.version}`,
      ` * Generated on: ${new Date().toISOString()}`,
      ' * ',
      ' * 支持特性:',
      ' * - 自动生成的 TypeScript API 函数',
      ' * - 内置 Axios 支持',
      ' * - 拦截器系统（认证、日志、重试、错误处理）',
      ' * - 参数过滤和验证',
      ' * - TypeScript 类型安全',
      ' */',
      '',
      "// 核心 API 函数",
      "export * from './api';",
    ];

    if (config.generateTypes) {
      lines.push("");
      lines.push("// TypeScript 类型定义");
      lines.push("export * from './types';");
    }

    lines.push("");
    lines.push("// API 客户端配置");
    lines.push("export * from './client';");
    lines.push("");
    lines.push("// 工具函数");
    lines.push("export * from '../utils/api-utils';");
    lines.push("");
    lines.push("// 拦截器系统");
    lines.push("export * from '../interceptors';");

    return {
      path: 'index.ts',
      content: lines.join('\n'),
      type: 'typescript',
    };
  }
}