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

// 导出工具函数
export {
  filterQueryParams,
  validateRequestBody,
  createRequestConfig,
  handleApiError,
  createQueryString,
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
  
  // 工具函数
  utils: {
    filterQueryParams,
    validateRequestBody,
    createRequestConfig,
    handleApiError,
    createQueryString,
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
  
  setBaseURL(baseURL: string) {
    console.log('设置基础 URL', baseURL);
  }
  
  setTimeout(timeout: number) {
    console.log('设置超时时间', timeout);
  }
  
  async request(config: any) {
    console.log('发送请求', config);
    return { data: {}, status: 200, statusText: 'OK', headers: {} };
  }
  
  getInstance() {
    return this;
  }
}

export function createAPIClient(config?: any): APIClient {
  return new APIClient(config);
}

export const apiClient = new APIClient();

// 工具函数
export function filterQueryParams(params: Record<string, any>, allowedKeys: string[] = []): Record<string, any> {
  if (!params) return {};
  
  let filtered = params;
  if (allowedKeys.length > 0) {
    const result: Record<string, any> = {};
    allowedKeys.forEach(key => {
      if (key in params) {
        result[key] = params[key];
      }
    });
    filtered = result;
  }
  
  return Object.fromEntries(
    Object.entries(filtered).filter(([, value]) => 
      value !== undefined && value !== null
    )
  );
}

export function validateRequestBody(data: any): any {
  return data;
}

export function createRequestConfig(method: string, url: string, options: any = {}): any {
  return { method: method.toUpperCase(), url, ...options };
}

export function handleApiError(error: any): Error {
  return new Error(error?.message || 'API Error');
}

export function createQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}