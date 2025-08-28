/**
 * Mock 服务器实现
 * 使用 express + swagger-ui-express，集成 Swagger UI，访问路径为 /docs
 * 支持健康检查端点和 CORS 跨域请求
 */

import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { OpenAPIV3 } from 'openapi-types';
import { SwaggerAnalyzer } from '../core/swagger-parser';
import type { ParsedSwagger } from '../types';

export interface MockServerOptions {
  port?: number;
  delay?: number;
  ui?: boolean;
  cors?: boolean;
  customResponses?: Record<string, any>;
}

export class MockServer {
  private app: express.Application;
  private swagger!: OpenAPIV3.Document;
  private parsedSwagger!: ParsedSwagger;
  private options: MockServerOptions;
  private analyzer: SwaggerAnalyzer;

  constructor(options: MockServerOptions = {}) {
    this.app = express();
    this.options = {
      port: 3001,
      delay: 0,
      ui: true,
      cors: true,
      ...options,
    };
    this.analyzer = new SwaggerAnalyzer();
    
    this.setupMiddleware();
  }

  /**
   * 加载 Swagger 文档并启动服务器
   */
  async start(swaggerSource: string | OpenAPIV3.Document): Promise<void> {
    // 解析 Swagger 文档
    this.parsedSwagger = await this.analyzer.parseSwagger(swaggerSource);
    this.swagger = swaggerSource as OpenAPIV3.Document;

    // 设置路由
    this.setupRoutes();
    this.setupSwaggerUI();
    this.setupMockEndpoints();

    // 启动服务器
    return new Promise((resolve, reject) => {
      const server = this.app.listen(this.options.port, () => {
        console.log(`🎭 Mock server started on port ${this.options.port}`);
        console.log(`📖 Swagger UI available at http://localhost:${this.options.port}/docs`);
        console.log(`💚 Health check available at http://localhost:${this.options.port}/health`);
        resolve();
      });

      server.on('error', reject);
    });
  }

