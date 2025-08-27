/**
 * AI 友好文档转换器
 * 将 Swagger 文档转换为对 LLM 更友好的格式
 */

import type { ParsedSwagger } from '../types';
import type {
  AIFriendlyDoc,
  AIEndpoint,
  AIParameter,
  AIRequestBody,
  AIResponse,
  AISchema,
  AIExample,
  AIMetadata,
  AISearchIndex,
  AIStatistics,
  AIDocConfig,
  AIDocResult,
  AIFullTextIndex,
} from './types';
import { NamingStrategy } from '../core/naming-strategy';

export class AIDocConverter {
  private namingStrategy: NamingStrategy;

  constructor() {
    this.namingStrategy = new NamingStrategy();
  }

  /**
   * 转换 Swagger 文档为 AI 友好格式
   */
  convertToAIFormat(swagger: ParsedSwagger): AIFriendlyDoc {
    const metadata = this.extractMetadata(swagger);
    const endpoints = this.convertEndpoints(swagger);
    const schemas = this.convertSchemas(swagger);
    const examples = this.generateGlobalExamples(swagger);
    const searchIndex = this.buildSearchIndex(endpoints);
    const tagGroups = this.groupByTags(endpoints);
    const statistics = this.calculateStatistics(endpoints);

    return {
      metadata,
      endpoints,
      schemas,
      examples,
      searchIndex,
      tagGroups,
      statistics,
    };
  }

  /**
   * 生成 AI 友好文档
   */
  async generateAIDoc(
    swagger: ParsedSwagger,
    config: AIDocConfig
  ): Promise<AIDocResult> {
    const startTime = Date.now();
    
    // 转换为 AI 格式
    const aiDoc = this.convertToAIFormat(swagger);
    
    // 生成文档内容
    let content: string;
    let extension: string;

    switch (config.format) {
      case 'markdown':
        content = this.generateMarkdown(aiDoc, config);
        extension = 'md';
        break;
      case 'json':
        content = JSON.stringify(aiDoc, null, 2);
        extension = 'json';
        break;
      case 'yaml':
        content = this.generateYAML(aiDoc);
        extension = 'yaml';
        break;
      default:
        throw new Error(`Unsupported format: ${config.format}`);
    }

    const generationTime = Date.now() - startTime;

    return {
      content,
      format: config.format,
      extension,
      metadata: aiDoc.metadata,
      stats: {
        generationTime,
        size: Buffer.byteLength(content, 'utf8'),
        processedEndpoints: aiDoc.endpoints.length,
      },
    };
  }

  /**
   * 提取元数据
   */
  private extractMetadata(swagger: ParsedSwagger): AIMetadata {
    return {
      title: swagger.info.title,
      version: swagger.info.version,
      description: swagger.info.description,
      servers: swagger.servers.map(server => server.url),
      contact: swagger.info.contact,
      license: swagger.info.license,
      generatedAt: new Date().toISOString(),
      generator: {
        name: 'Swagger-2-Request AI Converter',
        version: '1.0.0',
      },
    };
  }

  /**
   * 转换端点信息
   */
  private convertEndpoints(swagger: ParsedSwagger): AIEndpoint[] {
    return swagger.paths.map(endpoint => {
      const aiEndpoint: AIEndpoint = {
        id: `${endpoint.method.toLowerCase()}_${endpoint.path.replace(/[^a-zA-Z0-9]/g, '_')}`,
        method: endpoint.method.toUpperCase(),
        path: endpoint.path,
        functionName: endpoint.functionName,
        summary: endpoint.summary,
        description: endpoint.description,
        tags: endpoint.tags,
        parameters: this.convertParameters(endpoint.parameters),
        responses: this.convertResponses(endpoint.responses),
        examples: this.generateEndpointExamples(endpoint),
        searchKeywords: this.generateSearchKeywords(endpoint),
        complexity: this.calculateComplexity(endpoint),
        deprecated: endpoint.deprecated,
      };

      // 转换请求体
      if (endpoint.requestBody) {
        aiEndpoint.requestBody = this.convertRequestBody(endpoint.requestBody);
      }

      return aiEndpoint;
    });
  }

  /**
   * 转换参数信息
   */
  private convertParameters(parameters: any[]): AIParameter[] {
    return parameters.map(param => ({
      name: param.name,
      in: param.in,
      type: this.getTypeString(param.schema),
      required: param.required || false,
      description: param.description,
      example: param.example || param.schema?.example,
      enum: param.schema?.enum,
      validation: {
        minLength: param.schema?.minLength,
        maxLength: param.schema?.maxLength,
        minimum: param.schema?.minimum,
        maximum: param.schema?.maximum,
        pattern: param.schema?.pattern,
      },
    }));
  }

