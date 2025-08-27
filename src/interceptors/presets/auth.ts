/**
 * 认证拦截器
 * 提供多种认证方式的支持：Bearer Token、API Key、Basic Auth 等
 */

import type { AxiosRequestConfig } from 'axios';
import type { RequestInterceptor, AuthConfig, InterceptorFactory } from '../types';

/**
 * 创建认证拦截器
 */
export const createAuthInterceptor: InterceptorFactory<AuthConfig> = (
  config: AuthConfig
): RequestInterceptor => {
  return {
    name: 'auth',
    priority: 10, // 高优先级，确保认证信息最先添加
    onRequest: async (requestConfig: AxiosRequestConfig) => {
      switch (config.type) {
        case 'bearer':
          return addBearerAuth(requestConfig, config.token);
        
        case 'apikey':
          return addApiKeyAuth(requestConfig, config.apiKey);
        
        case 'basic':
          return addBasicAuth(requestConfig, config.basic);
        
        case 'custom':
          return config.custom ? await config.custom(requestConfig) : requestConfig;
        
        default:
          console.warn(`Unsupported auth type: ${config.type}`);
          return requestConfig;
      }
    },
    onRequestError: (error) => {
      console.error('Auth interceptor request error:', error);
      return Promise.reject(error);
    },
  };
};

/**
 * 添加 Bearer Token 认证
 */
function addBearerAuth(config: AxiosRequestConfig, token?: string): AxiosRequestConfig {
  if (!token) {
    console.warn('Bearer token is not provided');
    return config;
  }

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    },
  };
}

/**
 * 添加 API Key 认证
 */
function addApiKeyAuth(
  config: AxiosRequestConfig,
  apiKeyConfig?: AuthConfig['apiKey']
): AxiosRequestConfig {
  if (!apiKeyConfig) {
    console.warn('API Key config is not provided');
    return config;
  }

  const { name, value, in: location } = apiKeyConfig;

  if (location === 'header') {
    return {
      ...config,
      headers: {
        ...config.headers,
        [name]: value,
      },
    };
  } else if (location === 'query') {
    return {
      ...config,
      params: {
        ...config.params,
        [name]: value,
      },
    };
  }

  console.warn(`Unsupported API Key location: ${location}`);
  return config;
}

/**
 * 添加 Basic 认证
 */
function addBasicAuth(
  config: AxiosRequestConfig,
  basicConfig?: AuthConfig['basic']
): AxiosRequestConfig {
  if (!basicConfig) {
    console.warn('Basic auth config is not provided');
    return config;
  }

  const { username, password } = basicConfig;
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');

  return {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Basic ${credentials}`,
    },
  };
}

/**
 * 动态设置认证信息的工具函数
 */
export class AuthManager {
  private authConfig: AuthConfig | null = null;

  /**
   * 设置认证配置
   */
  setAuth(config: AuthConfig): void {
    this.authConfig = config;
  }

  /**
   * 清除认证配置
   */
  clearAuth(): void {
    this.authConfig = null;
  }

  /**
   * 获取当前认证配置
   */
  getAuth(): AuthConfig | null {
    return this.authConfig;
  }

  /**
   * 创建动态认证拦截器
   */
  createDynamicAuthInterceptor(): RequestInterceptor {
    return {
      name: 'dynamic-auth',
      priority: 10,
      onRequest: async (config: AxiosRequestConfig) => {
        if (!this.authConfig) {
          return config;
        }

        const authInterceptor = createAuthInterceptor(this.authConfig);
        return authInterceptor.onRequest ? await authInterceptor.onRequest(config) : config;
      },
    };
  }

  /**
   * 设置 Bearer Token
   */
  setBearerToken(token: string): void {
    this.setAuth({ type: 'bearer', token });
  }

  /**
   * 设置 API Key
   */
  setApiKey(name: string, value: string, location: 'header' | 'query' = 'header'): void {
    this.setAuth({
      type: 'apikey',
      apiKey: { name, value, in: location },
    });
  }

  /**
   * 设置 Basic 认证
   */
  setBasicAuth(username: string, password: string): void {
    this.setAuth({
      type: 'basic',
      basic: { username, password },
    });
  }
}

/**
 * 全局认证管理器实例
 */
export const globalAuthManager = new AuthManager();