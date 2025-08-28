/**
 * 拦截器模块主入口
 * 导出所有拦截器相关的类型、工厂函数和预设配置
 */

/* eslint-disable no-undef */

// 核心类型和接口
export type {
  RequestInterceptor,
  ResponseInterceptor,
  InterceptorConfig,
  InterceptorContext,
  AuthConfig,
  RetryConfig,
  LogConfig,
  InterceptorFactory,
} from './types';

// 拦截器管理器
export { InterceptorManager } from './manager';

// 认证拦截器
export {
  createAuthInterceptor,
  AuthManager,
  globalAuthManager,
} from './presets/auth';

// 日志拦截器
export {
  createRequestLogInterceptor,
  createResponseLogInterceptor,
  createLogInterceptors,
  createPerformanceLogInterceptor,
} from './presets/logger';

// 重试拦截器
export {
  createRetryInterceptor,
  RetryManager,
  retryPresets,
} from './presets/retry';

// 错误处理拦截器
export {
  createErrorHandlerInterceptor,
  ErrorHandlerManager,
  errorHandlerPresets,
  type StandardError,
  type ErrorHandlerConfig,
} from './presets/error-handler';

/**
 * 预设拦截器配置组合
 */
export const interceptorPresets = {
  /**
   * 开发环境预设 - 详细日志 + 错误处理
   */
  development: {
    request: [
      createAuthInterceptor({ type: 'bearer', token: '' }), // 需要用户设置 token
      createRequestLogInterceptor({
        logRequests: true,
        logRequestBody: true,
        level: 'debug',
      }),
    ],
    response: [
      createRetryInterceptor({
        maxRetries: 2,
        delay: 1000,
        delayFactor: 2,
      }),
      createResponseLogInterceptor({
        logResponses: true,
        logResponseBody: true,
        level: 'debug',
      }),
      createPerformanceLogInterceptor(),
      createErrorHandlerInterceptor(errorHandlerPresets.development),
    ],
  },

  /**
   * 生产环境预设 - 基础功能 + 错误监控
   */
  production: {
    request: [
      createAuthInterceptor({ type: 'bearer', token: '' }), // 需要用户设置 token
      createRequestLogInterceptor({
        logRequests: false,
        logRequestBody: false,
        level: 'warn',
      }),
    ],
    response: [
      createRetryInterceptor(retryPresets.conservative),
      createResponseLogInterceptor({
        logResponses: false,
        logResponseBody: false,
        level: 'error',
      }),
      createErrorHandlerInterceptor(errorHandlerPresets.production),
    ],
  },

  /**
   * 测试环境预设 - 快速重试 + 详细日志
   */
  testing: {
    request: [
      createRequestLogInterceptor({
        logRequests: true,
        logRequestBody: false,
        level: 'info',
      }),
    ],
    response: [
      createRetryInterceptor(retryPresets.fast),
      createResponseLogInterceptor({
        logResponses: true,
        logResponseBody: false,
        level: 'info',
      }),
      createErrorHandlerInterceptor({
        enableTransform: true,
        enableNotification: true,
      }),
    ],
  },

  /**
   * 最小化预设 - 仅基础功能
   */
  minimal: {
    request: [],
    response: [
      createErrorHandlerInterceptor(errorHandlerPresets.silent),
    ],
  },
} satisfies Record<string, InterceptorConfig>;

/**
 * 便利函数：创建具有常用拦截器的配置
 */
export function createInterceptorConfig(options: {
  auth?: AuthConfig;
  retry?: RetryConfig;
  logging?: LogConfig;
  errorHandling?: ErrorHandlerConfig;
}): InterceptorConfig {
  const { auth, retry, logging, errorHandling } = options;
  
  const config: InterceptorConfig = {
    request: [],
    response: [],
  };

  // 添加认证拦截器
  if (auth) {
    config.request!.push(createAuthInterceptor(auth));
  }

  // 添加日志拦截器
  if (logging) {
    if (logging.logRequests) {
      config.request!.push(createRequestLogInterceptor(logging));
    }
    if (logging.logResponses) {
      config.response!.push(createResponseLogInterceptor(logging));
    }
  }

  // 添加重试拦截器
  if (retry) {
    config.response!.push(createRetryInterceptor(retry));
  }

  // 添加错误处理拦截器
  if (errorHandling) {
    config.response!.push(createErrorHandlerInterceptor(errorHandling));
  }

  return config;
}

/**
 * 便利函数：创建认证管理器
 */
export function createAuthManager(initialConfig?: AuthConfig): AuthManager {
  const manager = new AuthManager();
  if (initialConfig) {
    manager.setAuth(initialConfig);
  }
  return manager;
}

/**
 * 便利函数：创建重试管理器
 */
export function createRetryManager(config: RetryConfig): RetryManager {
  return new RetryManager(config);
}

/**
 * 便利函数：创建错误处理管理器
 */
export function createErrorHandlerManager(config?: ErrorHandlerConfig): ErrorHandlerManager {
  return new ErrorHandlerManager(config);
}