  /**
   * 转换请求体信息
   */
  private convertRequestBody(requestBody: any): AIRequestBody {
    const jsonContent = requestBody.content?.['application/json'];
    return {
      contentType: 'application/json',
      type: this.getTypeString(jsonContent?.schema),
      description: requestBody.description,
      required: requestBody.required || false,
      schema: jsonContent?.schema ? this.convertSchema(jsonContent.schema) : undefined,
      example: jsonContent?.example,
    };
  }

  /**
   * 转换响应信息
   */
  private convertResponses(responses: any[]): AIResponse[] {
    return responses.map(response => {
      const jsonContent = response.content?.['application/json'];
      return {
        statusCode: response.statusCode,
        description: response.description,
        contentType: 'application/json',
        type: this.getTypeString(jsonContent?.schema),
        schema: jsonContent?.schema ? this.convertSchema(jsonContent.schema) : undefined,
        example: jsonContent?.example,
      };
    });
  }

  /**
   * 转换 Schema 信息
   */
  private convertSchema(schema: any): AISchema {
    const aiSchema: AISchema = {
      type: schema.type || 'object',
      description: schema.description,
      example: schema.example,
    };

    if (schema.properties) {
      aiSchema.properties = {};
      Object.entries(schema.properties).forEach(([key, propSchema]: [string, any]) => {
        aiSchema.properties![key] = {
          type: propSchema.type,
          description: propSchema.description,
          example: propSchema.example,
          enum: propSchema.enum,
        };
      });
      aiSchema.required = schema.required;
    }

    if (schema.items) {
      aiSchema.items = this.convertSchema(schema.items);
    }

    return aiSchema;
  }

  /**
   * 转换 Schemas 定义
   */
  private convertSchemas(swagger: ParsedSwagger): Record<string, AISchema> {
    const schemas: Record<string, AISchema> = {};
    
    if (swagger.components?.schemas) {
      Object.entries(swagger.components.schemas).forEach(([name, schema]) => {
        schemas[name] = {
          ...this.convertSchema(schema),
          name,
        };
      });
    }

    return schemas;
  }

  /**
   * 生成端点示例
   */
  private generateEndpointExamples(endpoint: any): AIExample[] {
    const examples: AIExample[] = [];

    // 基础示例
    const basicExample: AIExample = {
      name: '基础调用示例',
      description: `调用 ${endpoint.method.toUpperCase()} ${endpoint.path} 的基础示例`,
      request: {
        parameters: this.generateExampleParameters(endpoint.parameters),
        body: endpoint.requestBody ? this.generateExampleBody(endpoint.requestBody) : undefined,
      },
      response: {
        status: 200,
        body: this.generateExampleResponse(endpoint.responses),
      },
      code: {
        typescript: this.generateTypeScriptExample(endpoint),
        javascript: this.generateJavaScriptExample(endpoint),
        curl: this.generateCurlExample(endpoint),
      },
    };

    examples.push(basicExample);

    // 错误处理示例
    if (endpoint.responses.some((r: any) => parseInt(r.statusCode) >= 400)) {
      const errorExample: AIExample = {
        name: '错误处理示例',
        description: '处理可能的错误响应',
        code: {
          typescript: this.generateErrorHandlingExample(endpoint),
        },
      };
      examples.push(errorExample);
    }

    return examples;
  }

  /**
   * 生成 TypeScript 示例代码
   */
  private generateTypeScriptExample(endpoint: any): string {
    const lines: string[] = [];
    
    lines.push(`import { ${endpoint.functionName} } from './api';`);
    lines.push('');

    // 参数构建
    const pathParams = endpoint.parameters?.filter((p: any) => p.in === 'path') || [];
    const queryParams = endpoint.parameters?.filter((p: any) => p.in === 'query') || [];

    if (pathParams.length > 0 || queryParams.length > 0 || endpoint.requestBody) {
      lines.push('// 调用 API');
      
      const params: string[] = [];
      
      // 路径参数
      pathParams.forEach((param: any) => {
        params.push(`'${param.example || 'example'}'`);
      });

      // 查询参数
      if (queryParams.length > 0) {
        const queryObj = queryParams.map((p: any) => 
          `  ${p.name}: ${JSON.stringify(p.example || 'example')}`
        ).join(',\n');
        params.push(`{\n${queryObj}\n}`);
      }

      // 请求体
      if (endpoint.requestBody) {
        params.push('requestData');
      }

      lines.push(`const result = await ${endpoint.functionName}(${params.join(', ')});`);
    } else {
      lines.push(`const result = await ${endpoint.functionName}();`);
    }

    lines.push('console.log(result);');

    return lines.join('\n');
  }

