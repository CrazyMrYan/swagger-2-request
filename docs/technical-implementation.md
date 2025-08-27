# Technical Implementation Guide

## 核心实现细节

### 1. Swagger 解析与类型生成

#### 1.1 解析器实现

```typescript
import SwaggerParser from 'swagger-parser';
import { OpenAPIV3 } from 'openapi-types';

export class SwaggerAnalyzer {
  private schema: OpenAPIV3.Document;
  
  async parseSwagger(source: string | object): Promise<ParsedSwagger> {
    this.schema = await SwaggerParser.dereference(source) as OpenAPIV3.Document;
    return this.transformSchema();
  }
  
  private transformSchema(): ParsedSwagger {
    const paths = this.extractPaths();
    const components = this.extractComponents();
    
    return {
      info: this.schema.info,
      paths,
      components,
      servers: this.schema.servers || []
    };
  }
  
  private extractPaths(): APIEndpoint[] {
    const endpoints: APIEndpoint[] = [];
    
    Object.entries(this.schema.paths).forEach(([path, pathItem]) => {
      if (!pathItem) return;
      
      Object.entries(pathItem).forEach(([method, operation]) => {
        if (!operation || typeof operation !== 'object') return;
        
        const endpoint: APIEndpoint = {
          path,
          method: method.toUpperCase() as HTTPMethod,
          operationId: operation.operationId,
          functionName: this.generateFunctionName(path, method),
          parameters: this.extractParameters(operation),
          responses: this.extractResponses(operation),
          requestBody: this.extractRequestBody(operation),
          tags: operation.tags || [],
          summary: operation.summary,
          description: operation.description
        };
        
        endpoints.push(endpoint);
      });
    });
    
    return endpoints;
  }
}
```

#### 1.2 函数名生成策略

```typescript
export class NamingStrategy {
  generateFunctionName(path: string, method: string): string {
    // 处理路径参数: /api/users/{id} -> /api/users/Id
    const pathWithParams = path.replace(/\{([^}]+)\}/g, (_, param) => 
      this.capitalize(param)
    );
    
    // 移除特殊字符并转换为驼峰命名
    const cleanPath = pathWithParams
      .split('/')
      .filter(segment => segment.length > 0)
      .map((segment, index) => 
        index === 0 ? segment : this.capitalize(segment)
      )
      .join('');
    
    const methodSuffix = this.capitalize(method.toLowerCase());
    
    return `${cleanPath}${methodSuffix}`;
  }
  
  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// Examples:
// /api/users + GET -> apiUsersGet
// /api/users/{id} + PUT -> apiUsersIdPut  
// /auth/login + POST -> authLoginPost
```

### 2. TypeScript 代码生成

#### 2.1 类型定义生成

```typescript
export class TypeGenerator {
  generateTypes(components: ComponentSchemas): string {
    const typeDefinitions: string[] = [];
    
    Object.entries(components.schemas || {}).forEach(([name, schema]) => {
      const typeDefinition = this.schemaToTypeScript(name, schema);
      typeDefinitions.push(typeDefinition);
    });
    
    return typeDefinitions.join('\n\n');
  }
  
  private schemaToTypeScript(name: string, schema: any): string {
    switch (schema.type) {
      case 'object':
        return this.generateInterfaceType(name, schema);
      case 'string':
        if (schema.enum) {
          return this.generateEnumType(name, schema.enum);
        }
        return `export type ${name} = string;`;
      default:
        return this.generateGenericType(name, schema);
    }
  }
  
  private generateInterfaceType(name: string, schema: any): string {
    const properties = Object.entries(schema.properties || {})
      .map(([propName, propSchema]: [string, any]) => {
        const isRequired = schema.required?.includes(propName);
        const optional = isRequired ? '' : '?';
        const type = this.getTypeScriptType(propSchema);
        
        return `  ${propName}${optional}: ${type};`;
      })
      .join('\n');
    
    return `export interface ${name} {
${properties}
}`;
  }
}
```

#### 2.2 API 函数生成

