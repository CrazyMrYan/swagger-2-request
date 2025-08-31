/**
 * Swagger 解析器
 * 支持 OpenAPI 3.0-3.1 版本，使用多种解析器提取 paths、components、schemas
 */

import SwaggerParser from 'swagger-parser';
import { parse as parseWithReadme } from '@readme/openapi-parser';
import { OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import { NamingStrategy } from './naming-strategy';
import type {
  ParsedSwagger,
  APIEndpoint,
  Parameter,
  ResponseDefinition,
  RequestBody,
  HTTPMethod,
} from '../types';

// 支持的 OpenAPI 版本类型
type OpenAPIDocument = OpenAPIV3.Document | OpenAPIV3_1.Document;

export class SwaggerAnalyzer {
  private schema!: OpenAPIDocument;
  private namingStrategy: NamingStrategy;

  constructor() {
    this.namingStrategy = new NamingStrategy();
  }

  /**
   * 解析 Swagger 文档
   * @param source Swagger 文档路径、URL 或对象
   * @returns 解析后的 Swagger 数据
   */
  async parseSwagger(source: string | OpenAPIDocument): Promise<ParsedSwagger> {
    try {
      // 先尝试获取文档内容（如果是 URL）
      let apiDoc: OpenAPIDocument;
      
      if (typeof source === 'string') {
        if (source.startsWith('http')) {
          // 从 URL 获取
          const response = await fetch(source);
          if (!response.ok) {
            throw new Error(`Failed to fetch from ${source}: ${response.statusText}`);
          }
          apiDoc = await response.json();
        } else {
          // 从文件路径读取
          const fs = await import('fs/promises');
          const content = await fs.readFile(source, 'utf-8');
          apiDoc = JSON.parse(content);
        }
      } else {
        apiDoc = source;
      }
      
      // 检查 OpenAPI 版本并选择合适的解析器
      const version = this.getOpenAPIVersion(apiDoc);
      
      if (version.startsWith('3.1')) {
        // 使用 @readme/openapi-parser 处理 3.1
        console.log('🔄 Using @readme/openapi-parser for OpenAPI 3.1');
        this.schema = await parseWithReadme(apiDoc) as OpenAPIDocument;
      } else if (version.startsWith('3.0')) {
        // 使用 swagger-parser 处理 3.0
        console.log('🔄 Using swagger-parser for OpenAPI 3.0');
        const parser = SwaggerParser as any;
        this.schema = (await parser.dereference(apiDoc)) as OpenAPIDocument;
      } else if (version.startsWith('2.0')) {
        // 使用 swagger-parser 处理 Swagger 2.0
        console.log('🔄 Using swagger-parser for Swagger 2.0');
        const parser = SwaggerParser as any;
        this.schema = (await parser.dereference(apiDoc)) as OpenAPIDocument;
      } else {
        throw new Error(`Unsupported OpenAPI version: ${version}. Supported versions: 2.0, 3.0.x, 3.1.x`);
      }
      
      return this.transformSchema();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to parse Swagger document: ${errorMessage}`);
    }
  }

  /**
   * 验证 Swagger 文档
   * @param source Swagger 文档路径、URL 或对象
   * @returns 验证结果
   */
  async validateSwagger(source: string | OpenAPIDocument): Promise<boolean> {
    try {
      // 首先获取文档内容
      let apiDoc: OpenAPIDocument;
      
      if (typeof source === 'string') {
        if (source.startsWith('http')) {
          const response = await fetch(source);
          if (!response.ok) {
            throw new Error(`Failed to fetch from ${source}: ${response.statusText}`);
          }
          apiDoc = await response.json();
        } else {
          const fs = await import('fs/promises');
          const content = await fs.readFile(source, 'utf-8');
          apiDoc = JSON.parse(content);
        }
      } else {
        apiDoc = source;
      }
      
      const version = this.getOpenAPIVersion(apiDoc);
      
      if (version.startsWith('3.1')) {
        // 使用 @scalar/openapi-parser 验证 3.1
        const { validate } = await import('@scalar/openapi-parser');
        const result = await validate(apiDoc);
        if (!result.valid) {
          throw new Error(`Validation failed: ${JSON.stringify(result.errors)}`);
        }
        return true;
      } else if (version.startsWith('3.0') || version.startsWith('2.0')) {
        // 使用 swagger-parser 验证 3.0 和 2.0
        const parser = SwaggerParser as any;
        await parser.validate(apiDoc);
        return true;
      } else {
        throw new Error(`Unsupported OpenAPI version: ${version}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Swagger validation failed: ${errorMessage}`);
    }
  }

  /**
   * 获取 OpenAPI 版本
   */
  private getOpenAPIVersion(apiDoc: any): string {
    return apiDoc.openapi || apiDoc.swagger || '3.0.0';
  }

  /**
   * 转换解析后的 Schema 为内部格式
   */
  private transformSchema(): ParsedSwagger {
    const paths = this.extractPaths();
    const components = this.extractComponents();
    
    // 处理 servers 字段，Swagger 2.0 使用 host + basePath
    let servers: Array<{ url: string; description?: string }> = [];
    
    if (this.schema.servers) {
      // OpenAPI 3.x 格式
      servers = this.schema.servers.map(server => ({
        url: server.url,
        description: server.description,
      }));
    } else {
      // Swagger 2.0 格式，构建 servers 列表
      const swagger2Schema = this.schema as any;
      if (swagger2Schema.host) {
        const protocol = (swagger2Schema.schemes && swagger2Schema.schemes[0]) || 'https';
        const basePath = swagger2Schema.basePath || '';
        const url = `${protocol}://${swagger2Schema.host}${basePath}`;
        servers = [{ url, description: 'Swagger 2.0 API server' }];
      }
    }

    return {
      info: {
        title: this.schema.info.title,
        version: this.schema.info.version,
        description: this.schema.info.description,
      },
      paths,
      components,
      servers,
    };
  }

  /**
   * 提取 API 路径信息
   */
  private extractPaths(): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];

    if (!this.schema.paths) {
      return endpoints;
    }

    Object.entries(this.schema.paths).forEach(([path, pathItem]) => {
      if (!pathItem) return;

      // 支持的 HTTP 方法
      const methods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'] as const;

      methods.forEach(method => {
        const operation = pathItem[method] as OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject;
        if (!operation) return;

        const endpoint: APIEndpoint = {
          path,
          method: method.toUpperCase() as HTTPMethod,
          operationId: operation.operationId,
          functionName: this.namingStrategy.generateFunctionName(path, method.toUpperCase() as HTTPMethod),
          parameters: this.extractParameters(operation, pathItem),
          responses: this.extractResponses(operation),
          requestBody: this.extractRequestBody(operation),
          tags: operation.tags || [],
          summary: operation.summary,
          description: operation.description,
        };

        endpoints.push(endpoint);
      });
    });

    return endpoints;
  }

  /**
   * 提取参数信息
   */
  private extractParameters(
    operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
    pathItem: OpenAPIV3.PathItemObject | OpenAPIV3_1.PathItemObject
  ): Parameter[] {
    const parameters: Parameter[] = [];

    // 合并路径级别和操作级别的参数
    const allParams = [
      ...(pathItem.parameters || []),
      ...(operation.parameters || []),
    ];

    allParams.forEach(param => {
      if ('$ref' in param) {
        // 处理引用参数（已经被 dereference 处理过）
        return;
      }

      // 处理 Swagger 2.0 和 OpenAPI 3.x 的参数格式差异
      let schema: any = {};
      
      if (param.schema) {
        // OpenAPI 3.x 格式
        schema = param.schema;
      } else {
        // Swagger 2.0 格式，参数类型直接在参数对象上
        const swagger2Param = param as any;
        if (swagger2Param.type) {
          schema = {
            type: swagger2Param.type,
            format: swagger2Param.format,
            enum: swagger2Param.enum,
            items: swagger2Param.items,
            minimum: swagger2Param.minimum,
            maximum: swagger2Param.maximum,
            minLength: swagger2Param.minLength,
            maxLength: swagger2Param.maxLength,
            pattern: swagger2Param.pattern,
            default: swagger2Param.default,
          };
          
          // 移除 undefined 值
          Object.keys(schema).forEach(key => {
            if (schema[key] === undefined) {
              delete schema[key];
            }
          });
        }
      }

      const parameter: Parameter = {
        name: param.name,
        in: param.in as 'query' | 'path' | 'header' | 'cookie',
        required: param.required || param.in === 'path',
        schema,
        description: param.description,
      };

      parameters.push(parameter);
    });

    return parameters;
  }

  /**
   * 提取响应信息
   */
  private extractResponses(operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject): ResponseDefinition[] {
    const responses: ResponseDefinition[] = [];

    if (!operation.responses) {
      return responses;
    }

    Object.entries(operation.responses).forEach(([statusCode, response]) => {
      if ('$ref' in response) {
        // 处理引用响应（已经被 dereference 处理过）
        return;
      }

      const responseDefinition: ResponseDefinition = {
        statusCode,
        description: response.description,
        content: {},
        headers: response.headers,
      };

      // 处理 OpenAPI 3.0+ 格式
      if (response.content) {
        responseDefinition.content = Object.fromEntries(
          Object.entries(response.content).map(([mediaType, mediaTypeObject]) => {
            const mediaObj = mediaTypeObject as any;
            return [
              mediaType,
              {
                schema: mediaObj.schema,
                example: mediaObj.example,
                examples: mediaObj.examples,
              },
            ];
          })
        );
      }
      // 处理 Swagger 2.0 格式
      else if ((response as any).schema) {
        responseDefinition.content = {
          'application/json': {
            schema: (response as any).schema,
            example: (response as any).examples?.['application/json'],
          },
        };
        // 直接在响应定义上添加schema字段以兼容mock服务器
        (responseDefinition as any).schema = (response as any).schema;
      }

      responses.push(responseDefinition);
    });

    return responses;
  }

  /**
   * 提取请求体信息
   */
  private extractRequestBody(operation: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject): RequestBody | undefined {
    if (!operation.requestBody) {
      return undefined;
    }

    if ('$ref' in operation.requestBody) {
      // 处理引用请求体（已经被 dereference 处理过）
      return undefined;
    }

    const requestBody: RequestBody = {
      required: operation.requestBody.required,
      description: operation.requestBody.description,
      content: {},
    };

    if (operation.requestBody.content) {
      requestBody.content = Object.fromEntries(
        Object.entries(operation.requestBody.content).map(([mediaType, mediaTypeObject]) => {
          const mediaObj = mediaTypeObject as any;
          return [
            mediaType,
            {
              schema: mediaObj.schema,
              example: mediaObj.example,
              examples: mediaObj.examples,
            },
          ];
        })
      );
    }

    return requestBody;
  }

  /**
   * 提取组件信息
   */
  private extractComponents() {
    const components = this.schema.components || {};
    const swagger2Schema = this.schema as any;
    
    // 处理 Swagger 2.0 的 definitions
    let schemas = components.schemas || {};
    if (swagger2Schema.definitions) {
      schemas = swagger2Schema.definitions;
    }

    return {
      schemas,
      responses: components.responses || swagger2Schema.responses || {},
      parameters: components.parameters || swagger2Schema.parameters || {},
      requestBodies: components.requestBodies || {},
    };
  }

  /**
   * 获取 API 基础 URL
   */
  getBaseUrl(): string {
    if (this.schema.servers && this.schema.servers.length > 0) {
      return this.schema.servers[0].url;
    }
    return '';
  }

  /**
   * 获取 API 信息
   */
  getApiInfo() {
    return {
      title: this.schema.info.title,
      version: this.schema.info.version,
      description: this.schema.info.description,
      contact: this.schema.info.contact,
      license: this.schema.info.license,
    };
  }

  /**
   * 获取所有标签
   */
  getTags(): string[] {
    if (!this.schema.tags) {
      return [];
    }

    return this.schema.tags.map(tag => tag.name);
  }

  /**
   * 根据标签过滤端点
   */
  filterEndpointsByTag(endpoints: APIEndpoint[], tag: string): APIEndpoint[] {
    return endpoints.filter(endpoint => endpoint.tags.includes(tag));
  }

  /**
   * 获取安全定义
   */
  getSecuritySchemes() {
    return this.schema.components?.securitySchemes || {};
  }
}