  /**
   * 生成 JavaScript 示例代码
   */
  private generateJavaScriptExample(endpoint: any): string {
    const tsCode = this.generateTypeScriptExample(endpoint);
    // 简单地移除类型注解
    return tsCode.replace(/: \w+/g, '');
  }

  /**
   * 生成 cURL 示例代码
   */
  private generateCurlExample(endpoint: any): string {
    const lines: string[] = [];
    let url = `https://api.example.com${endpoint.path}`;
    
    // 替换路径参数
    const pathParams = endpoint.parameters?.filter((p: any) => p.in === 'path') || [];
    pathParams.forEach((param: any) => {
      url = url.replace(`{${param.name}}`, param.example || 'example');
    });

    // 添加查询参数
    const queryParams = endpoint.parameters?.filter((p: any) => p.in === 'query') || [];
    if (queryParams.length > 0) {
      const queryString = queryParams.map((p: any) => 
        `${p.name}=${encodeURIComponent(p.example || 'example')}`
      ).join('&');
      url += `?${queryString}`;
    }

    lines.push(`curl -X ${endpoint.method.toUpperCase()} \\`);
    lines.push(`  "${url}" \\`);
    lines.push(`  -H "Content-Type: application/json" \\`);
    lines.push(`  -H "Authorization: Bearer YOUR_TOKEN"`);

    if (endpoint.requestBody) {
      lines.push(`  -d '{`);
      lines.push(`    "example": "data"`);
      lines.push(`  }'`);
    }

    return lines.join('\n');
  }

  /**
   * 生成错误处理示例
   */
  private generateErrorHandlingExample(endpoint: any): string {
    return `try {
  const result = await ${endpoint.functionName}();
  console.log('成功:', result);
} catch (error) {
  if (error.status === 401) {
    console.error('认证失败，请检查 token');
  } else if (error.status === 404) {
    console.error('资源不存在');
  } else {
    console.error('请求失败:', error.message);
  }
}`;
  }

  /**
   * 生成示例参数
   */
  private generateExampleParameters(parameters: any[]): Record<string, any> {
    const params: Record<string, any> = {};
    
    parameters?.forEach(param => {
      if (param.in === 'query') {
        params[param.name] = param.example || this.generateExampleValue(param.schema);
      }
    });

    return params;
  }

  /**
   * 生成示例请求体
   */
  private generateExampleBody(requestBody: any): any {
    const jsonContent = requestBody.content?.['application/json'];
    if (jsonContent?.example) {
      return jsonContent.example;
    }
    
    if (jsonContent?.schema) {
      return this.generateExampleFromSchema(jsonContent.schema);
    }

    return {};
  }

  /**
   * 生成示例响应
   */
  private generateExampleResponse(responses: any[]): any {
    const successResponse = responses.find(r => r.statusCode === '200' || r.statusCode === '201');
    if (!successResponse) return {};

    const jsonContent = successResponse.content?.['application/json'];
    if (jsonContent?.example) {
      return jsonContent.example;
    }

    if (jsonContent?.schema) {
      return this.generateExampleFromSchema(jsonContent.schema);
    }

    return { message: 'Success' };
  }

  /**
   * 从 Schema 生成示例值
   */
  private generateExampleFromSchema(schema: any): any {
    if (schema.example) return schema.example;

    switch (schema.type) {
      case 'object':
        const obj: any = {};
        if (schema.properties) {
          Object.entries(schema.properties).forEach(([key, propSchema]: [string, any]) => {
            obj[key] = this.generateExampleFromSchema(propSchema);
          });
        }
        return obj;
      case 'array':
        return schema.items ? [this.generateExampleFromSchema(schema.items)] : [];
      case 'string':
        return schema.enum ? schema.enum[0] : 'example';
      case 'number':
      case 'integer':
        return 42;
      case 'boolean':
        return true;
      default:
        return null;
    }
  }

  /**
   * 生成示例值
   */
  private generateExampleValue(schema: any): any {
    if (schema?.example) return schema.example;
    
    switch (schema?.type) {
      case 'string':
        return 'example';
      case 'number':
      case 'integer':
        return 42;
      case 'boolean':
        return true;
      case 'array':
        return [];
      default:
        return 'example';
    }
  }

  /**
   * 获取类型字符串
   */
  private getTypeString(schema: any): string {
    if (!schema) return 'any';
    
    if (schema.type) {
      return schema.type;
    }
    
    if (schema.$ref) {
      return schema.$ref.split('/').pop() || 'object';
    }
    
    return 'any';
  }

