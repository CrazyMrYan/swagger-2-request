/**
 * 重试拦截器
 * 提供智能重试机制，支持指数退避、自定义重试条件等
 */

import type { AxiosError, AxiosResponse } from 'axios';
import type { ResponseInterceptor, RetryConfig, InterceptorFactory } from '../types';

/**
 * 默认可重试的状态码
 */
const DEFAULT_RETRYABLE_STATUS_CODES = [
  408, // Request Timeout
  429, // Too Many Requests
  500, // Internal Server Error
  502, // Bad Gateway
  503, // Service Unavailable
  504, // Gateway Timeout
];

/**
 * 默认重试条件判断
 */
const defaultShouldRetry = (error: AxiosError): boolean => {
  // 网络错误
  if (!error.response && error.code) {
    const networkErrors = ['ECONNABORTED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'];
    return networkErrors.includes(error.code);
  }

  // HTTP 状态码错误
  if (error.response) {
    return DEFAULT_RETRYABLE_STATUS_CODES.includes(error.response.status);
  }

  return false;
};

/**
 * 计算重试延迟
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  delayFactor: number = 2
): number {
  return baseDelay * Math.pow(delayFactor, attempt - 1);
}

/**
 * 睡眠函数
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 创建重试拦截器
 */
export const createRetryInterceptor: InterceptorFactory<RetryConfig> = (
  config: RetryConfig
): ResponseInterceptor => {
  const {
    maxRetries,
    delay,
    delayFactor = 2,
    retryableStatusCodes = DEFAULT_RETRYABLE_STATUS_CODES,
    shouldRetry = defaultShouldRetry,
  } = config;

  return {
    name: 'retry',
    priority: 20, // 高优先级，确保重试在其他错误处理之前
    onResponse: (response: AxiosResponse) => {
      // 成功响应，重置重试计数
      const retryConfig = (response.config as any).__retryConfig;
      if (retryConfig) {
        retryConfig.retryCount = 0;
      }
      return response;
    },
    onResponseError: async (error: AxiosError) => {
      const config = error.config;
      if (!config) {
        return Promise.reject(error);
      }

      // 初始化重试配置
      if (!(config as any).__retryConfig) {
        (config as any).__retryConfig = {
          retryCount: 0,
          maxRetries,
          delay,
          delayFactor,
        };
      }

      const retryConfig = (config as any).__retryConfig;
      const currentAttempt = retryConfig.retryCount + 1;

      // 检查是否应该重试
      const canRetry = currentAttempt <= maxRetries;
      const shouldRetryRequest = shouldRetry(error) || 
        (error.response && retryableStatusCodes.includes(error.response.status));

      if (!canRetry || !shouldRetryRequest) {
        // 记录最终失败
        const context = (config as any).__interceptorContext || {};
        console.warn(`Request failed after ${retryConfig.retryCount} retries`, {
          requestId: context.requestId,
          method: config.method?.toUpperCase(),
          url: config.url,
          finalError: error.message,
          totalRetries: retryConfig.retryCount,
        });
        return Promise.reject(error);
      }

      // 更新重试计数
      retryConfig.retryCount = currentAttempt;

      // 计算延迟时间
      const retryDelay = calculateDelay(currentAttempt, delay, delayFactor);

      // 记录重试信息
      const context = (config as any).__interceptorContext || {};
      console.info(`Retrying request (${currentAttempt}/${maxRetries})`, {
        requestId: context.requestId,
        method: config.method?.toUpperCase(),
        url: config.url,
        error: error.message,
        retryDelay: `${retryDelay}ms`,
        attempt: currentAttempt,
        maxRetries,
      });

      // 等待延迟时间
      await sleep(retryDelay);

      // 重新发送请求
      try {
        // 需要访问 axios 实例来重新发送请求
        // 这里我们通过 error.config 重新构造请求
        const axios = require('axios');
        return await axios.request(config);
      } catch (retryError) {
        // 如果重试也失败了，继续处理错误
        return Promise.reject(retryError);
      }
    },
  };
};

/**
 * 重试管理器
 */
export class RetryManager {
  private retryConfig: RetryConfig;

  constructor(config: RetryConfig) {
    this.retryConfig = config;
  }

  /**
   * 更新重试配置
   */
  updateConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * 获取当前重试配置
   */
  getConfig(): RetryConfig {
    return { ...this.retryConfig };
  }

  /**
   * 创建重试拦截器
   */
  createInterceptor(): ResponseInterceptor {
    return createRetryInterceptor(this.retryConfig);
  }

  /**
   * 检查错误是否可重试
   */
  shouldRetry(error: AxiosError): boolean {
    if (this.retryConfig.shouldRetry) {
      return this.retryConfig.shouldRetry(error);
    }
    return defaultShouldRetry(error);
  }

  /**
   * 获取重试统计信息
   */
  getRetryStats(config: any): {
    retryCount: number;
    maxRetries: number;
    canRetry: boolean;
  } {
    const retryConfig = config.__retryConfig || {
      retryCount: 0,
      maxRetries: this.retryConfig.maxRetries,
    };

    return {
      retryCount: retryConfig.retryCount,
      maxRetries: retryConfig.maxRetries,
      canRetry: retryConfig.retryCount < retryConfig.maxRetries,
    };
  }
}

/**
 * 预设重试配置
 */
export const retryPresets = {
  /**
   * 保守重试策略 - 适用于生产环境
   */
  conservative: {
    maxRetries: 2,
    delay: 1000,
    delayFactor: 2,
    retryableStatusCodes: [429, 500, 502, 503, 504],
  },

  /**
   * 积极重试策略 - 适用于开发和测试环境
   */
  aggressive: {
    maxRetries: 5,
    delay: 500,
    delayFactor: 1.5,
    retryableStatusCodes: [...DEFAULT_RETRYABLE_STATUS_CODES, 408],
  },

  /**
   * 快速重试策略 - 适用于实时性要求高的场景
   */
  fast: {
    maxRetries: 3,
    delay: 200,
    delayFactor: 1.2,
    retryableStatusCodes: [429, 502, 503, 504],
  },

  /**
   * 禁用重试
   */
  disabled: {
    maxRetries: 0,
    delay: 0,
    delayFactor: 1,
    retryableStatusCodes: [],
  },
} satisfies Record<string, RetryConfig>;