/**
 * 模拟生成的 API 客户端 - 主入口文件
 * 
 * 注意：这是一个模拟文件，用于展示生成后的目录结构
 * 在实际使用中，这些文件会通过 `s2r generate` 命令自动生成
 */

// 导出所有类型
export type {
  Pet,
  NewPet,
  PetsGetParams,
  // ... 其他生成的类型
} from './types.js';

// 导出所有 API 函数
export {
  petsGet,
  petsPost,
  petsPetIdGet,
  // ... 其他生成的 API 函数
} from './api.js';

// 导出客户端相关
export {
  APIClient,
  createAPIClient,
  apiClient,
  type APIClientConfig,
} from './client.js';

// 导出拦截器系统
export {
  // 拦截器类型
  type RequestInterceptor,
  type ResponseInterceptor,
  type InterceptorConfig,
  type AuthConfig,
  type RetryConfig,
  type LogConfig,
  type ErrorHandlerConfig,
  
  // 拦截器工厂函数
  createAuthInterceptor,
  createRetryInterceptor,
  createLogInterceptors,
  createErrorHandlerInterceptor,
  
  // 预设配置
  interceptorPresets,
  retryPresets,
  errorHandlerPresets,
  
  // 管理器
  globalAuthManager,
  InterceptorManager,
  AuthManager,
  RetryManager,
  ErrorHandlerManager,
  
  // 便利函数
  createInterceptorConfig,
  createAuthManager,
  createRetryManager,
  createErrorHandlerManager,
} from './interceptors.js';

// 导出工具函数
export {
  formatErrorMessage,
  validateRequestData,
  transformResponse,
  // ... 其他工具函数
} from './utils.js';

// 默认导出主要功能
export default {
  // API 函数
  api: {
    petsGet,
    petsPost,
    petsPetIdGet,
  },
  
  // 客户端
  client: {
    APIClient,
    createAPIClient,
    apiClient,
  },
  
  // 拦截器
  interceptors: {
    createAuthInterceptor,
    createRetryInterceptor,
    createLogInterceptors,
    createErrorHandlerInterceptor,
    interceptorPresets,
  },
};

/**
 * 模拟的 API 函数
 * 实际生成的函数会根据 Swagger 规范自动创建
 */

// 模拟的类型定义
export interface Pet {
  id: number;
  name: string;
  tag?: string;
}

export interface NewPet {
  name: string;
  tag?: string;
}

export interface PetsGetParams {
  limit?: number;
}

// 模拟的 API 函数
export async function petsGet(params?: PetsGetParams, options?: any): Promise<Pet[]> {
  // 这里会是实际的 axios 调用
  console.log('模拟调用 petsGet', params);
  return [
    { id: 1, name: '小白', tag: '可爱' },
    { id: 2, name: '小黑', tag: '聪明' }
  ];
}

export async function petsPost(data: NewPet, options?: any): Promise<Pet> {
  console.log('模拟调用 petsPost', data);
  return { id: Date.now(), ...data };
}

export async function petsPetIdGet(petId: string, options?: any): Promise<Pet> {
  console.log('模拟调用 petsPetIdGet', petId);
  return { id: parseInt(petId), name: '找到的宠物', tag: '测试' };
}

// 模拟的客户端类
export class APIClient {
  constructor(config?: any) {
    console.log('创建 API 客户端', config);
  }
  
  setHeader(name: string, value: string) {
    console.log('设置请求头', name, value);
  }
  
  get(url: string, config?: any) {
    console.log('GET 请求', url);
    return Promise.resolve({ data: {} });
  }
  
  post(url: string, data?: any, config?: any) {
    console.log('POST 请求', url, data);
    return Promise.resolve({ data: {} });
  }
}

export function createAPIClient(config?: any): APIClient {
  return new APIClient(config);
}

export const apiClient = new APIClient();

// 模拟的拦截器预设
export const interceptorPresets = {
  development: { request: [], response: [] },
  production: { request: [], response: [] },
  testing: { request: [], response: [] },
  minimal: { request: [], response: [] },
};

// 模拟的拦截器创建函数
export function createAuthInterceptor(config: any) {
  return { name: 'auth', priority: 10, onRequest: (cfg: any) => cfg };
}

export function createRetryInterceptor(config: any) {
  return { name: 'retry', priority: 20, onResponseError: (error: any) => Promise.reject(error) };
}

export function createLogInterceptors(config: any) {
  return {
    request: { name: 'request-log', onRequest: (cfg: any) => cfg },
    response: { name: 'response-log', onResponse: (res: any) => res }
  };
}

export function createErrorHandlerInterceptor(config: any) {
  return { name: 'error-handler', onResponseError: (error: any) => Promise.reject(error) };
}

// 模拟的全局认证管理器
export const globalAuthManager = {
  setBearerToken: (token: string) => console.log('设置 Bearer Token', token),
  setApiKey: (key: string, value: string) => console.log('设置 API Key', key, value),
  createDynamicAuthInterceptor: () => createAuthInterceptor({}),
};

// 模拟的管理器类
export class InterceptorManager {
  addRequestInterceptor(interceptor: any) {
    console.log('添加请求拦截器', interceptor.name);
  }
  
  addResponseInterceptor(interceptor: any) {
    console.log('添加响应拦截器', interceptor.name);
  }
  
  removeInterceptor(name: string) {
    console.log('移除拦截器', name);
  }
  
  getStats() {
    return { requestInterceptors: 0, responseInterceptors: 0 };
  }
}

export class AuthManager {
  setAuth(config: any) {
    console.log('设置认证配置', config);
  }
  
  createInterceptor() {
    return createAuthInterceptor({});
  }
}

export class RetryManager {
  constructor(config: any) {
    console.log('创建重试管理器', config);
  }
  
  updateConfig(config: any) {
    console.log('更新重试配置', config);
  }
  
  createInterceptor() {
    return createRetryInterceptor({});
  }
}

export class ErrorHandlerManager {
  constructor(config?: any) {
    console.log('创建错误处理管理器', config);
  }
  
  getErrorStats() {
    return { totalErrors: 0, errorsByType: {} };
  }
  
  isRecoverableError(error: any) {
    return false;
  }
}

// 便利函数
export function createInterceptorConfig(options: any) {
  return { request: [], response: [] };
}

export function createAuthManager(config?: any) {
  return new AuthManager();
}

export function createRetryManager(config: any) {
  return new RetryManager(config);
}

export function createErrorHandlerManager(config?: any) {
  return new ErrorHandlerManager(config);
}

// 预设配置
export const retryPresets = {
  conservative: { maxRetries: 2, delay: 1000 },
  aggressive: { maxRetries: 5, delay: 500 },
  fast: { maxRetries: 3, delay: 200 },
  disabled: { maxRetries: 0, delay: 0 },
};

export const errorHandlerPresets = {
  development: { enableTransform: true, enableNotification: true },
  production: { enableTransform: true, enableNotification: false },
  testing: { enableTransform: true, enableNotification: true },
  silent: { enableTransform: false, enableNotification: false },
};

// 工具函数
export function formatErrorMessage(error: any): string {
  return error?.message || '未知错误';
}

export function validateRequestData(data: any): boolean {
  return data != null;
}

export function transformResponse(response: any): any {
  return response?.data || response;
}