/**
 * 错误处理拦截器
 * 提供统一的错误处理、转换和通知机制
 */

import type { AxiosError, AxiosResponse } from 'axios';
import type { ResponseInterceptor, InterceptorFactory } from '../types';

/**
 * 标准化错误接口
 */
export interface StandardError {
  /** 错误码 */
  code: string;
  /** 错误消息 */
  message: string;
  /** 详细错误信息 */
  details?: any;
  /** HTTP 状态码 */
  status?: number;
  /** 原始错误对象 */
  originalError?: any;
  /** 请求 ID */
  requestId?: string;
  /** 错误发生时间 */
  timestamp: string;
}

/**
 * 错误处理配置
 */
export interface ErrorHandlerConfig {
  /** 是否启用错误转换 */
  enableTransform?: boolean;
  /** 是否启用错误通知 */
  enableNotification?: boolean;
  /** 自定义错误转换函数 */
  errorTransformer?: (error: AxiosError) => StandardError;
  /** 错误通知函数 */
  onError?: (error: StandardError) => void;
  /** 需要特殊处理的状态码映射 */
  statusCodeMapping?: Record<number, (error: AxiosError) => StandardError>;
}

/**
 * 默认错误转换函数
 */
const defaultErrorTransformer = (error: AxiosError): StandardError => {
  const context = (error.config as any)?.__interceptorContext || {};
  
  let code = 'UNKNOWN_ERROR';
  let message = 'An unknown error occurred';
  let status: number | undefined;
  let details: any;

  // 网络错误
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      code = 'TIMEOUT_ERROR';
      message = 'Request timeout';
    } else if (error.code === 'ENOTFOUND') {
      code = 'NETWORK_ERROR';
      message = 'Network error - unable to reach server';
    } else {
      code = 'NETWORK_ERROR';
      message = error.message || 'Network error occurred';
    }
  } else {
    // HTTP 错误
    status = error.response.status;
    
    switch (status) {
      case 400:
        code = 'BAD_REQUEST';
        message = 'Invalid request parameters';
        break;
      case 401:
        code = 'UNAUTHORIZED';
        message = 'Authentication required';
        break;
      case 403:
        code = 'FORBIDDEN';
        message = 'Access denied';
        break;
      case 404:
        code = 'NOT_FOUND';
        message = 'Resource not found';
        break;
      case 409:
        code = 'CONFLICT';
        message = 'Resource conflict';
        break;
      case 422:
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
        break;
      case 429:
        code = 'RATE_LIMIT_EXCEEDED';
        message = 'Too many requests';
        break;
      case 500:
        code = 'INTERNAL_SERVER_ERROR';
        message = 'Internal server error';
        break;
      case 502:
        code = 'BAD_GATEWAY';
        message = 'Bad gateway';
        break;
      case 503:
        code = 'SERVICE_UNAVAILABLE';
        message = 'Service temporarily unavailable';
        break;
      case 504:
        code = 'GATEWAY_TIMEOUT';
        message = 'Gateway timeout';
        break;
      default:
        code = `HTTP_${status}`;
        message = error.response.statusText || `HTTP ${status} error`;
    }

    // 尝试从响应中提取更详细的错误信息
    if (error.response.data) {
      const responseData = error.response.data;
      
      // 常见的 API 错误响应格式
      if (typeof responseData === 'object') {
        if (responseData.message) {
          message = responseData.message;
        }
        if (responseData.error) {
          message = responseData.error;
        }
        if (responseData.code) {
          code = responseData.code;
        }
        details = responseData;
      } else if (typeof responseData === 'string') {
        message = responseData;
      }
    }
  }

  return {
    code,
    message,
    details,
    status,
    originalError: error,
    requestId: context.requestId,
    timestamp: new Date().toISOString(),
  };
};

/**
 * 默认错误通知函数
 */
const defaultErrorNotifier = (error: StandardError): void => {
  console.error('API Error:', {
    code: error.code,
    message: error.message,
    status: error.status,
    requestId: error.requestId,
    timestamp: error.timestamp,
  });

  // 在开发环境下显示更详细的错误信息
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error.details);
    console.error('Original error:', error.originalError);
  }
};

/**
 * 创建错误处理拦截器
 */
