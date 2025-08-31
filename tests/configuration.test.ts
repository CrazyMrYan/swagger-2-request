/**
 * Configuration 单元测试
 * 测试各种配置选项是否正确生效
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeGenerator } from '../src/core/code-generator';
import type { ParsedSwagger, GenerationConfig, RuntimeConfig } from '../src/types';

describe('Configuration Tests', () => {
  let generator: CodeGenerator;
  let mockParsedSwagger: ParsedSwagger;
  let baseConfig: GenerationConfig;
  let baseRuntime: RuntimeConfig;

  beforeEach(() => {
    generator = new CodeGenerator();
    
    baseConfig = {
      outputDir: './src/api',
      functionNaming: 'pathMethod',
      includeComments: true,
      generateTypes: true,
      cleanOutput: false,
      excludeFiles: [],
      forceOverride: false,
    };

    baseRuntime = {
      baseURL: 'https://api.example.com',
      timeout: 10000,
      validateParams: true,
      filterParams: true,
    };

    mockParsedSwagger = {
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'Configuration test API',
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
          functionName: 'usersIdGet',
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'integer' },
              description: 'User ID',
            },
            {
              name: 'include',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'Fields to include',
            },
          ],
          responses: [
            {
              statusCode: '200',
              description: 'User found',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          ],
          tags: ['users'],
          summary: 'Get user by ID',
        },
        {
          path: '/users',
          method: 'POST',
          operationId: 'createUser',
          functionName: 'usersPost',
          parameters: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateUserRequest' },
              },
            },
          },
          responses: [
            {
              statusCode: '201',
              description: 'User created',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          ],
          tags: ['users'],
          summary: 'Create user',
        },
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id', 'name'],
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
          },
          CreateUserRequest: {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    };
  });

  describe('Generation Configuration', () => {
    it('should generate TypeScript files', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, baseConfig);

      const filenames = files.map(f => f.path);
      expect(filenames).toContain('api.ts');
      expect(filenames).toContain('client.ts');
      expect(filenames).toContain('types.ts');
    });

    it('should use pathMethod naming strategy', () => {
      const config = { ...baseConfig, functionNaming: 'pathMethod' as const };
      const files = generator.generateAPIClient(mockParsedSwagger, config);
      const apiFile = files.find(f => f.path.includes('api'));

      expect(apiFile?.content).toContain('export async function usersIdGet(');
      expect(apiFile?.content).toContain('export async function usersPost(');
    });

    it('should include comments when includeComments is true', () => {
      const config = { ...baseConfig, includeComments: true };
      const files = generator.generateAPIClient(mockParsedSwagger, config);
      const apiFile = files.find(f => f.path.includes('api'));

      expect(apiFile?.content).toContain('/**');
      expect(apiFile?.content).toContain('* Get user by ID');
      expect(apiFile?.content).toContain('* GET /users/{id}');
    });

    it('should exclude comments when includeComments is false', () => {
      const config = { ...baseConfig, includeComments: false };
      const files = generator.generateAPIClient(mockParsedSwagger, config);
      const apiFile = files.find(f => f.path.includes('api'));

      expect(apiFile?.content).not.toContain('/**');
      expect(apiFile?.content).not.toContain('* Get user by ID');
    });

    it('should skip types file when generateTypes is false', () => {
      const config = { ...baseConfig, generateTypes: false };
      const files = generator.generateAPIClient(mockParsedSwagger, config);

      const filenames = files.map(f => f.path);
      expect(filenames).not.toContain('types.js');
      expect(filenames).not.toContain('types.ts');
    });
  });

  describe('Runtime Configuration', () => {
    it('should apply baseURL and timeout in client configuration', () => {
      const runtime = { ...baseRuntime, baseURL: 'https://custom.api.com', timeout: 5000 };
      const files = generator.generateAPIClient(mockParsedSwagger, baseConfig, runtime);
      const clientFile = files.find(f => f.path.includes('client'));

      expect(clientFile?.content).toContain('https://custom.api.com');
      expect(clientFile?.content).toContain('5000');
    });

    it('should generate parameter validation when validateParams is true', () => {
      const runtime = { ...baseRuntime, validateParams: true };
      const files = generator.generateAPIClient(mockParsedSwagger, baseConfig, runtime);
      const apiFile = files.find(f => f.path.includes('api'));

      expect(apiFile?.content).toContain('Required parameter "id" is missing');
      expect(apiFile?.content).toContain('Request body is required');
    });

    it('should skip parameter validation when validateParams is false', () => {
      const runtime = { ...baseRuntime, validateParams: false };
      const files = generator.generateAPIClient(mockParsedSwagger, baseConfig, runtime);
      const apiFile = files.find(f => f.path.includes('api'));

      expect(apiFile?.content).not.toContain('Required parameter');
      expect(apiFile?.content).not.toContain('Request body is required');
    });

    it('should use filterQueryParams when filterParams is true', () => {
      const runtime = { ...baseRuntime, filterParams: true };
      const files = generator.generateAPIClient(mockParsedSwagger, baseConfig, runtime);
      const apiFile = files.find(f => f.path.includes('api'));

      expect(apiFile?.content).toContain('filterQueryParams(params, ["include"])');
    });

    it('should handle missing runtime configuration gracefully', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, baseConfig);
      const clientFile = files.find(f => f.path.includes('client'));
      const apiFile = files.find(f => f.path.includes('api'));

      expect(clientFile?.content).toContain('new APIClient()');
      expect(apiFile?.content).not.toContain('Required parameter');
    });
  });

  describe('Configuration Integration', () => {
    it('should work with all configurations combined', () => {
      const config = {
        ...baseConfig,
        includeComments: true,
        generateTypes: true,
      };
      const runtime = {
        ...baseRuntime,
        validateParams: true,
        filterParams: true,
      };

      const files = generator.generateAPIClient(mockParsedSwagger, config, runtime);

      expect(files).toHaveLength(4);
      
      const apiFile = files.find(f => f.path === 'api.ts');
      const clientFile = files.find(f => f.path === 'client.ts');
      const typesFile = files.find(f => f.path === 'types.ts');
      
      expect(apiFile?.content).toContain('/**');
      expect(apiFile?.content).toContain('Required parameter');
      expect(apiFile?.content).toContain('filterQueryParams');
      
      expect(clientFile?.content).toContain('https://api.example.com');
      expect(clientFile?.content).toContain('10000');
      
      expect(typesFile?.content).toContain('export interface User');
    });
  });
});