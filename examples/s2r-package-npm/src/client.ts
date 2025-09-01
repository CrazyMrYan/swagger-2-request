/**
 * API 客户端配置
 * Generated for: Swagger Petstore v1.0.7
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

/** API 客户端配置选项 */
export interface APIClientConfig {
  /** API 基础 URL */
  baseURL?: string;
  /** 请求超时时间（毫秒） */
  timeout?: number;
  /** 默认请求头 */
  headers?: Record<string, string>;
  /** 是否启用默认错误处理 */
  enableDefaultErrorHandling?: boolean;
}

/** API 客户端类 */
export class APIClient {
  private instance: AxiosInstance;

  constructor(config: APIClientConfig = {}) {
    // 创建 Axios 实例
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // 设置默认拦截器
    if (config.enableDefaultErrorHandling !== false) {
      this.setupDefaultInterceptors();
    }
  }

  /**
   * 设置默认拦截器
   */
  private setupDefaultInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 可以在这里添加请求拦截逻辑
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        // 简单的错误处理
        const errorMessage = error.response?.data?.message ||
                            error.response?.statusText ||
                            error.message ||
                            'API request failed';
        console.error('API Error:', errorMessage);
        return Promise.reject(error);
      }
    );
  }

  /**
   * 发送请求
   */
  async request<T = any>(config: AxiosRequestConfig): Promise<{ data: T; status: number; statusText: string; headers: any }> {
    const response = await this.instance.request<T>(config);
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    };
  }

  /**
   * 获取 Axios 实例
   */
  getInstance(): AxiosInstance {
    return this.instance;
  }

  /**
   * 设置请求头
   */
  setHeader(name: string, value: string): void {
    this.instance.defaults.headers.common[name] = value;
  }

  /**
   * 移除请求头
   */
  removeHeader(name: string): void {
    delete this.instance.defaults.headers.common[name];
  }

  /**
   * 设置基础 URL
   */
  setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }

  /**
   * 设置超时时间
   */
  setTimeout(timeout: number): void {
    this.instance.defaults.timeout = timeout;
  }
}

/** 默认 API 客户端实例 */

export const apiClient = new APIClient();

/** 创建新的 API 客户端实例 */
export function createAPIClient(config?: APIClientConfig): APIClient {
  return new APIClient(config);
}