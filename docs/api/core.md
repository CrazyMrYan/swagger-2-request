# API 参考

## 核心类

### SwaggerAnalyzer

解析 OpenAPI 文档：

```typescript
import { SwaggerAnalyzer } from 's2r';

const analyzer = new SwaggerAnalyzer();
const swagger = await analyzer.parseSwagger('./swagger.json');
```

### CodeGenerator

生成 TypeScript 代码：

```typescript
import { CodeGenerator } from 's2r';

const generator = new CodeGenerator();
const files = generator.generateAPIClient(swagger, {
  outputDir: './src/api',
  typescript: true,
  functionNaming: 'pathMethod'
});
```

### MockServer

启动 Mock 服务器：

```typescript
import { MockServer } from 's2r';

const server = new MockServer({ port: 3001 });
await server.start('./swagger.json');
```

## 工具函数

### 参数过滤

```typescript
import { filterQueryParams } from 's2r';

const filtered = filterQueryParams(params, ['page', 'limit']);
```

### 错误处理

```typescript
import { formatErrorMessage } from 's2r';

const message = formatErrorMessage(error);
```

## 类型定义

### GenerationConfig

```typescript
interface GenerationConfig {
  outputDir: string;
  typescript: boolean;
  functionNaming: 'pathMethod' | 'operationId';
  includeComments: boolean;
  generateTypes: boolean;
}
```

### ParsedSwagger

```typescript
interface ParsedSwagger {
  info: {
    title: string;
    version: string;
    description?: string;
  };
  paths: APIEndpoint[];
  components: {
    schemas?: Record<string, any>;
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
}
```

## SwaggerAnalyzer

Swagger 文档解析器，支持 OpenAPI 2.0-3.1 所有版本，实现智能版本检测和自动选择合适的解析器。

### 构造函数

```typescript
const analyzer = new SwaggerAnalyzer();
```

### 方法

#### parseSwagger(source)

解析 Swagger/OpenAPI 文档，支持多种数据源和版本。

**参数:**
- `source: string | OpenAPIDocument` - Swagger 文档路径、URL 或对象

**返回值:**
- `Promise<ParsedSwagger>` - 解析后的 Swagger 文档

**示例:**
```typescript
// 从 URL 解析（支持 OpenAPI 3.1）
const swagger = await analyzer.parseSwagger('https://carty-harp-backend-test.xiaotunqifu.com/v3/api-docs');

// 从本地文件解析
const swagger = await analyzer.parseSwagger('./swagger.json');

// 从对象解析
const swagger = await analyzer.parseSwagger(swaggerObject);

// 自动版本检测和解析器选择
console.log('检测到版本:', swagger.info.version);
```

#### detectVersion(document)

检测 OpenAPI 文档版本。

**参数:**
- `document: any` - OpenAPI 文档对象

**返回值:**
- `string` - 版本号 ('2.0', '3.0', '3.1')

**示例:**
```typescript
const version = analyzer.detectVersion(swaggerDoc);
console.log('OpenAPI 版本:', version); // '3.1'
```

## CodeGenerator

TypeScript 代码生成器，生成类型安全的 API 客户端代码，遵循 API 函数命名规范。

### 构造函数

```typescript
const generator = new CodeGenerator();
```

### 方法

#### generateAPIClient(swagger, config)

生成完整的 API 客户端代码，包括类型定义、API 函数、客户端配置和工具函数。

**参数:**
- `swagger: ParsedSwagger` - 解析后的 Swagger 文档
- `config: GenerationConfig` - 生成配置

**返回值:**
- `GeneratedFile[]` - 生成的文件列表

**示例:**
```typescript
// 基本使用
const files = generator.generateAPIClient(swagger, {
  outputDir: './src/api',
  typescript: true,
  functionNaming: 'pathMethod',  // 重要：使用路径+方法命名
  includeComments: true,
  generateTypes: true,
  cleanOutput: true
});

// 生成的函数命名示例：
// GET /api/users -> apiUsersGet
// POST /api/users -> apiUsersPost  
// GET /api/users/{id} -> apiUsersIdGet
// PUT /api/users/{id} -> apiUsersIdPut

// 写入文件
for (const file of files) {
  await fs.writeFile(
    path.join(config.outputDir, file.path), 
    file.content
  );
}
```

