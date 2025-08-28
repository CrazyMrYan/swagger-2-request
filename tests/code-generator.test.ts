/**
 * CodeGenerator 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CodeGenerator } from '../src/core/code-generator';
import type { ParsedSwagger, GenerationConfig } from '../src/types';

describe('CodeGenerator', () => {
  let generator: CodeGenerator;
  let mockParsedSwagger: ParsedSwagger;
  let mockConfig: GenerationConfig;

  beforeEach(() => {
    generator = new CodeGenerator();
    
    mockConfig = {
      outputDir: './src/api',
      typescript: true,
      functionNaming: 'pathMethod',
      includeComments: true,
      generateTypes: true,
      cleanOutput: true,
    };

    mockParsedSwagger = {
      info: {
        title: 'Test API',
        version: '1.0.0',
        description: 'A test API for unit testing',
      },
      servers: [
        {
          url: 'https://api.example.com',
          description: 'Production server',
        },
      ],
      paths: [
        {
          path: '/users',
          method: 'GET',
          operationId: 'getUsers',
          functionName: 'usersGet',
          parameters: [
            {
              name: 'limit',
              in: 'query',
              required: false,
              schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
              description: 'Number of users to return',
            },
          ],
          responses: [
            {
              statusCode: '200',
              description: 'Successful response',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          ],
          tags: ['users'],
          summary: 'Get all users',
          description: 'Retrieve a list of all users',
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
              description: 'User created successfully',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/User' },
                },
              },
            },
          ],
          tags: ['users'],
          summary: 'Create a new user',
        },
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
      ],
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id', 'name', 'email'],
            properties: {
              id: { type: 'integer', format: 'int64' },
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          CreateUserRequest: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' },
            },
          },
        },
      },
    };
  });

  describe('generateAPIClient', () => {
    it('should generate all required files', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);

      expect(files).toHaveLength(4);
      
      const filePaths = files.map(f => f.path);
      expect(filePaths).toContain('types.ts');
      expect(filePaths).toContain('api.ts');
      expect(filePaths).toContain('client.ts');
      expect(filePaths).toContain('index.ts');
    });

    it('should skip types file when generateTypes is false', () => {
      const configWithoutTypes = { ...mockConfig, generateTypes: false };
      const files = generator.generateAPIClient(mockParsedSwagger, configWithoutTypes);

      expect(files).toHaveLength(3);
      const filePaths = files.map(f => f.path);
      expect(filePaths).not.toContain('types.ts');
    });
  });

  describe('types generation', () => {
    it('should generate correct interface types for schemas', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const typesFile = files.find(f => f.path === 'types.ts');

      expect(typesFile).toBeDefined();
      expect(typesFile!.content).toContain('export interface User {');
      expect(typesFile!.content).toContain('export interface CreateUserRequest {');
      expect(typesFile!.content).toContain('id: number;');
      expect(typesFile!.content).toContain('name: string;');
      expect(typesFile!.content).toContain('email: string;');
    });

    it('should generate parameter types for endpoints', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const typesFile = files.find(f => f.path === 'types.ts');

      expect(typesFile!.content).toContain('export interface UsersGetParams {');
      expect(typesFile!.content).toContain('limit?: number;');
    });

    it('should generate base types', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const typesFile = files.find(f => f.path === 'types.ts');

      expect(typesFile!.content).toContain('export type HTTPMethod');
      expect(typesFile!.content).toContain('export interface RequestOptions');
      expect(typesFile!.content).toContain('export interface ApiResponse');
    });
  });

  describe('API functions generation', () => {
    it('should generate API functions with correct names', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const apiFile = files.find(f => f.path === 'api.ts');

      expect(apiFile).toBeDefined();
      expect(apiFile!.content).toContain('export async function usersGet(');
      expect(apiFile!.content).toContain('export async function usersPost(');
      expect(apiFile!.content).toContain('export async function usersIdGet(');
    });

    it('should include function comments when includeComments is true', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const apiFile = files.find(f => f.path === 'api.ts');

      expect(apiFile!.content).toContain('/**');
      expect(apiFile!.content).toContain('* Get all users');
      expect(apiFile!.content).toContain('* GET /users');
      expect(apiFile!.content).toContain('* @tags users');
      expect(apiFile!.content).toContain('*/');
    });

    it('should skip comments when includeComments is false', () => {
      const configWithoutComments = { ...mockConfig, includeComments: false };
      const files = generator.generateAPIClient(mockParsedSwagger, configWithoutComments);
      const apiFile = files.find(f => f.path === 'api.ts');

      expect(apiFile!.content).not.toContain('/**');
      expect(apiFile!.content).not.toContain('* Get all users');
    });

    it('should generate correct function parameters', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const apiFile = files.find(f => f.path === 'api.ts');

      // usersGet 应该有 params 参数
      expect(apiFile!.content).toContain('usersGet(params?: Types.UsersGetParams, options?: Types.RequestOptions)');
      
      // usersPost 应该有 data 参数
      expect(apiFile!.content).toContain('usersPost(data: Types.UsersPostRequest, options?: Types.RequestOptions)');
      
      // usersIdGet 应该有路径参数
      expect(apiFile!.content).toContain('usersIdGet(id: number, options?: Types.RequestOptions)');
    });

    it('should generate correct return types', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const apiFile = files.find(f => f.path === 'api.ts');

      expect(apiFile!.content).toContain('Promise<Types.UsersGetResponse>');
      expect(apiFile!.content).toContain('Promise<Types.UsersPostResponse>');
      expect(apiFile!.content).toContain('Promise<Types.UsersIdGetResponse>');
    });
  });

  describe('client configuration generation', () => {
    it('should generate client configuration without default base URL', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const clientFile = files.find(f => f.path === 'client.ts');

      expect(clientFile).toBeDefined();
      expect(clientFile!.content).toContain('baseURL: config.baseURL,');
      expect(clientFile!.content).not.toContain('User-Agent');
      expect(clientFile!.content).toContain('export class APIClient');
      expect(clientFile!.content).toContain('export const apiClient = new APIClient();');
    });

    it('should include API info in comments', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const clientFile = files.find(f => f.path === 'client.ts');

      expect(clientFile!.content).toContain('Generated for: Test API v1.0.0');
    });
  });

  describe('index file generation', () => {
    it('should export all modules', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const indexFile = files.find(f => f.path === 'index.ts');

      expect(indexFile).toBeDefined();
      expect(indexFile!.content).toContain("export * from './api';");
      expect(indexFile!.content).toContain("export * from './types';");
      expect(indexFile!.content).toContain("export * from './client';");
      expect(indexFile!.content).toContain("export * from './utils';");
    });

    it('should include API info in header', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const indexFile = files.find(f => f.path === 'index.ts');

      expect(indexFile!.content).toContain('Test API API Client');
      expect(indexFile!.content).toContain('Version: 1.0.0');
      expect(indexFile!.content).toContain('Generated on:');
    });
  });

  describe('type conversion', () => {
    it('should convert basic JSON schema types to TypeScript', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const typesFile = files.find(f => f.path === 'types.ts');

      // 整数类型应该转换为 number
      expect(typesFile!.content).toContain('id: number;');
      
      // 字符串类型应该保持 string
      expect(typesFile!.content).toContain('name: string;');
      expect(typesFile!.content).toContain('email: string;');
    });

    it('should handle optional properties correctly', () => {
      const files = generator.generateAPIClient(mockParsedSwagger, mockConfig);
      const typesFile = files.find(f => f.path === 'types.ts');

      // 必需属性不应该有 ?
      expect(typesFile!.content).toContain('id: number;');
      expect(typesFile!.content).toContain('name: string;');
      
      // 可选属性应该有 ?
      expect(typesFile!.content).toContain('createdAt?: string;');
    });
  });
});