export const createErrorHandlerInterceptor: InterceptorFactory<ErrorHandlerConfig> = (
  config: ErrorHandlerConfig = {}
): ResponseInterceptor => {
  const {
    enableTransform = true,
    enableNotification = true,
    errorTransformer = defaultErrorTransformer,
    onError = defaultErrorNotifier,
    statusCodeMapping = {},
  } = config;

  return {
    name: 'error-handler',
    priority: 80, // 较低优先级，在重试等拦截器之后执行
    onResponse: (response: AxiosResponse) => {
      // 检查响应是否包含业务错误
      if (response.data && typeof response.data === 'object') {
        const { success, error, code } = response.data;
        
        // 如果 API 返回了业务错误标识
        if (success === false || error || (code && code !== 0 && code !== '0' && code !== 'SUCCESS')) {
          const businessError = new Error(error || 'Business logic error') as any;
          businessError.response = response;
          businessError.isBusinessError = true;
          
          if (enableTransform) {
            const standardError = errorTransformer(businessError);
            if (enableNotification) {
              onError(standardError);
            }
            throw standardError;
          }
          
          throw businessError;
        }
      }

      return response;
    },
    onResponseError: async (error: AxiosError) => {
      let processedError: any = error;

      // 应用状态码特殊处理
      if (error.response && statusCodeMapping[error.response.status]) {
        const customHandler = statusCodeMapping[error.response.status];
        const standardError = customHandler(error);
        
        if (enableNotification) {
          onError(standardError);
        }
        
        return Promise.reject(standardError);
      }

      // 标准错误转换
      if (enableTransform) {
        const standardError = errorTransformer(error);
        
        if (enableNotification) {
          onError(standardError);
        }
        
        processedError = standardError;
      }

      return Promise.reject(processedError);
    },
  };
};

/**
 * 错误处理管理器
 */
export class ErrorHandlerManager {
  private config: ErrorHandlerConfig;
  private errorStats: Map<string, number> = new Map();

  constructor(config: ErrorHandlerConfig = {}) {
    this.config = config;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 创建错误处理拦截器
   */
  createInterceptor(): ResponseInterceptor {
    return createErrorHandlerInterceptor({
      ...this.config,
      onError: (error) => {
        // 记录错误统计
        this.recordError(error);
        
        // 调用原始错误处理函数
        if (this.config.onError) {
          this.config.onError(error);
        }
      },
    });
  }

  /**
   * 记录错误统计
   */
  private recordError(error: StandardError): void {
    const count = this.errorStats.get(error.code) || 0;
    this.errorStats.set(error.code, count + 1);
  }

  /**
   * 获取错误统计
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorStats);
  }

  /**
   * 清除错误统计
   */
  clearErrorStats(): void {
    this.errorStats.clear();
  }

  /**
   * 检查是否是可恢复的错误
   */
  isRecoverableError(error: StandardError): boolean {
    const recoverableErrors = [
      'TIMEOUT_ERROR',
      'NETWORK_ERROR',
      'RATE_LIMIT_EXCEEDED',
      'SERVICE_UNAVAILABLE',
      'BAD_GATEWAY',
      'GATEWAY_TIMEOUT',
    ];
    
    return recoverableErrors.includes(error.code);
  }
}

/**
 * 常用错误处理预设
 */
export const errorHandlerPresets = {
  /**
   * 开发环境配置 - 详细错误信息
   */
  development: {
    enableTransform: true,
    enableNotification: true,
    onError: (error: StandardError) => {
      console.group(`🚨 API Error [${error.code}]`);
      console.error('Message:', error.message);
      console.error('Status:', error.status);
      console.error('Request ID:', error.requestId);
      console.error('Timestamp:', error.timestamp);
      console.error('Details:', error.details);
      console.error('Original Error:', error.originalError);
      console.groupEnd();
    },
  },

  /**
   * 生产环境配置 - 简化错误信息
   */
  production: {
    enableTransform: true,
    enableNotification: false, // 生产环境不在控制台输出错误
    onError: (error: StandardError) => {
      // 可以在这里发送错误到监控系统
      // sendToErrorTracking(error);
    },
  },

  /**
   * 静默模式 - 不转换和通知错误
   */
  silent: {
    enableTransform: false,
    enableNotification: false,
  },
} satisfies Record<string, ErrorHandlerConfig>;