  /**
   * 设置中间件
   */
  private setupMiddleware(): void {
    // CORS 支持
    if (this.options.cors) {
      this.app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    }

    // JSON 解析
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // 请求日志
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
      next();
    });

    // 模拟延迟
    if (this.options.delay && this.options.delay > 0) {
      this.app.use((req, res, next) => {
        setTimeout(next, this.options.delay);
      });
    }
  }

  /**
   * 设置基础路由
   */
  private setupRoutes(): void {
    // 健康检查端点
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 's2r-mock',
        version: this.parsedSwagger.info.version,
        endpoints: this.parsedSwagger.paths.length,
      });
    });

    // API 信息端点
    this.app.get('/api-info', (req, res) => {
      res.json({
        info: this.parsedSwagger.info,
        servers: this.parsedSwagger.servers,
        endpointCount: this.parsedSwagger.paths.length,
        schemaCount: Object.keys(this.parsedSwagger.components.schemas || {}).length,
      });
    });

    // 根路径重定向到文档
    this.app.get('/', (req, res) => {
      res.redirect('/docs');
    });
  }

  /**
   * 设置 Swagger UI（访问路径为 /docs）
   */
  private setupSwaggerUI(): void {
    if (this.options.ui && this.swagger) {
      // 更新服务器 URL 为当前 Mock 服务器
      const mockSwagger = {
        ...this.swagger,
        servers: [
          {
            url: `http://localhost:${this.options.port}`,
            description: 'Mock Server',
          },
          ...(this.swagger.servers || []),
        ],
      };

      this.app.use('/docs', swaggerUi.serve, swaggerUi.setup(mockSwagger, {
        customCss: '.swagger-ui .topbar { display: none }',
        customSiteTitle: `${this.parsedSwagger.info.title} - Mock API`,
        swaggerOptions: {
          defaultModelsExpandDepth: 1,
          defaultModelExpandDepth: 1,
          docExpansion: 'list',
          filter: true,
        },
      }));
    }
  }

  /**
   * 设置 Mock 端点
   */
  private setupMockEndpoints(): void {
    this.parsedSwagger.paths.forEach(endpoint => {
      const expressPath = this.convertSwaggerPathToExpress(endpoint.path);
      const method = endpoint.method.toLowerCase() as keyof express.Application;

      if (typeof this.app[method] === 'function') {
        (this.app[method] as any)(expressPath, (req: express.Request, res: express.Response) => {
          this.handleMockRequest(req, res, endpoint);
        });
      }
    });
  }

  /**
   * 将 Swagger 路径转换为 Express 路径
   */
  private convertSwaggerPathToExpress(swaggerPath: string): string {
    return swaggerPath.replace(/\{([^}]+)\}/g, ':$1');
  }

  /**
   * 处理 Mock 请求
   */
  private handleMockRequest(
    req: express.Request, 
    res: express.Response, 
    endpoint: any
  ): void {
    try {
      // 检查自定义响应
      const customResponse = this.getCustomResponse(endpoint);
      if (customResponse) {
        res.status(customResponse.status || 200).json(customResponse.data);
        return;
      }

      // 生成 Mock 响应
      const mockResponse = this.generateMockResponse(endpoint);
      const statusCode = this.getSuccessStatusCode(endpoint);

      res.status(statusCode).json(mockResponse);
    } catch (error) {
      console.error('Mock generation error:', error);
      res.status(500).json({
        error: 'Mock generation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * 获取自定义响应
   */
  private getCustomResponse(endpoint: any): any {
    if (!this.options.customResponses) return null;

    const key = `${endpoint.method.toUpperCase()} ${endpoint.path}`;
    return this.options.customResponses[key];
  }

  /**
   * 生成 Mock 响应数据
   */
  private generateMockResponse(endpoint: any): any {
    const successResponse = endpoint.responses.find(
      (r: any) => r.statusCode === '200' || r.statusCode === '201'
    );

    if (!successResponse?.content) {
      return { message: 'Success', timestamp: new Date().toISOString() };
    }

    const jsonContent = successResponse.content['application/json'];
    if (jsonContent?.schema) {
      return this.generateMockData(jsonContent.schema);
    }

    return { message: 'Success' };
  }

  /**
   * 根据 Schema 生成 Mock 数据
   */
  private generateMockData(schema: any): any {
    if (!schema) return null;

    // 处理引用
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      const refSchema = this.parsedSwagger.components.schemas?.[refName];
      if (refSchema) {
        return this.generateMockData(refSchema);
      }
      return null;
    }

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
        return Math.random() > 0.5;
      default:
        return null;
    }
  }

  /**
   * 生成 Mock 对象
   */
  private generateMockObject(schema: any): any {
    const result: any = {};
    const { properties = {}, required = [] } = schema;

    // 为每个属性生成数据
    Object.entries(properties).forEach(([key, propSchema]: [string, any]) => {
      // 必需字段总是生成，可选字段有 80% 概率生成
      if (required.includes(key) || Math.random() > 0.2) {
        result[key] = this.generateMockData(propSchema);
      }
    });

    return result;
  }

  /**
   * 生成 Mock 数组
   */
  private generateMockArray(schema: any): any[] {
    const length = Math.floor(Math.random() * 5) + 1; // 1-5 个元素
    const result = [];

    for (let i = 0; i < length; i++) {
      if (schema.items) {
        result.push(this.generateMockData(schema.items));
      } else {
        result.push(`item_${i}`);
      }
    }

    return result;
  }

  /**
   * 生成 Mock 字符串
   */
  private generateMockString(schema: any): string {
    if (schema.enum) {
      return schema.enum[Math.floor(Math.random() * schema.enum.length)];
    }

    if (schema.format) {
      switch (schema.format) {
        case 'email':
          return `user${Math.floor(Math.random() * 1000)}@example.com`;
        case 'date':
          return new Date().toISOString().split('T')[0];
        case 'date-time':
          return new Date().toISOString();
        case 'uri':
        case 'url':
          return `https://example.com/resource/${Math.floor(Math.random() * 1000)}`;
        case 'uuid':
          return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
      }
    }

    // 生成随机字符串
    const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit'];
    const length = Math.floor(Math.random() * 4) + 1;
    return Array.from({ length }, () => words[Math.floor(Math.random() * words.length)]).join(' ');
  }

  /**
   * 生成 Mock 数字
   */
  private generateMockNumber(schema: any): number {
    const min = schema.minimum || 0;
    const max = schema.maximum || 1000;
    
    if (schema.type === 'integer') {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    return Math.random() * (max - min) + min;
  }

  /**
   * 获取成功状态码
   */
  private getSuccessStatusCode(endpoint: any): number {
    const response201 = endpoint.responses.find((r: any) => r.statusCode === '201');
    if (response201) return 201;

    const response200 = endpoint.responses.find((r: any) => r.statusCode === '200');
    if (response200) return 200;

    return 200;
  }

  /**
   * 获取 Express 应用实例
   */
  getApp(): express.Application {
    return this.app;
  }
}