/**
 * SwaggerAnalyzer 单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SwaggerAnalyzer } from '../src/core/swagger-parser';
import type { OpenAPIV3 } from 'openapi-types';

describe('SwaggerAnalyzer', () => {
  let analyzer: SwaggerAnalyzer;
  let mockSwaggerDoc: OpenAPIV3.Document;

  beforeEach(() => {
    analyzer = new SwaggerAnalyzer();
    
    // 创建一个简单的测试用 Swagger 文档
    mockSwaggerDoc = {
      openapi: '3.0.0',
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
      paths: {
        '/users': {
          get: {
            summary: 'Get all users',
            description: 'Retrieve a list of all users',
            operationId: 'getUsers',
            tags: ['users'],
            parameters: [
              {
                name: 'limit',
                in: 'query',
                description: 'Number of users to return',
                required: false,
                schema: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 100,
                  default: 10,
                },
              },
            ],
            responses: {
              '200': {
                description: 'Successful response',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/User',
                      },
                    },
                  },
                },
              },
            },
          },
          post: {
            summary: 'Create a new user',
            operationId: 'createUser',
            tags: ['users'],
            requestBody: {
              required: true,
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/CreateUserRequest',
                  },
                },
              },
            },
            responses: {
              '201': {
                description: 'User created successfully',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
            },
          },
        },
        '/users/{id}': {
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'User ID',
              schema: {
                type: 'integer',
              },
            },
          ],
          get: {
            summary: 'Get user by ID',
            operationId: 'getUserById',
            tags: ['users'],
            responses: {
              '200': {
                description: 'User found',
                content: {
                  'application/json': {
                    schema: {
                      $ref: '#/components/schemas/User',
                    },
                  },
                },
              },
              '404': {
                description: 'User not found',
              },
            },
          },
        },
      },
      components: {
        schemas: {
          User: {
            type: 'object',
            required: ['id', 'name', 'email'],
            properties: {
              id: {
                type: 'integer',
                format: 'int64',
              },
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
                format: 'email',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
              },
            },
          },
          CreateUserRequest: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: {
                type: 'string',
              },
              email: {
                type: 'string',
                format: 'email',
              },
            },
          },
        },
      },
    };
  });

  describe('parseSwagger', () => {
    it('should parse basic swagger document successfully', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      expect(result).toBeDefined();
      expect(result.info.title).toBe('Test API');
      expect(result.info.version).toBe('1.0.0');
      expect(result.info.description).toBe('A test API for unit testing');
    });

    it('should extract API paths correctly', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      expect(result.paths).toHaveLength(3); // /users GET, /users POST, /users/{id} GET
      
      const getUsersEndpoint = result.paths.find(p => p.path === '/users' && p.method === 'GET');
      expect(getUsersEndpoint).toBeDefined();
      expect(getUsersEndpoint?.functionName).toBe('usersGet');
      expect(getUsersEndpoint?.summary).toBe('Get all users');
      expect(getUsersEndpoint?.tags).toContain('users');
    });

    it('should generate correct function names according to naming convention', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      const functionNames = result.paths.map(p => p.functionName);
      expect(functionNames).toContain('usersGet');
      expect(functionNames).toContain('usersPost');
      expect(functionNames).toContain('usersIdGet');
    });

    it('should extract parameters correctly', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      const getUsersEndpoint = result.paths.find(p => p.path === '/users' && p.method === 'GET');
      expect(getUsersEndpoint?.parameters).toHaveLength(1);
      
      const limitParam = getUsersEndpoint?.parameters[0];
      expect(limitParam?.name).toBe('limit');
      expect(limitParam?.in).toBe('query');
      expect(limitParam?.required).toBe(false);
    });

    it('should extract path parameters correctly', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      const getUserByIdEndpoint = result.paths.find(p => p.path === '/users/{id}' && p.method === 'GET');
      expect(getUserByIdEndpoint?.parameters).toHaveLength(1);
      
      const idParam = getUserByIdEndpoint?.parameters[0];
      expect(idParam?.name).toBe('id');
      expect(idParam?.in).toBe('path');
      expect(idParam?.required).toBe(true);
    });

    it('should extract request body correctly', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      const createUserEndpoint = result.paths.find(p => p.path === '/users' && p.method === 'POST');
      expect(createUserEndpoint?.requestBody).toBeDefined();
      expect(createUserEndpoint?.requestBody?.required).toBe(true);
      expect(createUserEndpoint?.requestBody?.content).toHaveProperty('application/json');
    });

    it('should extract responses correctly', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      const getUsersEndpoint = result.paths.find(p => p.path === '/users' && p.method === 'GET');
      expect(getUsersEndpoint?.responses).toHaveLength(1);
      
      const successResponse = getUsersEndpoint?.responses[0];
      expect(successResponse?.statusCode).toBe('200');
      expect(successResponse?.description).toBe('Successful response');
    });

    it('should extract components correctly', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      expect(result.components.schemas).toHaveProperty('User');
      expect(result.components.schemas).toHaveProperty('CreateUserRequest');
    });

    it('should extract servers correctly', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);

      expect(result.servers).toHaveLength(1);
      expect(result.servers[0].url).toBe('https://api.example.com');
      expect(result.servers[0].description).toBe('Production server');
    });
  });

  describe('validateSwagger', () => {
    it('should validate correct swagger document', async () => {
      const isValid = await analyzer.validateSwagger(mockSwaggerDoc);
      expect(isValid).toBe(true);
    });

    it('should throw error for invalid swagger document', async () => {
      const invalidDoc = {
        openapi: '3.0.0',
        // Missing required 'info' field
        paths: {},
      };

      await expect(analyzer.validateSwagger(invalidDoc as any)).rejects.toThrow();
    });
  });

  describe('utility methods', () => {
    beforeEach(async () => {
      await analyzer.parseSwagger(mockSwaggerDoc);
    });

    it('should get base URL correctly', () => {
      const baseUrl = analyzer.getBaseUrl();
      expect(baseUrl).toBe('https://api.example.com');
    });

    it('should get API info correctly', () => {
      const apiInfo = analyzer.getApiInfo();
      expect(apiInfo.title).toBe('Test API');
      expect(apiInfo.version).toBe('1.0.0');
      expect(apiInfo.description).toBe('A test API for unit testing');
    });

    it('should get tags correctly', () => {
      const tags = analyzer.getTags();
      expect(tags).toEqual([]);
    });

    it('should get security schemes correctly', () => {
      const securitySchemes = analyzer.getSecuritySchemes();
      expect(securitySchemes).toEqual({});
    });

    it('should filter endpoints by tag', async () => {
      const result = await analyzer.parseSwagger(mockSwaggerDoc);
      const userEndpoints = analyzer.filterEndpointsByTag(result.paths, 'users');
      
      expect(userEndpoints).toHaveLength(3);
      userEndpoints.forEach(endpoint => {
        expect(endpoint.tags).toContain('users');
      });
    });
  });

  describe('error handling', () => {
    it('should handle invalid URL gracefully', async () => {
      await expect(analyzer.parseSwagger('https://invalid-url-that-does-not-exist.com/swagger.json'))
        .rejects.toThrow();
    });

    it('should handle malformed JSON gracefully', async () => {
      const malformedDoc = {
        openapi: '3.0.0',
        info: {
          title: 'Test',
          version: '1.0.0'
        },
        paths: {
          '/test': {
            get: {
              // Missing required fields
            }
          }
        }
      };

      const result = await analyzer.parseSwagger(malformedDoc as any);
      expect(result).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle swagger document with security schemes', async () => {
      const docWithSecurity: OpenAPIV3.Document = {
        ...mockSwaggerDoc,
        components: {
          ...mockSwaggerDoc.components,
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT'
            } as OpenAPIV3.HttpSecurityScheme,
            apiKey: {
              type: 'apiKey',
              in: 'header',
              name: 'X-API-Key'
            } as OpenAPIV3.ApiKeySecurityScheme
          }
        }
      };

      await analyzer.parseSwagger(docWithSecurity);
      const securitySchemes = analyzer.getSecuritySchemes();
      
      expect(securitySchemes).toHaveProperty('bearerAuth');
      expect(securitySchemes).toHaveProperty('apiKey');
      expect((securitySchemes.bearerAuth as OpenAPIV3.HttpSecurityScheme).type).toBe('http');
      expect((securitySchemes.apiKey as OpenAPIV3.ApiKeySecurityScheme).type).toBe('apiKey');
    });

    it('should handle swagger document with tags', async () => {
      const docWithTags: OpenAPIV3.Document = {
        ...mockSwaggerDoc,
        tags: [
          { name: 'users', description: 'User operations' },
          { name: 'admin', description: 'Admin operations' }
        ]
      };

      await analyzer.parseSwagger(docWithTags);
      const tags = analyzer.getTags();
      
      expect(tags).toHaveLength(2);
      expect(tags).toContain('users');
      expect(tags).toContain('admin');
    });

    it('should handle empty paths object', async () => {
      const docWithEmptyPaths: OpenAPIV3.Document = {
        ...mockSwaggerDoc,
        paths: {}
      };

      const result = await analyzer.parseSwagger(docWithEmptyPaths);
      expect(result.paths).toHaveLength(0);
    });

    it('should handle missing servers array', async () => {
      const docWithoutServers: OpenAPIV3.Document = {
        ...mockSwaggerDoc
      };
      delete (docWithoutServers as any).servers;

      const result = await analyzer.parseSwagger(docWithoutServers);
      expect(result.servers).toHaveLength(0);
      
      const baseUrl = analyzer.getBaseUrl();
      expect(baseUrl).toBe('');
    });
  });
});