  /**
   * 生成搜索关键词
   */
  private generateSearchKeywords(endpoint: any): string[] {
    const keywords = new Set<string>();

    // 从路径提取
    endpoint.path.split('/').forEach((segment: string) => {
      if (segment && !segment.startsWith('{')) {
        keywords.add(segment.toLowerCase());
      }
    });

    // 从标签提取
    endpoint.tags?.forEach((tag: string) => {
      keywords.add(tag.toLowerCase());
    });

    // 从摘要和描述提取
    [endpoint.summary, endpoint.description]
      .filter(Boolean)
      .forEach(text => {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        words.forEach(word => {
          if (word.length > 2) {
            keywords.add(word);
          }
        });
      });

    // HTTP 方法
    keywords.add(endpoint.method.toLowerCase());

    return Array.from(keywords);
  }

  /**
   * 计算复杂度
   */
  private calculateComplexity(endpoint: any): 'simple' | 'medium' | 'complex' {
    let score = 0;

    // 参数数量
    const paramCount = endpoint.parameters?.length || 0;
    score += paramCount;

    // 是否有请求体
    if (endpoint.requestBody) score += 2;

    // 响应数量
    score += endpoint.responses?.length || 0;

    // 路径参数
    const pathParams = endpoint.path.match(/\{[^}]+\}/g)?.length || 0;
    score += pathParams;

