/**
 * AI 文档生成功能单元测试
 * 测试 AI 文档转换器和配置功能
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AIDocConverter, defaultAIDocConfig, aiDocPresets } from '../src/ai-docs';
import type { ParsedSwagger, AIDocsConfig } from '../src/types';
import type { AIDocConfig } from '../src/ai-docs/types';

describe('AI Docs Tests', () => {
  let converter: AIDocConverter;
  let mockParsedSwagger: ParsedSwagger;
  let baseAIDocsConfig: AIDocsConfig;

  beforeEach(() => {
    converter = new AIDocConverter();
    
    baseAIDocsConfig = {
      enabled: true,
      format: 'markdown',
      includeExamples: true,
      optimizeForSearch: true,
      includeCodeExamples: true,
      generateTOC: true,
      language: 'zh',
      verbosity: 'normal',
      outputDir: './docs',
      filename: 'api-docs.md'
    };

    mockParsedSwagger = {
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'AI docs test API',
      },
      servers: [
        {
          url: 'https://api.example.com',
          description: 'Test server',
        },
      ],
      paths: [
        {
          path: '/users/{id}',
          method: 'GET',
          operationId: 'getUserById',
          functionName: 'getUserById',
          summary: 'Get user by ID',
          description: 'Retrieve a specific user by their ID',
          tags: ['users'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'User ID'
            }
          ],
          responses: [
            {
              statusCode: '200',
              description: 'User found',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' }
                    }
                  }
                }
              }
            }
          ]
        },
        {
          path: '/users',
          method: 'POST',
          operationId: 'createUser',
          functionName: 'createUser',
          summary: 'Create user',
          description: 'Create a new user',
          tags: ['users'],
          parameters: [],
          responses: [
            {
              statusCode: '201',
              description: 'User created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      email: { type: 'string' }
                    }
                  }
                }
              }
            }
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string' }
                  },
                  required: ['name', 'email']
                }
              }
            },
            required: true
          }
        }
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              email: { type: 'string' }
            }
          }
        }
      }
    };
  });

  describe('AIDocConverter', () => {
    it('should convert swagger to AI format', () => {
      const result = converter.convertToAIFormat(mockParsedSwagger);
      
      expect(result).toBeDefined();
      expect(result.metadata).toBeDefined();
      expect(result.metadata.title).toBe('Test API');
      expect(result.metadata.version).toBe('1.0.0');
      expect(result.endpoints).toHaveLength(2);
      expect(result.endpoints[0].method).toBe('GET');
      expect(result.endpoints[0].path).toBe('/users/{id}');
      expect(result.endpoints[1].method).toBe('POST');
      expect(result.endpoints[1].path).toBe('/users');
    });

    it('should generate AI documentation with default config', async () => {
      const result = await converter.generateAIDoc(mockParsedSwagger, defaultAIDocConfig);
      
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.format).toBe('markdown');
      expect(result.extension).toBe('md');
      expect(result.metadata).toBeDefined();
      expect(result.stats).toBeDefined();
      expect(result.stats.processedEndpoints).toBe(2);
    });

    it('should generate AI documentation with custom config', async () => {
      const customConfig: AIDocConfig = {
        ...defaultAIDocConfig,
        format: 'json',
        includeExamples: false,
        language: 'en'
      };
      
      const result = await converter.generateAIDoc(mockParsedSwagger, customConfig);
      
      expect(result.format).toBe('json');
      expect(result.extension).toBe('json');
    });

    it('should handle empty swagger document', () => {
      const emptySwagger: ParsedSwagger = {
        info: { title: 'Empty API', version: '1.0.0' },
        servers: [],
        paths: [],
        components: {}
      };
      
      const result = converter.convertToAIFormat(emptySwagger);
      
      expect(result.endpoints).toHaveLength(0);
      expect(result.metadata.title).toBe('Empty API');
    });
  });

  describe('AI Docs Configuration', () => {
    it('should have correct default configuration', () => {
      expect(defaultAIDocConfig.format).toBe('markdown');
      expect(defaultAIDocConfig.includeExamples).toBe(true);
      expect(defaultAIDocConfig.optimizeForSearch).toBe(true);
      expect(defaultAIDocConfig.includeCodeExamples).toBe(true);
      expect(defaultAIDocConfig.generateTOC).toBe(true);
      expect(defaultAIDocConfig.language).toBe('zh');
      expect(defaultAIDocConfig.verbosity).toBe('normal');
    });

    it('should have all required presets', () => {
      expect(aiDocPresets.developer).toBeDefined();
      expect(aiDocPresets.reference).toBeDefined();
      expect(aiDocPresets.training).toBeDefined();
      expect(aiDocPresets.preview).toBeDefined();
    });

    it('should have correct developer preset', () => {
      const preset = aiDocPresets.developer;
      expect(preset.format).toBe('markdown');
      expect(preset.includeExamples).toBe(true);
      expect(preset.includeCodeExamples).toBe(true);
      expect(preset.verbosity).toBe('detailed');
    });

    it('should have correct reference preset', () => {
      const preset = aiDocPresets.reference;
      expect(preset.format).toBe('json');
      expect(preset.includeExamples).toBe(false);
      expect(preset.includeCodeExamples).toBe(false);
      expect(preset.verbosity).toBe('minimal');
    });

    it('should have correct training preset', () => {
      const preset = aiDocPresets.training;
      expect(preset.format).toBe('json');
      expect(preset.includeExamples).toBe(true);
      expect(preset.includeCodeExamples).toBe(true);
      expect(preset.verbosity).toBe('detailed');
    });

    it('should have correct preview preset', () => {
      const preset = aiDocPresets.preview;
      expect(preset.format).toBe('markdown');
      expect(preset.includeExamples).toBe(false);
      expect(preset.includeCodeExamples).toBe(false);
      expect(preset.verbosity).toBe('minimal');
    });
  });

  describe('AI Docs Config Integration', () => {
    it('should merge config correctly', () => {
      const customConfig = {
        ...baseAIDocsConfig,
        format: 'json' as const,
        language: 'en' as const
      };
      
      expect(customConfig.format).toBe('json');
      expect(customConfig.language).toBe('en');
      expect(customConfig.includeExamples).toBe(true); // 保持默认值
    });

    it('should validate config types', () => {
      expect(typeof baseAIDocsConfig.enabled).toBe('boolean');
      expect(['markdown', 'json', 'yaml']).toContain(baseAIDocsConfig.format);
      expect(['zh', 'en']).toContain(baseAIDocsConfig.language);
      expect(['minimal', 'normal', 'detailed']).toContain(baseAIDocsConfig.verbosity);
      expect(typeof baseAIDocsConfig.outputDir).toBe('string');
      expect(typeof baseAIDocsConfig.filename).toBe('string');
    });

    it('should handle disabled AI docs', () => {
      const disabledConfig = {
        ...baseAIDocsConfig,
        enabled: false
      };
      
      expect(disabledConfig.enabled).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid swagger document', () => {
      const invalidSwagger = {} as ParsedSwagger;
      
      expect(() => {
        converter.convertToAIFormat(invalidSwagger);
      }).toThrow();
    });

    it('should handle missing required fields', () => {
      const incompleteSwagger = {
        info: { title: 'Test', version: '1.0.0' },
        servers: [],
        paths: [],
        components: {}
      } as ParsedSwagger;
      
      const result = converter.convertToAIFormat(incompleteSwagger);
      expect(result).toBeDefined();
      expect(result.endpoints).toHaveLength(0);
    });
  });

  describe('Performance', () => {
    it('should process large swagger documents efficiently', async () => {
      // 创建一个包含多个端点的大型 Swagger 文档
      const largeSwagger: ParsedSwagger = {
        ...mockParsedSwagger,
        paths: Array.from({ length: 100 }, (_, i) => ({
          path: `/endpoint-${i}`,
          method: 'GET' as const,
          operationId: `getEndpoint${i}`,
          functionName: `getEndpoint${i}`,
          summary: `Endpoint ${i}`,
          description: `Description for endpoint ${i}`,
          tags: ['test'],
          parameters: [],
          responses: [
            {
              statusCode: '200',
              description: 'Success',
              content: {
                'application/json': {
                  schema: { type: 'object' }
                }
              }
            }
          ]
        }))
      };
      
      const startTime = Date.now();
      const result = await converter.generateAIDoc(largeSwagger, defaultAIDocConfig);
      const endTime = Date.now();
      
      expect(result).toBeDefined();
      expect(result.stats.processedEndpoints).toBe(100);
      expect(endTime - startTime).toBeLessThan(5000); // 应该在 5 秒内完成
    });
  });
});