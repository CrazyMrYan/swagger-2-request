/**
 * NamingStrategy 单元测试
 */

import { describe, it, expect } from 'vitest';
import { NamingStrategy } from '../src/core/naming-strategy';
import { HTTPMethod } from '../src/types';

describe('NamingStrategy', () => {
  const namingStrategy = new NamingStrategy();

  describe('generateFunctionName', () => {
    it('should generate correct function name for simple path', () => {
      const result = namingStrategy.generateFunctionName('/api/users', 'GET');
      expect(result).toBe('apiUsersGet');
    });

    it('should generate correct function name for path with parameters', () => {
      const result = namingStrategy.generateFunctionName('/api/users/{id}', 'PUT');
      expect(result).toBe('apiUsersIdPut');
    });

    it('should handle complex paths with multiple parameters', () => {
      const result = namingStrategy.generateFunctionName(
        '/api/users/{userId}/posts/{postId}',
        'DELETE'
      );
      expect(result).toBe('apiUsersUserIdPostsPostIdDelete');
    });

    it('should handle paths with special characters', () => {
      const result = namingStrategy.generateFunctionName('/api/user-profiles', 'GET');
      expect(result).toBe('apiUserProfilesGet');
    });

    it('should handle different HTTP methods', () => {
      const methods: HTTPMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      const path = '/api/users';
      
      methods.forEach(method => {
        const result = namingStrategy.generateFunctionName(path, method);
        const expectedSuffix = method.charAt(0).toUpperCase() + method.slice(1).toLowerCase();
        expect(result).toBe(`apiUsers${expectedSuffix}`);
      });
    });

    it('should handle root path', () => {
      const result = namingStrategy.generateFunctionName('/', 'GET');
      expect(result).toBe('Get');
    });

    it('should handle nested paths', () => {
      const result = namingStrategy.generateFunctionName('/v1/api/users/profile', 'GET');
      expect(result).toBe('v1ApiUsersProfileGet');
    });
  });

  describe('validateFunctionName', () => {
    it('should validate correct function names', () => {
      expect(namingStrategy.validateFunctionName('apiUsersGet')).toBe(true);
      expect(namingStrategy.validateFunctionName('getUserById')).toBe(true);
      expect(namingStrategy.validateFunctionName('_privateFunction')).toBe(true);
      expect(namingStrategy.validateFunctionName('$specialFunction')).toBe(true);
    });

    it('should reject invalid function names', () => {
      expect(namingStrategy.validateFunctionName('123invalid')).toBe(false);
      expect(namingStrategy.validateFunctionName('with-dash')).toBe(false);
      expect(namingStrategy.validateFunctionName('with space')).toBe(false);
      expect(namingStrategy.validateFunctionName('')).toBe(false);
    });
  });

  describe('generateTypeName', () => {
    it('should generate Pascal case type names', () => {
      expect(namingStrategy.generateTypeName('user')).toBe('User');
      expect(namingStrategy.generateTypeName('user-profile')).toBe('UserProfile');
      expect(namingStrategy.generateTypeName('api_response')).toBe('ApiResponse');
    });

    it('should add suffix when provided', () => {
      expect(namingStrategy.generateTypeName('user', 'Response')).toBe('UserResponse');
      expect(namingStrategy.generateTypeName('create-user', 'Request')).toBe('CreateUserRequest');
    });
  });

  describe('generateParameterTypeName', () => {
    it('should generate parameter type names', () => {
      const result = namingStrategy.generateParameterTypeName('/api/users', 'GET', 'Query');
      expect(result).toBe('ApiUsersGetQuery');
    });

    it('should handle different parameter types', () => {
      const path = '/api/users/{id}';
      const method: HTTPMethod = 'PUT';
      
      expect(namingStrategy.generateParameterTypeName(path, method, 'Body')).toBe('ApiUsersIdPutBody');
      expect(namingStrategy.generateParameterTypeName(path, method, 'Response')).toBe('ApiUsersIdPutResponse');
    });
  });
});