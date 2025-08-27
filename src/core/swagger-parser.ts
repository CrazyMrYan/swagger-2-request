/**
 * Swagger 解析器
 * 使用 swagger-parser 解析 OpenAPI 文档，提取 paths、components、schemas
 */

import SwaggerParser from 'swagger-parser';
import { OpenAPIV3 } from 'openapi-types';
import { NamingStrategy } from './naming-strategy';
import type {
  ParsedSwagger,
  APIEndpoint,
  Parameter,
  ResponseDefinition,
  RequestBody,
  HTTPMethod,
} from '../types';

export class SwaggerAnalyzer {
  private schema!: OpenAPIV3.Document;
  private namingStrategy: NamingStrategy;

  constructor() {
    this.namingStrategy = new NamingStrategy();
  }

  /**
   * 解析 Swagger 文档
   * @param source Swagger 文档路径、URL 或对象
   * @returns 解析后的 Swagger 数据
   */
  async parseSwagger(source: string | OpenAPIV3.Document): Promise<ParsedSwagger> {
    try {
      // 使用 swagger-parser 解析和验证文档
      const parser = SwaggerParser as any;
      this.schema = (await parser.dereference(source)) as OpenAPIV3.Document;
      
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
  async validateSwagger(source: string | OpenAPIV3.Document): Promise<boolean> {
    try {
      const parser = SwaggerParser as any;
      await parser.validate(source);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Swagger validation failed: ${errorMessage}`);
    }
  }

  /**
   * 转换解析后的 Schema 为内部格式
   */
  private transformSchema(): ParsedSwagger {
    const paths = this.extractPaths();
    const components = this.extractComponents();
    const servers = this.schema.servers || [];

    return {
      info: {
        title: this.schema.info.title,
        version: this.schema.info.version,
        description: this.schema.info.description,
      },
      paths,
      components,
      servers: servers.map(server => ({
        url: server.url,
        description: server.description,
      })),
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
        const operation = pathItem[method] as OpenAPIV3.OperationObject;
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
    operation: OpenAPIV3.OperationObject,
    pathItem: OpenAPIV3.PathItemObject
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

      const parameter: Parameter = {
        name: param.name,
        in: param.in as 'query' | 'path' | 'header' | 'cookie',
        required: param.required || param.in === 'path',
        schema: param.schema || {},
        description: param.description,
      };

      parameters.push(parameter);
    });

    return parameters;
  }

  /**
   * 提取响应信息
   */
  private extractResponses(operation: OpenAPIV3.OperationObject): ResponseDefinition[] {
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

      if (response.content) {
        responseDefinition.content = Object.fromEntries(
          Object.entries(response.content).map(([mediaType, mediaTypeObject]) => [
            mediaType,
            {
              schema: mediaTypeObject.schema,
              example: mediaTypeObject.example,
              examples: mediaTypeObject.examples,
            },
          ])
        );
      }

      responses.push(responseDefinition);
    });

    return responses;
  }

  /**
   * 提取请求体信息
   */
  private extractRequestBody(operation: OpenAPIV3.OperationObject): RequestBody | undefined {
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
        Object.entries(operation.requestBody.content).map(([mediaType, mediaTypeObject]) => [
          mediaType,
          {
            schema: mediaTypeObject.schema,
            example: mediaTypeObject.example,
            examples: mediaTypeObject.examples,
          },
        ])
      );
    }

    return requestBody;
  }

  /**
   * 提取组件信息
   */
  private extractComponents() {
    const components = this.schema.components || {};

    return {
      schemas: components.schemas || {},
      responses: components.responses || {},
      parameters: components.parameters || {},
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