    if (score <= 3) return 'simple';
    if (score <= 7) return 'medium';
    return 'complex';
  }

  /**
   * 生成全局示例
   */
  private generateGlobalExamples(swagger: ParsedSwagger): AIExample[] {
    const examples: AIExample[] = [];

    // 认证示例
    examples.push({
      name: '认证设置',
      description: '如何设置 API 认证',
      code: {
        typescript: `import { globalAuthManager } from './api';

// 设置 Bearer Token
globalAuthManager.setBearerToken('your-jwt-token');

// 或者设置 API Key
globalAuthManager.setApiKey('X-API-Key', 'your-api-key');`,
      },
    });

    // 错误处理示例
    examples.push({
      name: '全局错误处理',
      description: '统一的错误处理方式',
      code: {
        typescript: `import { apiClient, createErrorHandlerInterceptor } from './api';

// 添加全局错误处理
apiClient.getInterceptorManager().addResponseInterceptor(
  createErrorHandlerInterceptor({
    onError: (error) => {
      console.error('API 错误:', error.message);
      // 这里可以添加错误上报逻辑
    }
  })
);`,
      },
    });

    return examples;
  }

  /**
   * 构建搜索索引
   */
  private buildSearchIndex(endpoints: AIEndpoint[]): AISearchIndex {
    const keywords: Record<string, string[]> = {};
    const tags: Record<string, string[]> = {};
    const paths: Record<string, string> = {};
    const methods: Record<string, string[]> = {};
    const fullText: AIFullTextIndex[] = [];

    endpoints.forEach(endpoint => {
      const endpointId = endpoint.id;

      // 路径索引
      paths[endpoint.path] = endpointId;

      // 方法索引
      if (!methods[endpoint.method]) {
        methods[endpoint.method] = [];
      }
      methods[endpoint.method].push(endpointId);

      // 关键词索引
      endpoint.searchKeywords.forEach(keyword => {
        if (!keywords[keyword]) {
          keywords[keyword] = [];
        }
        keywords[keyword].push(endpointId);
      });

      // 标签索引
      endpoint.tags.forEach(tag => {
        if (!tags[tag]) {
          tags[tag] = [];
        }
        tags[tag].push(endpointId);
      });

      // 全文索引
      if (endpoint.summary) {
        fullText.push({
          endpointId,
          text: endpoint.summary,
          weight: 3,
          type: 'title',
        });
      }

      if (endpoint.description) {
        fullText.push({
          endpointId,
          text: endpoint.description,
          weight: 2,
          type: 'description',
        });
      }
    });

    return { keywords, tags, paths, methods, fullText };
  }

  /**
   * 按标签分组
   */
  private groupByTags(endpoints: AIEndpoint[]): Record<string, AIEndpoint[]> {
    const groups: Record<string, AIEndpoint[]> = {};

    endpoints.forEach(endpoint => {
      if (endpoint.tags.length === 0) {
        if (!groups['未分类']) {
          groups['未分类'] = [];
        }
        groups['未分类'].push(endpoint);
      } else {
        endpoint.tags.forEach(tag => {
          if (!groups[tag]) {
            groups[tag] = [];
          }
          groups[tag].push(endpoint);
        });
      }
    });

    return groups;
  }

  /**
   * 计算统计信息
   */
  private calculateStatistics(endpoints: AIEndpoint[]): AIStatistics {
    const methodDistribution: Record<string, number> = {};
    const tagDistribution: Record<string, number> = {};
    const complexityDistribution: Record<string, number> = {};
    
    let totalParameters = 0;
    let mostComplexEndpoint: string | undefined;
    let maxComplexity = 0;

    endpoints.forEach(endpoint => {
      // 方法分布
      methodDistribution[endpoint.method] = (methodDistribution[endpoint.method] || 0) + 1;

      // 标签分布
      endpoint.tags.forEach(tag => {
        tagDistribution[tag] = (tagDistribution[tag] || 0) + 1;
      });

      // 复杂度分布
      complexityDistribution[endpoint.complexity] = (complexityDistribution[endpoint.complexity] || 0) + 1;

      // 参数统计
      totalParameters += endpoint.parameters.length;

      // 最复杂端点
      const complexity = this.getComplexityScore(endpoint.complexity);
      if (complexity > maxComplexity) {
        maxComplexity = complexity;
        mostComplexEndpoint = endpoint.id;
      }
    });

    // 最常用标签
    const mostUsedTags = Object.entries(tagDistribution)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    return {
      totalEndpoints: endpoints.length,
      methodDistribution,
      tagDistribution,
      complexityDistribution,
      averageParameters: totalParameters / endpoints.length,
      mostComplexEndpoint,
      mostUsedTags,
    };
  }

  /**
   * 获取复杂度分数
   */
  private getComplexityScore(complexity: string): number {
    switch (complexity) {
      case 'simple': return 1;
      case 'medium': return 2;
      case 'complex': return 3;
      default: return 0;
    }
  }

  /**
   * 生成 Markdown 文档
   */
  private generateMarkdown(aiDoc: AIFriendlyDoc, config: AIDocConfig): string {
    const lines: string[] = [];

    // 标题和基本信息
    lines.push(`# ${aiDoc.metadata.title}`);
    lines.push('');
    if (aiDoc.metadata.description) {
      lines.push(aiDoc.metadata.description);
      lines.push('');
    }

    // 目录
    if (config.generateTOC) {
      lines.push('## 目录');
      lines.push('');
      Object.keys(aiDoc.tagGroups).forEach(tag => {
        lines.push(`- [${tag}](#${tag.toLowerCase().replace(/\s+/g, '-')})`);
      });
      lines.push('');
    }

    // 统计信息
    lines.push('## 📊 API 统计');
    lines.push('');
    lines.push(`- **总端点数**: ${aiDoc.statistics.totalEndpoints}`);
    lines.push(`- **平均参数数**: ${aiDoc.statistics.averageParameters.toFixed(1)}`);
    lines.push(`- **最常用标签**: ${aiDoc.statistics.mostUsedTags.join(', ')}`);
    lines.push('');

    // 按标签分组的端点
    Object.entries(aiDoc.tagGroups).forEach(([tag, endpoints]) => {
      lines.push(`## ${tag}`);
      lines.push('');

      endpoints.forEach(endpoint => {
        lines.push(`### ${endpoint.method} ${endpoint.path}`);
        lines.push('');
        
        if (endpoint.summary) {
          lines.push(`**摘要**: ${endpoint.summary}`);
          lines.push('');
        }

        if (endpoint.description) {
          lines.push(endpoint.description);
          lines.push('');
        }

        // 参数
        if (endpoint.parameters.length > 0) {
          lines.push('**参数**:');
          lines.push('');
          endpoint.parameters.forEach(param => {
            const required = param.required ? '**必需**' : '可选';
            lines.push(`- \`${param.name}\` (${param.type}) - ${required}: ${param.description || '无描述'}`);
          });
          lines.push('');
        }

        // 代码示例
        if (config.includeCodeExamples && endpoint.examples.length > 0) {
          const example = endpoint.examples[0];
          if (example.code?.typescript) {
            lines.push('**TypeScript 示例**:');
            lines.push('');
            lines.push('```typescript');
            lines.push(example.code.typescript);
            lines.push('```');
            lines.push('');
          }
        }

        lines.push('---');
        lines.push('');
      });
    });

    return lines.join('\n');
  }

  /**
   * 生成 YAML 文档
   */
  private generateYAML(aiDoc: AIFriendlyDoc): string {
    // 简化的 YAML 生成
    return JSON.stringify(aiDoc, null, 2)
      .replace(/"/g, '')
      .replace(/,\n/g, '\n')
      .replace(/{/g, '')
      .replace(/}/g, '');
  }
}