```typescript
export class FunctionGenerator {
  generateAPIFunctions(endpoints: APIEndpoint[]): string {
    const functions = endpoints.map(endpoint => 
      this.generateSingleFunction(endpoint)
    );
    
    return functions.join('\n\n');
  }
  
  private generateSingleFunction(endpoint: APIEndpoint): string {
    const {
      functionName,
      path,
      method,
      parameters,
      requestBody,
      responses
    } = endpoint;
    
    const functionParams = this.generateFunctionParameters(parameters, requestBody);
    const returnType = this.generateReturnType(responses);
    const urlPath = this.generateUrlPath(path, parameters);
    const requestConfig = this.generateRequestConfig(method, parameters, requestBody);
    
    return `export async function ${functionName}(${functionParams}): Promise<${returnType}> {
  const url = \`${urlPath}\`;
  const config: AxiosRequestConfig = ${requestConfig};
  
  const response = await apiClient.request<${returnType}>(config);
  return response.data;
}`;
  }
  
  private generateFunctionParameters(
    parameters: Parameter[], 
    requestBody?: RequestBody
  ): string {
    const params: string[] = [];
    
    // Path parameters (required)
    const pathParams = parameters.filter(p => p.in === 'path');
    pathParams.forEach(param => {
      params.push(`${param.name}: ${this.getTypeScriptType(param.schema)}`);
    });
    
    // Query parameters (optional object)
    const queryParams = parameters.filter(p => p.in === 'query');
    if (queryParams.length > 0) {
      const queryType = this.generateQueryParamsType(queryParams);
      params.push(`params?: ${queryType}`);
    }
    
    // Request body
    if (requestBody) {
      const bodyType = this.getRequestBodyType(requestBody);
      params.push(`data: ${bodyType}`);
    }
    
    // Options parameter
    params.push('options?: RequestOptions');
    
    return params.join(', ');
  }
}
```

### 3. 参数过滤与验证

#### 3.1 参数过滤实现

```typescript
import { pick, omit, isPlainObject } from 'lodash-es';

export class ParameterFilter {
  filterQueryParams(
    params: Record<string, any>, 
    schema: Parameter[]
  ): Record<string, any> {
    const allowedParams = schema
      .filter(p => p.in === 'query')
      .map(p => p.name);
    
    const filtered = pick(params, allowedParams);
    
    // 移除 undefined 和 null 值
    return Object.fromEntries(
      Object.entries(filtered).filter(([_, value]) => 
        value !== undefined && value !== null
      )
    );
  }
  
  validateAndTransform(
    data: any, 
    schema: any
  ): any {
    if (!schema) return data;
    
    switch (schema.type) {
      case 'object':
        return this.validateObject(data, schema);
      case 'array':
        return this.validateArray(data, schema);
      case 'string':
        return this.validateString(data, schema);
      case 'number':
      case 'integer':
        return this.validateNumber(data, schema);
      default:
        return data;
    }
  }
  
  private validateObject(data: any, schema: any): any {
    if (!isPlainObject(data)) {
      throw new Error('Expected object');
    }
    
    const result: any = {};
    const { properties = {}, required = [] } = schema;
    
    // 验证必填字段
    required.forEach((field: string) => {
      if (!(field in data)) {
        throw new Error(`Missing required field: ${field}`);
      }
    });
    
    // 验证和转换每个字段
    Object.entries(properties).forEach(([key, propSchema]) => {
      if (key in data) {
        result[key] = this.validateAndTransform(data[key], propSchema);
      }
    });
    
    return result;
  }
}
```

### 4. 自定义拦截器系统

#### 4.1 拦截器接口设计

```typescript
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
```

#### 4.2 API 客户端实现

```typescript
export class APIClient {
  private axios: AxiosInstance;
  private interceptors: InterceptorConfig = {};
  
  constructor(config: APIClientConfig) {
    this.axios = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      ...config.axiosConfig
    });
    
    this.setupInterceptors(config.interceptors);
  }
  
  private setupInterceptors(interceptors?: InterceptorConfig) {
    if (!interceptors) return;
    
    // 请求拦截器
    interceptors.request?.forEach(interceptor => {
      this.axios.interceptors.request.use(
        interceptor.onRequest,
        interceptor.onRequestError
      );
    });
    
    // 响应拦截器
    interceptors.response?.forEach(interceptor => {
      this.axios.interceptors.response.use(
        interceptor.onResponse,
        interceptor.onResponseError
      );
    });
  }
  
  async request<T = any>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    // 应用参数过滤
    if (config.params) {
      config.params = this.filterParams(config.params, config.meta?.querySchema);
    }
    
    // 应用请求体验证
    if (config.data && config.meta?.bodySchema) {
      config.data = this.validateRequestBody(config.data, config.meta.bodySchema);
    }
    
    return this.axios.request<T>(config);
  }
}
```

### 5. Mock 服务实现

#### 5.1 Mock 服务器核心

```typescript
import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { faker } from '@faker-js/faker';