## MockServer

Mock 服务器，集成 Swagger UI。

### 构造函数

```typescript
const mockServer = new MockServer(options);
```

**参数:**
- `options: MockServerOptions` - Mock 服务器配置
  - `port?: number` - 服务器端口 (默认: 3001)
  - `delay?: number` - 响应延迟 (ms)
  - `ui?: boolean` - 是否启用 Swagger UI (默认: true)
  - `cors?: boolean` - 是否启用 CORS (默认: true)
  - `customResponses?: Record<string, any>` - 自定义响应

### 方法

#### start(swaggerSource)

启动 Mock 服务器。

**参数:**
- `swaggerSource: string | OpenAPIDocument` - Swagger 文档

**返回值:**
- `Promise<void>`

**示例:**
```typescript
const mockServer = new MockServer({
  port: 3001,
  delay: 200,
  ui: true,
  cors: true
});

await mockServer.start('./swagger.json');
console.log('Mock 服务器已启动: http://localhost:3001');
console.log('Swagger UI: http://localhost:3001/docs');
```

## AIConverter

AI 友好文档转换器。

### 构造函数

```typescript
const converter = new AIConverter();
```

### 方法

#### convertToAIFormat(swagger)

将 Swagger 文档转换为 AI 友好格式。

**参数:**
- `swagger: ParsedSwagger` - 解析后的 Swagger 文档

**返回值:**
- `AIFriendlyDoc` - AI 友好的文档格式

#### generateAIDoc(swagger, config)

生成 AI 文档。

**参数:**
- `swagger: ParsedSwagger` - 解析后的 Swagger 文档
- `config: AIDocConfig` - AI 文档配置

**返回值:**
- `Promise<AIDocResult>` - 生成结果

**示例:**
```typescript
const result = await converter.generateAIDoc(swagger, {
  format: 'markdown',
  preset: 'developer',
  includeExamples: true,
  includeSchemas: true
});

console.log('文档大小:', result.stats.size);
console.log('处理端点:', result.stats.processedEndpoints);
```

## PackagePublisher

NPM 包发布器。

### 构造函数

```typescript
const publisher = new PackagePublisher();
```

### 方法

#### publishPackage(swagger, config)

发布 NPM 包。

**参数:**
- `swagger: ParsedSwagger` - 解析后的 Swagger 文档
- `config: PublishConfig` - 发布配置

**返回值:**
- `Promise<PublishResult>` - 发布结果

**示例:**
```typescript
const result = await publisher.publishPackage(swagger, {
  outputDir: './package',
  packageConfig: {
    name: '@company/api-client',
    version: '1.0.0',
    description: 'API client for Company API',
    author: 'Company Team',
    license: 'MIT'
  },
  build: true,
  runTests: true,
  publish: true,
  dryRun: false
});

if (result.success) {
  console.log('包发布成功!');
} else {
  console.error('发布失败:', result.error);
}
```

## 拦截器系统

### InterceptorManager

拦截器管理器。

```typescript
const manager = new InterceptorManager(axiosInstance);

// 注册拦截器
manager.register({
  request: [authInterceptor, logInterceptor],
  response: [retryInterceptor, errorHandlerInterceptor]
});

// 获取统计
const stats = manager.getStats();
```

### 创建拦截器

#### createAuthInterceptor(config)

创建认证拦截器。

```typescript
const authInterceptor = createAuthInterceptor({
  type: 'bearer',
  token: 'your-jwt-token'
});
```

#### createRetryInterceptor(config)

创建重试拦截器。

```typescript
const retryInterceptor = createRetryInterceptor({
  maxRetries: 3,
  delay: 1000,
  delayFactor: 2
});
```

#### createLogInterceptors(config)

创建日志拦截器。

```typescript
const { request, response } = createLogInterceptors({
  logRequests: true,
  logResponses: true,
  level: 'info'
});
```

