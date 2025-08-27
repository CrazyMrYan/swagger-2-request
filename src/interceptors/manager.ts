/**
 * 拦截器管理器
 * 负责拦截器的注册、管理和执行
 */

import type { AxiosInstance } from 'axios';
import type {
  RequestInterceptor,
  ResponseInterceptor,
  InterceptorConfig,
  InterceptorContext,
} from './types';

export class InterceptorManager {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private axiosInterceptorIds: number[] = [];
  private context: InterceptorContext = {};

  constructor(private axiosInstance: AxiosInstance) {}

  /**
   * 注册拦截器配置
   */
  register(config: InterceptorConfig): void {
    // 清除现有拦截器
    this.clear();

    // 注册请求拦截器
    if (config.request) {
      config.request.forEach(interceptor => {
        this.addRequestInterceptor(interceptor);
      });
    }

    // 注册响应拦截器
    if (config.response) {
      config.response.forEach(interceptor => {
        this.addResponseInterceptor(interceptor);
      });
    }

    // 应用到 Axios 实例
    this.applyToAxios();
  }

  /**
   * 添加请求拦截器
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    // 按优先级插入
    const priority = interceptor.priority || 100;
    const insertIndex = this.requestInterceptors.findIndex(
      i => (i.priority || 100) > priority
    );

    if (insertIndex === -1) {
      this.requestInterceptors.push(interceptor);
    } else {
      this.requestInterceptors.splice(insertIndex, 0, interceptor);
    }
  }

  /**
   * 添加响应拦截器
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    // 按优先级插入
    const priority = interceptor.priority || 100;
    const insertIndex = this.responseInterceptors.findIndex(
      i => (i.priority || 100) > priority
    );

    if (insertIndex === -1) {
      this.responseInterceptors.push(interceptor);
    } else {
      this.responseInterceptors.splice(insertIndex, 0, interceptor);
    }
  }

  /**
   * 移除指定名称的拦截器
   */
  removeInterceptor(name: string): void {
    this.requestInterceptors = this.requestInterceptors.filter(
      i => i.name !== name
    );
    this.responseInterceptors = this.responseInterceptors.filter(
      i => i.name !== name
    );

    // 重新应用到 Axios
    this.applyToAxios();
  }

  /**
   * 获取拦截器列表
   */
  getInterceptors(): {
    request: RequestInterceptor[];
    response: ResponseInterceptor[];
  } {
    return {
      request: [...this.requestInterceptors],
      response: [...this.responseInterceptors],
    };
  }

  /**
   * 清除所有拦截器
   */
  clear(): void {
    // 清除 Axios 拦截器
    this.axiosInterceptorIds.forEach(id => {
      this.axiosInstance.interceptors.request.eject(id);
      this.axiosInstance.interceptors.response.eject(id);
    });
    this.axiosInterceptorIds = [];

    // 清除本地拦截器
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * 应用拦截器到 Axios 实例
   */
  private applyToAxios(): void {
    // 清除现有的 Axios 拦截器
    this.axiosInterceptorIds.forEach(id => {
      this.axiosInstance.interceptors.request.eject(id);
      this.axiosInstance.interceptors.response.eject(id);
    });
    this.axiosInterceptorIds = [];

    // 应用请求拦截器
    if (this.requestInterceptors.length > 0) {
      const requestId = this.axiosInstance.interceptors.request.use(
        async (config) => {
          let currentConfig = config;
          
          // 初始化上下文
          this.context = {
            startTime: Date.now(),
            requestId: this.generateRequestId(),
            metadata: {},
          };

          // 依次执行所有请求拦截器
          for (const interceptor of this.requestInterceptors) {
            if (interceptor.onRequest) {
              try {
                currentConfig = await interceptor.onRequest(currentConfig);
              } catch (error) {
                console.error(`Request interceptor "${interceptor.name}" failed:`, error);
                throw error;
              }
            }
          }

          // 将上下文信息附加到配置中
          (currentConfig as any).__interceptorContext = this.context;

          return currentConfig;
        },
        async (error) => {
          // 依次执行所有请求错误拦截器
          for (const interceptor of this.requestInterceptors) {
            if (interceptor.onRequestError) {
              try {
                error = await interceptor.onRequestError(error);
              } catch (interceptorError) {
                console.error(`Request error interceptor "${interceptor.name}" failed:`, interceptorError);
              }
            }
          }
          return Promise.reject(error);
        }
      );
      this.axiosInterceptorIds.push(requestId);
    }

    // 应用响应拦截器
    if (this.responseInterceptors.length > 0) {
      const responseId = this.axiosInstance.interceptors.response.use(
        async (response) => {
          let currentResponse = response;
          
          // 从请求配置中获取上下文
          const context = (response.config as any).__interceptorContext || {};
          
          // 计算请求耗时
          if (context.startTime) {
            context.duration = Date.now() - context.startTime;
          }

          // 依次执行所有响应拦截器
          for (const interceptor of this.responseInterceptors) {
            if (interceptor.onResponse) {
              try {
                currentResponse = await interceptor.onResponse(currentResponse);
              } catch (error) {
                console.error(`Response interceptor "${interceptor.name}" failed:`, error);
                throw error;
              }
            }
          }

          return currentResponse;
        },
        async (error) => {
          // 从请求配置中获取上下文
          const context = error.config?.__interceptorContext || {};
          
          // 计算请求耗时
          if (context.startTime) {
            context.duration = Date.now() - context.startTime;
          }

          // 依次执行所有响应错误拦截器
          for (const interceptor of this.responseInterceptors) {
            if (interceptor.onResponseError) {
              try {
                error = await interceptor.onResponseError(error);
              } catch (interceptorError) {
                console.error(`Response error interceptor "${interceptor.name}" failed:`, interceptorError);
              }
            }
          }
          return Promise.reject(error);
        }
      );
      this.axiosInterceptorIds.push(responseId);
    }
  }

  /**
   * 生成请求 ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取拦截器统计信息
   */
  getStats(): {
    requestInterceptors: number;
    responseInterceptors: number;
    totalInterceptors: number;
  } {
    return {
      requestInterceptors: this.requestInterceptors.length,
      responseInterceptors: this.responseInterceptors.length,
      totalInterceptors: this.requestInterceptors.length + this.responseInterceptors.length,
    };
  }
}