export class MockServer {
  private app: express.Application;
  private swagger: any;
  private config: MockConfig;
  
  constructor(swagger: any, config: MockConfig) {
    this.app = express();
    this.swagger = swagger;
    this.config = config;
    
    this.setupMiddleware();
    this.setupRoutes();
    this.setupSwaggerUI();
  }
  
  private setupRoutes() {
    Object.entries(this.swagger.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const expressPath = this.convertSwaggerPathToExpress(path);
        const handler = this.createMockHandler(operation);
        
        this.app[method.toLowerCase()](expressPath, handler);
      });
    });
  }
  
  private createMockHandler(operation: any) {
    return (req: express.Request, res: express.Response) => {
      try {
        // 模拟延迟
        const delay = this.config.delay || 0;
        
        setTimeout(() => {
          const mockData = this.generateMockResponse(operation);
          const statusCode = this.getSuccessStatusCode(operation);
          
          res.status(statusCode).json(mockData);
        }, delay);
        
      } catch (error) {
        res.status(500).json({ error: 'Mock generation failed' });
      }
    };
  }
  
  private generateMockResponse(operation: any): any {
    const responses = operation.responses;
    const successResponse = responses['200'] || responses['201'] || responses['default'];
    
    if (!successResponse?.content) {
      return { message: 'Success' };
    }
    
    const schema = successResponse.content['application/json']?.schema;
    return this.generateMockData(schema);
  }
  
  private generateMockData(schema: any): any {
    if (!schema) return null;
    
    switch (schema.type) {
      case 'object':
        return this.generateMockObject(schema);
      case 'array':
        return this.generateMockArray(schema);
      case 'string':
        return this.generateMockString(schema);
      case 'number':
      case 'integer':
        return this.generateMockNumber(schema);
      case 'boolean':
        return faker.datatype.boolean();
      default:
        return null;
    }
  }
  
  private generateMockObject(schema: any): any {
    const result: any = {};
    const { properties = {} } = schema;
    
    Object.entries(properties).forEach(([key, propSchema]) => {
      result[key] = this.generateMockData(propSchema);
    });
    
    return result;
  }
}
```

### 6. AI 友好文档转换

#### 6.1 文档转换器

```typescript
export class AIDocumentConverter {
  convertToAIFormat(swagger: any): AIFriendlyDoc {
    return {
      metadata: this.extractMetadata(swagger),
      endpoints: this.convertEndpoints(swagger),
      schemas: this.convertSchemas(swagger),
      examples: this.generateExamples(swagger),
      searchIndex: this.buildSearchIndex(swagger)
    };
  }
  
  private convertEndpoints(swagger: any): AIEndpoint[] {
    const endpoints: AIEndpoint[] = [];
    
    Object.entries(swagger.paths).forEach(([path, methods]: [string, any]) => {
      Object.entries(methods).forEach(([method, operation]) => {
        const endpoint: AIEndpoint = {
          id: `${method.toUpperCase()}_${path}`,
          method: method.toUpperCase(),
          path,
          summary: operation.summary,
          description: operation.description,
          tags: operation.tags || [],
          parameters: this.formatParametersForAI(operation.parameters),
          requestBody: this.formatRequestBodyForAI(operation.requestBody),
          responses: this.formatResponsesForAI(operation.responses),
          examples: this.extractExamples(operation),
          searchKeywords: this.generateSearchKeywords(operation, path)
        };
        
        endpoints.push(endpoint);
      });
    });
    
    return endpoints;
  }
  
  private generateSearchKeywords(operation: any, path: string): string[] {
    const keywords = new Set<string>();
    
    // 从路径提取关键词
    path.split('/').forEach(segment => {
      if (segment && !segment.startsWith('{')) {
        keywords.add(segment.toLowerCase());
      }
    });
    
    // 从标签提取关键词
    operation.tags?.forEach((tag: string) => {
      keywords.add(tag.toLowerCase());
    });
    
    // 从描述提取关键词
    if (operation.summary) {
      this.extractKeywordsFromText(operation.summary).forEach(kw => 
        keywords.add(kw)
      );
    }
    
    return Array.from(keywords);
  }
  