#### createErrorHandlerInterceptor(config)

创建错误处理拦截器。

```typescript
const errorHandler = createErrorHandlerInterceptor({
  enableTransform: true,
  enableNotification: true,
  onError: (error) => {
    console.error('API 错误:', error);
  }
});
```

## 工具函数

### validateRequestBody(data, schema)

验证请求体数据。

```typescript
const validatedData = validateRequestBody(requestData, schema);
```

### filterQueryParams(params, allowedKeys)

过滤查询参数。

```typescript
const filteredParams = filterQueryParams(params, ['page', 'limit', 'search']);
```

### formatErrorMessage(error)

格式化错误消息。

```typescript
const message = formatErrorMessage(error);
console.log(message); // "HTTP 404 Not Found: Resource not found"
```

### createRequestConfig(method, url, options)

创建请求配置。

```typescript
const config = createRequestConfig('GET', '/api/users', {
  params: { page: 1 },
  headers: { 'Authorization': 'Bearer token' }
});
```

### generateRequestId()

生成请求 ID。

```typescript
const requestId = generateRequestId();
console.log(requestId); // "req_1640995200000_a1b2c3d4e5"
```

## 类型定义

### ParsedSwagger

解析后的 Swagger 文档结构。

```typescript
interface ParsedSwagger {
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
```

### APIEndpoint

API 端点定义。

```typescript
interface APIEndpoint {
  path: string;
  method: string;
  functionName: string;
  parameters: Parameter[];
  responses: ResponseDefinition[];
  requestBody?: RequestBody;
  tags: string[];
  summary?: string;
  description?: string;
  deprecated?: boolean;
}
```

### GenerationConfig

代码生成配置。

```typescript
interface GenerationConfig {
  outputDir: string;
  typescript: boolean;
  functionNaming: 'pathMethod' | 'operationId';
  includeComments: boolean;
  generateTypes: boolean;
  cleanOutput: boolean;
}
```

### RuntimeConfig

运行时配置。

```typescript
interface RuntimeConfig {
  timeout: number;
  validateParams: boolean;
  filterParams: boolean;
  retries?: number;
  baseURL?: string;
}
```

## 常量

### DEFAULT_CONFIG

默认配置。

```typescript
export const DEFAULT_CONFIG = {
  generation: {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod' as const,
    includeComments: true,
    generateTypes: true,
    cleanOutput: true,
  },
  runtime: {
    timeout: 10000,
    validateParams: true,
    filterParams: true,
  },
  mock: {
    enabled: false,
    port: 3001,
    delay: 0,
    ui: true,
  },
};
```

### VERSION

当前版本号。

```typescript
export const VERSION = '0.1.5';
```

## 使用示例

### 完整工作流程

```typescript
import { 
  SwaggerAnalyzer, 
  CodeGenerator, 
  MockServer,
  AIConverter,
  PackagePublisher 
} from 's2r';

async function completeWorkflow() {
  // 1. 解析 Swagger 文档
  const analyzer = new SwaggerAnalyzer();
  const swagger = await analyzer.parseSwagger('./swagger.json');
  
  // 2. 生成 API 客户端
  const generator = new CodeGenerator();
  const files = generator.generateAPIClient(swagger, {
    outputDir: './src/api',
    typescript: true,
    functionNaming: 'pathMethod',
    includeComments: true,
    generateTypes: true,
    cleanOutput: true
  });
  
  // 3. 启动 Mock 服务器
  const mockServer = new MockServer({ port: 3001 });
  await mockServer.start(swagger);
  
  // 4. 生成 AI 文档
  const aiConverter = new AIConverter();
  const aiDoc = await aiConverter.generateAIDoc(swagger, {
    format: 'markdown',
    preset: 'developer'
  });
  
  // 5. 发布 NPM 包
  const publisher = new PackagePublisher();
  const result = await publisher.publishPackage(swagger, {
    packageConfig: {
      name: '@company/api-client',
      version: '1.0.0'
    }
  });
  
  console.log('工作流程完成!');
}
```