  exportAsMarkdown(aiDoc: AIFriendlyDoc): string {
    const sections = [
      this.generateMetadataSection(aiDoc.metadata),
      this.generateEndpointsSection(aiDoc.endpoints),
      this.generateSchemasSection(aiDoc.schemas),
      this.generateExamplesSection(aiDoc.examples)
    ];
    
    return sections.join('\n\n---\n\n');
  }
}
```

### 7. NPM 包发布支持

#### 7.1 包生成器

```typescript
export class PackageGenerator {
  async generatePackage(
    swaggerDoc: any, 
    config: PackageConfig
  ): Promise<GeneratedPackage> {
    const packageInfo = this.generatePackageJson(config);
    const sourceCode = await this.generateSourceCode(swaggerDoc, config);
    const documentation = this.generateDocumentation(swaggerDoc);
    
    return {
      packageJson: packageInfo,
      sourceFiles: sourceCode,
      documentation,
      buildConfig: this.generateBuildConfig()
    };
  }
  
  private generatePackageJson(config: PackageConfig): any {
    return {
      name: config.packageName,
      version: config.version || '1.0.0',
      description: config.description,
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsup src/index.ts --dts',
        test: 'vitest',
        prepublishOnly: 'npm run build'
      },
      dependencies: {
        axios: '^1.6.0',
        'lodash-es': '^4.17.21'
      },
      devDependencies: {
        typescript: '^5.2.0',
        tsup: '^7.2.0',
        vitest: '^0.34.0'
      },
      files: ['dist'],
      repository: config.repository,
      keywords: config.keywords || [],
      author: config.author,
      license: config.license || 'MIT'
    };
  }
  
  async publishToNPM(packagePath: string, config: PublishConfig): Promise<void> {
    const commands = [
      'npm run build',
      'npm run test',
      config.tag ? `npm publish --tag ${config.tag}` : 'npm publish'
    ];
    
    for (const command of commands) {
      await this.executeCommand(command, packagePath);
    }
  }
}
```

## 配置文件示例

### swagger2request.config.js

```javascript
module.exports = {
  // Swagger 源
  swagger: {
    source: './api-docs.json', // 或 URL
    version: '3.0.0'
  },
  
  // 代码生成配置
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod', // pathMethod | operationId | custom
    includeComments: true,
    generateTypes: true
  },
  
  // 运行时配置
  runtime: {
    baseURL: process.env.API_BASE_URL,
    timeout: 10000,
    validateParams: true,
    filterParams: true
  },
  
  // 拦截器配置
  interceptors: {
    request: [
      // 认证拦截器
      {
        name: 'auth',
        handler: './interceptors/auth.js'
      },
      // 日志拦截器
      {
        name: 'logger',
        handler: './interceptors/logger.js'
      }
    ],
    response: [
      {
        name: 'errorHandler',
        handler: './interceptors/error.js'
      }
    ]
  },
  
  // Mock 服务配置
  mock: {
    enabled: true,
    port: 3001,
    delay: 200,
    ui: true,
    customResponses: './mock/responses.json'
  },
  
  // NPM 包配置
  package: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'Generated API client',
    repository: 'https://github.com/company/api-client',
    private: false
  },
  
  // AI 文档配置
  aiDocs: {
    enabled: true,
    outputFormat: 'markdown', // markdown | json
    includeExamples: true,
    optimizeForSearch: true
  }
};
```

## 使用示例

### 基本使用

```bash
# 安装 CLI
npm install -g swagger-2-request

# 生成 API 客户端
s2r generate ./swagger.json --output ./src/api

# 启动 Mock 服务
s2r mock ./swagger.json --port 3001

# 发布 NPM 包
s2r publish ./swagger.json --name @company/api-client
```

### 生成的代码示例

```typescript
// 生成的 API 客户端
import { APIClient } from './client';
import type { User, CreateUserRequest } from './types';

// GET /api/users
export async function apiUsersGet(
  params?: { page?: number; limit?: number },
  options?: RequestOptions
): Promise<User[]> {
  const config = {
    method: 'GET' as const,
    url: '/api/users',
    params: filterQueryParams(params, querySchema),
    ...options
  };
  
  const response = await apiClient.request<User[]>(config);
  return response.data;
}

// POST /api/users
export async function apiUsersPost(
  data: CreateUserRequest,
  options?: RequestOptions
): Promise<User> {
  const config = {
    method: 'POST' as const,
    url: '/api/users',
    data: validateRequestBody(data, requestBodySchema),
    ...options
  };
  
  const response = await apiClient.request<User>(config);
  return response.data;
}
```

这个实现方案提供了完整的技术细节，涵盖了您提到的所有核心需求。每个模块都是独立的，可以逐步开发和测试。